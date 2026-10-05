import { Router, Request, Response } from 'express';
import { callOpenRouter, DEFAULT_MODEL } from '../services/openrouter';

const router = Router();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REFERER = process.env.OPENROUTER_REFERER || 'https://vthinkorchestrai-academy.web.app';
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'OrchestrAI Academy';

/**
 * POST /api/ping
 * Body: { modelOverride?: string }
 * Header: x-api-key  (must match REVIEW_SERVICE_API_KEY if that env var is set)
 *
 * Ports the exact logic from pingTierBProvider in functions/src/index.ts.
 */
router.post('/', async (req: Request, res: Response) => {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const expectedKey = process.env.REVIEW_SERVICE_API_KEY;
  if (expectedKey) {
    const provided = req.headers['x-api-key'];
    if (provided !== expectedKey) {
      res.status(401).json({ ok: false, error: 'Unauthorized: invalid x-api-key header.' });
      return;
    }
  }

  const { modelOverride } = req.body as { modelOverride?: string };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.json({
      ok: false,
      error:
        'OPENROUTER_API_KEY env var is not set. Add it to your Render environment variables.',
    });
    return;
  }

  const model = modelOverride || DEFAULT_MODEL;

  try {
    const fetchRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': REFERER,
        'X-Title': APP_NAME,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
        max_tokens: 5,
      }),
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text().catch(() => '');
      res.json({ ok: false, error: `OpenRouter ${fetchRes.status}: ${errText.slice(0, 300)}`, model });
      return;
    }

    const data: any = await fetchRes.json();
    res.json({
      ok: true,
      model,
      reply: data?.choices?.[0]?.message?.content || '(empty)',
      usage: data?.usage,
    });
  } catch (err: any) {
    res.json({ ok: false, error: err?.message || String(err), model });
  }
});

export default router;
