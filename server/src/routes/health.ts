import { Router, Request, Response } from 'express';
import { getGithubHealth } from '../services/github';

const router = Router();

/**
 * GET /api/health
 * Liveness probe — no auth required.
 *
 * `github` reports whether GITHUB_TOKEN is configured and ACCEPTED by GitHub,
 * and the remaining REST quota. It is the first thing to check when AI Review
 * reports missing repository evidence. No secret value is ever returned, and
 * the GitHub lookup is cached for 60s so this endpoint cannot be used to burn
 * quota.
 */
router.get('/', async (_req: Request, res: Response) => {
  let github: unknown;
  try {
    github = await getGithubHealth();
  } catch (err: any) {
    github = { error: err?.message || String(err) };
  }
  res.json({
    status: 'ok',
    service: 'OrchestrAI AI Review Service',
    timestamp: new Date().toISOString(),
    github,
  });
});

export default router;
