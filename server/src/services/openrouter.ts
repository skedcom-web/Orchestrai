/**
 * OpenRouter AI client + scoring prompt builder.
 * Ported verbatim from functions/src/index.ts — RUBRIC, buildScoringPrompt,
 * and callOpenRouter are bit-for-bit identical to the Cloud Function versions.
 */

import { SubmissionRecord } from '../types';

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-72b-instruct';
const REFERER = process.env.OPENROUTER_REFERER || 'https://vthinkorchestrai-academy.web.app';
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'OrchestrAI Academy';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 9-category rubric (v7 manual) — matches what the human reviewer scores against.
export const RUBRIC: Record<string, number> = {
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

// ── buildScoringPrompt ────────────────────────────────────────────────────────

export function buildScoringPrompt(
  submission: SubmissionRecord,
  repoEvidence: {
    readme: string | null;
    fileList: string[];
    packageJson: string | null;
  }
): string {
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

// ── callOpenRouter ────────────────────────────────────────────────────────────

/**
 * Call the OpenRouter chat completions API and return the raw JSON response.
 * Throws on non-OK HTTP status.
 */
export async function callOpenRouter(
  prompt: string,
  model: string,
  apiKey: string
): Promise<any> {
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

export { DEFAULT_MODEL };
