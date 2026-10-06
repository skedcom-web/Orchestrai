// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  LIMITS,
  buildGithubCheck,
  collectRepoEvidence,
  redactSecrets,
  selectKeyFiles,
  summarizeEvidence,
} from '../services/evidence';
import { LiveUrlEvidence } from '../services/liveUrl';
import { RATE_LIMITED, json, loadRealRepoFixture, mockFetch, text, treeResponse } from './helpers';

const REAL_URL = 'https://github.com/Vishakan1807/Vthink-Health';

const liveOk: LiveUrlEvidence = { kind: 'hosting', reachable: true, httpStatus: 200, finalUrl: 'https://x.web.app/', title: 'LabTrack', snippet: 'Sign in', note: 'Live URL responded HTTP 200.' };
const liveConsole: LiveUrlEvidence = { kind: 'console', reachable: false, httpStatus: null, finalUrl: null, title: null, snippet: '', note: 'The submitted link is a Firebase CONSOLE page.' };

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Raw-file responder: README/package.json get realistic bodies, everything else echoes its path. */
const rawFiles = (url: string) => {
  if (/\/README\.md$/i.test(url)) return text('# LabTrack\n\nLaboratory sample tracker.\n\n## Run\nnpm install && npm run dev\n');
  if (/\/package\.json$/.test(url)) return text('{"name":"vthink-health","scripts":{"dev":"vite"}}');
  return text(`// source of ${url.split('/HEAD/')[1]}\n` + 'export const x = 1;\n'.repeat(80));
};

describe('redactSecrets', () => {
  it('removes credential-shaped strings before content leaves the service', () => {
    const dirty = [
      '-----BEGIN PRIVATE KEY-----\nMIIEvQ\n-----END PRIVATE KEY-----',
      'const t = "ghp_' + 'a'.repeat(36) + '"',
      'key: sk-or-v1-' + 'b'.repeat(40),
      'AKIAABCDEFGHIJKLMNOP',
      'apiKey: "AIza' + 'c'.repeat(35) + '"',
      '"private_key": "-----abc-----"',
    ].join('\n');
    const clean = redactSecrets(dirty);
    expect(clean).not.toMatch(/MIIEvQ|ghp_a|sk-or-v1|AKIAABC|AIzac|-----abc-----/);
    expect(clean).toContain('[REDACTED]');
  });
  it('leaves ordinary code untouched', () => {
    const code = 'export const auth = getAuth(app);\nconst role = "admin";';
    expect(redactSecrets(code)).toBe(code);
  });
});

