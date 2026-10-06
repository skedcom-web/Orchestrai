/**
 * Evidence collection for AI review.
 *
 * Produces an explicit, honest picture of what we could and could not learn
 * about a submission, so the scoring model is never handed "(empty)" for
 * something that was merely unreachable.
 *
 * Three distinct states for every artefact:
 *   ok          — retrieved
 *   missing     — GitHub answered definitively and it is not there
 *   unavailable — we could not find out (rate limit, auth, network, timeout)
 */

import { EvidenceSummary, FetchKind, GithubCheck } from '../types';
import { FileResult, TreeEntry, TreeResult, fetchRawFile, listRepoTree, parseGitHubUrl } from './github';
import { LiveUrlEvidence } from './liveUrl';

export const LIMITS = {
  README_CHARS: 8_000,
  PACKAGE_CHARS: 2_000,
  MAX_SOURCE_FILES: 16,
  // 16 files × 2,500 chars fits under the total, so no selected file is starved by
  // earlier large ones. ≈ 8k tokens of source + README/listing keeps the whole
  // prompt well inside a 32k-token context.
  PER_FILE_CHARS: 2_500,
  TOTAL_SOURCE_CHARS: 32_000,
  /** Skip blobs larger than this — generated bundles, data dumps. */
  MAX_BLOB_BYTES: 80_000,
  PATHS_IN_PROMPT: 200,
} as const;

export type Presence = 'ok' | 'missing' | 'unavailable';

export interface SourceSample {
  path: string;
  category: string;
  text: string;
  truncated: boolean;
}

export interface RepoEvidence {
  parsed: { owner: string; repo: string } | null;
  tree: TreeResult | null;
  /** 'api' = full listing, 'probe' = listing unavailable, inferred from direct file probes. */
  listingSource: 'api' | 'probe' | 'none';
  files: string[];
  readme: { presence: Presence; path: string | null; text: string | null; truncated: boolean };
  packageJson: { presence: Presence; path: string | null; text: string | null };
  hasDesignDoc: boolean;
  sources: SourceSample[];
  /** An anonymous request succeeded, so the repository is public. */
  publicProven: boolean;
  accessible: boolean;
  verifiedEmpty: boolean;
  notFound: boolean;
  /** We could not get trustworthy evidence — scoring on it would be fabrication. */
  unavailable: boolean;
  unavailableReason: string | null;
  tokenConfigured: boolean;
}

// ── Secret handling ──────────────────────────────────────────────────────────

const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/g,
  /\bsk-(?:or-)?[A-Za-z0-9_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
];

