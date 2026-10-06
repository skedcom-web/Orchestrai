/**
 * GitHub access layer for the AI Review service.
 *
 * Design rule: a failed request must NEVER be indistinguishable from an empty
 * repository. Every call returns a classified outcome (FetchKind) plus the
 * HTTP status and rate-limit headers, and every call is logged, so "GitHub said
 * no" is visible in the Render logs and in the Admin UI instead of being
 * reported to the scoring model as "(empty)".
 *
 * Quota strategy: the REST API allows 60 requests/hour anonymously (per IP —
 * and Render's free tier shares egress IPs) versus 5,000 with a token. We spend
 * exactly ONE REST call per review (the repository tree) and fetch all file
 * contents from raw.githubusercontent.com, which is not metered by that quota.
 */

import { FetchKind } from '../types';

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';
const USER_AGENT = 'OrchestrAI-Academy-Review/1.0 (+https://vthinkorchestrai-academy.web.app)';
const TIMEOUT_MS = 10_000;
const MAX_TREE_ENTRIES = 5000;

// ── URL + token helpers ──────────────────────────────────────────────────────

/**
 * Parse "https://github.com/owner/repo[.git][/tree/...]" → { owner, repo } | null.
 * Tolerates surrounding whitespace and a missing scheme ("github.com/o/r").
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url || typeof url !== 'string') return null;
  let candidate = url.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (!/^(www\.)?github\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const repo = parts[1].replace(/\.git$/i, '');
    if (!parts[0] || !repo) return null;
    return { owner: parts[0], repo };
  } catch {
    return null;
  }
}

/**
 * Normalise a GITHUB_TOKEN pasted into a hosting dashboard. Real-world failure
 * modes this guards against: surrounding quotes, a trailing newline, or a
 * leading "token "/"Bearer " prefix — each of which makes GitHub answer 401 for
 * EVERY request, including public repositories.
 */
