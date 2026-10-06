import { vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type FetchCall = { url: string; headers: Record<string, string> };
export type Responder = (url: string, init?: RequestInit) => Response | Promise<Response>;

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

export const text = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers });

/**
 * Route table for the global fetch. First matching pattern wins; an unmatched
 * URL fails the test loudly rather than silently reaching the network.
 */
export function mockFetch(routes: Array<[RegExp, Responder]>) {
  const calls: FetchCall[] = [];
  const impl = vi.fn(async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : String(input?.url ?? input);
    const headers: Record<string, string> = {};
    new Headers(init?.headers as any).forEach((v, k) => { headers[k.toLowerCase()] = v; });
    calls.push({ url, headers });
    for (const [re, responder] of routes) {
      if (re.test(url)) return responder(url, init);
    }
    throw new Error(`Unmocked fetch in test: ${url}`);
  });
  vi.stubGlobal('fetch', impl);
  return { calls, impl };
}

export interface TreeFixture {
  repo: string;
  blobs: Array<{ path: string; size: number }>;
}

/** The REAL file listing of the capstone that was wrongly reported as empty. */
export function loadRealRepoFixture(): TreeFixture {
  return JSON.parse(readFileSync(join(__dirname, 'fixtures', 'vthink-health.tree.json'), 'utf8'));
}

export const treeResponse = (fx: TreeFixture, headers: Record<string, string> = {}) =>
  json(
    { sha: 'abc', truncated: false, tree: fx.blobs.map((b) => ({ path: b.path, type: 'blob', size: b.size })) },
    200,
    { 'x-ratelimit-remaining': '55', 'x-ratelimit-reset': '1791281779', ...headers }
  );

export const RATE_LIMITED = () =>
  json({ message: 'API rate limit exceeded for 1.2.3.4.' }, 403, {
    'x-ratelimit-remaining': '0',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 1800),
  });