/** Strip credential-shaped strings before any repo content leaves this service. */
export function redactSecrets(text: string): string {
  let out = text;
  for (const re of SECRET_PATTERNS) out = out.replace(re, '[REDACTED]');
  return out.replace(/("private_key"\s*:\s*")[^"]+(")/g, '$1[REDACTED]$2');
}

// ── Key-file selection ───────────────────────────────────────────────────────

const IGNORED_DIR = /(^|\/)(node_modules|dist|build|out|\.next|\.git|coverage|vendor|\.cache|\.firebase|\.vscode|\.idea|__pycache__|venv)\//i;
const BINARY_OR_NOISE = /\.(png|jpe?g|gif|svg|ico|webp|avif|bmp|woff2?|ttf|otf|eot|mp3|mp4|mov|webm|wav|pdf|zip|gz|tar|rar|7z|jar|class|exe|dll|so|map|lock|lockb|min\.js|min\.css)$|(^|\/)(package-lock\.json|pnpm-lock\.yaml|npm-shrinkwrap\.json)$/i;
const SECRET_FILE = /(^|\/)(\.env(?!\.example|\.sample|\.template)(\..*)?|[^/]*serviceaccount[^/]*\.json|[^/]*credentials[^/]*\.json|[^/]*\.pem|[^/]*\.key|[^/]*\.p12|[^/]*\.pfx|id_rsa[^/]*)$/i;
const CODE_FILE = /\.(tsx?|jsx?|mjs|cjs|vue|svelte|py|java|cs|go|rb|php|sql|rules)$/i;
const CONFIG_FILE = /(^|\/)(firebase\.json|\.firebaserc|database\.rules\.json|firestore\.rules|storage\.rules|firestore\.indexes\.json|vite\.config\.[a-z]+|dockerfile)$|(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/i;
const DESIGN_DOC = /(^|\/)design[^/]*\.md$/i;
const TEST_FILE = /(\.|\/)(test|spec)\.[a-z]+$|__tests__|\.d\.ts$/i;

// Ordered by rubric weight (workflow 20, transactions 15, rbac 15, then 10s) so the
// heaviest categories claim file slots first. `deployment` and `documentation`
// are covered by fixed anchors (firebase.json, DESIGN doc) and the separately
// fetched README, so they are not ranked here.
const CATEGORY_HINTS: Array<{ key: string; re: RegExp }> = [
  { key: 'workflow', re: /workflow|transition|fsm|lifecycle|approval|statemachine|status(flow|matrix|machine)|states?\.[a-z]+$/ },
  { key: 'transactions', re: /transaction|service|api|crud|repository|store|context|form|request|order|ticket|booking|claim|sample/ },
  { key: 'rbac', re: /rbac|role|permission|guard|protected|acl|policy/ },
  { key: 'authentication', re: /auth|login|signin|signup|register|session|firebase(config)?\./ },
  { key: 'dashboard', re: /dashboard|overview|kpi|analytics|summary/ },
  { key: 'reports', re: /report|export|pdf|excel|xlsx|csv/ },
  { key: 'masterData', re: /master|catalog|categor|department|setup|settings|manage/ },
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface PickedFile {
  path: string;
  category: string;
}

/**
 * Choose up to MAX_SOURCE_FILES representative files. Deterministic: the same
 * tree always yields the same selection, so re-running a review is reproducible.
 */
export function selectKeyFiles(entries: TreeEntry[], hints: { title?: string } = {}): PickedFile[] {
  const titleWords = (hints.title || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4);
  const titleRe = titleWords.length ? new RegExp(titleWords.map(escapeRe).join('|')) : null;

  const candidates = entries.filter((e) => {
    const p = e.path;
    if (IGNORED_DIR.test(p) || BINARY_OR_NOISE.test(p) || SECRET_FILE.test(p)) return false;
    if (/(^|\/)(readme[^/]*|package\.json)$/i.test(p)) return false; // fetched separately
    if (e.size <= 0 || e.size > LIMITS.MAX_BLOB_BYTES) return false;
    return CODE_FILE.test(p) || CONFIG_FILE.test(p) || DESIGN_DOC.test(p);
  });

  const picked: PickedFile[] = [];
  const taken = new Set<string>();
  const take = (path: string, category: string) => {
    if (picked.length >= LIMITS.MAX_SOURCE_FILES || taken.has(path)) return;
    taken.add(path);
    picked.push({ path, category });
  };

  // 1. Anchors that explain how the app is wired, secured and deployed.
  //    (Labels here are informational for the reviewer, not rubric keys.)
  const anchors: Array<[RegExp, string]> = [
    [/^firebase\.json$/i, 'config'],
    [/^(database\.rules\.json|firestore\.rules|storage\.rules)$/i, 'security-rules'],
    [/^src\/app\.(tsx|jsx|ts|js)$/i, 'routing'],
  ];
  for (const [re, cat] of anchors) {
    for (const c of candidates) if (re.test(c.path)) take(c.path, cat);
  }
  const design = candidates.filter((c) => DESIGN_DOC.test(c.path)).sort((a, b) => a.path.split('/').length - b.path.split('/').length)[0];
  if (design) take(design.path, 'documentation');

  // 2. Rank files per rubric category. A match on the FILE NAME is worth far more
  //    than a match on a parent folder (so DashboardPage.tsx beats a chart that
  //    merely lives near it), and substantive files beat tiny UI primitives.
  const scoreFile = (c: TreeEntry, key: string, re: RegExp): number => {
    const lower = c.path.toLowerCase();
    const base = lower.slice(lower.lastIndexOf('/') + 1);
    let score: number;
    if (re.test(base)) score = 10;
    else if (re.test(lower)) score = 4;
    else return 0;
    if ((key === 'transactions' || key === 'masterData') && titleRe && titleRe.test(base)) score += 6;
    if (lower.startsWith('src/')) score += 2;
    score += Math.min(Math.floor(c.size / 3000), 3);
    if (c.size < 300) score -= 4;
    if (/(^|\/)(components\/ui|assets)\//.test(lower)) score -= 8;
    if (TEST_FILE.test(lower)) score -= 8;
    if (/\.(css|json)$/.test(lower)) score -= 6;
    return score;
  };
  const ranked = CATEGORY_HINTS.map(({ key, re }) => ({
    key,
    list: candidates
      .map((c) => ({ path: c.path, score: scoreFile(c, key, re) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)),
  }));

  // 3. Round-robin so every category gets a file before any gets a second.
  for (let round = 0; round < 3; round++) {
    for (const { key, list } of ranked) {
      const next = list.find((l) => !taken.has(l.path));
      if (next) take(next.path, key);
    }
  }
  return picked;
}

// ── Collection ───────────────────────────────────────────────────────────────

const PROBE_PATHS = [
  'README.md', 'readme.md', 'package.json', 'firebase.json',
  'database.rules.json', 'DESIGN.md', 'src/main.tsx', 'src/App.tsx',
];

function shallowest(paths: string[]): string | null {
  return [...paths].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))[0] ?? null;
}

export function pickReadmePath(files: string[]): string | null {
  const root = files.filter((p) => /^readme(\.(md|markdown|txt))?$/i.test(p));
  if (root.length) return root.find((p) => /\.md$/i.test(p)) ?? root[0];
  return shallowest(files.filter((p) => !IGNORED_DIR.test(p) && /(^|\/)readme(\.(md|markdown|txt))?$/i.test(p)));
}

export function pickPackageJsonPath(files: string[]): string | null {
  if (files.includes('package.json')) return 'package.json';
  return shallowest(files.filter((p) => !IGNORED_DIR.test(p) && /(^|\/)package\.json$/i.test(p)));
}

const TRANSPORT_FAILURES: FetchKind[] = ['rate_limited', 'bad_credentials', 'forbidden', 'timeout', 'network', 'http_error'];

/** Plain-English explanation of a GitHub failure, safe to show an admin. */
export function describeGithubFailure(kind: FetchKind, httpStatus: number | null, resetAt: number | null): string {
  switch (kind) {
    case 'rate_limited': {
      const when = resetAt ? ` The quota resets at ${new Date(resetAt).toUTCString()}.` : '';
      return `GitHub API rate limit reached.${when} Configure a valid GITHUB_TOKEN on the review service to raise the limit from 60 to 5,000 requests/hour.`;
    }
    case 'bad_credentials':
      return 'GitHub rejected the configured GITHUB_TOKEN (401 Bad credentials). Replace it in the review service environment.';
    case 'forbidden':
      return 'GitHub refused the request (403). The repository may be private or blocked.';
    case 'timeout':
      return 'GitHub did not respond within 10 seconds.';
    case 'network':
      return 'The review service could not reach GitHub (network error).';
    case 'not_found':
      return 'GitHub returned 404: the repository does not exist or is private.';
    case 'empty_repo':
      return 'The repository exists but contains no files (verified).';
    case 'ok':
      return 'GitHub evidence retrieved.';
    default:
      return `GitHub returned an unexpected response${httpStatus ? ` (HTTP ${httpStatus})` : ''}.`;
  }
}

export async function collectRepoEvidence(
  githubUrl: string,
  token: string | undefined,
  hints: { title?: string } = {}
): Promise<RepoEvidence> {
  const blank = (): RepoEvidence => ({
    parsed: null, tree: null, listingSource: 'none', files: [],
    readme: { presence: 'unavailable', path: null, text: null, truncated: false },
    packageJson: { presence: 'unavailable', path: null, text: null },
    hasDesignDoc: false, sources: [], publicProven: false, accessible: false,
    verifiedEmpty: false, notFound: false, unavailable: false, unavailableReason: null,
    tokenConfigured: !!token,
  });
  const ev = blank();

  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    ev.notFound = true;
    ev.unavailableReason = `"${(githubUrl || '').slice(0, 120)}" is not a valid GitHub repository URL.`;
    ev.readme.presence = 'missing';
    ev.packageJson.presence = 'missing';
    return ev;
  }
  ev.parsed = parsed;
  const { owner, repo } = parsed;

  // Memoised raw fetches: a path is requested at most once per review.
  const rawCache = new Map<string, Promise<FileResult>>();
  const getRaw = (path: string, maxBytes = 60_000) => {
    let p = rawCache.get(path);
    if (!p) { p = fetchRawFile(owner, repo, path, maxBytes); rawCache.set(path, p); }
    return p;
  };

  const tree = await listRepoTree(owner, repo, token);
  ev.tree = tree;

  let entries: TreeEntry[] = [];
  if (tree.kind === 'ok') {
    ev.listingSource = 'api';
    entries = tree.entries;
  } else if (tree.kind === 'empty_repo') {
    ev.verifiedEmpty = true;
  } else if (tree.kind === 'not_found') {
    ev.notFound = true;
  } else if (TRANSPORT_FAILURES.includes(tree.kind)) {
    // Listing unavailable — fall back to probing well-known files directly.
    const probes = await Promise.all(PROBE_PATHS.map(async (p) => ({ p, r: await getRaw(p) })));
    const found = probes.filter((x) => x.r.kind === 'ok' && x.r.text !== null);
    if (found.length) {
      ev.listingSource = 'probe';
      entries = found.map((x) => ({ path: x.p, size: x.r.text!.length }));
    }
  }
  ev.files = entries.map((e) => e.path);
  ev.hasDesignDoc = ev.files.some((p) => /design(\.md)?$/i.test(p));

  // README + package.json
  const listingKnown = tree.kind === 'ok';
  const readmePath = listingKnown ? pickReadmePath(ev.files) : (['README.md', 'readme.md'].find((p) => ev.files.includes(p)) ?? null);
  if (readmePath) {
    const r = await getRaw(readmePath, 40_000);
    if (r.kind === 'ok') ev.readme = { presence: 'ok', path: readmePath, text: r.text, truncated: r.truncated };
    else ev.readme = { presence: r.kind === 'not_found' ? 'missing' : 'unavailable', path: readmePath, text: null, truncated: false };
  } else if (listingKnown || tree.kind === 'empty_repo' || tree.kind === 'not_found') {
    ev.readme.presence = 'missing';
  } else {
    // Probe mode and neither README spelling answered ok: 404 from both is a definitive "missing".
    const a = await getRaw('README.md');
    const b = await getRaw('readme.md');
    ev.readme.presence = a.kind === 'not_found' && b.kind === 'not_found' ? 'missing' : 'unavailable';
  }

  const pkgPath = listingKnown ? pickPackageJsonPath(ev.files) : (ev.files.includes('package.json') ? 'package.json' : null);
  if (pkgPath) {
    const r = await getRaw(pkgPath, 20_000);
    if (r.kind === 'ok') ev.packageJson = { presence: 'ok', path: pkgPath, text: r.text };
    else ev.packageJson = { presence: r.kind === 'not_found' ? 'missing' : 'unavailable', path: pkgPath, text: null };
  } else if (listingKnown || tree.kind === 'empty_repo' || tree.kind === 'not_found') {
    ev.packageJson.presence = 'missing';
  } else {
    const r = await getRaw('package.json');
    ev.packageJson.presence = r.kind === 'not_found' ? 'missing' : 'unavailable';
  }

  // Source sampling
  const picks = ev.listingSource === 'none'
    ? []
    : selectKeyFiles(entries, hints);
  const fetched = await Promise.all(
    picks.map(async (pk) => ({ pk, r: await getRaw(pk.path, LIMITS.MAX_BLOB_BYTES) }))
  );
  let budget: number = LIMITS.TOTAL_SOURCE_CHARS;
  for (const { pk, r } of fetched) {
    if (r.kind !== 'ok' || !r.text || budget <= 0) continue;
    const cleaned = redactSecrets(r.text);
    const text = cleaned.slice(0, Math.min(LIMITS.PER_FILE_CHARS, budget));
    budget -= text.length;
    ev.sources.push({ path: pk.path, category: pk.category, text, truncated: r.truncated || cleaned.length > text.length });
  }

  // Public proof + overall verdicts
  const anyRawOk = [...rawCache.values()].length > 0 && (await Promise.all(rawCache.values())).some((r) => r.kind === 'ok');
  ev.publicProven = anyRawOk || (tree.kind === 'ok' && !tree.usedToken);
  ev.accessible = tree.kind === 'ok' || ev.readme.presence === 'ok' || ev.packageJson.presence === 'ok' || ev.sources.length > 0;
  if (!ev.accessible && !ev.verifiedEmpty && !ev.notFound) {
    ev.unavailable = true;
    ev.unavailableReason = describeGithubFailure(tree.kind, tree.httpStatus, tree.rateLimitResetAt);
  }
  return ev;
}

// ── Summaries persisted / shown to admins ────────────────────────────────────

export function buildGithubCheck(ev: RepoEvidence): GithubCheck {
  const t = ev.tree;
  const status: FetchKind = t ? t.kind : 'not_found';
  return {
    status,
    httpStatus: t ? t.httpStatus : null,
    evidenceAvailable: !ev.unavailable,
    message: ev.unavailableReason || describeGithubFailure(status, t?.httpStatus ?? null, t?.rateLimitResetAt ?? null),
    rateLimitRemaining: t?.rateLimitRemaining ?? null,
    rateLimitResetAt: t?.rateLimitResetAt ?? null,
    tokenConfigured: ev.tokenConfigured,
    tokenRejected: !!t?.tokenRejected,
  };
}

export function summarizeEvidence(ev: RepoEvidence, live: LiveUrlEvidence): EvidenceSummary {
  const complete = ev.listingSource === 'api' && !ev.tree?.truncated;
  const listing: EvidenceSummary['listing'] = ev.verifiedEmpty ? 'verified_empty'
    : ev.notFound ? 'not_found'
    : complete ? 'complete'
    : ev.listingSource !== 'none' ? 'partial'
    : 'unavailable';

  const gaps: string[] = [];
  if (listing === 'partial' && ev.listingSource === 'probe') gaps.push(`Full file listing unavailable (${ev.unavailableReason || describeGithubFailure(ev.tree?.kind ?? 'network', ev.tree?.httpStatus ?? null, ev.tree?.rateLimitResetAt ?? null)}) — structure inferred from direct file probes.`);
  if (listing === 'partial' && ev.tree?.truncated) gaps.push('Repository is very large; GitHub truncated the file listing.');
  if (listing === 'unavailable') gaps.push(ev.unavailableReason || 'Repository listing unavailable.');
  if (listing === 'not_found') gaps.push(ev.unavailableReason || 'Repository not found or private.');
  if (ev.readme.presence === 'unavailable') gaps.push('README could not be retrieved.');
  if (ev.packageJson.presence === 'unavailable') gaps.push('package.json could not be retrieved.');
  if (ev.sources.length === 0 && ev.accessible && !ev.verifiedEmpty) gaps.push('No source files could be sampled.');
  if (!live.reachable) gaps.push(live.note);

  let confidence: EvidenceSummary['confidence'] = 'high';
  if (listing !== 'complete' || ev.sources.length < 3 || ev.readme.presence === 'unavailable') confidence = 'low';
  else if (ev.sources.length < 5 || !live.reachable || ev.readme.presence !== 'ok') confidence = 'medium';

  return {
    listing,
    filesListed: ev.files.length,
    readme: ev.readme.presence,
    packageJson: ev.packageJson.presence,
    sourceFilesSampled: ev.sources.length,
    sourceCharsSampled: ev.sources.reduce((n, s) => n + s.text.length, 0),
    liveUrl: live.reachable ? 'reachable' : live.kind === 'console' ? 'console_link' : 'unreachable',
    confidence,
    gaps,
  };
}
