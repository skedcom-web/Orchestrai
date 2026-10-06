/**
 * OrchestrAI AI Review Service — Express entry point.
 *
 * Endpoints:
 *   GET  /api/health          — liveness probe
 *   POST /api/ping            — OpenRouter connectivity check
 *   POST /api/score-capstone  — full Tier A + Tier B rubric scoring
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import pingRouter from './routes/ping';
import scoreRouter from './routes/score';
import { getGithubToken } from './services/github';

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://vthinkorchestrai-academy.web.app';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/ping', pingRouter);
app.use('/api/score-capstone', scoreRouter);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`✅  OrchestrAI AI Review Service listening on port ${PORT}`);
  console.log(`    Allowed origin : ${allowedOrigin}`);
  const ghToken = getGithubToken();
  console.log(
    `    GITHUB_TOKEN   : ${ghToken ? `configured (${ghToken.length} chars, ${ghToken.slice(0, 4)}…)` : 'NOT set — anonymous GitHub access is limited to 60 requests/hour per IP'}`
  );
  console.log(`    Endpoints:`);
  console.log(`      GET  /api/health`);
  console.log(`      POST /api/ping`);
  console.log(`      POST /api/score-capstone`);
});

export default app;
