import { Router, Request, Response } from 'express';
import { getDb } from '../services/firebase';
import { getGithubToken } from '../services/github';
import { buildGithubCheck, collectRepoEvidence, summarizeEvidence } from '../services/evidence';
import { inspectLiveUrl } from '../services/liveUrl';
import {
  callOpenRouter,
  buildScoringPrompt,
  parseModelJson,
  RUBRIC,
  DEFAULT_MODEL,
} from '../services/openrouter';
import { SubmissionRecord, AutoChecks, TierBSuggestion } from '../types';

const router = Router();

/**
 * POST /api/score-capstone
 * Body: { submissionId: string, modelOverride?: string, tierAOnly?: boolean }
 * Header: x-api-key  (must match REVIEW_SERVICE_API_KEY if that env var is set)
 *
 * RTDB write paths are unchanged:
 *   reviews/{submissionId}/autoChecks
 *   reviews/{submissionId}/autoScore
 *   reviews/{submissionId}/tierBSuggestion
 * (new fields are additive and optional — see types/index.ts)
 *
 * Evidence-first contract: if GitHub evidence cannot be retrieved (rate limit,
 * auth, network) the model is NOT called and no zero-score suggestion is
 * written. The admin gets the real reason instead of a fabricated verdict, and
 * any previous suggestion is left intact.
 */
