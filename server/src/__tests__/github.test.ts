// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fetchRawFile, listRepoTree, parseGitHubUrl, sanitizeToken } from '../services/github';
import { RATE_LIMITED, json, loadRealRepoFixture, mockFetch, text, treeResponse } from './helpers';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('parseGitHubUrl', () => {
  it.each([
    ['https://github.com/Vishakan1807/Vthink-Health', 'Vishakan1807', 'Vthink-Health'],
    ['https://github.com/Vishakan1807/Vthink-Health/', 'Vishakan1807', 'Vthink-Health'],
    ['https://github.com/o/r.git', 'o', 'r'],
    ['https://github.com/o/r/tree/main/src', 'o', 'r'],
    ['  https://www.github.com/o/r  ', 'o', 'r'],
    ['github.com/o/r', 'o', 'r'],
  ])('parses %s', (url, owner, repo) => {
    expect(parseGitHubUrl(url)).toEqual({ owner, repo });
  });

  it.each([
    'https://notgithub.com/o/r',
    'https://github.com/only-owner',
    'https://gitlab.com/o/r',
    '',
    'not a url',
  ])('rejects %s', (url) => {
    expect(parseGitHubUrl(url)).toBeNull();
  });
});

describe('sanitizeToken', () => {
  it('strips quotes, whitespace, newlines and Bearer/token prefixes (a pasted-secret failure mode)', () => {
    expect(sanitizeToken('ghp_abc123')).toBe('ghp_abc123');
    expect(sanitizeToken('"ghp_abc123"')).toBe('ghp_abc123');
    expect(sanitizeToken("'ghp_abc123'\n")).toBe('ghp_abc123');
    expect(sanitizeToken('Bearer ghp_abc123')).toBe('ghp_abc123');
    expect(sanitizeToken('token ghp_abc123')).toBe('ghp_abc123');
  });
  it('returns undefined for empty or unusable values', () => {
    expect(sanitizeToken(undefined)).toBeUndefined();
    expect(sanitizeToken('   ')).toBeUndefined();
    expect(sanitizeToken('ghp_abc 123')).toBeUndefined();
  });
});

