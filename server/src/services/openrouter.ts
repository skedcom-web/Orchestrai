/**
 * OpenRouter AI client + scoring prompt builder.
 *
 * RUBRIC, the task wording, and the strict-JSON output contract are unchanged
 * from the original port. What changed is the EVIDENCE section: it now reports
 * exactly what was retrieved, what was missing, and what was unavailable, so the
 * model can tell "the repo has no README" apart from "we could not fetch it".
 */

import { EvidenceSummary, SubmissionRecord } from '../types';
import { LIMITS, RepoEvidence } from './evidence';
import { LiveUrlEvidence } from './liveUrl';

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

// ── Evidence rendering ───────────────────────────────────────────────────────

function renderListing(ev: RepoEvidence, s: EvidenceSummary): string {
  switch (s.listing) {
    case 'verified_empty':
      return 'VERIFIED EMPTY — GitHub confirmed the repository contains no files.';
    case 'not_found':
      return `NOT FOUND — ${ev.unavailableReason || 'the repository does not exist or is private.'}`;
    case 'unavailable':
      return `UNAVAILABLE — ${ev.unavailableReason || 'GitHub could not be reached.'} This does NOT mean the repository is empty.`;
    case 'partial': {
      const why = ev.listingSource === 'probe'
        ? 'full listing unavailable; only these files were confirmed by direct probes'
        : 'listing was truncated by GitHub';
      return `PARTIAL (${why}):\n${ev.files.slice(0, LIMITS.PATHS_IN_PROMPT).join('\n') || '(none confirmed)'}`;
    }
    default:
      return `${ev.files.length} files (showing first ${Math.min(ev.files.length, LIMITS.PATHS_IN_PROMPT)}):\n${ev.files.slice(0, LIMITS.PATHS_IN_PROMPT).join('\n')}`;
  }
}

function renderFile(label: string, presence: 'ok' | 'missing' | 'unavailable', text: string | null, limit: number): string {
  if (presence === 'ok' && text !== null) return text.slice(0, limit);
  if (presence === 'missing') return `(MISSING — the repository was read and contains no ${label})`;
  return `(UNAVAILABLE — ${label} could not be retrieved; this does NOT mean it is absent)`;
}

function renderLive(live: LiveUrlEvidence, submitted: string): string {
  const lines = [`  Submitted URL: ${submitted || '(none)'}`, `  Result: ${live.note}`];
  if (live.title) lines.push(`  Page title: ${live.title}`);
  if (live.snippet) lines.push(`  Visible text (first ${live.snippet.length} chars): ${live.snippet}`);
  return lines.join('\n');
}

export function buildScoringPrompt(
  submission: SubmissionRecord,
  evidence: RepoEvidence,
  live: LiveUrlEvidence,
  summary: EvidenceSummary
): string {
  const sources = evidence.sources.length
    ? evidence.sources
        .map((s) => `--- ${s.path} [${s.category}]${s.truncated ? ' (excerpt)' : ''} ---\n${s.text}`)
        .join('\n\n')
    : '(no source files were sampled)';

  return `You are a senior code reviewer evaluating a Lead Certification capstone for the OrchestrAI Academy.

CAPSTONE UNDER REVIEW
  ID:        ${submission.capstoneId}
  Title:     ${submission.capstoneTitle}
  Domain:    ${submission.capstoneDomain}
  GitHub:    ${submission.githubUrl}
  Live URL:  ${submission.firebaseUrl}

EVIDENCE COLLECTION REPORT (read this before scoring)
  Repository listing : ${summary.listing.toUpperCase().replace('_', ' ')} (${summary.filesListed} files known)
  README.md          : ${summary.readme.toUpperCase()}
  package.json       : ${summary.packageJson.toUpperCase()}
  Source files shown : ${summary.sourceFilesSampled} (${summary.sourceCharsSampled} chars)
  Live deployment    : ${summary.liveUrl.toUpperCase().replace('_', ' ')}
  Evidence confidence: ${summary.confidence.toUpperCase()}
${summary.gaps.length ? summary.gaps.map((g) => `  GAP: ${g}`).join('\n') : '  GAP: none'}

EVIDENCE FROM THE REPOSITORY
README.md (truncated to ${LIMITS.README_CHARS} chars):
${renderFile('README', evidence.readme.presence, evidence.readme.text, LIMITS.README_CHARS)}

package.json:
${renderFile('package.json', evidence.packageJson.presence, evidence.packageJson.text, LIMITS.PACKAGE_CHARS)}

Repository file listing:
${renderListing(evidence, summary)}

SAMPLED SOURCE FILES (selected per rubric category; excerpts only — absence from this sample is NOT absence from the repository)
${sources}

LIVE DEPLOYMENT
${renderLive(live, submission.firebaseUrl)}

EVIDENCE RULES (these take precedence over the scoring guidance below)
- Score 0 only when evidence WAS retrieved and does not show the feature.
- If the relevant evidence is UNAVAILABLE, PARTIAL, or outside the sampled excerpts, do not guess and do not claim the feature is absent: score conservatively from what is visible and write "insufficient evidence" in that category's rationale.
- Never describe the repository as empty unless the listing says VERIFIED EMPTY.
- Do not invent files, features, or behaviour that the evidence above does not show.

YOUR TASK
Score this submission against the 9-category OrchestrAI rubric. For EACH category:
- Give a numeric score from 0 to the max shown below
- Give a one-sentence rationale citing specific evidence from the README, file list, source files, or live URL

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

Be honest. Score 0 for evidence that was retrieved and is missing the feature. Score max only when evidence is strong AND specific.

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

// ── Response parsing ─────────────────────────────────────────────────────────

/** Parse the model's JSON, tolerating markdown fences or stray commentary around it. */
export function parseModelJson(raw: string): any | null {
  const attempt = (s: string) => {
    try { return JSON.parse(s); } catch { return null; }
  };
  const direct = attempt(raw);
  if (direct && typeof direct === 'object') return direct;
  const unfenced = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const fromFence = attempt(unfenced);
  if (fromFence && typeof fromFence === 'object') return fromFence;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = attempt(raw.slice(start, end + 1));
    if (sliced && typeof sliced === 'object') return sliced;
  }
  return null;
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
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 500)}`);
  }

  return await res.json();
}

export { DEFAULT_MODEL };