router.post('/', async (req: Request, res: Response) => {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const expectedKey = process.env.REVIEW_SERVICE_API_KEY;
  if (expectedKey) {
    const provided = req.headers['x-api-key'];
    if (provided !== expectedKey) {
      res.status(401).json({ success: false, error: 'Unauthorized: invalid x-api-key header.' });
      return;
    }
  }

  const { submissionId, modelOverride, tierAOnly } = req.body as {
    submissionId?: string;
    modelOverride?: string;
    tierAOnly?: boolean;
  };

  if (!submissionId) {
    res.status(400).json({ success: false, error: 'submissionId is required.' });
    return;
  }

  // submissionId format: "{uid}_{capstoneId}" — look it up under /submissions/{uid}/{capstoneId}
  const [uid, ...capParts] = submissionId.split('_');
  const capstoneId = capParts.join('_');
  if (!uid || !capstoneId) {
    res.status(400).json({ success: false, error: 'submissionId must be {uid}_{capstoneId}' });
    return;
  }

  let db: ReturnType<typeof getDb>;
  try {
    db = getDb();
  } catch (err: any) {
    console.error('Firebase init failed:', err);
    res.status(500).json({ success: false, error: `Firebase initialisation failed: ${err?.message}` });
    return;
  }

  const submissionSnap = await db.ref(`submissions/${uid}/${capstoneId}`).get();
  if (!submissionSnap.exists()) {
    res.status(404).json({ success: false, error: `Submission ${submissionId} not found.` });
    return;
  }
  const submission = submissionSnap.val() as SubmissionRecord;

  // ── Evidence collection (GitHub + live URL, in parallel) ─────────────────
  const [evidence, live] = await Promise.all([
    collectRepoEvidence(submission.githubUrl, getGithubToken(), { title: submission.capstoneTitle }),
    inspectLiveUrl(submission.firebaseUrl),
  ]);
  const githubCheck = buildGithubCheck(evidence);
  const summary = summarizeEvidence(evidence, live);

  console.log(
    `[score] ${submissionId} github=${githubCheck.status} listing=${summary.listing} files=${summary.filesListed} ` +
    `readme=${summary.readme} pkg=${summary.packageJson} sources=${summary.sourceFilesSampled} ` +
    `live=${summary.liveUrl} confidence=${summary.confidence}`
  );

  // ── Evidence unavailable → stop. Never score on missing evidence. ────────
  if (evidence.unavailable) {
    await db.ref(`reviews/${submissionId}/autoChecks/githubCheck`).set(githubCheck);
    await db.ref(`reviews/${submissionId}/autoChecks/checkedAt`).set(Date.now());
    const message = `GitHub evidence unavailable — ${githubCheck.message}`;
    if (tierAOnly) {
      res.json({ success: true, submissionId, evidenceAvailable: false, githubCheck, message });
      return;
    }
    res.status(502).json({ success: false, code: 'GITHUB_EVIDENCE_UNAVAILABLE', error: message, githubCheck });
    return;
  }

  // ── Tier A: deterministic auto-checks ────────────────────────────────────
  const autoChecks: AutoChecks = {
    githubReachable: !!evidence.parsed,
    githubPublic: evidence.publicProven,
    hasReadme: evidence.readme.presence === 'ok' || (evidence.listingSource === 'api' && !!evidence.readme.path),
    hasDesignDoc: evidence.hasDesignDoc,
    hasPackageJson: evidence.packageJson.presence === 'ok' || (evidence.listingSource === 'api' && !!evidence.packageJson.path),
    fileCount: evidence.tree?.kind === 'ok' ? evidence.tree.totalBlobs : evidence.files.length,
    firebaseReachable: live.reachable,
    checkedAt: Date.now(),
    githubCheck,
    firebaseUrlKind: live.kind,
    liveUrlNote: live.note,
  };

  // Calculate baseline Tier A auto-score out of 10
  let autoScore = 0;
  if (autoChecks.firebaseReachable) autoScore += 5;
  if (autoChecks.hasReadme) autoScore += 3;
  if (autoChecks.hasDesignDoc) autoScore += 2;

  await db.ref(`reviews/${submissionId}/autoChecks`).set(autoChecks);
  await db.ref(`reviews/${submissionId}/autoScore`).set(autoScore);

  // If only deterministic Tier A checks are requested, return early
  if (tierAOnly) {
    res.json({ success: true, submissionId, autoChecks, autoScore });
    return;
  }

  // ── Tier B: AI scoring via OpenRouter ────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      error: 'OPENROUTER_API_KEY env var is not set. Add it to your Render environment variables.',
    });
    return;
  }

  const model = modelOverride || DEFAULT_MODEL;
  const prompt = buildScoringPrompt(submission, evidence, live, summary);

  let aiResponse: any;
  try {
    aiResponse = await callOpenRouter(prompt, model, apiKey);
  } catch (err: any) {
    console.error('OpenRouter call failed:', err);
    res.status(500).json({ success: false, error: `AI scoring failed: ${err?.message || err}` });
    return;
  }

  const rawContent: string = aiResponse?.choices?.[0]?.message?.content || '';
  const parsed = parseModelJson(rawContent) as {
    scores?: Record<string, number>;
    rationale?: Record<string, string>;
    overallObservations?: string;
  } | null;
  if (!parsed) {
    console.error('AI returned non-JSON content:', rawContent.slice(0, 500));
    res.status(500).json({ success: false, error: 'AI did not return valid JSON. Check server logs.' });
    return;
  }

  // Clamp scores to rubric maxima and compute total
  const clampedScores: Record<string, number> = {};
  let total = 0;
  for (const [k, max] of Object.entries(RUBRIC)) {
    const v = Math.max(0, Math.min(max, Math.round(Number(parsed.scores?.[k]) || 0)));
    clampedScores[k] = v;
    total += v;
  }

  // Degraded evidence must be visible wherever the summary travels (it is copied
  // into the reviewer's notes by "Adopt All").
  let observations = parsed.overallObservations || '';
  if (summary.confidence !== 'high') {
    observations += ` [Evidence confidence: ${summary.confidence.toUpperCase()}${summary.gaps.length ? ' — ' + summary.gaps.join(' ') : ''}]`;
  }

  const tierBSuggestion: TierBSuggestion = {
    perCategory: clampedScores,
    rationale: parsed.rationale || {},
    overallObservations: observations.trim(),
    total,
    model,
    generatedAt: Date.now(),
    autoChecks,
    tokensUsed: aiResponse?.usage || null,
    evidence: summary,
    promptChars: prompt.length,
  };

  await db.ref(`reviews/${submissionId}/tierBSuggestion`).set(tierBSuggestion);

  res.json({ success: true, submissionId, tierBSuggestion, autoChecks, autoScore });
});

export default router;
