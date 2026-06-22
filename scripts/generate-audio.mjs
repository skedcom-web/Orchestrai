#!/usr/bin/env node
/**
 * generate-audio.mjs — Pre-render slide narration to MP3 via ElevenLabs.
 *
 * Reads a slide JSON, calls ElevenLabs for each segment in narration_script,
 * writes MP3 files to public/audio/<module>/<slide>/<seg>.mp3, and emits an
 * updated JSON with `audio_url` fields injected per segment.
 *
 * Usage:
 *   $env:ELEVENLABS_API_KEY="..."             # PowerShell
 *   export ELEVENLABS_API_KEY=...             # bash
 *   node scripts/generate-audio.mjs Module1/module1_genz_v5_with_music.json
 *
 * Optional env vars (defaults are sensible):
 *   ELEVENLABS_VOICE_SARA   — voice ID for female_genz (default Bella)
 *   ELEVENLABS_VOICE_ARJUN  — voice ID for male_genz   (default Antoni)
 *   ELEVENLABS_MODEL_ID     — eleven_turbo_v2_5 (cheap, default) | eleven_multilingual_v2 (best)
 *
 * Re-running is safe: existing MP3 files are skipped, only missing ones are generated.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// ── Configuration ──────────────────────────────────────────────────────────
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5';

// Voice IDs from ElevenLabs default library (available on free tier).
// Override via env vars if you find voices you like better.
const VOICE_MAP = {
  female_genz: process.env.ELEVENLABS_VOICE_SARA  || 'EXAVITQu4vr4xnSDxMaL', // Bella  — young, expressive female
  male_genz:   process.env.ELEVENLABS_VOICE_ARJUN || 'ErXwobaYiN019PkySvjV', // Antoni — warm, conversational male
  // Lower-priority fallbacks for older / non-genz voice keys
  female:      process.env.ELEVENLABS_VOICE_SARA  || 'EXAVITQu4vr4xnSDxMaL',
  male:        process.env.ELEVENLABS_VOICE_ARJUN || 'ErXwobaYiN019PkySvjV',
};

const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.45,
  use_speaker_boost: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveVoiceId(voiceKey) {
  const key = (voiceKey || 'female_genz').toLowerCase();
  // Direct match
  if (VOICE_MAP[key]) return VOICE_MAP[key];
  // Heuristic: anything containing 'male' but not 'female' → male voice
  if (!key.includes('female') && key.includes('male')) return VOICE_MAP.male_genz;
  return VOICE_MAP.female_genz;
}

function pickText(seg) {
  // Honor the v5 priority order — text_expressive carries inline emotion cues for ElevenLabs.
  return seg.text_expressive || seg.text_ssml || seg.text || '';
}

async function elevenLabsTTS(text, voiceId) {
  const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status} ${res.statusText} — ${body.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌  ELEVENLABS_API_KEY is not set in your environment.');
    console.error('    PowerShell: $env:ELEVENLABS_API_KEY="..."');
    console.error('    bash:        export ELEVENLABS_API_KEY=...');
    process.exit(1);
  }

  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node scripts/generate-audio.mjs <path-to-slide-json>');
    process.exit(1);
  }

  const json = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  const slides = Array.isArray(json.slides) ? json.slides : Array.isArray(json) ? json : null;
  if (!slides) {
    console.error("❌  Couldn't find a `slides` array in the input JSON.");
    process.exit(1);
  }

  const moduleSlug = path.basename(inputPath, '.json').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const projectRoot = process.cwd();
  const audioRoot = path.join(projectRoot, 'public', 'audio', moduleSlug);
  await fs.mkdir(audioRoot, { recursive: true });

  let totalSegs = 0, generated = 0, skipped = 0, failed = 0, charsSent = 0;
  for (const s of slides) if (Array.isArray(s.narration_script)) totalSegs += s.narration_script.length;

  console.log(`🎙️   ${slides.length} slides · ${totalSegs} segments · model: ${MODEL_ID}`);
  console.log(`📁   Writing to public/audio/${moduleSlug}/`);
  console.log('');

  for (let si = 0; si < slides.length; si++) {
    const slide = slides[si];
    if (!Array.isArray(slide.narration_script) || slide.narration_script.length === 0) continue;

    const slideId = slide.slide_id || `slide_${String(si + 1).padStart(2, '0')}`;
    const slideDir = path.join(audioRoot, slideId);
    await fs.mkdir(slideDir, { recursive: true });

    for (let gi = 0; gi < slide.narration_script.length; gi++) {
      const seg = slide.narration_script[gi];
      const segFile = `seg_${String(gi + 1).padStart(2, '0')}.mp3`;
      const segDiskPath = path.join(slideDir, segFile);
      const segUrl = `/audio/${moduleSlug}/${slideId}/${segFile}`;

      // Resumable: skip files that already exist.
      try {
        await fs.access(segDiskPath);
        seg.audio_url = segUrl;
        skipped++;
        process.stdout.write(`  ⏭️   ${slideId} seg ${gi + 1} (exists)\n`);
        continue;
      } catch { /* doesn't exist — generate */ }

      const text = pickText(seg);
      if (!text.trim()) {
        process.stdout.write(`  ⚠️   ${slideId} seg ${gi + 1} — empty text, skipping\n`);
        continue;
      }

      const voiceKey = seg.voice || (seg.speaker === 'Arjun' ? 'male_genz' : 'female_genz');
      const voiceId = resolveVoiceId(voiceKey);

      try {
        process.stdout.write(`  🎤  ${slideId} seg ${gi + 1} — ${seg.speaker || '?'} · ${voiceKey} · ${text.length} chars ... `);
        const mp3 = await elevenLabsTTS(text, voiceId);
        await fs.writeFile(segDiskPath, mp3);
        seg.audio_url = segUrl;
        generated++;
        charsSent += text.length;
        process.stdout.write(`✅\n`);
        await sleep(200); // gentle pacing — keeps us well under rate limits
      } catch (e) {
        failed++;
        process.stdout.write(`❌  ${e.message}\n`);
      }
    }
  }

  const outJsonPath = inputPath.replace(/\.json$/i, '_with_audio.json');
  await fs.writeFile(outJsonPath, JSON.stringify(json, null, 2));

  console.log('');
  console.log('─'.repeat(60));
  console.log(`✅  Done. generated=${generated}  skipped=${skipped}  failed=${failed}  chars=${charsSent}`);
  console.log(`📄  Updated JSON: ${outJsonPath}`);
  console.log(`🎵  Audio files:  public/audio/${moduleSlug}/`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. npm run build && firebase deploy --only hosting   (publishes the MP3s)`);
  console.log(`  2. Open Admin → Module Media Manager → upload ${path.basename(outJsonPath)}`);
  console.log(`  3. Open Module 1 → press Play → same Sara + Arjun on every device 🎉`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
