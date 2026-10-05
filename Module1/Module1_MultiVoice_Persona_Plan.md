# Module 1 — Multi-Voice Persona & Script Plan (TTS Edition)

**Goal:** Make each preset feel like a genuinely different *experience*, not the same narrator with swapped vocabulary. We do this with distinct personas, and for two of the presets, a two-voice dialogue. Facts, approach, and topic stay 100% frozen — only delivery changes.

**Delivery target:** Text-to-speech (audio only, no animated faces). So every script is broken into speaker-tagged segments, each carrying a voice hint your TTS engine maps to a real voice.

---

## 1. The Four Personas

| Preset | Format | Persona(s) | Voice gender | TTS voice feel |
|---|---|---|---|---|
| **Formal** | Two-voice | **Aanya** (Strategy Lead) + **Dev** (Domain Expert) | Female + Male | Measured, authoritative, boardroom. Aanya frames the "why," Dev delivers the technical proof. |
| **Conversational** | Single voice | **Maya** (Mentor) | Female | Warm, confident, 1-on-1. The safe baseline — this is your current default, lightly enriched. |
| **Gen-Z** | Two-voice | **Zo** + **Kai** (podcast duo) | Female + Male | Fast, playful, reactive. They riff off each other, finish each other's points, react in real time. |
| **Beginner** | Single voice | **Sir Ravi** (Patient Teacher) | Male | Calm, slow, encouraging. Pauses to check understanding, never rushes, repeats key ideas. |

**Design logic:**
- The **two-voice presets (Formal, Gen-Z)** create the "unique experience" you felt was missing. A dialogue reads completely differently from a monologue, even with identical facts.
- The **single-voice presets (Conversational, Beginner)** are deliberately calmer — a mentor and a teacher. Not every learner wants banter; some want one steady guide. This gives genuine variety across the four, not four flavors of the same thing.
- Gender pairing is intentional: Formal pairs a female strategist with a male expert (subverts the default), Gen-Z is a balanced co-host duo, and the single voices are split one female / one male so the four presets together cover the full range.

---

## 2. How Two-Voice Dialogue Works (Without Deviating From Content)

The risk with dialogue is "filler chatter" that pads length but adds nothing — or worse, drifts off-topic. The rule I follow:

> **Every line either delivers a locked fact, sets up the next locked fact, or reacts to a locked fact. No line exists purely for vibe.**

So when Zo says "wait, hold up" before Kai explains hallucinations — that's not filler, it's a *transition device* that makes the learner lean in before the real content lands. The banter is the wrapper; the payload is identical to the frozen content.

Concretely, a two-voice segment looks like this:

```
Zo:  "Okay so AI can already write code. It can query databases. It can build UIs."
Kai: "Right, all of that. Today. Not someday."
Zo:  "So then... what's left for us to actually do?"
Kai: "THAT. That question right there is the whole reason OrchestrAI exists."
```

Four lines, two voices — but the *content* is exactly slide 5's locked point: "AI has the capabilities; intent is the gap; that gap is your job." Nothing added, nothing deviated. Just delivered as a back-and-forth that's far more engaging than one voice stating it.

---

## 3. New JSON Fields (Additive — Nothing Breaks)

Each slide keeps its existing flat `narration` string as a **fallback**. We add:

```json
"narration_script": [
  { "speaker": "Zo",  "voice": "female_genz",  "text": "..." },
  { "speaker": "Kai", "voice": "male_genz",    "text": "..." }
],
"estimated_duration_seconds": 95
```

- `narration_script` — the array of speaker-tagged segments your TTS reads in order, switching voices per segment.
- `speaker` — display name (for an optional on-screen "now speaking" label).
- `voice` — a semantic voice key (e.g. `female_genz`, `male_formal`) that your app maps to a specific TTS voice ID in your engine. You set the mapping once in your app config; the JSON never hard-codes a vendor voice ID, so you can switch TTS providers anytime.
- `estimated_duration_seconds` — powers the video-style progress bar (see section 4).

