// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { extractTitle, extractVisibleText, inspectLiveUrl } from '../services/liveUrl';
import { collectRepoEvidence, summarizeEvidence } from '../services/evidence';
import { buildScoringPrompt, parseModelJson, RUBRIC } from '../services/openrouter';
import { RATE_LIMITED, loadRealRepoFixture, mockFetch, text, treeResponse } from './helpers';

const withUrl = (r: Response, url: string) => {
  Object.defineProperty(r, 'url', { value: url });
  return r;
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('inspectLiveUrl', () => {
  it('a Firebase CONSOLE link is not a live app — and is never fetched (it 200s via a sign-in redirect)', async () => {
    const { calls } = mockFetch([[/labtrack-cap22\.web\.app/, () => text('Site Not Found', 404)]]);
    const r = await inspectLiveUrl('https://console.firebase.google.com/u/0/project/labtrack-cap22/overview');

    expect(r.kind).toBe('console');
    expect(r.reachable).toBe(false);
    expect(r.derived).toEqual({ url: 'https://labtrack-cap22.web.app', reachable: false, httpStatus: 404 });
    expect(r.note).toMatch(/CONSOLE/);
    expect(r.note).toMatch(/labtrack-cap22\.web\.app/);
    expect(calls.some((c) => /console\.firebase\.google\.com/.test(c.url))).toBe(false);
  });

  it('flags when the derived hosting URL is actually live (learner submitted the wrong link)', async () => {
    mockFetch([[/myapp\.web\.app/, () => text('<html><title>My App</title><body>hello</body></html>')]]);
    const r = await inspectLiveUrl('https://console.firebase.google.com/project/myapp/overview');
    expect(r.reachable).toBe(false);
    expect(r.derived?.reachable).toBe(true);
    expect(r.note).toMatch(/DOES respond/);
  });

  it('reads a real deployed site: status, title and visible text', async () => {
    mockFetch([[/labtrack\.web\.app/, () =>
      withUrl(text('<html><head><title>LabTrack — Sign in</title><style>x{}</style></head><body><script>var a=1</script><h1>Sign in to LabTrack</h1><p>Laboratory samples</p></body></html>'), 'https://labtrack.web.app/')]]);
    const r = await inspectLiveUrl('https://labtrack.web.app');
    expect(r).toMatchObject({ kind: 'hosting', reachable: true, httpStatus: 200, title: 'LabTrack — Sign in' });
    expect(r.snippet).toContain('Sign in to LabTrack');
    expect(r.snippet).not.toMatch(/var a=1|x\{\}/);
  });

  it('a redirect to a Google sign-in page is NOT reachable', async () => {
    mockFetch([[/private\.web\.app/, () => withUrl(text('<html>login</html>'), 'https://accounts.google.com/signin')]]);
    const r = await inspectLiveUrl('https://private.web.app');
    expect(r.reachable).toBe(false);
    expect(r.note).toMatch(/sign-in/i);
  });

  it('404, network failure and junk input are all unreachable with a reason', async () => {
    mockFetch([[/gone\.web\.app/, () => text('Not found', 404)], [/down\.example\.com/, () => { throw new TypeError('fetch failed'); }]]);
    expect((await inspectLiveUrl('https://gone.web.app')).reachable).toBe(false);
    const down = await inspectLiveUrl('https://down.example.com');
    expect(down.reachable).toBe(false);
    expect(down.note).toMatch(/could not be reached/);
    expect((await inspectLiveUrl('')).kind).toBe('invalid');
    expect((await inspectLiveUrl('http://[bad')).kind).toBe('invalid');
  });

  it('notes a client-rendered shell instead of pretending there is no content', async () => {
    mockFetch([[/spa\.web\.app/, () => text('<html><head><title>App</title></head><body><div id="root"></div><script src="/a.js"></script></body></html>')]]);
    const r = await inspectLiveUrl('https://spa.web.app');
    expect(r.reachable).toBe(true);
    expect(r.note).toMatch(/client-rendered/);
  });

  it('helpers extract title and text', () => {
    expect(extractTitle('<title>\n  Hi  there </title>')).toBe('Hi there');
    expect(extractTitle('<p>none</p>')).toBeNull();
    expect(extractVisibleText('<p>a&nbsp;&amp;&nbsp;b</p>')).toBe('a & b');
  });
});

describe('buildScoringPrompt — what the model is actually shown', () => {
  const submission = {
    capstoneId: 'CAP-22', capstoneTitle: 'Laboratory Sample Tracker', capstoneDomain: 'Healthcare',
    githubUrl: 'https://github.com/Vishakan1807/Vthink-Health',
    firebaseUrl: 'https://console.firebase.google.com/u/0/project/labtrack-cap22/overview',
    readmeUrl: 'x',
  };
  const consoleLive = {
    kind: 'console' as const, reachable: false, httpStatus: null, finalUrl: null, title: null, snippet: '',
    note: 'The submitted link is a Firebase CONSOLE page (requires sign-in), not a running application.',
  };

  const healthy = async () => {
    const fx = loadRealRepoFixture();
    mockFetch([
      [/git\/trees/, () => treeResponse(fx)],
      [/raw\.githubusercontent\.com/, (u) =>
        /README/.test(u) ? text('# LabTrack\nLaboratory Sample Tracker with RBAC and FSM workflow.')
        : /package\.json/.test(u) ? text('{"name":"vthink-health"}')
        : text(`// ${u.split('/HEAD/')[1]}\n` + 'export const a = 1;\n'.repeat(120))],
    ]);
    const ev = await collectRepoEvidence(submission.githubUrl, undefined, { title: submission.capstoneTitle });
    return { ev, summary: summarizeEvidence(ev, consoleLive) };
  };

  it('gives the model real project evidence for the repo that was reported empty', async () => {
    const { ev, summary } = await healthy();
    const prompt = buildScoringPrompt(submission, ev, consoleLive, summary);

    expect(prompt).toContain('LabTrack');
    expect(prompt).toContain('88 files');
    expect(prompt).toContain('src/pages/auth/LoginPage.tsx');
    expect(prompt).toContain('src/constants/workflowStates.ts');
    expect(prompt).toMatch(/--- src\/App\.tsx \[\w+\] ---/);
    expect(prompt).toContain('"name":"vthink-health"');
    expect(prompt).toContain('CONSOLE page');
    expect(prompt).not.toMatch(/\(empty\)|\(no README found\)|completely empty/);
    // Previous behaviour sent ~594 tokens in total. This is evidence-rich but bounded.
    expect(prompt.length).toBeGreaterThan(8_000);
    expect(prompt.length).toBeLessThan(60_000);
  });

  it('keeps the rubric, task wording and strict-JSON contract intact', async () => {
    const { ev, summary } = await healthy();
    const prompt = buildScoringPrompt(submission, ev, consoleLive, summary);
    for (const [k, max] of Object.entries(RUBRIC)) expect(prompt).toContain(`${k}: ${max}`);
    expect(prompt).toContain('workflow: 20        — Status transition matrix correctness (HIGHEST WEIGHT');
    expect(prompt).toContain('OUTPUT FORMAT (strict JSON only, no markdown fences, no commentary)');
    expect(prompt).toContain('"overallObservations": "<2-3 sentences summarising strengths and gaps>"');
  });

  it('labels UNAVAILABLE evidence as unknown — it never presents a fetch failure as "(empty)"', async () => {
    mockFetch([[/api\.github\.com/, RATE_LIMITED], [/raw\./, (u) => (/README/.test(u) ? text('# Hi') : text('x', 404))]]);
    const ev = await collectRepoEvidence(submission.githubUrl, undefined);
    ev.packageJson.presence = 'unavailable';
    const summary = summarizeEvidence(ev, consoleLive);
    const prompt = buildScoringPrompt(submission, ev, consoleLive, summary);

    expect(prompt).toContain('does NOT mean');
    expect(prompt).toContain('PARTIAL');
    expect(prompt).not.toMatch(/\(empty\)/);
    // The rule line mentions the phrase; the LISTING itself must not claim it.
    expect(prompt).not.toMatch(/Repository file listing:\s*\nVERIFIED EMPTY/);
    expect(prompt).not.toMatch(/Repository listing : VERIFIED EMPTY/);
    expect(prompt).toContain('Never describe the repository as empty unless the listing says VERIFIED EMPTY');
    expect(prompt).toContain('Score 0 only when evidence WAS retrieved');
  });

  it('says VERIFIED EMPTY only for a repository GitHub confirmed has no files', async () => {
    mockFetch([[/api\.github\.com/, () => new Response('{"message":"Git Repository is empty."}', { status: 409 })], [/raw\./, () => text('x', 404)]]);
    const ev = await collectRepoEvidence('https://github.com/o/blank', undefined);
    const prompt = buildScoringPrompt(submission, ev, consoleLive, summarizeEvidence(ev, consoleLive));
    expect(prompt).toContain('VERIFIED EMPTY');
    expect(prompt).toContain('MISSING');
  });
});

describe('parseModelJson', () => {
  const obj = { scores: { workflow: 15 } };
  it('parses plain JSON, fenced JSON, and JSON wrapped in chatter', () => {
    expect(parseModelJson(JSON.stringify(obj))).toEqual(obj);
    expect(parseModelJson('```json\n' + JSON.stringify(obj) + '\n```')).toEqual(obj);
    expect(parseModelJson('Sure! Here you go:\n' + JSON.stringify(obj) + '\nHope that helps.')).toEqual(obj);
  });
  it('returns null for non-JSON', () => {
    expect(parseModelJson('I cannot do that')).toBeNull();
    expect(parseModelJson('')).toBeNull();
  });
});