describe('selectKeyFiles — against the real capstone listing', () => {
  const fx = loadRealRepoFixture();
  const picks = selectKeyFiles(fx.blobs, { title: 'Laboratory Sample Tracker' });
  const paths = picks.map((p) => p.path);

  it('is bounded and deterministic', () => {
    expect(picks.length).toBeGreaterThan(5);
    expect(picks.length).toBeLessThanOrEqual(LIMITS.MAX_SOURCE_FILES);
    expect(selectKeyFiles(fx.blobs, { title: 'Laboratory Sample Tracker' })).toEqual(picks);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('samples wiring, security rules and the file that best evidences each rubric area', () => {
    expect(paths).toContain('firebase.json');
    expect(paths).toContain('database.rules.json');
    expect(paths).toContain('src/App.tsx');
    // workflow is the heaviest category (20 pts): its state definitions must be shown, not a chart
    expect(paths).toContain('src/constants/workflowStates.ts');
    expect(paths).toContain('src/pages/dashboard/DashboardPage.tsx');
    expect(paths).toContain('src/components/auth/RoleGuard.tsx');
    expect(paths.some((p) => /pages\/auth\/LoginPage/.test(p))).toBe(true);
    expect(paths.some((p) => /pages\/reports\//.test(p))).toBe(true);
    expect(paths.some((p) => /pages\/samples\//.test(p))).toBe(true); // main transaction entity
  });

  it('covers every rubric category with at least one file', () => {
    const cats = new Set(picks.map((p) => p.category));
    for (const c of ['workflow', 'transactions', 'rbac', 'authentication', 'dashboard', 'reports', 'masterData']) {
      expect(cats.has(c)).toBe(true);
    }
  });

  it('never selects noise: lockfiles, images, styles, UI primitives, template leftovers, README/package.json', () => {
    for (const p of paths) {
      expect(p).not.toMatch(/package-lock|\.svg$|\.png$|\.css$|^README|^package\.json$|components\/ui\/|assets\/|^src\/main\.tsx?$|vite\.config/);
    }
  });

  it('never selects secret-bearing files even when they are present', () => {
    const dangerous = [
      ...fx.blobs,
      { path: '.env', size: 100 },
      { path: '.env.production', size: 100 },
      { path: 'serviceAccountKey.json', size: 2000 },
      { path: 'config/firebase-credentials.json', size: 2000 },
      { path: 'keys/deploy.pem', size: 1700 },
      { path: 'node_modules/left-pad/index.js', size: 500 },
      { path: 'dist/assets/index.js', size: 500 },
    ];
    const chosen = selectKeyFiles(dangerous).map((p) => p.path);
    expect(chosen.filter((p) => /\.env|serviceAccount|credentials|\.pem|node_modules|^dist\//.test(p))).toEqual([]);
  });

  it('skips oversized generated blobs', () => {
    const chosen = selectKeyFiles([{ path: 'src/dashboard.js', size: LIMITS.MAX_BLOB_BYTES + 1 }, { path: 'src/Dashboard.tsx', size: 2000 }]);
    expect(chosen.map((p) => p.path)).toEqual(['src/Dashboard.tsx']);
  });
});

describe('collectRepoEvidence', () => {
  it('collects real evidence for the repo that was wrongly reported as empty — with ONE REST call', async () => {
    const fx = loadRealRepoFixture();
    const { calls } = mockFetch([
      [/api\.github\.com.*git\/trees/, () => treeResponse(fx)],
      [/raw\.githubusercontent\.com/, (u) => rawFiles(u)],
    ]);

    const ev = await collectRepoEvidence(REAL_URL, undefined, { title: 'Laboratory Sample Tracker' });

    expect(ev.unavailable).toBe(false);
    expect(ev.accessible).toBe(true);
    expect(ev.verifiedEmpty).toBe(false);
    expect(ev.listingSource).toBe('api');
    expect(ev.files).toHaveLength(88);
    expect(ev.readme.presence).toBe('ok');
    expect(ev.readme.text).toContain('LabTrack');
    expect(ev.packageJson.presence).toBe('ok');
    expect(ev.hasDesignDoc).toBe(false); // the real repo genuinely has no DESIGN.md
    expect(ev.publicProven).toBe(true);
    expect(ev.sources.length).toBeGreaterThanOrEqual(5);

    // Budgets hold.
    for (const s of ev.sources) expect(s.text.length).toBeLessThanOrEqual(LIMITS.PER_FILE_CHARS);
    expect(ev.sources.reduce((n, s) => n + s.text.length, 0)).toBeLessThanOrEqual(LIMITS.TOTAL_SOURCE_CHARS);

    // Quota efficiency: 1 metered REST call, every file body from raw.githubusercontent.com.
    const rest = calls.filter((c) => /api\.github\.com/.test(c.url));
    expect(rest).toHaveLength(1);
    expect(calls.filter((c) => /raw\.githubusercontent\.com/.test(c.url)).length).toBeGreaterThanOrEqual(7);
  });

  it('redacts secrets found in sampled source before they can reach the model', async () => {
    const fx = loadRealRepoFixture();
    mockFetch([
      [/git\/trees/, () => treeResponse(fx)],
      [/raw\.githubusercontent\.com/, (u) =>
        /firebase\.ts|firebase\.json/.test(u)
          ? text('const key = "ghp_' + 'z'.repeat(36) + '";')
          : rawFiles(u)],
    ]);
    const ev = await collectRepoEvidence(REAL_URL, undefined);
    expect(ev.sources.map((s) => s.text).join('\n')).not.toContain('ghp_zzzz');
  });

  it('listing rate-limited but raw files reachable → PARTIAL evidence, not "empty"', async () => {
    mockFetch([
      [/api\.github\.com/, RATE_LIMITED],
      [/raw\.githubusercontent\.com/, (u) => (/(README|package\.json|firebase\.json|src\/main\.tsx|src\/App\.tsx)/.test(u) ? rawFiles(u) : text('Not Found', 404))],
    ]);
    const ev = await collectRepoEvidence(REAL_URL, undefined);

    expect(ev.unavailable).toBe(false);
    expect(ev.accessible).toBe(true);
    expect(ev.listingSource).toBe('probe');
    expect(ev.readme.presence).toBe('ok');
    expect(ev.packageJson.presence).toBe('ok');
    expect(ev.publicProven).toBe(true);

    const summary = summarizeEvidence(ev, liveOk);
    expect(summary.listing).toBe('partial');
    expect(summary.confidence).toBe('low');
    expect(summary.gaps.join(' ')).toMatch(/rate limit/i);
  });

  it('everything unreachable → UNAVAILABLE with an actionable reason (never an empty-repo verdict)', async () => {
    mockFetch([
      [/api\.github\.com/, RATE_LIMITED],
      [/raw\.githubusercontent\.com/, () => { throw new TypeError('fetch failed'); }],
    ]);
    const ev = await collectRepoEvidence(REAL_URL, undefined);

    expect(ev.unavailable).toBe(true);
    expect(ev.verifiedEmpty).toBe(false);
    expect(ev.notFound).toBe(false);
    expect(ev.accessible).toBe(false);
    expect(ev.unavailableReason).toMatch(/rate limit/i);
    expect(ev.unavailableReason).toMatch(/GITHUB_TOKEN/);

    const check = buildGithubCheck(ev);
    expect(check).toMatchObject({ status: 'rate_limited', httpStatus: 403, evidenceAvailable: false, rateLimitRemaining: 0 });
    expect(check.rateLimitResetAt).toBeGreaterThan(Date.now());
  });

  it('a rejected token is surfaced and the review still succeeds anonymously', async () => {
    const fx = loadRealRepoFixture();
    mockFetch([
      [/git\/trees/, (_u, init) => (new Headers(init?.headers as any).get('authorization') ? json({ message: 'Bad credentials' }, 401) : treeResponse(fx))],
      [/raw\.githubusercontent\.com/, (u) => rawFiles(u)],
    ]);
    const ev = await collectRepoEvidence(REAL_URL, 'ghp_expired');
    expect(ev.unavailable).toBe(false);
    expect(ev.files).toHaveLength(88);
    const check = buildGithubCheck(ev);
    expect(check.tokenRejected).toBe(true);
    expect(check.tokenConfigured).toBe(true);
  });

  it('404 → notFound (definitive), not "unavailable"', async () => {
    mockFetch([[/api\.github\.com/, () => json({ message: 'Not Found' }, 404)], [/raw\./, () => text('404', 404)]]);
    const ev = await collectRepoEvidence('https://github.com/o/ghost', undefined);
    expect(ev.notFound).toBe(true);
    expect(ev.unavailable).toBe(false);
    expect(summarizeEvidence(ev, liveOk).listing).toBe('not_found');
  });

  it('a genuinely empty repository is VERIFIED empty (409)', async () => {
    mockFetch([[/api\.github\.com/, () => json({ message: 'Git Repository is empty.' }, 409)], [/raw\./, () => text('404', 404)]]);
    const ev = await collectRepoEvidence('https://github.com/o/blank', undefined);
    expect(ev.verifiedEmpty).toBe(true);
    expect(ev.unavailable).toBe(false);
    expect(summarizeEvidence(ev, liveOk).listing).toBe('verified_empty');
  });

  it('an unparseable GitHub URL is a definitive data problem, not a transport failure', async () => {
    const { impl } = mockFetch([]);
    const ev = await collectRepoEvidence('https://example.com/not-github', undefined);
    expect(ev.parsed).toBeNull();
    expect(ev.notFound).toBe(true);
    expect(ev.unavailable).toBe(false);
    expect(impl).not.toHaveBeenCalled();
  });

  it('finds README / package.json in non-standard places (case, monorepo subfolder)', async () => {
    mockFetch([
      [/git\/trees/, () => json({ truncated: false, tree: [
        { path: 'Readme.md', type: 'blob', size: 100 },
        { path: 'frontend/package.json', type: 'blob', size: 100 },
        { path: 'frontend/src/App.tsx', type: 'blob', size: 900 },
      ] })],
      [/raw\.githubusercontent\.com/, (u) => rawFiles(u)],
    ]);
    const ev = await collectRepoEvidence(REAL_URL, undefined);
    expect(ev.readme).toMatchObject({ presence: 'ok', path: 'Readme.md' });
    expect(ev.packageJson).toMatchObject({ presence: 'ok', path: 'frontend/package.json' });
  });
});

describe('summarizeEvidence confidence', () => {
  it('is HIGH only with a complete listing, README, enough source and a live app', async () => {
    const fx = loadRealRepoFixture();
    mockFetch([[/git\/trees/, () => treeResponse(fx)], [/raw\.githubusercontent\.com/, (u) => rawFiles(u)]]);
    const ev = await collectRepoEvidence(REAL_URL, undefined);
    expect(summarizeEvidence(ev, liveOk).confidence).toBe('high');
    // Same repo, but the submitted live link is a console page → capped at MEDIUM.
    const s = summarizeEvidence(ev, liveConsole);
    expect(s.confidence).toBe('medium');
    expect(s.liveUrl).toBe('console_link');
    expect(s.gaps.join(' ')).toMatch(/CONSOLE/);
  });
});
