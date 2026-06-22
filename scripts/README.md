# scripts/

## generate-audio.mjs

Pre-renders slide narration to MP3 via ElevenLabs so playback is **identical on every device**.

### One-time setup

1. Create a free ElevenLabs account → https://elevenlabs.io
2. Copy your API key from the profile menu (top-right → "API Keys")
3. Set it in your shell:

   ```powershell
   # PowerShell
   $env:ELEVENLABS_API_KEY = "sk_..."
   ```

   ```bash
   # bash / zsh
   export ELEVENLABS_API_KEY=sk_...
   ```

### Generate audio for a module

```powershell
npm run audio:generate -- Module1/module1_genz_v5_with_music.json
```

The script will:

- Read the JSON, walk every `narration_script` segment
- Call ElevenLabs once per segment (uses `text_expressive` → `text_ssml` → `text` priority)
- Save MP3 files to `public/audio/<module>/<slide>/<seg>.mp3`
- Emit `module1_genz_v5_with_music_with_audio.json` next to the original, with `audio_url` fields injected
- **Resume-safe**: re-running skips MP3s that already exist

### Voice defaults

| Voice key in JSON | ElevenLabs default | Override env var |
|---|---|---|
| `female_genz` (Sara) | Bella — young, expressive | `ELEVENLABS_VOICE_SARA` |
| `male_genz`   (Arjun) | Antoni — warm, conversational | `ELEVENLABS_VOICE_ARJUN` |

To audition other voices, browse https://elevenlabs.io/voice-library and set the env var to the voice ID.

### Cost estimate

| Plan | Chars/mo | Covers |
|---|---|---|
| Free | 10,000 | ~Module 1 alone (tight) |
| Starter ($5) | 30,000 | Modules 1 & 2 with headroom |
| Creator ($22) | 100,000 | All 8 modules |

The script uses `eleven_turbo_v2_5` (cheap, fast) by default. Set `ELEVENLABS_MODEL_ID=eleven_multilingual_v2` for the premium model (double cost, best quality).

### After generation

```powershell
npm run build
firebase deploy --only hosting
```

Then in the app: **Admin → Module Media Manager → upload** the `_with_audio.json` file.

The presenter automatically prefers `audio_url` over Web Speech when it's present — no other code changes needed.
