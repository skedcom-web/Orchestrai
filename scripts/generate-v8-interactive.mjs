#!/usr/bin/env node
/**
 * One-shot generator: build Module1/module1_genz_v8_interactive.json from v7
 * by inserting 4 interactive primitive slides at high-leverage positions.
 */
import fs from 'node:fs';

const SRC = 'Module1/module1_genz_v7_with_subtypes.json';
const OUT = 'Module1/module1_genz_v8_interactive.json';
const j = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const INSERTIONS = [
  // After slide 4 ("Extended Capabilities") — Act 1 capstone reveal
  { afterSlide: 4, slide: {
    slide_id: 'slide_04b_interactive_reveal',
    type: 'tap_reveal',
    act: 'Meet Your Twin',
    title: 'Your AI twin, decoded',
    subtitle: 'Tap each capability to see what it actually unlocks for you',
    icon: 'sparkles',
    estimated_duration_seconds: 45,
    cards: [
      { label: 'LLM — the brain',          reveal: 'Generates plausible-sounding language. Without your constraints, it generates plausible-sounding bugs.' },
      { label: 'RAG — the memory',         reveal: 'Lets the AI quote YOUR docs verbatim — turns hallucinations into citations.' },
      { label: 'Tool use — the hands',     reveal: 'Lets the AI actually do things — call APIs, write files, run code. Powerful and terrifying in equal measure.' },
      { label: 'MCP — the nervous system', reveal: 'Connects models to your real tools (Slack, GitHub, your DB). This is where AI stops being a chatbot and starts being a teammate.' }
    ],
    narration: "Real quick — tap each one. See what each AI capability actually unlocks for YOU. Don't skip this, it'll click everything we just covered.",
    narration_script: [
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'playful_intrigue', text: 'Okay quick pause.' },
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'real_talk',        text: "Tap each card. See what these capabilities actually unlock — not the textbook definition, the real one." },
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'teasing',          text: "It's like four seconds of effort. Do it." }
    ]
  } },

  // After slide 14 (P.R.O.M.P.T. Formula) — practice on a bad prompt
  { afterSlide: 14, slide: {
    slide_id: 'slide_14b_interactive_flaw',
    type: 'spot_the_flaw',
    act: 'P.R.O.M.P.T.',
    title: "What's wrong with this prompt?",
    subtitle: 'Click each flaw — there are three',
    icon: 'alert-triangle',
    estimated_duration_seconds: 60,
    text: 'Build me a login form. Make it secure and use modern best practices. The output should be production-ready.',
    flaws: [
      { phrase: 'Make it secure',          explanation: 'Vague. Secure against what? OWASP Top 10? Brute force? Session fixation? Without naming the threats, AI picks any subset — usually the easy ones.' },
      { phrase: 'modern best practices',   explanation: "Means nothing. 'Modern' to whom? React? Vue? Vanilla? Best for what — speed, accessibility, SEO? AI will pick whatever sounds smartest, not whatever YOU need." },
      { phrase: 'production-ready',        explanation: "Production-ready in what stack? With what error monitoring? What logging level? Production-ready is a promise, not a spec — and AI can't keep promises it doesn't understand." }
    ],
    narration: "We just covered P.R.O.M.P.T. Time to use it. Look at this prompt. Click on every part that breaks the formula. Three flaws — find them.",
    narration_script: [
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'real_talk', text: "Alright. P.R.O.M.P.T. is loaded. Time to use it." },
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'amazed',    text: "Look at this prompt. It LOOKS fine, right?" },
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'teasing',   text: "It's a disaster. Three flaws. Tap them. We'll wait." }
    ]
  } },

  // After slide 18 (Cockpit Instrument Panel) — match pillars to jobs
  { afterSlide: 18, slide: {
    slide_id: 'slide_18b_interactive_match',
    type: 'mini_match',
    act: 'P.R.O.M.P.T.',
    title: 'Match each pillar to its real job',
    subtitle: 'Pick a pillar, then pick what it actually does. Wrong matches shake.',
    icon: 'sparkles',
    estimated_duration_seconds: 90,
    pairs: [
      { left: 'Purpose', right: 'WHY we are building this' },
      { left: 'Role',    right: 'WHO the AI should pretend to be' },
      { left: 'Output',  right: 'WHAT SHAPE the result must take' },
      { left: 'Marker',  right: 'WHERE the AI is not allowed to go' },
      { left: 'Pattern', right: 'HOW the result is organized inside' },
      { left: 'Taste',   right: 'HOW it should sound and feel' }
    ],
    narration: 'Lock it in. Six pillars, six jobs. Match them — wrong matches shake, right ones lock green. Go.',
    narration_script: [
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'playful_intrigue', text: 'Lock it in time.' },
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'real_talk',        text: 'Six pillars. Six jobs. Drag — well, tap — them into place.' },
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'teasing',          text: "If you can't do this in 90 seconds, replay the last two slides. No judgment." }
    ]
  } },

  // After slide 19 (If You Remember Nothing Else) — pre-quiz confidence check
  { afterSlide: 19, slide: {
    slide_id: 'slide_19b_interactive_confidence',
    type: 'confidence_slider',
    act: 'Prove It',
    title: 'Before we test you…',
    icon: 'help-circle',
    estimated_duration_seconds: 30,
    prompt: 'Honestly. If I dropped a real client brief in your lap right now, could you write a 6-pillar P.R.O.M.P.T. that fences against SQL injection, broken auth, and cross-tenant leaks?',
    scale: { min_label: 'Not yet', max_label: "Let's go" },
    narration: "Real check-in before the quiz. How confident are you, honestly? Pick a number. There's no wrong answer.",
    narration_script: [
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'real_talk', text: 'Real check-in before the quiz.' },
      { speaker: 'Sara',  voice: 'female_genz', emotion: 'amazed',    text: 'How confident are you, RIGHT NOW, with the P.R.O.M.P.T. formula?' },
      { speaker: 'Arjun', voice: 'male_genz',   emotion: 'teasing',   text: "No wrong answer. We're just getting a baseline before the gate. Pick a number." }
    ]
  } }
];