**Single-voice presets** (Conversational, Beginner) use the same `narration_script` array — they just have one `speaker`/`voice` throughout. Uniform structure across all 4 files keeps your app code simple: it always reads `narration_script`, never special-cases.

---

## 4. The Play Button + Progress Bar

This is **app/front-end work**, not JSON — but the JSON feeds it. Here's the clean division:

**What the JSON provides (I deliver):**
- `estimated_duration_seconds` per slide — lets the bar show length before audio even loads.
- Ordered `narration_script` segments — lets the bar show sub-progress ("segment 3 of 7") and highlight the current speaker.

**What your app/developer builds (not me):**
- The play/pause button UI.
- The seek bar that fills as audio plays.
- Time elapsed / remaining display.
- Auto-advance to next slide when audio finishes (optional).

**How TTS duration actually works:** when your app sends a script segment to the TTS engine, the engine returns both the audio and its real duration. Your app sums those for the true total. The `estimated_duration_seconds` I provide is a *pre-load estimate* (based on word count ÷ speaking rate) so the bar isn't blank while audio generates. Once real audio loads, the app can swap the estimate for the exact number.

> Rough estimate math I use: ~150 words/min for measured (Formal, Beginner), ~180 words/min for fast (Gen-Z), ~165 for Conversational. So a 250-word Gen-Z slide ≈ 83 seconds.

---

## 5. Script Length Strategy (Justifying the Content)

You're right that current scripts are too short to justify a 60-min module. New targets per slide:

| Slide type | Old (approx words) | New target | Why |
|---|---|---|---|
| Welcome / transition | 90 | 180–220 | Room to set scene, build curiosity |
| Anatomy / competencies | 110 | 220–280 | More examples per item |
| Comparison / mindset | 120 | 250–300 | The "aha" slides deserve weight |
| P.R.O.M.P.T. + examples | 130 | 280–340 | Core tool — most important |
| Day in life | 130 | 260–320 | Walk the full day, not summarize |
| Quiz intro | 90 | 150–180 | Encouraging, not rushed |

Across 20 slides this brings total narration to roughly **45–52 minutes of audio**, leaving ~8–15 min for reading slides, reflection prompts, and the quiz — landing the full module honestly at 60 minutes.

---

## 6. Voice Key Reference (For Your App's TTS Config)

Set these mappings once in your app. Example using common TTS voice families (swap for your engine's actual voice IDs):

| Voice key | Suggested character | Maps to (example) |
|---|---|---|
| `female_formal` | Aanya — measured, authoritative | e.g. a "news anchor" female voice |
| `male_formal` | Dev — calm expert | e.g. a "narrator" male voice |
| `female_conversational` | Maya — warm mentor | e.g. a "friendly" female voice |
| `male_genz` | Kai — energetic co-host | e.g. an "upbeat" male voice |
| `female_genz` | Zo — playful co-host | e.g. an "expressive" female voice |
| `male_beginner` | Sir Ravi — patient teacher | e.g. a "calm/slow" male voice |

You map each key to a real voice in your TTS dashboard. The JSON only references the keys, so re-casting a persona = changing one mapping, not re-editing 20 slides.

---

## 7. What I'm Delivering This Round

- This plan (the document you're reading).
- **One fully-written sample preset: Gen-Z**, all 20 slides, as speaker-tagged two-voice scripts (Zo + Kai), with `estimated_duration_seconds` on every slide — so you can feel the experience before I write the other three.

Once you approve the feel, I'll produce the remaining three (Formal two-voice, Conversational single, Beginner single) in the same structure, and re-split into your 4 upload files.

---

## 8. Open Question for You

The personas above (Aanya, Dev, Maya, Zo, Kai, Sir Ravi) are my casting suggestion. If you'd rather use OrchestrAI-relevant names, real team members' style, or different gender pairings, tell me and I'll recast before writing the other three. Names are trivial to change; the *structure* is the thing to lock now.

