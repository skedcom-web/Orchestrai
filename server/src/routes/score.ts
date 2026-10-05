import { Router, Request, Response } from 'express';
import { getDb } from '../services/firebase';
import {
  parseGitHubUrl,
  fetchGitHubFile,
  listGitHubRepoFiles,
  checkUrlReachable,
} from '../services/github';
import {
  callOpenRouter,
  buildScoringPrompt,
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
 * Ports the EXACT logic from scoreCapstoneTierB in functions/src/index.ts.
 * RTDB write paths are identical:
 *   reviews/{submissionId}/autoChecks
 *   reviews/{submissionId}/autoScore
 *   reviews/{submissionId}/tierBSuggestion
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

  // ── Tier A: deterministic auto-checks (run in parallel) ──────────────────
  const ghParsed = parseGitHubUrl(submission.githubUrl);
  const githubToken = process.env.GITHUB_TOKEN || undefined;

  const [readme, packageJson, fileList, firebaseReachable] = await Promise.all([
    ghParsed
      ? fetchGitHubFile(ghParsed.owner, ghParsed.repo, 'README.md', githubToken)
      : Promise.resolve(null),
    ghParsed
      ? fetchGitHubFile(ghParsed.owner, ghParsed.repo, 'package.json', githubToken)
      : Promise.resolve(null),
    ghParsed
      ? listGitHubRepoFiles(ghParsed.owner, ghParsed.repo, githubToken)
      : Promise.resolve<string[]>([]),
    checkUrlReachable(submission.firebaseUrl),
  ]);

  const autoChecks: AutoChecks = {
    githubReachable: !!ghParsed,
    githubPublic: !!fileList.length || !!readme,
    hasReadme: !!readme,
    hasDesignDoc: fileList.some((p) => /design(\.md)?$/i.test(p)),
    hasPackageJson: !!packageJson,
    fileCount: fileList.length,
    firebaseReachable,
    checkedAt: Date.now(),
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
  const prompt = buildScoringPrompt(submission, { readme, packageJson, fileList });

  let aiResponse: any;
  try {
    aiResponse = await callOpenRouter(prompt, model, apiKey);
  } catch (err: any) {
    console.error('OpenRouter call failed:', err);
    res.status(500).json({ success: false, error: `AI scoring failed: ${err?.message || err}` });
    return;
  }

  const rawContent: string = aiResponse?.choices?.[0]?.message?.content || '';
  let parsed: {
    scores: Record<string, number>;
    rationale: Record<string, string>;
    overallObservations?: string;
  };
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    console.error('AI returned non-JSON content:', rawContent.slice(0, 500));
    res.status(500).json({ success: false, error: 'AI did not return valid JSON. Check server logs.' });
    return;
  }

  // Clamp scores to rubric maxima and compute total
  const clampedScores: Record<string, number> = {};
  let total = 0;
  for (const [k, max] of Object.entries(RUBRIC)) {
    const v = Math.max(0, Math.min(max, Math.round(parsed.scores?.[k] || 0)));
    clampedScores[k] = v;
    total += v;
  }

  const tierBSuggestion: TierBSuggestion = {
    perCategory: clampedScores,
    rationale: parsed.rationale || {},
    overallObservations: parsed.overallObservations || '',
    total,
    model,
    generatedAt: Date.now(),
    autoChecks,
    tokensUsed: aiResponse?.usage || null,
  };

  await db.ref(`reviews/${submissionId}/tierBSuggestion`).set(tierBSuggestion);

  res.json({ success: true, submissionId, tierBSuggestion, autoChecks, autoScore });
});

export default router;