describe('listRepoTree', () => {
  it('lists the REAL capstone repo (88 files) and sends the required GitHub headers', async () => {
    const fx = loadRealRepoFixture();
    const { calls } = mockFetch([[/api\.github\.com\/repos\/.*\/git\/trees\/HEAD/, () => treeResponse(fx)]]);

    const r = await listRepoTree('Vishakan1807', 'Vthink-Health');

    expect(r.kind).toBe('ok');
    expect(r.totalBlobs).toBe(88);
    expect(r.entries.map((e) => e.path)).toContain('src/pages/dashboard/DashboardPage.tsx');
    expect(r.rateLimitRemaining).toBe(55);
    // GitHub rejects API requests that lack a User-Agent.
    expect(calls[0].headers['user-agent']).toMatch(/OrchestrAI/);
    expect(calls[0].headers['x-github-api-version']).toBeTruthy();
    expect(calls[0].headers['authorization']).toBeUndefined();
  });

  it('classifies an exhausted quota as rate_limited — NOT as an empty repository', async () => {
    mockFetch([[/git\/trees/, RATE_LIMITED]]);
    const r = await listRepoTree('o', 'r');
    expect(r.kind).toBe('rate_limited');
    expect(r.entries).toEqual([]);
    expect(r.httpStatus).toBe(403);
    expect(r.rateLimitRemaining).toBe(0);
    expect(r.rateLimitResetAt).toBeGreaterThan(Date.now());
  });

  it('classifies 429 as rate_limited', async () => {
    mockFetch([[/git\/trees/, () => json({ message: 'slow down' }, 429, { 'retry-after': '60' })]]);
    expect((await listRepoTree('o', 'r')).kind).toBe('rate_limited');
  });

  it('distinguishes a plain 403 (forbidden) from a rate limit', async () => {
    mockFetch([[/git\/trees/, () => json({ message: 'Resource not accessible' }, 403, { 'x-ratelimit-remaining': '40' })]]);
    expect((await listRepoTree('o', 'r')).kind).toBe('forbidden');
  });

  it('maps 404 → not_found and 409 → empty_repo (GitHub: "Git Repository is empty")', async () => {
    mockFetch([[/repos\/o\/missing/, () => json({ message: 'Not Found' }, 404)], [/repos\/o\/blank/, () => json({ message: 'Git Repository is empty.' }, 409)]]);
    expect((await listRepoTree('o', 'missing')).kind).toBe('not_found');
    expect((await listRepoTree('o', 'blank')).kind).toBe('empty_repo');
  });

  it('treats a 200 with zero blobs as a verified empty repository', async () => {
    mockFetch([[/git\/trees/, () => json({ tree: [], truncated: false })]]);
    expect((await listRepoTree('o', 'r')).kind).toBe('empty_repo');
  });

  it('reports network failures and timeouts as such', async () => {
    mockFetch([[/repos\/o\/down/, () => { throw new TypeError('fetch failed'); }], [/repos\/o\/slow/, () => { throw Object.assign(new Error('timed out'), { name: 'TimeoutError' }); }]]);
    expect((await listRepoTree('o', 'down')).kind).toBe('network');
    expect((await listRepoTree('o', 'slow')).kind).toBe('timeout');
  });

  it('retries ANONYMOUSLY when GitHub rejects the token, so a stale token cannot break public repos', async () => {
    const fx = loadRealRepoFixture();
    const { calls } = mockFetch([
      [/git\/trees/, (_u, init) => {
        const auth = new Headers(init?.headers as any).get('authorization');
        return auth ? json({ message: 'Bad credentials' }, 401) : treeResponse(fx);
      }],
    ]);

    const r = await listRepoTree('Vishakan1807', 'Vthink-Health', 'ghp_expired_token');

    expect(r.kind).toBe('ok');
    expect(r.totalBlobs).toBe(88);
    expect(r.tokenRejected).toBe(true);
    expect(r.usedToken).toBe(false);
    expect(calls).toHaveLength(2);
    expect(calls[0].headers['authorization']).toBe('Bearer ghp_expired_token');
    expect(calls[1].headers['authorization']).toBeUndefined();
  });

  it('uses the token (and does not fall back) when it is valid', async () => {
    const fx = loadRealRepoFixture();
    const { calls } = mockFetch([[/git\/trees/, () => treeResponse(fx, { 'x-ratelimit-remaining': '4990' })]]);
    const r = await listRepoTree('o', 'r', 'ghp_good');
    expect(r.usedToken).toBe(true);
    expect(r.tokenRejected).toBe(false);
    expect(calls).toHaveLength(1);
  });
});

describe('fetchRawFile', () => {
  it('reads from raw.githubusercontent.com on HEAD (default branch) with no REST quota and no auth', async () => {
    const { calls } = mockFetch([[/raw\.githubusercontent\.com/, () => text('# LabTrack')]]);
    const r = await fetchRawFile('Vishakan1807', 'Vthink-Health', 'src/pages/auth/LoginPage.tsx');
    expect(r).toMatchObject({ kind: 'ok', text: '# LabTrack' });
    expect(calls[0].url).toBe('https://raw.githubusercontent.com/Vishakan1807/Vthink-Health/HEAD/src/pages/auth/LoginPage.tsx');
    expect(calls[0].headers['authorization']).toBeUndefined();
    expect(calls[0].url).not.toMatch(/api\.github\.com/);
  });

  it('percent-encodes path segments', async () => {
    const { calls } = mockFetch([[/raw\.githubusercontent\.com/, () => text('x')]]);
    await fetchRawFile('o', 'r', 'docs/my file#1.md');
    expect(calls[0].url).toContain('docs/my%20file%231.md');
  });

  it('distinguishes missing (404) from unreachable', async () => {
    mockFetch([[/DESIGN\.md/, () => text('404: Not Found', 404)], [/README\.md/, () => { throw new TypeError('fetch failed'); }]]);
    expect((await fetchRawFile('o', 'r', 'DESIGN.md')).kind).toBe('not_found');
    expect((await fetchRawFile('o', 'r', 'README.md')).kind).toBe('network');
  });

  it('caps how much of a large file is read', async () => {
    mockFetch([[/raw\.githubusercontent\.com/, () => text('a'.repeat(500_000))]]);
    const r = await fetchRawFile('o', 'r', 'big.ts', 1_000);
    expect(r.text!.length).toBeLessThanOrEqual(1_000);
    expect(r.truncated).toBe(true);
  });
});
