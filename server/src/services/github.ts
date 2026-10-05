/**
 * GitHub helper utilities — ported verbatim from functions/src/index.ts.
 * Signatures and logic are identical; only the firebase-functions logger
 * calls are replaced with console.warn (available in any Node process).
 */

// ── parseGitHubUrl ────────────────────────────────────────────────────────────

/**
 * Parse "https://github.com/owner/repo" → { owner, repo } | null
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('github.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

// ── fetchGitHubFile ──────────────────────────────────────────────────────────

/**
 * Fetch the raw contents of a single file from a GitHub repository.
 * Returns null on any error or non-OK response.
 */
export async function fetchGitHubFile(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3.raw' };
  if (token) headers.Authorization = `token ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`Failed to fetch ${path}:`, err);
    return null;
  }
}

// ── listGitHubRepoFiles ──────────────────────────────────────────────────────

/**
 * Return a list of all blob paths in the repository (up to 200).
 * Returns an empty array on any error.
 */
export async function listGitHubRepoFiles(
  owner: string,
  repo: string,
  token?: string
): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `token ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.tree || [])
      .filter((t: any) => t.type === 'blob')
      .map((t: any) => t.path)
      .slice(0, 200);
  } catch (err) {
    console.warn('Failed to list repo files:', err);
    return [];
  }
}

// ── checkUrlReachable ─────────────────────────────────────────────────────────

/**
 * Returns true if the URL responds with an OK status (or 405, since some
 * servers reject HEAD requests but are still up).
 */
export async function checkUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
}