export function sanitizeToken(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  let t = String(raw).trim();
  t = t.replace(/^['"]+|['"]+$/g, '').trim();
  t = t.replace(/^(bearer|token)\s+/i, '').trim();
  if (!t) return undefined;
  if (/\s/.test(t) || /[^\x21-\x7e]/.test(t)) {
    console.warn('[github] GITHUB_TOKEN contains whitespace/non-printable characters — ignoring it and using anonymous access.');
    return undefined;
  }
  return t;
}

export function getGithubToken(): string | undefined {
  return sanitizeToken(process.env.GITHUB_TOKEN);
}

// ── Low-level request with classification ────────────────────────────────────

interface HttpOutcome {
  kind: FetchKind;
  httpStatus: number | null;
  text: string;
  truncated: boolean;
  rateLimitRemaining: number | null;
  rateLimitResetAt: number | null;
  usedToken: boolean;
  tokenRejected: boolean;
  ms: number;
}

function classify(status: number, remaining: string | null, retryAfter: string | null, body: string): FetchKind {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 404) return 'not_found';
  if (status === 409) return 'empty_repo'; // trees API: "Git Repository is empty."
  if (status === 401) return 'bad_credentials';
  if (status === 403 || status === 429) {
    if (remaining === '0' || retryAfter || /rate limit|abuse|secondary/i.test(body)) return 'rate_limited';
    return 'forbidden';
  }
  return 'http_error';
}

async function readLimited(res: Response, maxBytes: number): Promise<{ text: string; truncated: boolean }> {
  if (!res.body) {
    const t = await res.text();
    return { text: t.slice(0, maxBytes), truncated: t.length > maxBytes };
  }
  const reader = res.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
    total += value.length;
    if (total >= maxBytes) {
      truncated = true;
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  return { text: Buffer.concat(chunks).subarray(0, maxBytes).toString('utf8'), truncated };
}

async function once(
  label: string,
  url: string,
  headers: Record<string, string>,
  maxBytes: number,
  usedToken: boolean
): Promise<HttpOutcome> {
  const started = Date.now();
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' });
    const remainingHeader = res.headers.get('x-ratelimit-remaining');
    const resetHeader = res.headers.get('x-ratelimit-reset');
    const { text, truncated } = await readLimited(res, maxBytes);
    const kind = classify(res.status, remainingHeader, res.headers.get('retry-after'), text.slice(0, 500));
    const out: HttpOutcome = {
      kind,
      httpStatus: res.status,
      text,
      truncated,
      rateLimitRemaining: remainingHeader !== null ? Number(remainingHeader) : null,
      rateLimitResetAt: resetHeader ? Number(resetHeader) * 1000 : null,
      usedToken,
      tokenRejected: false,
      ms: Date.now() - started,
    };
    console.log(
      `[github] ${label} → ${res.status} (${kind}) remaining=${out.rateLimitRemaining ?? 'n/a'} ${out.ms}ms ${usedToken ? 'auth' : 'anon'}`
    );
    return out;
  } catch (err: any) {
    const kind: FetchKind = err?.name === 'TimeoutError' || err?.name === 'AbortError' ? 'timeout' : 'network';
    const ms = Date.now() - started;
    console.warn(`[github] ${label} → ${kind} after ${ms}ms: ${err?.message || err}`);
    return {
      kind, httpStatus: null, text: '', truncated: false,
      rateLimitRemaining: null, rateLimitResetAt: null, usedToken, tokenRejected: false, ms,
    };
  }
}

/**
 * GET with the token if we have one. If GitHub rejects the token (401) retry
 * ONCE anonymously: public repositories never need credentials, so a stale
 * token must not be able to take every review down.
 */
async function githubGet(
  label: string,
  url: string,
  accept: string,
  token: string | undefined,
  maxBytes = 2_000_000
): Promise<HttpOutcome> {
  const base: Record<string, string> = {
    Accept: accept,
    'User-Agent': USER_AGENT,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (!token) return once(label, url, base, maxBytes, false);

  const authed = await once(label, url, { ...base, Authorization: `Bearer ${token}` }, maxBytes, true);
  if (authed.kind !== 'bad_credentials') return authed;

  console.warn(`[github] ${label}: GITHUB_TOKEN was rejected (401 Bad credentials) — retrying anonymously. Replace the token in the Render environment.`);
  const anon = await once(label, url, base, maxBytes, false);
  return { ...anon, tokenRejected: true };
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface TreeEntry {
  path: string;
  size: number;
}

export interface TreeResult {
  kind: FetchKind;
  httpStatus: number | null;
  entries: TreeEntry[];
  totalBlobs: number;
  /** GitHub truncated the listing (very large repo). */
  truncated: boolean;
  rateLimitRemaining: number | null;
  rateLimitResetAt: number | null;
  usedToken: boolean;
  tokenRejected: boolean;
}

/**
 * List every file in the default branch with ONE REST call. `HEAD` resolves to
 * the default branch, so branch naming (main/master/trunk) does not matter.
 */
export async function listRepoTree(owner: string, repo: string, token?: string): Promise<TreeResult> {
  const out = await githubGet(
    `tree ${owner}/${repo}`,
    `${API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    'application/vnd.github+json',
    token
  );

  const result: TreeResult = {
    kind: out.kind,
    httpStatus: out.httpStatus,
    entries: [],
    totalBlobs: 0,
    truncated: false,
    rateLimitRemaining: out.rateLimitRemaining,
    rateLimitResetAt: out.rateLimitResetAt,
    usedToken: out.usedToken,
    tokenRejected: out.tokenRejected,
  };
  if (out.kind !== 'ok') return result;

  try {
    const data = JSON.parse(out.text);
    const blobs: TreeEntry[] = (Array.isArray(data.tree) ? data.tree : [])
      .filter((t: any) => t && t.type === 'blob' && typeof t.path === 'string')
      .map((t: any) => ({ path: t.path as string, size: typeof t.size === 'number' ? t.size : 0 }));
    result.totalBlobs = blobs.length;
    result.entries = blobs.slice(0, MAX_TREE_ENTRIES);
    result.truncated = !!data.truncated || blobs.length > MAX_TREE_ENTRIES;
    if (blobs.length === 0) result.kind = 'empty_repo';
  } catch {
    result.kind = 'http_error';
  }
  return result;
}

export interface FileResult {
  kind: FetchKind;
  httpStatus: number | null;
  text: string | null;
  truncated: boolean;
}

/**
 * Fetch one file's text from raw.githubusercontent.com (default branch).
 * Not metered by the REST API quota. Anonymous: capstone repositories must be
 * public, and a successful anonymous read is also our "repo is public" proof.
 */
export async function fetchRawFile(owner: string, repo: string, path: string, maxBytes = 60_000): Promise<FileResult> {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  const out = await once(
    `raw ${owner}/${repo}/${path}`,
    `${RAW}/${owner}/${repo}/HEAD/${encoded}`,
    { 'User-Agent': USER_AGENT, Accept: 'text/plain, */*' },
    maxBytes,
    false
  );
  return {
    kind: out.kind,
    httpStatus: out.httpStatus,
    text: out.kind === 'ok' ? out.text : null,
    truncated: out.truncated,
  };
}

// ── Health / diagnostics ─────────────────────────────────────────────────────

export interface GithubHealth {
  tokenConfigured: boolean;
  /** null = no token configured, nothing to validate. */
  tokenAccepted: boolean | null;
  limit: number | null;
  remaining: number | null;
  resetAt: number | null;
  checkedAt: number;
  error?: string;
}

let healthCache: { at: number; value: GithubHealth } | null = null;

/** Cached 60s. Calling /rate_limit does not consume quota. */
export async function getGithubHealth(): Promise<GithubHealth> {
  if (healthCache && Date.now() - healthCache.at < 60_000) return healthCache.value;

  const token = getGithubToken();
  const out = await githubGet('rate_limit', `${API}/rate_limit`, 'application/vnd.github+json', token, 20_000);

  const value: GithubHealth = {
    tokenConfigured: !!token,
    tokenAccepted: token ? !out.tokenRejected && out.kind === 'ok' : null,
    limit: null,
    remaining: null,
    resetAt: null,
    checkedAt: Date.now(),
  };
  if (out.kind === 'ok') {
    try {
      const core = JSON.parse(out.text)?.resources?.core;
      value.limit = typeof core?.limit === 'number' ? core.limit : null;
      value.remaining = typeof core?.remaining === 'number' ? core.remaining : null;
      value.resetAt = typeof core?.reset === 'number' ? core.reset * 1000 : null;
    } catch {
      value.error = 'Could not parse /rate_limit response';
    }
  } else {
    value.error = `GitHub /rate_limit returned ${out.httpStatus ?? out.kind}`;
  }
  healthCache = { at: Date.now(), value };
  return value;
}
