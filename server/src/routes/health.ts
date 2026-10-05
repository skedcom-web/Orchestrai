import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Simple liveness probe — no auth required.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'OrchestrAI AI Review Service',
    timestamp: new Date().toISOString(),
  });
});

export default router;
