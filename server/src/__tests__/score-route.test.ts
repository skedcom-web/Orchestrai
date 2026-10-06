// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { RATE_LIMITED, json, loadRealRepoFixture, mockFetch, text, treeResponse } from './helpers';

const h = vi.hoisted(() => ({
  writes: [] as Array<[string, any]>,
  submission: null as any,
}));

vi.mock('../services/firebase', () => ({
  getDb: () => ({
    ref: (path: string) => ({
      get: async () => ({ exists: () => !!h.submission, val: () => h.submission }),
      set: async (value: unknown) => { h.writes.push([path, value]); },
    }),
  }),
}));

import router from '../routes/score';

const SUB_ID = '5pa9ik4a5_CAP-22';
// Exactly what is stored for the learner whose review was wrongly scored 0/100.
const realSubmission = () => ({
  capstoneId: 'CAP-22',
  capstoneTitle: 'Laboratory Sample Tracker',
  capstoneDomain: 'Healthcare',
  githubUrl: 'https://github.com/Vishakan1807/Vthink-Health',
  firebaseUrl: 'https://console.firebase.google.com/u/0/project/labtrack-cap22/overview',
  readmeUrl: 'https://github.com/Vishakan1807/Vthink-Health/blob/main/README.md',
});

const AI_OK = {
  scores: { authentication: 8, dashboard: 8, masterData: 7, transactions: 12, workflow: 15, rbac: 12, reports: 8, deployment: 1, documentation: 3 },
  rationale: { authentication: 'LoginPage + auth.service present.' },
  overallObservations: 'Solid implementation with RBAC and a status FSM.',
};

function run(body: any, headers: Record<string, string> = {}) {
  const handler = (router as any).stack[0].route.stack[0].handle;
  const res: any = { statusCode: 200, body: undefined };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  return handler({ body, headers }, res).then(() => res);
}

const writeTo = (suffix: string) => h.writes.filter(([p]) => p.endsWith(suffix));

function stubHealthyGithub(opts: { aiContent?: string; aiStatus?: number } = {}) {
  const fx = loadRealRepoFixture();
  let sentToModel: any = null;
  const mocks = mockFetch([
    [/api\.github\.com.*git\/trees/, () => treeResponse(fx)],
    [/raw\.githubusercontent\.com/, (u) =>
      /README\.md$/.test(u) ? text('# ⚗️ LabTrack — Laboratory Sample Tracker\n\nRBAC roles, FSM workflow, reports.\n')
      : /package\.json$/.test(u) ? text('{"name":"vthink-health","scripts":{"build":"vite build"}}')
      : text(`// ${u.split('/HEAD/')[1]}\n` + 'export const v = 1;\n'.repeat(60))],
    [/labtrack-cap22\.web\.app/, () => text('Site Not Found', 404)],
    [/openrouter\.ai/, (_u, init) => {
      sentToModel = JSON.parse(String(init?.body));
      return json({ choices: [{ message: { content: opts.aiContent ?? '```json\n' + JSON.stringify(AI_OK) + '\n```' } }], usage: { prompt_tokens: 9000, completion_tokens: 400 } }, opts.aiStatus ?? 200);
    }],
  ]);
  return { ...mocks, sent: () => sentToModel };
}