// Build new slides array — preserve original order, insert after each marker
const newSlides = [];
j.slides.forEach((s, i) => {
  newSlides.push(s);
  const ins = INSERTIONS.find((x) => x.afterSlide === i + 1);
  if (ins) newSlides.push(ins.slide);
});

// Recompute act ranges from per-slide tags so the wrapper stays in sync
const ACT_ORDER = ['Meet Your Twin', 'The Shift', 'Your New Job', 'P.R.O.M.P.T.', 'Prove It'];
const acts = ACT_ORDER.map((name, idx) => {
  let start = -1, end = -1;
  newSlides.forEach((s, i) => {
    if ((s.act || s.act_id) === name) {
      if (start === -1) start = i + 1;
      end = i + 1;
    }
  });
  return { id: 'act_' + (idx + 1), name, slide_start: start, slide_end: end };
});

const out = {
  ...j,
  schema_version: 'v8_interactive',
  last_updated: new Date().toISOString(),
  acts,
  slides: newSlides
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('✅ Wrote ' + OUT);
console.log('   Total slides: ' + newSlides.length + ' (was ' + j.slides.length + ', +' + (newSlides.length - j.slides.length) + ' interactive)');
console.log('');
console.log('Inserted interactions:');
INSERTIONS.forEach((ins) => {
  const newPos = newSlides.findIndex((s) => s.slide_id === ins.slide.slide_id) + 1;
  console.log('  Slide ' + String(newPos).padStart(2, '0') + ' · ' + ins.slide.type.padEnd(20) + ' · ' + ins.slide.title);
});
console.log('');
console.log('Updated act ranges:');
acts.forEach((a) => console.log('  ' + a.name.padEnd(18) + ' slides ' + a.slide_start + '-' + a.slide_end));
