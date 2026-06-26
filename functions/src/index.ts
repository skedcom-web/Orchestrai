/**
 * OrchestrAI Cloud Functions — Tier B AI rubric scoring via OpenRouter (Qwen).
 *
 * Functions exposed (HTTPS Callable):
 *   - scoreCapstoneTierB({ submissionId, modelOverride? })
 *   - pingTierBProvider({ modelOverride? })
 *
 * Configure secrets BEFORE deploying:
 *   firebase functions:secrets:set OPENROUTER_API_KEY
 *   (optional) firebase functions:secrets:set GITHUB_TOKEN
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const OPENROUTER_API_KEY = defineSecret('OPENROUTER_API_KEY');
const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-72b-instruct';
const REFERER = process.env.OPENROUTER_REFERER || 'https://vthinkorchestrai-academy.web.app';
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'OrchestrAI Academy';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 9-category rubric (v7 manual) — matches what the human reviewer scores against.
const RUBRIC: Record<string, number> = {
  authentication: 10,
  dashboard: 10,
  masterData: 10,
  transactions: 15,
  workflow: 20,
  rbac: 15,
  reports: 10,
  deployment: 5,
  documentation: 5,
};

interface SubmissionRecord {
  learnerName?: string;
  capstoneId: string;
  capstoneTitle: string;
  capstoneDomain: string;
  githubUrl: string;
  firebaseUrl: string;
  readmeUrl: string;
  workflowDiagramUrl?: string;
  supportingDocs?: Array<{ name: string; storageUrl: string }>;
}

// Parse "https://github.com/owner/repo" → { owner, repo }
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('github.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

async function fetchGitHubFile(owner: string, repo: string, path: string, token?: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3.raw' };
  if (token) headers.Authorization = `token ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    logger.warn(`Failed to fetch ${path}:`, err);
    return null;
  }
}

async function listGitHubRepoFiles(owner: string, repo: string, token?: string): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `token ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.tree || []).filter((t: any) => t.type === 'blob').map((t: any) => t.path).slice(0, 200);
  } catch (err) {
    logger.warn('Failed to list repo files:', err);
    return [];
  }
}

async function checkUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok || res.status === 405; // some servers reject HEAD; treat as up
  } catch {
    return false;
  }
}

function buildScoringPrompt(submission: SubmissionRecord, repoEvidence: {
  readme: string | null;
  fileList: string[];
  packageJson: string | null;
}): string {
  return `You are a senior code reviewer evaluating a Lead Certification capstone for the OrchestrAI Academy.

CAPSTONE UNDER REVIEW
  ID:        ${submission.capstoneId}
  Title:     ${submission.capstoneTitle}
  Domain:    ${submission.capstoneDomain}
  GitHub:    ${submission.githubUrl}
  Live URL:  ${submission.firebaseUrl}

EVIDENCE FROM THE REPOSITORY
README.md (truncated to 8000 chars):
${(repoEvidence.readme || '(no README found)').slice(0, 8000)}

package.json:
${(repoEvidence.packageJson || '(no package.json found)').slice(0, 2000)}

Repository file listing (first 200 paths):
${repoEvidence.fileList.slice(0, 200).join('\n') || '(empty)'}

YOUR TASK
Score this submission against the 9-category OrchestrAI rubric. For EACH category:
- Give a numeric score from 0 to the max shown below
- Give a one-sentence rationale citing specific evidence from the README, file list, or live URL

Rubric (max points):
  authentication: 10  — Firebase Auth setup, login/signup flows, session handling
  dashboard: 10       — Landing dashboard with KPIs, recent items, indexed queries
  masterData: 10      — Master entity CRUD (list/create/edit/delete)
  transactions: 15    — Main transaction entity full CRUD with validation
  workflow: 20        — Status transition matrix correctness (HIGHEST WEIGHT — examine evidence carefully)
  rbac: 15            — Role-based access controls enforced across routes and actions
  reports: 10         — Summary / Status / Activity reports with Excel + PDF export
  deployment: 5       — Live Firebase URL reachable, README has run instructions
  documentation: 5    — README quality, DESIGN.md mentioning OGE, per-component commits

Be honest. Score 0 for missing evidence. Score max only when evidence is strong AND specific.

OUTPUT FORMAT (strict JSON only, no markdown fences, no commentary):
{
  "scores": {
    "authentication": <int>, "dashboard": <int>, "masterData": <int>,
    "transactions": <int>, "workflow": <int>, "rbac": <int>,
    "reports": <int>, "deployment": <int>, "documentation": <int>
  },
  "rationale": {
    "authentication": "<one sentence>", "dashboard": "<one sentence>", "masterData": "<one sentence>",
    "transactions": "<one sentence>", "workflow": "<one sentence>", "rbac": "<one sentence>",
    "reports": "<one sentence>", "deployment": "<one sentence>", "documentation": "<one sentence>"
  },
  "overallObservations": "<2-3 sentences summarising strengths and gaps>"
}`;
}

async function callOpenRouter(prompt: string, model: string, apiKey: string): Promise<any> {
  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are a strict, evidence-based code reviewer. Always return valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    temperature: 0.2,
  };
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': REFERER,
      'X-Title': APP_NAME,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 500)}`);
  }
  return await res.json();
}

// ─── scoreCapstoneTierB ─────────────────────────────────────────────────────
export const scoreCapstoneTierB = onCall(
  { secrets: [OPENROUTER_API_KEY, GITHUB_TOKEN], timeoutSeconds: 120, memory: '512MiB' },
  async (req) => {
    const { submissionId, modelOverride, tierAOnly } = (req.data || {}) as { submissionId?: string; modelOverride?: string; tierAOnly?: boolean };
    if (!submissionId) throw new HttpsError('invalid-argument', 'submissionId is required.');

    const db = admin.database();

    // submissionId format: "{uid}_{capstoneId}" — look it up under /submissions/{uid}/{capstoneId}
    const [uid, ...capParts] = submissionId.split('_');
    const capstoneId = capParts.join('_');
    if (!uid || !capstoneId) throw new HttpsError('invalid-argument', 'submissionId must be {uid}_{capstoneId}');

    const submissionSnap = await db.ref(`submissions/${uid}/${capstoneId}`).get();
    if (!submissionSnap.exists()) throw new HttpsError('not-found', `Submission ${submissionId} not found.`);
    const submission = submissionSnap.val() as SubmissionRecord;

    // Run deterministic auto-checks in parallel
    const ghParsed = parseGitHubUrl(submission.githubUrl);
    const githubToken = GITHUB_TOKEN.value() || undefined;

    const [readme, packageJson, fileList, firebaseReachable] = await Promise.all([
      ghParsed ? fetchGitHubFile(ghParsed.owner, ghParsed.repo, 'README.md', githubToken) : Promise.resolve(null),
      ghParsed ? fetchGitHubFile(ghParsed.owner, ghParsed.repo, 'package.json', githubToken) : Promise.resolve(null),
      ghParsed ? listGitHubRepoFiles(ghParsed.owner, ghParsed.repo, githubToken) : Promise.resolve<string[]>([]),
      checkUrlReachable(submission.firebaseUrl),
    ]);

    const autoChecks = {
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
      return { success: true, submissionId, autoChecks, autoScore };
    }

    const apiKey = OPENROUTER_API_KEY.value();
    if (!apiKey) throw new HttpsError('failed-precondition', 'OPENROUTER_API_KEY secret is not set. Run: firebase functions:secrets:set OPENROUTER_API_KEY');

    // Call AI (Tier B)
    const model = modelOverride || DEFAULT_MODEL;
    const prompt = buildScoringPrompt(submission, { readme, packageJson, fileList });

    let aiResponse: any;
    try {
      aiResponse = await callOpenRouter(prompt, model, apiKey);
    } catch (err: any) {
      logger.error('OpenRouter call failed:', err);
      throw new HttpsError('internal', `AI scoring failed: ${err?.message || err}`);
    }

    const rawContent: string = aiResponse?.choices?.[0]?.message?.content || '';
    let parsed: { scores: Record<string, number>; rationale: Record<string, string>; overallObservations?: string };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      logger.error('AI returned non-JSON content:', rawContent.slice(0, 500));
      throw new HttpsError('internal', 'AI did not return valid JSON. See function logs.');
    }

    // Clamp scores to rubric maxima and compute total
    const clampedScores: Record<string, number> = {};
    let total = 0;
    for (const [k, max] of Object.entries(RUBRIC)) {
      const v = Math.max(0, Math.min(max, Math.round(parsed.scores?.[k] || 0)));
      clampedScores[k] = v;
      total += v;
    }

    const tierBSuggestion = {
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

    return { success: true, submissionId, tierBSuggestion, autoChecks, autoScore };
  }
);

// ─── pingTierBProvider ──────────────────────────────────────────────────────
export const pingTierBProvider = onCall(
  { secrets: [OPENROUTER_API_KEY], timeoutSeconds: 30 },
  async (req) => {
    const { modelOverride } = (req.data || {}) as { modelOverride?: string };
    const apiKey = OPENROUTER_API_KEY.value();
    if (!apiKey) {
      return { ok: false, error: 'OPENROUTER_API_KEY secret is not set on the function. Run: firebase functions:secrets:set OPENROUTER_API_KEY' };
    }
    const model = modelOverride || DEFAULT_MODEL;
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': REFERER,
          'X-Title': APP_NAME,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
          max_tokens: 5,
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, error: `OpenRouter ${res.status}: ${errText.slice(0, 300)}`, model };
      }
      const data: any = await res.json();
      return { ok: true, model, reply: data?.choices?.[0]?.message?.content || '(empty)', usage: data?.usage };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), model };
    }
  }
);
