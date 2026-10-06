/**
 * Live deployment URL inspection.
 *
 * The previous check was HEAD + "any 2xx is reachable". That reports a Firebase
 * CONSOLE link as a live app (it answers 200 by redirecting to a Google sign-in
 * page) and tells the scoring model nothing about what is deployed. This module
 * fetches the page, classifies what it is, and extracts a little visible text.
 */

const USER_AGENT = 'OrchestrAI-Academy-Review/1.0 (+https://vthinkorchestrai-academy.web.app)';
const TIMEOUT_MS = 8_000;
const MAX_BYTES = 200_000;
const SNIPPET_CHARS = 1_200;

export interface LiveUrlEvidence {
  /** 'console' = a Firebase console page, not a running application. */
  kind: 'hosting' | 'console' | 'other' | 'invalid';
  /** True only when a real site answered 2xx (not a login wall). */
  reachable: boolean;
  httpStatus: number | null;
  finalUrl: string | null;
  title: string | null;
  snippet: string;
  note: string;
  /** For console links: the hosting URL we derived from the project id, and whether it answered. */
  derived?: { url: string; reachable: boolean; httpStatus: number | null };
}

interface PageProbe {
  httpStatus: number | null;
  ok: boolean;
  finalUrl: string | null;
  html: string;
  error?: string;
}

async function probe(url: string): Promise<PageProbe> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    let html = '';
    if (res.body) {
      const reader = res.body.getReader();
      const chunks: Buffer[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
        total += value.length;
        if (total >= MAX_BYTES) {
          await reader.cancel().catch(() => undefined);
          break;
        }
      }
      html = Buffer.concat(chunks).toString('utf8');
    }
    return { httpStatus: res.status, ok: res.ok, finalUrl: res.url || url, html };
  } catch (err: any) {
    return { httpStatus: null, ok: false, finalUrl: null, html: '', error: err?.message || String(err) };
  }
}

export function extractTitle(html: string): string | null {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!m) return null;
  const t = m[1].replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, 160) : null;
}

export function extractVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SNIPPET_CHARS);
}

export function firebaseProjectFromConsoleUrl(u: URL): string | null {
  const m = /\/project\/([a-z0-9-]+)/i.exec(u.pathname);
  return m ? m[1] : null;
}

export async function inspectLiveUrl(rawUrl: string): Promise<LiveUrlEvidence> {
  const input = (rawUrl || '').trim();
  const empty = (kind: LiveUrlEvidence['kind'], note: string): LiveUrlEvidence => ({
    kind, reachable: false, httpStatus: null, finalUrl: null, title: null, snippet: '', note,
  });
  if (!input) return empty('invalid', 'No live URL was submitted.');

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return empty('invalid', `"${input.slice(0, 120)}" is not a valid URL.`);
  }

  // Firebase console link — never a running app, and it answers 200 via a sign-in redirect.
  if (url.hostname === 'console.firebase.google.com') {
    const projectId = firebaseProjectFromConsoleUrl(url);
    const base = empty(
      'console',
      'The submitted link is a Firebase CONSOLE page (requires sign-in), not a running application.'
    );
    if (!projectId) return base;

    const derivedUrl = `https://${projectId}.web.app`;
    const d = await probe(derivedUrl);
    base.derived = { url: derivedUrl, reachable: d.ok, httpStatus: d.httpStatus };
    base.note += d.ok
      ? ` The derived hosting URL ${derivedUrl} DOES respond (HTTP ${d.httpStatus}) — the app may be deployed, but the learner submitted the wrong link.`
      : ` The derived hosting URL ${derivedUrl} did not serve an app (${d.httpStatus ? `HTTP ${d.httpStatus}` : d.error || 'unreachable'}).`;
    return base;
  }

  const p = await probe(url.toString());
  const isFirebaseHost = /\.(web\.app|firebaseapp\.com)$/i.test(url.hostname);
  const kind: LiveUrlEvidence['kind'] = isFirebaseHost ? 'hosting' : 'other';

  if (p.httpStatus === null) {
    return { ...empty(kind, `The live URL could not be reached (${p.error || 'network error'}).`), finalUrl: null };
  }

  const finalHost = (() => {
    try { return new URL(p.finalUrl || '').hostname; } catch { return ''; }
  })();
  if (/(^|\.)accounts\.google\.com$/i.test(finalHost)) {
    return {
      ...empty(kind, 'The live URL redirects to a Google sign-in page, so no application is publicly visible.'),
      httpStatus: p.httpStatus,
      finalUrl: p.finalUrl,
    };
  }

  const title = extractTitle(p.html);
  const snippet = extractVisibleText(p.html);
  let note = p.ok
    ? `Live URL responded HTTP ${p.httpStatus}.`
    : `Live URL responded HTTP ${p.httpStatus} (not a working page).`;
  if (p.ok && snippet.length < 40) {
    note += ' The page is a client-rendered shell; its content is not visible without executing JavaScript.';
  }
  return { kind, reachable: p.ok, httpStatus: p.httpStatus, finalUrl: p.finalUrl, title, snippet, note };
}