beforeEach(() => {
  h.writes.length = 0;
  h.submission = realSubmission();
  process.env.OPENROUTER_API_KEY = 'test-key';
  delete process.env.REVIEW_SERVICE_API_KEY;
  delete process.env.GITHUB_TOKEN;
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/score-capstone — the submission that was scored 0/100 "repository empty"', () => {
  it('now analyses the real repository and sends the model real evidence', async () => {
    const m = stubHealthyGithub();
    const res = await run({ submissionId: SUB_ID });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const t = res.body.tierBSuggestion;
    expect(t.total).toBe(8 + 8 + 7 + 12 + 15 + 12 + 8 + 1 + 3);
    expect(t.evidence).toMatchObject({ listing: 'complete', filesListed: 88, readme: 'ok', packageJson: 'ok' });
    expect(t.evidence.sourceFilesSampled).toBeGreaterThanOrEqual(5);
    expect(t.promptChars).toBeGreaterThan(8_000);

    // What the model received.
    const prompt: string = m.sent().messages[1].content;
    expect(prompt).toContain('LabTrack');
    expect(prompt).toContain('88 files');
    expect(prompt).toContain('src/pages/auth/LoginPage.tsx');
    expect(prompt).not.toMatch(/\(empty\)|\(no README found\)|completely empty/);

    // Rubric / schema preserved: same RTDB paths as before.
    expect(writeTo('/autoChecks')).toHaveLength(1);
    expect(writeTo('/autoScore')).toHaveLength(1);
    expect(writeTo('/tierBSuggestion')).toHaveLength(1);
    expect(h.writes.every(([p]) => p.startsWith(`reviews/${SUB_ID}/`))).toBe(true);
  });

  it('Tier A reports the truth: repo public, README + package.json found, 88 files', async () => {
    stubHealthyGithub();
    const res = await run({ submissionId: SUB_ID });
    expect(res.body.autoChecks).toMatchObject({
      githubReachable: true, githubPublic: true, hasReadme: true, hasPackageJson: true,
      hasDesignDoc: false, fileCount: 88,
    });
    expect(res.body.autoChecks.githubCheck).toMatchObject({ status: 'ok', evidenceAvailable: true });
  });

  it('stops giving +5 for a Firebase CONSOLE link and flags the confidence cap', async () => {
    stubHealthyGithub();
    const res = await run({ submissionId: SUB_ID });
    expect(res.body.autoChecks).toMatchObject({ firebaseReachable: false, firebaseUrlKind: 'console' });
    expect(res.body.autoScore).toBe(3); // README only; previously 8 because the console link counted as "live"
    expect(res.body.tierBSuggestion.evidence.confidence).toBe('medium');
    expect(res.body.tierBSuggestion.overallObservations).toMatch(/\[Evidence confidence: MEDIUM/);
    expect(res.body.tierBSuggestion.overallObservations).toMatch(/CONSOLE/);
  });

  it('tolerates a fenced model response and clamps out-of-range scores to the rubric', async () => {
    stubHealthyGithub({ aiContent: '```json\n' + JSON.stringify({ ...AI_OK, scores: { ...AI_OK.scores, authentication: 99, rbac: -4, workflow: '15' } }) + '\n```' });
    const res = await run({ submissionId: SUB_ID });
    const s = res.body.tierBSuggestion.perCategory;
    expect(s.authentication).toBe(10);
    expect(s.rbac).toBe(0);
    expect(s.workflow).toBe(15);
  });
});

describe('POST /api/score-capstone — when GitHub cannot be reached', () => {
  function stubGithubDown() {
    return mockFetch([
      [/api\.github\.com/, RATE_LIMITED],
      [/raw\.githubusercontent\.com/, () => { throw new TypeError('fetch failed'); }],
      [/labtrack-cap22\.web\.app/, () => text('Site Not Found', 404)],
      [/openrouter\.ai/, () => json({ choices: [{ message: { content: '{}' } }] })],
    ]);
  }

  it('refuses to fabricate a score: 502 with the real reason, model never called', async () => {
    const m = stubGithubDown();
    const res = await run({ submissionId: SUB_ID });

    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({ success: false, code: 'GITHUB_EVIDENCE_UNAVAILABLE' });
    expect(res.body.error).toMatch(/rate limit/i);
    expect(res.body.error).toMatch(/GITHUB_TOKEN/);
    expect(res.body.githubCheck).toMatchObject({ status: 'rate_limited', evidenceAvailable: false });
    expect(m.calls.some((c) => /openrouter\.ai/.test(c.url))).toBe(false);
  });

  it('leaves any existing suggestion and Tier A result untouched; records only the diagnosis', async () => {
    stubGithubDown();
    await run({ submissionId: SUB_ID });

    expect(writeTo('/tierBSuggestion')).toHaveLength(0);
    expect(writeTo('/autoScore')).toHaveLength(0);
    const diag = writeTo('/autoChecks/githubCheck');
    expect(diag).toHaveLength(1);
    expect(diag[0][1]).toMatchObject({ status: 'rate_limited', httpStatus: 403 });
    expect(h.writes.filter(([p]) => p.endsWith('/autoChecks'))).toHaveLength(0);
  });

  it('tierAOnly reports unavailability instead of writing false ✗ results', async () => {
    stubGithubDown();
    const res = await run({ submissionId: SUB_ID, tierAOnly: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, evidenceAvailable: false });
    expect(writeTo('/autoScore')).toHaveLength(0);
  });

  it('a genuinely missing repository (404) is still scored — as a definitive finding', async () => {
    mockFetch([
      [/api\.github\.com/, () => json({ message: 'Not Found' }, 404)],
      [/raw\./, () => text('404', 404)],
      [/labtrack-cap22\.web\.app/, () => text('x', 404)],
      [/openrouter\.ai/, () => json({ choices: [{ message: { content: JSON.stringify({ scores: {}, rationale: {}, overallObservations: 'Repository not found.' }) } }] })],
    ]);
    const res = await run({ submissionId: SUB_ID });
    expect(res.statusCode).toBe(200);
    expect(res.body.autoChecks).toMatchObject({ githubReachable: true, githubPublic: false, fileCount: 0 });
    expect(res.body.tierBSuggestion.evidence.listing).toBe('not_found');
  });
});

describe('POST /api/score-capstone — unchanged guards', () => {
  it('enforces the x-api-key when REVIEW_SERVICE_API_KEY is set', async () => {
    process.env.REVIEW_SERVICE_API_KEY = 'secret';
    stubHealthyGithub();
    expect((await run({ submissionId: SUB_ID })).statusCode).toBe(401);
    expect((await run({ submissionId: SUB_ID }, { 'x-api-key': 'secret' })).statusCode).toBe(200);
  });

  it('validates the request and surfaces a missing submission', async () => {
    stubHealthyGithub();
    expect((await run({})).statusCode).toBe(400);
    expect((await run({ submissionId: 'nounderscore' })).statusCode).toBe(400);
    h.submission = null;
    expect((await run({ submissionId: SUB_ID })).statusCode).toBe(404);
  });

  it('reports a missing OPENROUTER_API_KEY clearly and surfaces model failures', async () => {
    stubHealthyGithub();
    delete process.env.OPENROUTER_API_KEY;
    expect((await run({ submissionId: SUB_ID })).statusCode).toBe(500);

    process.env.OPENROUTER_API_KEY = 'k';
    vi.unstubAllGlobals();
    stubHealthyGithub({ aiStatus: 402 });
    const res = await run({ submissionId: SUB_ID });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/OpenRouter 402/);
  });

  it('tierAOnly never calls the model', async () => {
    const m = stubHealthyGithub();
    const res = await run({ submissionId: SUB_ID, tierAOnly: true });
    expect(res.body.autoChecks.fileCount).toBe(88);
    expect(m.calls.some((c) => /openrouter\.ai/.test(c.url))).toBe(false);
  });
});
