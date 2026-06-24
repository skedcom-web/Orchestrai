const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'module2');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// GEN Z PRESET
const genzData = {
  module: "Module 2 — The OrchestrAI Framework Architecture",
  preset: "genz",
  format: "two_voice_dialogue",
  speakers: {
    Sara: {
      voice_key: "female_genz",
      gender: "female",
      persona: "Sara — energetic, expressive co-host"
    },
    Arjun: {
      voice_key: "male_genz",
      gender: "male",
      persona: "Arjun — upbeat, grounded co-host"
    }
  },
  tts_field_priority: [
    "text_expressive",
    "text_ssml",
    "text"
  ],
  tts_notes: "Use text_expressive for ElevenLabs-style engines, text_ssml for Google/Azure/Polly, text as universal fallback. 'emotion' is a one-word hint for engines that accept an emotion param. Map voice keys (female_genz, male_genz) to real voices in your TTS dashboard.",
  schema_version: "v8_interactive",
  last_updated: "2026-06-23T18:28:39+05:30",
  acts: [
    { id: "act_1", name: "The Blueprint", slide_start: "slide_01", slide_end: "slide_05" },
    { id: "act_2", name: "The GPS", slide_start: "slide_06", slide_end: "slide_11" },
    { id: "act_3", name: "The Precision Game", slide_start: "slide_12", slide_end: "slide_16" },
    { id: "act_4", name: "Seeing It Live", slide_start: "slide_17", slide_end: "slide_19b" },
    { id: "act_5", name: "Prove It", slide_start: "slide_20", slide_end: "slide_23" }
  ],
  slides: []
};

// Populate GenZ Slides
genzData.slides.push(
  {
    slide_id: "slide_01",
    type: "welcome",
    title: "Welcome Back — Time to Build the Machine",
    subtitle: "Module 2 of the OrchestrAI Lead Certification",
    icon: "cog",
    visual_cue: "animated_blueprint_unfold",
    hero_stat: {
      value: "6 + 6",
      label: "principles and stages that run every OrchestrAI engagement",
      icon: "layers"
    },
    opening_hook: "Ok so Module 1 gave you the mindset. Module 2 gives you the machine. Six rules. Six stages. One loop that runs literally everything.",
    bullets: [
      "You know the conductor role. Now here's the actual score.",
      "Six non-negotiable principles. Break any one? It's not OrchestrAI anymore.",
      "Six lifecycle stages — the GPS for every feature you'll ever ship.",
      "Pass the quiz, Module 3 unlocks. Let's build."
    ],
    closing_thread: "First up: the six rules that can't be broken.",
    analogy: {
      title: "Drive vs. Mechanics",
      text: "Module 1 was like learning to drive — getting the feel of the car. Module 2 is learning the traffic rules and the GPS. Without both, you're just a fast car waiting to crash."
    },
    memory_hook: "Mindset was Module 1. Machine is Module 2.",
    narration: "Okay — you're back, and you're ready. Welcome to Module 2. I'm Sara. And I'm Arjun. Module 1 gave you the conductor mindset, but today we're building the actual machine. Six core principles and six lifecycle stages. Think of it as your new operating framework. If you break even one of these principles, it's not OrchestrAI anymore — you're just coding by hand. And the lifecycle is your GPS. Pass the quiz, and Module 3 unlocks. Let's get it. First up: the six rules that can't be broken.",
    estimated_duration_seconds: 80,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "warm_excited",
        text: "Okay — you're back, and you're ready. Welcome to Module 2. I'm Sara.",
        text_ssml: "<speak>Okay<break time=\"200ms\"/> you're back, and you're <emphasis level=\"moderate\">ready</emphasis>. Welcome to Module 2. I'm Sara.</speak>",
        text_expressive: "[warm_excited] Okay — you're back, and you're ready. Welcome to Module 2. I'm Sara."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident_friendly",
        text: "And I'm Arjun. Module 1 gave you the conductor mindset, but today we're building the actual machine.",
        text_ssml: "<speak>And I'm Arjun. Module 1 gave you the conductor mindset, but <emphasis level=\"moderate\">today</emphasis> we're building the actual machine.</speak>",
        text_expressive: "And I'm Arjun. Module 1 gave you the conductor mindset, but today we're building the actual machine."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Six core principles and six lifecycle stages. Think of it as your new operating framework.",
        text_ssml: "<speak>Six core principles and <emphasis level=\"moderate\">six lifecycle stages</emphasis>. Think of it as your new operating framework.</speak>",
        text_expressive: "Six core principles and six lifecycle stages. Think of it as your new operating framework."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "serious",
        text: "If you break even one of these principles, it's not OrchestrAI anymore — you're just coding by hand.",
        text_ssml: "<speak>If you break <emphasis level=\"moderate\">even one</emphasis> of these principles, it's not OrchestrAI anymore<break time=\"150ms\"/> you're just coding by hand.</speak>",
        text_expressive: "If you break even one of these principles, it's not OrchestrAI anymore — you're just coding by hand."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "And the lifecycle is your GPS. Pass the quiz, and Module 3 unlocks. Let's get it.",
        text_ssml: "<speak>And the lifecycle is your <emphasis level=\"moderate\">GPS</emphasis>. Pass the quiz, and Module 3 unlocks. Let's get it.</speak>",
        text_expressive: "And the lifecycle is your GPS. Pass the quiz, and Module 3 unlocks. Let's get it."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "hyped",
        text: "First up: the six rules that can't be broken.",
        text_ssml: "<speak>First up: the six rules that <emphasis level=\"strong\">cannot</emphasis> be broken.</speak>",
        text_expressive: "[hyped] First up: the six rules that can't be broken."
      }
    ],
    background_music: {
      track_key: "intro_theme_m2",
      behavior: "fade_in_then_duck_under_narration",
      fade_in_ms: 1500,
      duck_volume_percent: 15,
      fade_out_ms: 2000,
      notes: "Play a short upbeat intro theme on slide load. Fade in over 1.5s, then duck to 15% volume once narration starts. Fade out as user advances."
    }
  },
  {
    slide_id: "slide_02",
    type: "competencies",
    title: "The Six Commandments",
    subtitle: "Break one, and it's not OrchestrAI. Period.",
    icon: "shield-check",
    visual_cue: "six_commandment_tablets_with_glow",
    analogy: {
      title: "The Gym Membership Analogy",
      text: "Having a gym membership doesn't make you fit. Saying you run OrchestrAI doesn't make it OrchestrAI. These six principles are the actual workouts — skip one, and you're just paying for a badge you didn't earn."
    },
    list: [
      { name: "AI as Primary Builder", icon: "bot", desc: "AI writes ALL the code — APIs, schemas, UI, tests. If the Lead is writing code, something has gone wrong. Full stop." },
      { name: "Human as Orchestrator", icon: "user-cog", desc: "You define direction, constraints, trade-offs, and approvals. You're the conductor from Module 1 — not the violinist." },
      { name: "Plain-English Driven", icon: "message-circle", desc: "Requirements enter as natural language. No UML diagrams, no 47-page spec docs. Precise — but in plain English." },
      { name: "Continuous Delivery", icon: "infinity", desc: "No sprints. No sprint planning. No retros about retros. Work flows continuously through the intent-validate-evolve loop." },
      { name: "Instant Iteration", icon: "zap", desc: "Gap found during validation? Fixed same session. Not next sprint. Not next quarter. Right now." },
      { name: "Quality by Design", icon: "shield-check", desc: "Security, validation, error handling — specified as constraints in the intent. Generated with every artifact from day one." }
    ],
    memory_hook: "Six rules. All six. All the time. Non-negotiable.",
    narration: "Here's the deal: these six commandments are the bedrock of everything we do. First: AI as Primary Builder. AI writes all the code, period. If you're manually patching bugs, you're breaking the system. Second: Human as Orchestrator. You are the conductor, not the coder. Third: Plain-English Driven. No massive BRDs — keep it in structured, natural language. Fourth: Continuous Delivery. Sprints are dead. We ship features as they are validated. Fifth: Instant Iteration. You correct AI in the same session, not next week. And sixth: Quality by Design. Security is baked in upfront, not added in QA.",
    estimated_duration_seconds: 120,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Here's the deal: these six commandments are the bedrock of everything we do.",
        text_ssml: "<speak>Here's the deal: these <emphasis level=\"moderate\">six commandments</emphasis> are the bedrock of everything we do.</speak>",
        text_expressive: "Here's the deal: these six commandments are the bedrock of everything we do."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "First: AI as Primary Builder. AI writes all the code, period. If you're manually patching bugs, you're breaking the system.",
        text_ssml: "<speak>First: AI as <emphasis level=\"moderate\">Primary Builder</emphasis>. AI writes <emphasis level=\"moderate\">all</emphasis> the code, period. If you're manually patching bugs, you're breaking the system.</speak>",
        text_expressive: "First: AI as Primary Builder. AI writes all the code, period. If you're manually patching bugs, you're breaking the system."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "emphatic",
        text: "Second: Human as Orchestrator. You are the conductor, not the coder. Third: Plain-English Driven. No massive BRDs — keep it in structured, natural language.",
        text_ssml: "<speak>Second: <emphasis level=\"moderate\">Human as Orchestrator</emphasis>. You are the conductor, not the coder. Third: <emphasis level=\"moderate\">Plain-English Driven</emphasis>. No massive B R Ds — keep it in structured, natural language.</speak>",
        text_expressive: "Second: Human as Orchestrator. You are the conductor, not the coder. Third: Plain-English Driven. No massive BRDs — keep it in structured, natural language."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Fourth: Continuous Delivery. Sprints are dead. We ship features as they are validated. Fifth: Instant Iteration. You correct AI in the same session, not next week.",
        text_ssml: "<speak>Fourth: <emphasis level=\"moderate\">Continuous Delivery</emphasis>. Sprints are dead. We ship features as they are validated. Fifth: <emphasis level=\"moderate\">Instant Iteration</emphasis>. You correct A I in the same session, not next week.</speak>",
        text_expressive: "Fourth: Continuous Delivery. Sprints are dead. We ship features as they are validated. Fifth: Instant Iteration. You correct AI in the same session, not next week."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "And sixth: Quality by Design. Security is baked in upfront, not added in QA.",
        text_ssml: "<speak>And sixth: <emphasis level=\"moderate\">Quality by Design</emphasis>. Security is baked in upfront, not added in Q A.</speak>",
        text_expressive: "And sixth: Quality by Design. Security is baked in upfront, not added in QA."
      }
    ]
  },
  {
    slide_id: "slide_03",
    type: "comparison_table",
    title: "AI Builds. You Orchestrate.",
    subtitle: "The line between builder and director is now permanent",
    icon: "git-fork",
    visual_cue: "director_vs_camera_split",
    analogy: {
      title: "Director vs Camera Operator",
      text: "A film director doesn't hold the camera. Doesn't mix the audio. Doesn't build the set. But every single frame reflects their decisions. That's you. The AI is your entire film crew — you just need to give directions that actually work."
    },
    table: [
      { icon: "code-2", old: "Lead writes code when AI can't get it right", new: "Lead re-prompts with better constraints. Never touches code." },
      { icon: "message-circle", old: "Requirements in Jira tickets and BRDs", new: "Requirements in plain-English P.R.O.M.P.T. briefs" },
      { icon: "calendar", old: "2-week sprints, planning poker, velocity tracking", new: "Continuous loop — hours, not weeks" },
      { icon: "shield-check", old: "Security added in hardening sprint before release", new: "Security baked into every intent as a Marker constraint" },
      { icon: "file-text", old: "Docs written by a tech writer after dev is done", new: "Docs auto-generated alongside every artifact" },
      { icon: "refresh-cw", old: "Change requests go into the backlog for next sprint", new: "Changes expressed in plain English, implemented same day" }
    ],
    memory_hook: "Director = zero cameras touched. OrchestrAI Lead = zero code touched.",
    narration: "Let's compare the old way with the new way. Old way: when the AI gets stuck, you write the code. New way: you NEVER touch code. You rewrite the prompt with better constraints. Old way: requirements in messy Jira tickets. New way: clear plain-English briefs. Old way: two-week sprints. New way: continuous delivery in hours. Old way: security added at the end. New way: security baked into the prompt from day one. Old way: docs written at the very end. New way: docs auto-generated alongside code. Old way: change requests go to the backlog. New way: changes are prompt-driven and shipped same day.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "Let's compare the old way with the new way. Old way: when the AI gets stuck, you write the code. New way: you NEVER touch code.",
        text_ssml: "<speak>Let's compare the old way with the new way. Old way: when the A I gets stuck, you write the code. New way: you <emphasis level=\"strong\">never</emphasis> touch code.</speak>",
        text_expressive: "Let's compare the old way with the new way. Old way: when the AI gets stuck, you write the code. New way: you NEVER touch code."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "You rewrite the prompt with better constraints. Old way: requirements in messy Jira tickets. New way: clear plain-English briefs.",
        text_ssml: "<speak>You rewrite the prompt with better constraints. Old way: requirements in messy Jira tickets. New way: clear plain-English <emphasis level=\"moderate\">briefs</emphasis>.</speak>",
        text_expressive: "You rewrite the prompt with better constraints. Old way: requirements in messy Jira tickets. New way: clear plain-English briefs."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "casual",
        text: "Old way: two-week sprints. New way: continuous delivery in hours. Old way: security added at the end. New way: security baked into the prompt from day one.",
        text_ssml: "<speak>Old way: two-week sprints. New way: continuous delivery in hours. Old way: security added at the end. New way: security <emphasis level=\"moderate\">baked into</emphasis> the prompt from day one.</speak>",
        text_expressive: "Old way: two-week sprints. New way: continuous delivery in hours. Old way: security added at the end. New way: security baked into the prompt from day one."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "upbeat",
        text: "Old way: docs written at the very end. New way: docs auto-generated alongside code. Old way: change requests go to the backlog. New way: changes are prompt-driven and shipped same day.",
        text_ssml: "<speak>Old way: docs written at the very end. New way: docs auto-generated alongside code. Old way: change requests go to the backlog. New way: changes are <emphasis level=\"moderate\">prompt-driven</emphasis> and shipped same day.</speak>",
        text_expressive: "Old way: docs written at the very end. New way: docs auto-generated alongside code. Old way: change requests go to the backlog. New way: changes are prompt-driven and shipped same day."
      }
    ]
  },
  {
    slide_id: "slide_03b",
    type: "tap_reveal",
    title: "Which principle is being broken?",
    subtitle: "Tap each scenario to see the answer",
    icon: "alert-triangle",
    visual_cue: "tap_reveal_card_grid",
    cards: [
      { label: "The Lead fixes a CSS bug directly in VS Code", reveal: "Violation: AI as Primary Builder. Re-prompt with a targeted correction instead. The moment you touch code, you break the audit trail." },
      { label: "Team decides to 'just do one sprint' for the complex module", reveal: "Violation: Continuous Delivery. Even complex features flow through the intent-validate-evolve loop. Sprints are the old world's crutch." },
      { label: "AI generates code without any security constraints in the prompt", reveal: "Violation: Quality by Design. Security isn't added later — it's a Marker in every intent. This output ships insecure by default." },
      { label: "The Lead writes a 30-page BRD before any generation", reveal: "Violation: Plain-English Driven. Requirements are structured briefs, not enterprise documents. Precision, yes. Bureaucracy, no." }
    ],
    narration: "Quick principle check. Four real scenarios. Tap each one — figure out which principle is being broken.",
    estimated_duration_seconds: 45,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "playful_intrigue",
        text: "Quick principle check. Four real scenarios. Tap each one — figure out which principle is being broken.",
        text_ssml: "<speak>Quick principle check. Four real scenarios. Tap each one <break time=\"100ms\"/> figure out which principle is being broken.</speak>",
        text_expressive: "Quick principle check. Four real scenarios. Tap each one — figure out which principle is being broken."
      }
    ]
  },
  {
    slide_id: "slide_04",
    type: "stats_hero",
    title: "What Happens When You Break the Rules",
    subtitle: "Real consequences, not theoretical ones",
    icon: "alert-triangle",
    visual_cue: "rework_cost_graph",
    hero_stat: { value: "3x", label: "the rework cost when even ONE principle is skipped", icon: "trending-up" },
    analogy: {
      title: "The Seatbelt Rule",
      text: "You don't wear a seatbelt because of traffic on this specific road. You wear it because the one time you need it, it's too late to put it on. Same with these principles. Skip one on a Tuesday, and it'll be the Tuesday something breaks."
    },
    bullets: [
      "Skip 'AI as Primary Builder'? Manual code breaks the audit trail. Nobody can trace what was generated vs patched.",
      "Skip 'Plain-English Driven'? You re-introduce the 47-page BRD cycle. Congratulations, you just rebuilt waterfall.",
      "Skip 'Continuous Delivery'? Sprint ceremonies return. Velocity debates return. Four-month timelines return.",
      "Skip 'Quality by Design'? Security becomes a late-stage surprise. Hallucinations ship undetected."
    ],
    closing_thread: "Six rules, all six, every time. Now let's look at the actual machine that runs inside them.",
    memory_hook: "Break one rule, rebuild the old world. That's the deal.",
    narration: "Okay, so what's the damage if you skip a rule? The numbers don't lie: rework cost goes up three times when you skip even one principle. Skip AI as Primary Builder? You break the audit trail. Skip Plain-English Driven? Welcome back to forty-seven-page BRDs. Skip Continuous Delivery? Sprints and retros return. Skip Quality by Design? Security breaks. It is seatbelt rules here — skip it once, and it will be the day you get hit.",
    estimated_duration_seconds: 100,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "real_talk",
        text: "Okay, so what's the damage if you skip a rule? The numbers don't lie: rework cost goes up three times when you skip even one principle.",
        text_ssml: "<speak>Okay, so what's the damage if you skip a rule? The numbers don't lie: rework cost goes up <emphasis level=\"strong\">three times</emphasis> when you skip even one principle.</speak>",
        text_expressive: "Okay, so what's the damage if you skip a rule? The numbers don't lie: rework cost goes up three times when you skip even one principle."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Skip AI as Primary Builder? You break the audit trail. Skip Plain-English Driven? Welcome back to forty-seven-page BRDs.",
        text_ssml: "<speak>Skip A I as Primary Builder? You break the audit trail. Skip Plain-English Driven? Welcome back to <emphasis level=\"reduced\">forty-seven-page</emphasis> B R Ds.</speak>",
        text_expressive: "Skip AI as Primary Builder? You break the audit trail. Skip Plain-English Driven? Welcome back to forty-seven-page BRDs."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Skip Continuous Delivery? Sprints and retros return. Skip Quality by Design? Security breaks.",
        text_ssml: "<speak>Skip Continuous Delivery? Sprints and retros return. Skip Quality by Design? <emphasis level=\"moderate\">Security breaks</emphasis>.</speak>",
        text_expressive: "Skip Continuous Delivery? Sprints and retros return. Skip Quality by Design? Security breaks."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "emphatic",
        text: "It is seatbelt rules here — skip it once, and it will be the day you get hit.",
        text_ssml: "<speak>It is <emphasis level=\"moderate\">seatbelt rules</emphasis> here <break time=\"100ms\"/> skip it once, and it will be the day you get hit.</speak>",
        text_expressive: "It is seatbelt rules here — skip it once, and it will be the day you get hit."
      }
    ]
  },
  {
    slide_id: "slide_05",
    type: "welcome",
    title: "Principles Tell You What. The Lifecycle Tells You How.",
    subtitle: "From rules to rhythm",
    icon: "map",
    visual_cue: "principles_to_lifecycle_bridge_animation",
    reflection_prompt: "You now know the six rules of the game. But rules don't build software — processes do. Ready to see the actual engine?",
    bullets: [
      "Six principles = the rules of the road",
      "Six stages = the GPS that gets you there",
      "INTENT → ORCHESTRATE → GENERATE → VALIDATE → EVOLVE → DEPLOY",
      "Not a waterfall. Not a sprint. A loop."
    ],
    closing_thread: "Stage 1: Intent. The foundation of literally everything.",
    memory_hook: "Principles = rules. Lifecycle = GPS. Both required.",
    narration: "So, the principles tell you the what. But the lifecycle is the how. Think of it as: principles are the rules of the road, and the lifecycle is your GPS. We go from Intent, to Orchestrate, to Generate, to Validate, to Evolve, and finally Deploy. This is not a straight line, it's a loop. Ready to see the actual engine? Let's dive in.",
    estimated_duration_seconds: 75,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "So, the principles tell you the what. But the lifecycle is the how. Think of it as: principles are the rules of the road, and the lifecycle is your GPS.",
        text_ssml: "<speak>So, the principles tell you the what. But the lifecycle is the <emphasis level=\"moderate\">how</emphasis>. Think of it as: principles are the rules of the road, and the lifecycle is your GPS.</speak>",
        text_expressive: "So, the principles tell you the what. But the lifecycle is the how. Think of it as: principles are the rules of the road, and the lifecycle is your GPS."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "We go from Intent, to Orchestrate, to Generate, to Validate, to Evolve, and finally Deploy. This is not a straight line, it's a loop.",
        text_ssml: "<speak>We go from Intent, to Orchestrate, to Generate, to Validate, to Evolve, and finally Deploy. This is <emphasis level=\"moderate\">not</emphasis> a straight line, it's a loop.</speak>",
        text_expressive: "We go from Intent, to Orchestrate, to Generate, to Validate, to Evolve, and finally Deploy. This is not a straight line, it's a loop."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "excited",
        text: "Ready to see the actual engine? Let's dive in.",
        text_ssml: "<speak>Ready to see the actual engine? <emphasis level=\"moderate\">Let's dive in</emphasis>.</speak>",
        text_expressive: "[excited] Ready to see the actual engine? Let's dive in."
      }
    ]
  },
  {
    slide_id: "slide_06",
    type: "competencies",
    title: "The Six-Stage Lifecycle",
    subtitle: "Your GPS for every feature, every engagement, every day",
    icon: "route",
    visual_cue: "circular_lifecycle_loop_with_arrows",
    analogy: {
      title: "GPS Navigation, Not a Printed Map",
      text: "A printed map gives you the route once and hopes you don't miss a turn. A GPS recalculates in real time. The OrchestrAI lifecycle is a GPS — it loops, it adapts, and it's always recalculating based on where you actually are, not where the plan said you'd be."
    },
    list: [
      { name: "INTENT", icon: "target", desc: "Define what you're building with surgical precision. This is where P.R.O.M.P.T. from Module 1 meets enterprise requirements." },
      { name: "ORCHESTRATE", icon: "git-branch", desc: "Map the dependency graph. What needs to exist first? Which components, in what order, with what API contracts?" },
      { name: "GENERATE", icon: "wand-2", desc: "AI builds. You direct. One focused prompt per component — not one giant prompt for the whole system." },
      { name: "VALIDATE", icon: "shield-check", desc: "Systematic check against acceptance criteria. Not a vibe check — a checklist." },
      { name: "EVOLVE", icon: "repeat", desc: "Stakeholder feedback → new intent → re-generate → re-validate. Same session, not next sprint." },
      { name: "DEPLOY", icon: "rocket", desc: "Continuous, governed, documented, reversible. Not a 'project-end event' — a daily activity." }
    ],
    memory_hook: "I-O-G-V-E-D. Intent, Orchestrate, Generate, Validate, Evolve, Deploy. Loop it.",
    narration: "Here's the full loop: I-O-G-V-E-D. Intent, Orchestrate, Generate, Validate, Evolve, Deploy. It starts with Intent: defining requirements with surgical precision. Next is Orchestrate: mapping the dependency order. Then Generate: writing one prompt per component. Validate is where we check it against a hard checklist. Evolve is the same-session loop where we iterate on stakeholder feedback. And Deploy is the daily shipping. It is recalculating in real-time, just like a GPS.",
    estimated_duration_seconds: 115,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Here's the full loop: I-O-G-V-E-D. Intent, Orchestrate, Generate, Validate, Evolve, Deploy.",
        text_ssml: "<speak>Here's the full loop: <emphasis level=\"strong\">I O G V E D</emphasis>. Intent, Orchestrate, Generate, Validate, Evolve, Deploy.</speak>",
        text_expressive: "Here's the full loop: I-O-G-V-E-D. Intent, Orchestrate, Generate, Validate, Evolve, Deploy."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "It starts with Intent: defining requirements with surgical precision. Next is Orchestrate: mapping the dependency order.",
        text_ssml: "<speak>It starts with <emphasis level=\"moderate\">Intent</emphasis>: defining requirements with surgical precision. Next is <emphasis level=\"moderate\">Orchestrate</emphasis>: mapping the dependency order.</speak>",
        text_expressive: "It starts with Intent: defining requirements with surgical precision. Next is Orchestrate: mapping the dependency order."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "casual",
        text: "Then Generate: writing one prompt per component. Validate is where we check it against a hard checklist.",
        text_ssml: "<speak>Then <emphasis level=\"moderate\">Generate</emphasis>: writing one prompt per component. <emphasis level=\"moderate\">Validate</emphasis> is where we check it against a hard checklist.</speak>",
        text_expressive: "Then Generate: writing one prompt per component. Validate is where we check it against a hard checklist."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Evolve is the same-session loop where we iterate on stakeholder feedback. And Deploy is the daily shipping. It is recalculating in real-time, just like a GPS.",
        text_ssml: "<speak>Evolve is the same-session loop where we iterate on stakeholder feedback. And <emphasis level=\"moderate\">Deploy</emphasis> is the daily shipping. It is recalculating in real-time, just like a GPS.</speak>",
        text_expressive: "Evolve is the same-session loop where we iterate on stakeholder feedback. And Deploy is the daily shipping. It is recalculating in real-time, just like a GPS."
      }
    ]
  },
  {
    slide_id: "slide_07",
    type: "welcome",
    title: "Stage 1: INTENT — The Foundation of Everything",
    subtitle: "Poorly defined intent = drifted AI output. Every time.",
    icon: "target",
    visual_cue: "blueprint_foundation_animation",
    analogy: {
      title: "Foundation of a Building",
      text: "Nobody sees the foundation of a skyscraper. But every millimeter it's off at the base becomes a meter off at the top. Intent is your foundation — get it wrong, and everything generated on top of it drifts."
    },
    bullets: [
      "Capture the outcome in ONE clear sentence — what working behaviour should exist that doesn't exist today?",
      "List ALL user roles and what each can and can't do",
      "Enumerate EVERY validation rule — what makes input valid or invalid?",
      "State ALL security constraints — who accesses what, enforced where?",
      "Define acceptance signals — how will you KNOW it's correct?",
      "List known edge cases — what happens at boundaries, on errors, on empty states?",
      "Specify technology context — Stack & Patterns"
    ],
    closing_thread: "And yeah — that list? Those are the eight components of a perfect intent statement. Remember P.R.O.M.P.T. from Module 1? This is P.R.O.M.P.T.'s big sibling.",
    memory_hook: "Vague intent = drifted output. Precise intent = precise output. Every. Single. Time.",
    narration: "Let's zoom into Stage 1: Intent. If the intent is off by even a millimeter, the generated output drifts by a mile. You have to specify the outcome in one sentence, define the roles, validation rules, security constraints, acceptance signals, and edge cases. In other words, you need structured intent. Think of this as the eight-component framework — it's basically the big sibling of the P.R.O.M.P.T. formula we learned last module.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Let's zoom into Stage 1: Intent. If the intent is off by even a millimeter, the generated output drifts by a mile.",
        text_ssml: "<speak>Let's zoom into Stage 1: Intent. If the intent is off by <emphasis level=\"moderate\">even a millimeter</emphasis>, the generated output drifts by a mile.</speak>",
        text_expressive: "Let's zoom into Stage 1: Intent. If the intent is off by even a millimeter, the generated output drifts by a mile."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "You have to specify the outcome in one sentence, define the roles, validation rules, security constraints, acceptance signals, and edge cases.",
        text_ssml: "<speak>You have to specify the outcome in one sentence, define the roles, validation rules, security constraints, acceptance signals, and edge cases.</speak>",
        text_expressive: "You have to specify the outcome in one sentence, define the roles, validation rules, security constraints, acceptance signals, and edge cases."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "In other words, you need structured intent. Think of this as the eight-component framework — it's basically the big sibling of the P.R.O.M.P.T. formula we learned last module.",
        text_ssml: "<speak>In other words, you need <emphasis level=\"moderate\">structured intent</emphasis>. Think of this as the eight-component framework — it's basically the big sibling of the P.R.O.M.P.T. formula we learned last module.</speak>",
        text_expressive: "In other words, you need structured intent. Think of this as the eight-component framework — it's basically the big sibling of the P.R.O.M.P.T. formula we learned last module."
      }
    ]
  },
  {
    slide_id: "slide_08",
    type: "welcome",
    title: "Weak Intent vs. Strong Intent",
    subtitle: "Same feature. Two briefs. Night and day.",
    icon: "split",
    visual_cue: "before_after_split",
    before_after: {
      before: {
        label: "Weak Intent",
        icon: "frown",
        output: "'Build a timesheet entry screen where users can log hours against projects.' → AI assumes scope, skips validation rules, creates its own schema, doesn't enforce anything server-side. You spend 2 days fixing what should've taken 2 hours."
      },
      after: {
        label: "Strong Intent (8 Components)",
        icon: "smile",
        output: "'Build a timesheet entry screen for Team Members (role: TEAM_MEMBER). 7-day grid, Mon-Sun, rows for project/task pairs. 10 validation rules: (1) at least one complete row, (2) project mandatory, (3) task mandatory, (4) no duplicate project+task, (5) daily hours 0-24, (6) task not expired, (7-8) no hours outside task date range, (9) daily total <=24h, (10) weekly total >=40h. Enforced client AND server-side. First failed rule shows persistent red banner. Submit disabled until clean save. Stack: React + TypeScript, NestJS, Prisma, PostgreSQL.' → Ships same day. Zero rework."
      }
    },
    memory_hook: "Same P.R.O.M.P.T. idea from Module 1 — but enterprise-grade now. Eight components, not six.",
    narration: "Look at the difference on screen. Same feature request: timesheet entry. Weak intent is basically 'build a timesheet screen.' AI guesses the rules, ignores security, and you spend two days fixing it. Strong intent specifies roles, the React-NestJS stack, and lists exactly ten validation rules. The output? AI writes code that works perfectly on the first try. That's the difference between shipping today vs. debugging all weekend.",
    estimated_duration_seconds: 120,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "casual",
        text: "Look at the difference on screen. Same feature request: timesheet entry.",
        text_ssml: "<speak>Look at the difference on screen. Same feature request: timesheet entry.</speak>",
        text_expressive: "Look at the difference on screen. Same feature request: timesheet entry."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "incredulous",
        text: "Weak intent is basically 'build a timesheet screen.' AI guesses the rules, ignores security, and you spend two days fixing it.",
        text_ssml: "<speak>Weak intent is basically 'build a timesheet screen.' A I guesses the rules, ignores security, and you spend <emphasis level=\"moderate\">two days</emphasis> fixing it.</speak>",
        text_expressive: "Weak intent is basically 'build a timesheet screen.' AI guesses the rules, ignores security, and you spend two days fixing it."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "Strong intent specifies roles, the React-NestJS stack, and lists exactly ten validation rules. The output? AI writes code that works perfectly on the first try.",
        text_ssml: "<speak>Strong intent specifies roles, the React-NestJS stack, and lists exactly <emphasis level=\"moderate\">ten validation rules</emphasis>. The output? A I writes code that works perfectly on the first try.</speak>",
        text_expressive: "Strong intent specifies roles, the React-NestJS stack, and lists exactly ten validation rules. The output? AI writes code that works perfectly on the first try."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "The output? AI writes code that works perfectly on the first try. That's the difference between shipping today vs. debugging all weekend.",
        text_ssml: "<speak>The output? A I writes code that works <emphasis level=\"moderate\">perfectly</emphasis> on the first try. That's the difference between shipping today vs. debugging all weekend.</speak>",
        text_expressive: "The output? AI writes code that works perfectly on the first try. That's the difference between shipping today vs. debugging all weekend."
      }
    ]
  },
  {
    slide_id: "slide_09",
    type: "competencies",
    title: "Stage 2: ORCHESTRATE — Mapping the Build Order",
    subtitle: "What depends on what, in what order",
    icon: "git-branch",
    visual_cue: "dependency_critical_path",
    analogy: {
      title: "IKEA Assembly, Not Freeform Art",
      text: "You don't start IKEA furniture with the door handles. You start with the frame, because everything attaches to it. Orchestration is figuring out the assembly order before you open the first packet."
    },
    list: [
      { name: "Dependency Graph", icon: "network", desc: "What must exist before this feature can be built? Auth before user profiles. Database before API. API before UI." },
      { name: "Reusable Components", icon: "copy", desc: "What already exists in the codebase? Don't regenerate what works — assemble from proven patterns." },
      { name: "API Contract", icon: "file-json", desc: "What endpoints? What request/response shapes? What auth guards? Define before generation, not after." },
      { name: "Data Model", icon: "database", desc: "New tables, columns, relationships, indices, constraints — all mapped before a single prompt fires." },
      { name: "Cross-Cutting Concerns", icon: "layers", desc: "Logging, error handling patterns, naming conventions. These apply everywhere — specify once, enforce always." }
    ],
    memory_hook: "Orchestrate = assembly instructions before generation. IKEA, not abstract art.",
    narration: "Stage 2 is Orchestrate. Before you touch AI, you map out the assembly plan. Like IKEA furniture, you don't start with the door handles — you need the frame. We map the dependency graph: database schema first, then service layer, then API, then UI. We reuse existing components, lock in the API contracts, define the data model, and set cross-cutting concerns like logging. It is all about planning the build order.",
    estimated_duration_seconds: 105,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "Stage 2 is Orchestrate. Before you touch AI, you map out the assembly plan. Like IKEA furniture, you don't start with the door handles — you need the frame.",
        text_ssml: "<speak>Stage 2 is <emphasis level=\"moderate\">Orchestrate</emphasis>. Before you touch A I, you map out the assembly plan. Like I K E A furniture, you don't start with the door handles — you need the frame.</speak>",
        text_expressive: "Stage 2 is Orchestrate. Before you touch AI, you map out the assembly plan. Like IKEA furniture, you don't start with the door handles — you need the frame."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "We map the dependency graph: database schema first, then service layer, then API, then UI. We reuse existing components, lock in the API contracts, define the data model, and set cross-cutting concerns.",
        text_ssml: "<speak>We map the dependency graph: database schema first, then service layer, then A P I, then U I. We reuse existing components, lock in the A P I contracts, define the data model, and set cross-cutting concerns.</speak>",
        text_expressive: "We map the dependency graph: database schema first, then service layer, then API, then UI. We reuse existing components, lock in the API contracts, define the data model, and set cross-cutting concerns."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "It is all about planning the build order.",
        text_ssml: "<speak>It is all about <emphasis level=\"moderate\">planning</emphasis> the build order.</speak>",
        text_expressive: "It is all about planning the build order."
      }
    ]
  },
  {
    slide_id: "slide_10",
    type: "welcome",
    title: "Stage 3: GENERATE — AI Builds, You Direct",
    subtitle: "Active direction, not passive waiting",
    icon: "wand-2",
    visual_cue: "ai_generation_with_human_directing",
    analogy: {
      title: "Air Traffic Controller, Not Passenger",
      text: "A passenger sits back and trusts the system. An air traffic controller watches every approach, intervenes when needed, and never assumes everything's fine just because nothing's blinking red. During generation, you're the controller."
    },
    bullets: [
      "One focused prompt per component. NOT one mega-prompt for the entire system.",
      "Always include context: existing code patterns, naming conventions, stack version.",
      "Review output IMMEDIATELY — don't queue multiple generations before validating the first.",
      "If AI deviates, correct with a targeted constraint prompt. Never accept and fix manually.",
      "Never accept code you can't explain. If you can't explain it, you can't validate it."
    ],
    closing_thread: "Generated? Great. Now comes the real job — validation.",
    memory_hook: "Generate = one prompt, one component, one validation. Never batch.",
    narration: "Stage 3 is Generate. You are the air traffic controller, not the passenger. You watch the AI build and intervene immediately if it drifts. We write one focused prompt per component — never a mega-prompt. We review the output immediately, and if the AI deviates, we prompt again. We never, ever write manual fixes or accept code we can't explain.",
    estimated_duration_seconds: 105,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Stage 3 is Generate. You are the air traffic controller, not the passenger. You watch the AI build and intervene immediately if it drifts.",
        text_ssml: "<speak>Stage 3 is <emphasis level=\"moderate\">Generate</emphasis>. You are the air traffic controller, not the passenger. You watch the A I build and intervene immediately if it drifts.</speak>",
        text_expressive: "Stage 3 is Generate. You are the air traffic controller, not the passenger. You watch the AI build and intervene immediately if it drifts."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "We write one focused prompt per component — never a mega-prompt. We review the output immediately, and if the AI deviates, we prompt again.",
        text_ssml: "<speak>We write <emphasis level=\"moderate\">one focused prompt</emphasis> per component — never a mega-prompt. We review the output immediately, and if the A I deviates, we prompt again.</speak>",
        text_expressive: "We write one focused prompt per component — never a mega-prompt. We review the output immediately, and if the AI deviates, we prompt again."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "We never, ever write manual fixes or accept code we can't explain.",
        text_ssml: "<speak>We <emphasis level=\"strong\">never, ever</emphasis> write manual fixes or accept code we can't explain.</speak>",
        text_expressive: "[emphatic] We never, ever write manual fixes or accept code we can't explain."
      }
    ]
  },
  {
    slide_id: "slide_10b",
    type: "mini_match",
    title: "What gets built first?",
    subtitle: "Put these components in the right generation order. Wrong matches shake.",
    icon: "sort-asc",
    visual_cue: "mini_match_drag_drop",
    pairs: [
      { left: "Step 1", right: "Database schema & migrations" },
      { left: "Step 2", right: "Service layer with business logic" },
      { left: "Step 3", right: "API controllers & endpoints" },
      { left: "Step 4", right: "Frontend UI components" },
      { left: "Step 5", right: "Integration tests" }
    ],
    narration: "Generation order matters. Put these five in dependency order. Database first? UI first? You tell us.",
    estimated_duration_seconds: 60,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "playful",
        text: "Generation order matters. Put these five in dependency order. Database first? UI first? You tell us.",
        text_ssml: "<speak>Generation order matters. Put these five in dependency order. Database first? U I first? You tell us.</speak>",
        text_expressive: "Generation order matters. Put these five in dependency order. Database first? UI first? You tell us."
      }
    ]
  },
  {
    slide_id: "slide_11",
    type: "competencies",
    title: "Validate → Evolve → Deploy",
    subtitle: "The back half of the loop — where quality gets proven",
    icon: "check-circle",
    visual_cue: "validate_evolve_deploy_stages",
    analogy: {
      title: "Test Drive, Tune-Up, Road Trip",
      text: "Validate = the test drive (does it actually work?). Evolve = the tune-up (stakeholder says 'this is great, but can we also...?'). Deploy = the road trip (it's live, governed, and has a U-turn option if needed)."
    },
    list: [
      { name: "VALIDATE — The Checklist, Not the Vibe", icon: "clipboard-check", desc: "Check every acceptance criterion explicitly. Functional, security, data isolation, error handling, edge cases, documentation. If it's not on the checklist, it's not validated." },
      { name: "EVOLVE — Same-Session Enhancement", icon: "repeat", desc: "Stakeholder sees it in the demo → gives feedback → you reshape intent → AI regenerates → you revalidate. Hours, not sprints." },
      { name: "DEPLOY — Continuous, Not Ceremonial", icon: "rocket", desc: "Deploy to staging when validated. Deploy to production when quality threshold met. Every deployment documented, tested, reversible." }
    ],
    memory_hook: "Validate = checklist. Evolve = same-day fix. Deploy = governed go-live.",
    narration: "Now for the back half of the loop: Validate, Evolve, Deploy. Validate is a hard checklist, not a vibe check. We check security, data isolation, and edge cases. Evolve is where we modify the intent based on feedback and re-generate. And Deploy is continuous and reversible — we deploy as a daily activity, not a project-end event. Think of it as: test drive, tune-up, and finally, the road trip.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "Now for the back half of the loop: Validate, Evolve, Deploy.",
        text_ssml: "<speak>Now for the back half of the loop: Validate, Evolve, Deploy.</speak>",
        text_expressive: "Now for the back half of the loop: Validate, Evolve, Deploy."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "earnest",
        text: "Validate is a hard checklist, not a vibe check. We check security, data isolation, and edge cases.",
        text_ssml: "<speak>Validate is a <emphasis level=\"moderate\">hard checklist</emphasis>, not a vibe check. We check security, data isolation, and edge cases.</speak>",
        text_expressive: "Validate is a hard checklist, not a vibe check. We check security, data isolation, and edge cases."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "Evolve is where we modify the intent based on feedback and re-generate. And Deploy is continuous and reversible.",
        text_ssml: "<speak>Evolve is where we modify the intent based on feedback and re-generate. And Deploy is <emphasis level=\"moderate\">continuous and reversible</emphasis>.</speak>",
        text_expressive: "Evolve is where we modify the intent based on feedback and re-generate. And Deploy is continuous and reversible."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "upbeat",
        text: "We deploy as a daily activity, not a project-end event. Think of it as: test drive, tune-up, and finally, the road trip.",
        text_ssml: "<speak>We deploy as a daily activity, not a project-end event. Think of it as: <emphasis level=\"moderate\">test drive, tune-up, and the road trip</emphasis>.</speak>",
        text_expressive: "We deploy as a daily activity, not a project-end event. Think of it as: test drive, tune-up, and finally, the road trip."
      }
    ]
  },
  {
    slide_id: "slide_12",
    type: "competencies",
    title: "The Anatomy of a Perfect Intent",
    subtitle: "Eight components. All eight. Every time.",
    icon: "puzzle",
    visual_cue: "eight_component_checklist_animated",
    analogy: {
      title: "Pilot's Pre-Flight Checklist",
      text: "Pilots don't skip checklist items because 'it was fine last time.' Missing one item on a pre-flight can crash a plane. Missing one intent component can crash a feature. Same energy. All eight. Every time."
    },
    list: [
      { name: "Outcome", icon: "target", desc: "One sentence: what working behaviour should exist? This is Purpose from P.R.O.M.P.T., levelled up." },
      { name: "Actor & Role", icon: "user-cog", desc: "Exact user role, their permissions, and what they CANNOT do." },
      { name: "Validation Rules", icon: "list-checks", desc: "Every rule that determines valid vs invalid input, numbered." },
      { name: "Security Constraints", icon: "shield-alert", desc: "Auth, authorization, enforcement layer — always both client AND server-side." },
      { name: "Stack & Patterns", icon: "code-2", desc: "Technology, version, naming conventions, existing patterns to follow." },
      { name: "Acceptance Signals", icon: "check-circle", desc: "Explicit list of what success looks like. If you can't test it, it's not an acceptance signal." },
      { name: "Edge Cases", icon: "alert-triangle", desc: "Boundary conditions, error states, empty states, concurrent requests." },
      { name: "Data Model", icon: "database", desc: "Tables, columns, relationships, constraints involved." }
    ],
    memory_hook: "O-A-V-S-S-A-E-D. Outcome, Actor, Validation, Security, Stack, Acceptance, Edge, Data. Skip one, pay for it later.",
    narration: "Alright, let's break down the anatomy of a perfect intent statement. There are eight parts, and you need all of them. Outcome is the purpose. Actor and Role defines permissions. Validation rules are explicit. Security constraints enforce rules client and server-side. Stack and Patterns gives context. Acceptance signals define success. Edge cases cover errors. And Data Model defines tables. Think of it like a pilot's checklist. You don't skip any, or the plane crashes.",
    estimated_duration_seconds: 125,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "Alright, let's break down the anatomy of a perfect intent statement. There are eight parts, and you need all of them.",
        text_ssml: "<speak>Alright, let's break down the anatomy of a perfect intent statement. There are <emphasis level=\"moderate\">eight parts</emphasis>, and you need all of them.</speak>",
        text_expressive: "Alright, let's break down the anatomy of a perfect intent statement. There are eight parts, and you need all of them."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "Outcome is the purpose. Actor and Role defines permissions. Validation rules are explicit. Security constraints enforce rules client and server-side.",
        text_ssml: "<speak>Outcome is the purpose. Actor and Role defines permissions. Validation rules are explicit. Security constraints enforce rules <emphasis level=\"moderate\">client and server-side</emphasis>.</speak>",
        text_expressive: "Outcome is the purpose. Actor and Role defines permissions. Validation rules are explicit. Security constraints enforce rules client and server-side."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Stack and Patterns gives context. Acceptance signals define success. Edge cases cover errors. And Data Model defines tables.",
        text_ssml: "<speak>Stack and Patterns gives context. Acceptance signals define success. Edge cases cover errors. And Data Model defines tables.</speak>",
        text_expressive: "Stack and Patterns gives context. Acceptance signals define success. Edge cases cover errors. And Data Model defines tables."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "emphatic",
        text: "Think of it like a pilot's checklist. You don't skip any, or the plane crashes.",
        text_ssml: "<speak>Think of it like a <emphasis level=\"moderate\">pilot's checklist</emphasis>. You don't skip any, or the plane crashes.</speak>",
        text_expressive: "Think of it like a pilot's checklist. You don't skip any, or the plane crashes."
      }
    ]
  },
  {
    slide_id: "slide_13",
    type: "comparison_table",
    title: "From P.R.O.M.P.T. to Enterprise Intent",
    subtitle: "Module 1's formula was the training wheels. This is the real bike.",
    icon: "arrow-up-right",
    visual_cue: "prompt_vs_intent_grid",
    analogy: {
      title: "Training Wheels -> Full Bike",
      text: "P.R.O.M.P.T. had six letters. Enterprise intent has eight components. They map to each other — P.R.O.M.P.T. was the warm-up, intent is the real thing. Same muscle, just stronger now."
    },
    table: [
      { icon: "target", old: "P — Purpose: one-sentence goal", new: "Outcome: working behaviour + Actor & Role" },
      { icon: "user-cog", old: "R — Role: who AI pretends to be", new: "Stack & Patterns: technology context for AI" },
      { icon: "layout-template", old: "O — Output: format you need back", new: "Acceptance Signals: how you'll test success" },
      { icon: "shield-alert", old: "M — Marker: hard constraints", new: "Validation Rules + Security Constraints (numbered, explicit)" },
      { icon: "grid-3x3", old: "P — Pattern: internal structure", new: "Data Model + Edge Cases" },
      { icon: "smile", old: "T — Tone: the vibe", new: "Tone still applies — especially in client-facing features" }
    ],
    memory_hook: "P.R.O.M.P.T. = 6 letters for any AI request. Intent = 8 components for enterprise software. Same DNA, bigger body.",
    narration: "How does this map to P.R.O.M.P.T. from Module 1? P.R.O.M.P.T. was the training wheels, and structured intent is the full bike. Purpose maps to Outcome and Actor. Role maps to Stack and Patterns. Output maps to Acceptance Signals. Marker maps to Validation and Security. Pattern maps to Data Model and Edge Cases. Tone is still there for UI copy. Same muscle, just stronger now.",
    estimated_duration_seconds: 100,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "How does this map to P.R.O.M.P.T. from Module 1? P.R.O.M.P.T. was the training wheels, and structured intent is the full bike.",
        text_ssml: "<speak>How does this map to P.R.O.M.P.T. from Module 1? P.R.O.M.P.T. was the <emphasis level=\"moderate\">training wheels</emphasis>, and structured intent is the full bike.</speak>",
        text_expressive: "How does this map to P.R.O.M.P.T. from Module 1? P.R.O.M.P.T. was the training wheels, and structured intent is the full bike."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Purpose maps to Outcome and Actor. Role maps to Stack and Patterns. Output maps to Acceptance Signals.",
        text_ssml: "<speak>Purpose maps to Outcome and Actor. Role maps to Stack and Patterns. Output maps to Acceptance Signals.</speak>",
        text_expressive: "Purpose maps to Outcome and Actor. Role maps to Stack and Patterns. Output maps to Acceptance Signals."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "casual",
        text: "Marker maps to Validation and Security. Pattern maps to Data Model and Edge Cases. Tone is still there for UI copy. Same muscle, just stronger now.",
        text_ssml: "<speak>Marker maps to Validation and Security. Pattern maps to Data Model and Edge Cases. Tone is still there for U I copy. Same muscle, <emphasis level=\"moderate\">just stronger now</emphasis>.</speak>",
        text_expressive: "Marker maps to Validation and Security. Pattern maps to Data Model and Edge Cases. Tone is still there for UI copy. Same muscle, just stronger now."
      }
    ]
  },
  {
    slide_id: "slide_13b",
    type: "spot_the_flaw",
    title: "What's missing from this intent?",
    subtitle: "This intent LOOKS good — but three components are missing. Find them.",
    icon: "search",
    visual_cue: "spot_the_flaw_requirements",
    text: "Build an expense approval workflow. Managers approve expenses submitted by their team. Expenses over ₹50,000 require VP approval. Use React + NestJS + PostgreSQL. The workflow should send email notifications on approval or rejection.",
    flaws: [
      { phrase: "Expenses over ₹50,000 require VP approval.", explanation: "No Validation Rules. What makes an expense valid? Required fields? Amount limits? Duplicate detection? Without numbered rules, AI will guess — and guess wrong." },
      { phrase: "Managers approve expenses", explanation: "No Security Constraints. Who enforces that a Manager can only see their team's expenses? Client-side only? Server-side? Both? Without this, data leaks." },
      { phrase: "approval or rejection.", explanation: "No Edge Cases. What if a Manager IS the submitter? What about expenses submitted after the period closes? What if the VP is on leave? These become production bugs." }
    ],
    narration: "Looks like a real intent, right? Three things are missing. They'll each become a production bug. Find them.",
    estimated_duration_seconds: 60,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "playful_intrigue",
        text: "Looks like a real intent, right? Three things are missing. They'll each become a production bug. Find them.",
        text_ssml: "<speak>Looks like a real intent, right? Three things are <emphasis level=\"moderate\">missing</emphasis>. They'll each become a production bug. Find them.</speak>",
        text_expressive: "Looks like a real intent, right? Three things are missing. They'll each become a production bug. Find them."
      }
    ]
  },
  {
    slide_id: "slide_14",
    type: "competencies",
    title: "The Five Ways Intent Goes Wrong",
    subtitle: "Avoid these — they're the most common mistakes in the field",
    icon: "ban",
    visual_cue: "anti_patterns_hazard_grid",
    analogy: {
      title: "The 'Close Enough' Trap",
      text: "'Close enough' is the most expensive phrase in software. A vague intent that seems 80% right generates code that's 80% right — and that last 20% costs more to fix than writing the whole intent properly would have."
    },
    list: [
      { name: "The Vague Outcome", icon: "cloud", desc: "'Build a dashboard for managers.' No scope, no role def, no data spec. Fix: specify exact role, exact metrics, exact data sources, exact acceptance criteria." },
      { name: "The Mega-Prompt", icon: "file-stack", desc: "One prompt for the entire app. Quality degrades with scope. Fix: one focused prompt per component, validate each before next." },
      { name: "The Assumption Prompt", icon: "help-circle", desc: "'Add authentication.' No stack, no existing patterns, no token strategy. Fix: specify exact mechanism, reference existing code." },
      { name: "The Trust-and-Skip", icon: "eye-off", desc: "Accepting output without checking. AI is statistically good but not always correct. Fix: validate every output. No exceptions." },
      { name: "The Manual Patch", icon: "wrench", desc: "Fixing code by hand instead of re-prompting. Creates drift between intent and implementation. Fix: always correct through prompting." }
    ],
    memory_hook: "Vague. Mega. Assume. Skip. Patch. Five ways to blow up your engagement.",
    narration: "Here are the five ways intent goes wrong. Avoid these like the plague. First: the Vague Outcome — saying 'build a dashboard' with no detail. Second: the Mega-Prompt — trying to generate the whole app in one go. Third: the Assumption Prompt — assuming AI knows how you do auth. Fourth: the Trust-and-Skip — accepting code without testing. Fifth: the Manual Patch — fixing code yourself instead of correcting the prompt. Remember: close enough is the most expensive phrase in software.",
    estimated_duration_seconds: 115,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "real_talk",
        text: "Here are the five ways intent goes wrong. Avoid these like the plague. First: the Vague Outcome — saying 'build a dashboard' with no detail.",
        text_ssml: "<speak>Here are the five ways intent goes wrong. Avoid these <emphasis level=\"moderate\">like the plague</emphasis>. First: the Vague Outcome — saying 'build a dashboard' with no detail.</speak>",
        text_expressive: "Here are the five ways intent goes wrong. Avoid these like the plague. First: the Vague Outcome — saying 'build a dashboard' with no detail."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Second: the Mega-Prompt — trying to generate the whole app in one go. Third: the Assumption Prompt — assuming AI knows how you do auth.",
        text_ssml: "<speak>Second: the <emphasis level=\"moderate\">Mega-Prompt</emphasis> — trying to generate the whole app in one go. Third: the <emphasis level=\"moderate\">Assumption Prompt</emphasis> — assuming A I knows how you do auth.</speak>",
        text_expressive: "Second: the Mega-Prompt — trying to generate the whole app in one go. Third: the Assumption Prompt — assuming AI knows how you do auth."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "casual",
        text: "Fourth: the Trust-and-Skip — accepting code without testing. Fifth: the Manual Patch — fixing code yourself instead of correcting the prompt.",
        text_ssml: "<speak>Fourth: the Trust-and-Skip — accepting code without testing. Fifth: the Manual Patch — <emphasis level=\"moderate\">fixing code yourself</emphasis> instead of correcting the prompt.</speak>",
        text_expressive: "Fourth: the Trust-and-Skip — accepting code without testing. Fifth: the Manual Patch — fixing code yourself instead of correcting the prompt."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "earnest",
        text: "Remember: close enough is the most expensive phrase in software.",
        text_ssml: "<speak>Remember: <emphasis level=\"moderate\">close enough</emphasis> is the most expensive phrase in software.</speak>",
        text_expressive: "Remember: close enough is the most expensive phrase in software."
      }
    ]
  },
  {
    slide_id: "slide_15",
    type: "competencies",
    title: "The Validation Checklist",
    subtitle: "Not a vibe check — a systematic gate",
    icon: "clipboard-check",
    visual_cue: "seven_point_inspection_checklist",
    analogy: {
      title: "Restaurant Health Inspection",
      text: "A health inspector doesn't walk in and go 'yeah, feels clean.' They have a checklist. Every item checked. Every item documented. Your validation is the same — systematic, documented, no shortcuts."
    },
    list: [
      { name: "Functional Correctness", icon: "check-circle", desc: "Does every acceptance criterion produce the correct behaviour? Test each one explicitly." },
      { name: "Business Rule Enforcement", icon: "shield-check", desc: "Is every validation rule enforced server-side, not only in the UI? Can it be bypassed via API?" },
      { name: "Data Isolation", icon: "lock", desc: "Can User A see User B's data in any code path? Test cross-tenant access explicitly." },
      { name: "Error Handling", icon: "alert-circle", desc: "Does every error return a clear, user-appropriate message? No stack traces, no internal paths." },
      { name: "Security", icon: "shield-alert", desc: "Auth guards on every endpoint. Authorization at service layer. Parameterized queries. No PII in responses." },
      { name: "Edge Cases", icon: "alert-triangle", desc: "Empty inputs, boundary values, concurrent requests — all the edge cases from the intent." },
      { name: "Documentation", icon: "file-text", desc: "Has auto-generated documentation accurately captured what was built, including decisions?" }
    ],
    memory_hook: "Seven checks. Every component. No shortcuts. This IS your quality gate.",
    narration: "Validation is not a vibe check. It's a restaurant health inspection. You need a checklist of seven things: functional correctness, business rules enforced on the server, data isolation, clean error handling, security (auth guards and query params), edge cases, and documentation. If it's not on the checklist, it is not validated. That's your quality gate.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Validation is not a vibe check. It's a restaurant health inspection.",
        text_ssml: "<speak>Validation is <emphasis level=\"moderate\">not a vibe check</emphasis>. It's a restaurant health inspection.</speak>",
        text_expressive: "Validation is not a vibe check. It's a restaurant health inspection."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "You need a checklist of seven things: functional correctness, business rules enforced on the server, data isolation, clean error handling, security, edge cases, and documentation.",
        text_ssml: "<speak>You need a checklist of <emphasis level=\"moderate\">seven things</emphasis>: functional correctness, business rules enforced on the server, data isolation, clean error handling, security, edge cases, and documentation.</speak>",
        text_expressive: "You need a checklist of seven things: functional correctness, business rules enforced on the server, data isolation, clean error handling, security, edge cases, and documentation."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "If it's not on the checklist, it is not validated. That's your quality gate.",
        text_ssml: "<speak>If it's not on the checklist, <emphasis level=\"moderate\">it is not validated</emphasis>. That's your quality gate.</speak>",
        text_expressive: "If it's not on the checklist, it is not validated. That's your quality gate."
      }
    ]
  },
  {
    slide_id: "slide_16",
    type: "comparison_table",
    title: "When Prompting Isn't Enough",
    subtitle: "Know when to re-prompt, when to pause, and when to call for backup",
    icon: "siren",
    visual_cue: "escalation_triage_flowchart",
    analogy: {
      title: "The Doctor Analogy",
      text: "First symptom → try the obvious fix. Third symptom → run tests. Unknown condition → refer to a specialist. Escalation isn't failure — it's professional judgment."
    },
    table: [
      { icon: "refresh-cw", old: "Output deviates on first attempt", new: "Re-prompt with targeted correction" },
      { icon: "pause", old: "Still deviating after 3 re-prompts", new: "PAUSE. Get SME/architect to review the intent structure." },
      { icon: "shield-alert", old: "Security pattern you don't recognize", new: "DO NOT accept. Get a security reviewer before committing." },
      { icon: "wrench", old: "Feature impossible with current stack", new: "Escalate to Solution Architect. Document the constraint." },
      { icon: "help-circle", old: "Code is correct but you can't explain it", new: "DO NOT accept. Ask AI to explain step by step until you can." }
    ],
    memory_hook: "1 miss = re-prompt. 3 misses = pause + SME. Unknown = never accept.",
    narration: "What happens when prompting fails? Think like a doctor. If the AI deviates on the first attempt, you re-prompt. If it is still off after three times, PAUSE and get an SME to review the intent. If it's a security pattern you don't know, don't commit it — get a security reviewer. If the stack can't do it, talk to a Solution Architect. And if the code works but you can't explain it, do not accept it. Ask the AI to explain it step-by-step.",
    estimated_duration_seconds: 100,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "What happens when prompting fails? Think like a doctor.",
        text_ssml: "<speak>What happens when prompting fails? <emphasis level=\"moderate\">Think like a doctor</emphasis>.</speak>",
        text_expressive: "What happens when prompting fails? Think like a doctor."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "casual",
        text: "If the AI deviates on the first attempt, you re-prompt. If it is still off after three times, PAUSE and get an SME to review the intent.",
        text_ssml: "<speak>If the A I deviates on the first attempt, you re-prompt. If it is still off after three times, <emphasis level=\"strong\">PAUSE</emphasis> and get an S M E to review the intent.</speak>",
        text_expressive: "If the AI deviates on the first attempt, you re-prompt. If it is still off after three times, PAUSE and get an SME to review the intent."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "If it's a security pattern you don't know, get a security reviewer. If the stack can't do it, talk to a Solution Architect.",
        text_ssml: "<speak>If it's a security pattern you don't know, get a security reviewer. If the stack can't do it, talk to a Solution Architect.</speak>",
        text_expressive: "If it's a security pattern you don't know, get a security reviewer. If the stack can't do it, talk to a Solution Architect."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "serious",
        text: "And if the code works but you can't explain it, do not accept it. Ask the AI to explain it step-by-step.",
        text_ssml: "<speak>And if the code works but you can't explain it, <emphasis level=\"moderate\">do not accept it</emphasis>. Ask the A I to explain it step-by-step.</speak>",
        text_expressive: "And if the code works but you can't explain it, do not accept it. Ask the AI to explain it step-by-step."
      }
    ]
  },
  {
    slide_id: "slide_17",
    type: "day_in_life",
    title: "One Feature, Full Lifecycle",
    subtitle: "Watching the loop run from intent to deploy",
    icon: "play-circle",
    visual_cue: "lifecycle_timeline_animation",
    analogy: {
      title: "The Cooking Show Format",
      text: "Cooking shows don't show you the recipe and say 'figure it out.' They show you the chef doing it — step by step, with commentary. That's what this slide is. One feature, full lifecycle, play by play."
    },
    timeline: [
      { time: "09:00 AM", icon: "target", phase: "INTENT", desc: "Stakeholder says: 'We need employees to submit expenses.' You turn that into a full 8-component intent with 6 validation rules, 3 roles, and server-side enforcement." },
      { time: "10:00 AM", icon: "git-branch", phase: "ORCHESTRATE", desc: "Expense table needs Employee table (exists). Approval workflow needs Manager role mapping (exists). Email service needs notification template (new)." },
      { time: "10:30 AM", icon: "wand-2", phase: "GENERATE", desc: "Prompt 1: database migration. Prompt 2: service layer with business rules. Prompt 3: API endpoints with guards. Prompt 4: React form with validation. Each validated before next." },
      { time: "11:30 AM", icon: "shield-check", phase: "VALIDATE", desc: "All 6 validation rules tested. Server-side enforcement confirmed. Manager can't see other teams' expenses. Error messages are clean. Edge cases covered." },
      { time: "02:00 PM", icon: "repeat", phase: "EVOLVE", desc: "Demo at 11:30. Stakeholder: 'Can we add receipt photo upload?' → New intent item → generate → validate → done by 2 PM." },
      { time: "04:30 PM", icon: "rocket", phase: "DEPLOY", desc: "Code committed with structured message. Docs auto-updated. Feature in client's QA by 4:30. Rollback plan documented." }
    ],
    memory_hook: "One feature, six stages, one day. That's the loop in action.",
    narration: "Let's watch a day in the life of a feature. At nine AM, we capture the Intent for an expense submission feature. At ten AM, we Orchestrate: checking dependencies and planning migrations. At ten-thirty, we Generate the code step-by-step. By eleven-thirty, we Validate: running our checklist and isolation tests. At two PM, we Evolve the feature after stakeholder feedback (adding receipt uploads). And by four-thirty, we Deploy to staging with auto-generated docs. That is the loop in action.",
    estimated_duration_seconds: 130,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Let's watch a day in the life of a feature. At nine AM, we capture the Intent for an expense submission feature.",
        text_ssml: "<speak>Let's watch a day in the life of a feature. At <emphasis level=\"moderate\">nine A M</emphasis>, we capture the Intent for an expense submission feature.</speak>",
        text_expressive: "Let's watch a day in the life of a feature. At nine AM, we capture the Intent for an expense submission feature."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "casual",
        text: "At ten AM, we Orchestrate: checking dependencies and planning migrations. At ten-thirty, we Generate the code step-by-step.",
        text_ssml: "<speak>At <emphasis level=\"moderate\">ten A M</emphasis>, we Orchestrate: checking dependencies and planning migrations. At <emphasis level=\"moderate\">ten-thirty</emphasis>, we Generate the code step-by-step.</speak>",
        text_expressive: "At ten AM, we Orchestrate: checking dependencies and planning migrations. At ten-thirty, we Generate the code step-by-step."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "By eleven-thirty, we Validate: running our checklist and isolation tests. At two PM, we Evolve the feature after stakeholder feedback, like adding receipt uploads.",
        text_ssml: "<speak>By <emphasis level=\"moderate\">eleven-thirty</emphasis>, we Validate: running our checklist and isolation tests. At <emphasis level=\"moderate\">two P M</emphasis>, we Evolve the feature after stakeholder feedback, like adding receipt uploads.</speak>",
        text_expressive: "By eleven-thirty, we Validate: running our checklist and isolation tests. At two PM, we Evolve the feature after stakeholder feedback, like adding receipt uploads."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "hyped",
        text: "And by four-thirty, we Deploy to staging with auto-generated docs. That is the loop in action.",
        text_ssml: "<speak>And by <emphasis level=\"moderate\">four-thirty</emphasis>, we Deploy to staging with auto-generated docs. That is the loop in action.</speak>",
        text_expressive: "[hyped] And by four-thirty, we Deploy to staging with auto-generated docs. That is the loop in action."
      }
    ]
  },
  {
    slide_id: "slide_18",
    type: "welcome",
    title: "Documentation That Writes Itself",
    subtitle: "The last principle that glues everything together",
    icon: "file-text",
    visual_cue: "living_document_auto_update_animation",
    analogy: {
      title: "GPS History vs Handwritten Diary",
      text: "A GPS automatically records every route you've taken — time, distance, turns. A handwritten diary requires you to remember to write. OrchestrAI documentation is the GPS kind — generated alongside the code, always current, never forgotten."
    },
    bullets: [
      "Documentation is generated ALONGSIDE the code, not after",
      "It includes: what was built, what decisions were made, what constraints applied",
      "Every commit message follows: [FEATURE] [Component] — AI-generated, validated by [Lead]",
      "The Lead reviews auto-generated docs DAILY and flags inaccuracies",
      "Documentation that falls behind the code = ungoverned code"
    ],
    closing_thread: "Every principle, every stage, every artifact — documented as it happens. Not after.",
    memory_hook: "Living docs = GPS history. Dead docs = handwritten diary you forgot to update.",
    narration: "Let's talk about documentation. In OrchestrAI, docs write themselves. They are generated alongside the code, not three weeks later. It captures what was built, key decisions, and constraints. Every commit has a strict format, and you review these docs daily. Remember: documentation that falls behind the code is just ungoverned code.",
    estimated_duration_seconds: 95,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "Let's talk about documentation. In OrchestrAI, docs write themselves. They are generated alongside the code, not three weeks later.",
        text_ssml: "<speak>Let's talk about documentation. In OrchestrAI, docs <emphasis level=\"moderate\">write themselves</emphasis>. They are generated alongside the code, not three weeks later.</speak>",
        text_expressive: "Let's talk about documentation. In OrchestrAI, docs write themselves. They are generated alongside the code, not three weeks later."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "It captures what was built, key decisions, and constraints. Every commit has a strict format, and you review these docs daily.",
        text_ssml: "<speak>It captures what was built, key decisions, and constraints. Every commit has a strict format, and you review these docs <emphasis level=\"moderate\">daily</emphasis>.</speak>",
        text_expressive: "It captures what was built, key decisions, and constraints. Every commit has a strict format, and you review these docs daily."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "real_talk",
        text: "Remember: documentation that falls behind the code is just ungoverned code.",
        text_ssml: "<speak>Remember: documentation that falls behind the code is <emphasis level=\"strong\">just ungoverned code</emphasis>.</speak>",
        text_expressive: "Remember: documentation that falls behind the code is just ungoverned code."
      }
    ]
  },
  {
    slide_id: "slide_19",
    type: "recap",
    title: "If You Remember Nothing Else…",
    subtitle: "Module 2 in five sentences",
    icon: "bookmark",
    visual_cue: "recap_board_summary",
    bullets: [
      "Six principles govern every engagement. Break one, it's not OrchestrAI.",
      "The lifecycle is a loop, not a line: Intent → Orchestrate → Generate → Validate → Evolve → Deploy.",
      "Intent is the foundation — eight components, all eight, every time.",
      "Validation is a systematic checklist, not a vibe check.",
      "Documentation lives alongside the code — generated, not written after."
    ],
    closing_thread: "Quiz time. Ten questions, 80% to pass, Module 3 unlocks.",
    memory_hook: "Principles. Loop. Intent. Checklist. Living docs. Five words, whole module.",
    narration: "Time to recap. If you remember nothing else from this module, remember these five. First: six principles govern everything. Break one? It's not OrchestrAI. Second: the lifecycle is a loop: I-O-G-V-E-D. Third: intent is the foundation — eight components, all eight, every time. Fourth: validation is a checklist, not a vibe. Fifth: documentation lives alongside code. Quiz time. Ten questions, eighty percent to pass. Let's do it.",
    estimated_duration_seconds: 90,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "summarizing",
        text: "Time to recap. If you remember nothing else from this module, remember these five.",
        text_ssml: "<speak>Time to recap. If you remember <emphasis level=\"reduced\">nothing else</emphasis> from this module, remember these five.</speak>",
        text_expressive: "Time to recap. If you remember nothing else from this module, remember these five."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "First: six principles govern everything. Break one? It's not OrchestrAI. Second: the lifecycle is a loop: I-O-G-V-E-D.",
        text_ssml: "<speak>First: six principles govern everything. Break one? It's not OrchestrAI. Second: the lifecycle is a loop: <emphasis level=\"moderate\">I O G V E D</emphasis>.</speak>",
        text_expressive: "First: six principles govern everything. Break one? It's not OrchestrAI. Second: the lifecycle is a loop: I-O-G-V-E-D."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Third: intent is the foundation — eight components, all eight, every time. Fourth: validation is a checklist, not a vibe. Fifth: documentation lives alongside code.",
        text_ssml: "<speak>Third: intent is the foundation — <emphasis level=\"moderate\">eight components</emphasis>, all eight, every time. Fourth: validation is a checklist, not a vibe. Fifth: documentation lives alongside code.</speak>",
        text_expressive: "Third: intent is the foundation — eight components, all eight, every time. Fourth: validation is a checklist, not a vibe. Fifth: documentation lives alongside code."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "hyped",
        text: "Quiz time. Ten questions, eighty percent to pass. Let's do it.",
        text_ssml: "<speak>Quiz time. Ten questions, <emphasis level=\"moderate\">eighty percent</emphasis> to pass. Let's do it.</speak>",
        text_expressive: "[hyped] Quiz time. Ten questions, eighty percent to pass. Let's do it."
      }
    ]
  },
  {
    slide_id: "slide_19b",
    type: "confidence_slider",
    title: "Before we test you…",
    subtitle: "Quick self-check on the operational framework",
    icon: "help-circle",
    visual_cue: "confidence_slider_interactive",
    prompt: "If a client handed you a feature request right now, could you write a full 8-component intent statement, map the dependency graph, and define the validation checklist — before AI touches a single line?",
    scale: { min_label: "Not yet", max_label: "Let's go" },
    narration: "Before the quiz, a quick self-check. Slide that slider. How confident are you feeling about mapping this out?",
    estimated_duration_seconds: 30,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "casual",
        text: "Before the quiz, a quick self-check. Slide that slider. How confident are you feeling about mapping this out?",
        text_ssml: "<speak>Before the quiz, a quick self-check. Slide that slider. How confident are you feeling about mapping this out?</speak>",
        text_expressive: "Before the quiz, a quick self-check. Slide that slider. How confident are you feeling about mapping this out?"
      }
    ]
  },
  {
    slide_id: "slide_20",
    type: "interactive_quiz_engine",
    title: "Module 2 Knowledge Check",
    subtitle: "10 questions. 80% to pass. Unlimited retakes.",
    icon: "clipboard-check",
    visual_cue: "quiz_engine_interface",
    pass_threshold: 80,
    questions: [
      {
        id: "q1",
        category: "Principles",
        icon: "shield-check",
        question: "Which principle is violated when a Lead manually fixes a bug in AI-generated code instead of re-prompting?",
        choices: ["AI as Primary Builder", "Human as Orchestrator", "Continuous Delivery", "Quality by Design"],
        correct_answer: "AI as Primary Builder",
        explanation: "Manual code fixes break the audit trail and create drift between intent and implementation. Always correct through re-prompting."
      },
      {
        id: "q2",
        category: "Principles",
        icon: "infinity",
        question: "'No sprints, no sprint planning, no retros' — which principle?",
        choices: ["Continuous Delivery", "Plain-English Driven", "Instant Iteration", "AI as Primary Builder"],
        correct_answer: "Continuous Delivery",
        explanation: "Continuous Delivery means work flows through the intent-validate-evolve loop in hours, replacing fixed-time sprint boxes."
      },
      {
        id: "q3",
        category: "Principles",
        icon: "shield-alert",
        question: "Quality by Design means security and validation are specified WHERE?",
        choices: ["In the intent statement, as constraints before generation", "During the validate stage after generation", "By a QA engineer in staging", "By the developer during coding"],
        correct_answer: "In the intent statement, as constraints before generation",
        explanation: "Quality by Design requires security and validation rules to be specified upfront as constraints in the intent, so they are built in from day one."
      },
      {
        id: "q4",
        category: "Lifecycle",
        icon: "route",
        question: "What is the correct order of the six lifecycle stages?",
        choices: [
          "Intent -> Orchestrate -> Generate -> Validate -> Evolve -> Deploy",
          "Orchestrate -> Intent -> Generate -> Validate -> Evolve -> Deploy",
          "Intent -> Generate -> Orchestrate -> Validate -> Evolve -> Deploy",
          "Intent -> Orchestrate -> Generate -> Evolve -> Validate -> Deploy"
        ],
        correct_answer: "Intent -> Orchestrate -> Generate -> Validate -> Evolve -> Deploy",
        explanation: "The lifecycle always starts with Intent, maps dependencies in Orchestrate, generates with AI, validates against checklist, evolves from feedback, and deploys daily."
      },
      {
        id: "q5",
        category: "Lifecycle",
        icon: "git-branch",
        question: "During the ORCHESTRATE stage, the Lead's primary job is to:",
        choices: [
          "Map the dependency graph and define the component build order",
          "Write the code using AI",
          "Test the UI for CSS bugs",
          "Capture the initial business intent"
        ],
        correct_answer: "Map the dependency graph and define the component build order",
        explanation: "Orchestration is about laying out the dependency analysis and assembly sequence (database before service before API before UI)."
      },
      {
        id: "q6",
        category: "Lifecycle",
        icon: "alert-circle",
        question: "What should a Lead do if AI output still deviates after 3 targeted re-prompts?",
        choices: [
          "Pause generation and engage the SME/architect for review",
          "Fix the code manually in VS Code",
          "Skip this feature and build something else",
          "Try a 4th and 5th identical prompt"
        ],
        correct_answer: "Pause generation and engage the SME/architect for review",
        explanation: "If generation fails three times, pause. Escalation is professional judgment. Get an SME or architect to review the intent structure."
      },
      {
        id: "q7",
        category: "Intent",
        icon: "puzzle",
        question: "How many components does a perfect intent statement have?",
        choices: ["Eight", "Six", "Ten", "Twelve"],
        correct_answer: "Eight",
        explanation: "The 8-component framework consists of: Outcome, Actor & Role, Validation Rules, Security Constraints, Stack & Patterns, Acceptance Signals, Edge Cases, and Data Model."
      },
      {
        id: "q8",
        category: "Intent",
        icon: "cloud",
        question: "Which anti-pattern involves issuing one massive prompt for an entire application?",
        choices: ["The Mega-Prompt", "The Vague Outcome", "The Assumption Prompt", "The Manual Patch"],
        correct_answer: "The Mega-Prompt",
        explanation: "The Mega-Prompt degrades quality with scope. The rule is: one focused prompt per component, validating each before moving on."
      },
      {
        id: "q9",
        category: "Validation",
        icon: "lock",
        question: "Which validation category checks whether User A can see User B's data?",
        choices: ["Data Isolation", "Functional Correctness", "Business Rule Enforcement", "Security"],
        correct_answer: "Data Isolation",
        explanation: "Data Isolation validation explicitly tests database querying and controller scope to ensure cross-tenant data leaks cannot occur."
      },
      {
        id: "q10",
        category: "Deploy",
        icon: "rocket",
        question: "What MUST be true before any AI-generated code reaches production?",
        choices: [
          "Lead validation sign-off, security checklist pass, test pass, docs current, rollback plan",
          "The code compiles and seems to work in the UI",
          "The AI says the code is complete and secure",
          "The project manager approves the design layout"
        ],
        correct_answer: "Lead validation sign-off, security checklist pass, test pass, docs current, rollback plan",
        explanation: "Deployments in OrchestrAI must be governed, documented, tested, and reversible, with current living documentation."
      }
    ],
    narration: "Quiz time! Ten questions. You need an eighty percent score to pass. Take your time, recall the principles and the lifecycle stages, and let's get it.",
    estimated_duration_seconds: 480,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "excited",
        text: "Quiz time! Ten questions. You need an eighty percent score to pass.",
        text_ssml: "<speak>Quiz time! Ten questions. You need an <emphasis level=\"moderate\">eighty percent score</emphasis> to pass.</speak>",
        text_expressive: "Quiz time! Ten questions. You need an eighty percent score to pass."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "encouraging",
        text: "Take your time, recall the principles and the lifecycle stages, and let's get it.",
        text_ssml: "<speak>Take your time, recall the principles and the lifecycle stages, and let's get it.</speak>",
        text_expressive: "Take your time, recall the principles and the lifecycle stages, and let's get it."
      }
    ]
  },
  {
    slide_id: "slide_21",
    type: "prompt_lab",
    title: "Lab 1: Map the Lifecycle",
    subtitle: "Write the intent + orchestration plan for a real feature",
    icon: "flask-conical",
    visual_cue: "lab_input_workspace",
    lab_number: 1,
    scenario: {
      label: "The Scenario",
      text: "A client says: 'We need a leave request system. Employees request leave, managers approve or reject, and HR can see all requests.' That's the entire brief. Your job: write the INTENT (8 components) and the ORCHESTRATION plan (dependency order + API contracts) before a single prompt fires."
    },
    task_prompt: "Write the 8-component intent statement and orchestrate the build plan. Fill in the fields below.",
    input_fields: [
      { key: "outcome", label: "Outcome", placeholder: "One sentence: what working behaviour should exist?" },
      { key: "actor_role", label: "Actor & Role", placeholder: "List all user roles and their permissions" },
      { key: "validation_rules", label: "Validation Rules (numbered)", placeholder: "What makes input valid or invalid?" },
      { key: "security", label: "Security Constraints", placeholder: "Auth, authorization, enforcement layers" },
      { key: "build_order", label: "Build Order (numbered)", placeholder: "What gets generated first, second, third...?" },
      { key: "api_contracts", label: "Key API Endpoints", placeholder: "List the main endpoints with HTTP verbs and guards" }
    ],
    submit_button_label: "Compare to Model Plan",
    model_answer: {
      outcome: "Build a leave request system where Employees submit requests, Managers approve/reject team requests, and HR views all requests.",
      actor_role: "EMPLOYEE (request leave, view own history), MANAGER (view/approve/reject team leave), HR (view all leave requests, no edit).",
      validation_rules: "(1) leave dates must be in future, (2) start date <= end date, (3) description mandatory, (4) leave duration cannot exceed remaining balance.",
      security: "JWT auth. Managers can only access requests where submitter's managerId matches Manager's ID. HR role required for global read endpoint.",
      build_order: "(1) Prisma schema with LeaveRequest model and migrations, (2) NestJS Service layer with validation rules, (3) Controller endpoints with Guards, (4) React forms and tables.",
      api_contracts: "POST /leave (Employee, submit), GET /leave/team (Manager, view team), PATCH /leave/:id/approve (Manager, action), GET /leave/all (HR, view all)."
    },
    comparison_report: {
      title: "How did your plan stack up?",
      intro: "This lab tests your ability to structure intent and define a clean build sequence before prompting. Let's compare your plan to the model answer.",
      common_gaps: [
        {
          element: "Security Constraints",
          insight: "Did you catch that Managers must be restricted to their own team? Client-side hidden lists aren't enough — it must be enforced server-side via SQL/ORM conditions."
        },
        {
          element: "Build Order",
          insight: "Database migrations must come first. Generating controllers before the schema results in import errors and compiler noise."
        }
      ],
      closing_line: "Review the differences and proceed to Lab 2 when you're ready."
    },
    narration: "Lab 1 time. A client asks for a leave request system. Employees request, managers approve, HR views. Vague, right? Your job: fill in the fields to turn this request into a proper, structured intent and dependency plan.",
    estimated_duration_seconds: 240,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "excited",
        text: "Lab 1 time. A client asks for a leave request system. Employees request, managers approve, HR views. Vague, right?",
        text_ssml: "<speak>Lab 1 time. A client asks for a leave request system. Employees request, managers approve, HR views. Vague, right?</speak>",
        text_expressive: "Lab 1 time. A client asks for a leave request system. Employees request, managers approve, HR views. Vague, right?"
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "encouraging",
        text: "Your job: fill in the fields to turn this request into a proper, structured intent and dependency plan.",
        text_ssml: "<speak>Your job: fill in the fields to turn this request into a <emphasis level=\"moderate\">proper, structured intent</emphasis> and dependency plan.</speak>",
        text_expressive: "Your job: fill in the fields to turn this request into a proper, structured intent and dependency plan."
      }
    ]
  },
  {
    slide_id: "slide_22",
    type: "prompt_lab",
    title: "Lab 2: Validation Checklist Exercise",
    subtitle: "Can you turn acceptance criteria into explicit test actions?",
    icon: "flask-conical",
    visual_cue: "lab_input_validation_checklist",
    lab_number: 2,
    scenario: {
      label: "The Scenario",
      text: "Using the leave request feature from Lab 1, your AI just generated the service layer and API endpoints. Before you accept this code, you need a validation checklist. For each acceptance criterion below, write the specific test action you'd perform."
    },
    task_prompt: "Define specific test actions for validation. Fill in the fields below.",
    input_fields: [
      { key: "functional", label: "Functional Test", placeholder: "How do you verify an employee can submit a leave request?" }
      ,{ key: "business_rule", label: "Business Rule Test", placeholder: "How do you verify overlapping leave dates are rejected?" }
      ,{ key: "data_isolation", label: "Data Isolation Test", placeholder: "How do you verify Employee A can't see Employee B's requests?" }
      ,{ key: "security", label: "Security Test", placeholder: "How do you verify the API rejects unauthenticated requests?" }
      ,{ key: "edge_case", label: "Edge Case Test", placeholder: "What happens when an employee requests leave for a past date?" }
      ,{ key: "error_handling", label: "Error Handling Test", placeholder: "What does the user see when submitting an invalid request?" }
    ],
    submit_button_label: "Compare to Model Checklist",
    model_answer: {
      functional: "Use Swagger/Postman to POST a valid leave request payload as Employee A. Verify 201 Created response and DB record existence.",
      business_rule: "Submit a leave request for July 1-5, then submit another for July 3-7 for same Employee. Verify 400 Bad Request on second.",
      data_isolation: "Log in as Manager A. Attempt GET /leave/team. Verify only requests from Employee A (team member) are returned, no Employee B (Manager B's team) requests.",
      security: "Make GET /leave/all request without Authorization header. Verify 401 Unauthorized response is returned.",
      edge_case: "Submit leave request with startDate in past (e.g. yesterday). Verify API validation rejects it with clear validation error.",
      error_handling: "Submit a request missing dates. Verify response contains detailed JSON error list showing validation errors, not a 500 error."
    },
    comparison_report: {
      title: "Checklist Validation",
      intro: "A true OrchestrAI Lead tests systematically. Let's compare your validation test actions with the model answers.",
      common_gaps: [
        {
          element: "Data Isolation",
          insight: "Always test with cross-tenant context. Trying to fetch data using another user's ID is the absolute best way to check if your server-side checks actually hold up."
        },
        {
          element: "Error Handling",
          insight: "Ensure bad payloads return 400 with messages. If you get a 500 response, that's a validation leak — the database crashed instead of the API catching it."
        }
      ],
      closing_line: "Compare your checks, confirm you understand, and let's unlock that final certificate slide!"
    },
    narration: "Lab 2: time to write the validation checklist. The AI just generated the backend. Before you commit, how do you verify it? Fill in the test actions for each category.",
    estimated_duration_seconds: 240,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Lab 2: time to write the validation checklist. The AI just generated the backend. Before you commit, how do you verify it?",
        text_ssml: "<speak>Lab 2: time to write the validation checklist. The A I just generated the backend. Before you commit, how do you verify it?</speak>",
        text_expressive: "Lab 2: time to write the validation checklist. The AI just generated the backend. Before you commit, how do you verify it?"
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "encouraging",
        text: "Fill in the test actions for each category. Don't guess — write the exact Postman or DB query you'd run.",
        text_ssml: "<speak>Fill in the test actions for each category. Don't guess <break time=\"100ms\"/> write the exact Postman or D B query you'd run.</speak>",
        text_expressive: "Fill in the test actions for each category. Don't guess — write the exact Postman or DB query you'd run."
      }
    ]
  },
  {
    slide_id: "slide_23",
    type: "module_complete",
    title: "You Did It — Again",
    subtitle: "Module 2 Complete",
    icon: "party-popper",
    visual_cue: "architect_with_blueprint",
    hero_visual: {
      concept: "architect_with_blueprint",
      description: "An architect standing before a glowing blueprint/schematic, the six lifecycle stages visible as connected nodes. Ties back to the 'blueprint' metaphor from Act 1.",
      alt_text: "An illustrated architect standing in front of a glowing blueprint diagram of the six lifecycle stages.",
      fallback_icon: "party-popper",
      animation_suggestion: "Glowing node connection lines fade in sequentially, ending in a brief blue energy surge."
    },
    score_display: {
      label: "Your Quiz Score",
      pass_threshold: 80
    },
    summary_bullets: [
      "Six principles — break one, it's not OrchestrAI.",
      "The lifecycle is a loop: I-O-G-V-E-D. Memorize it.",
      "Intent has eight components. All eight. Every time.",
      "Validation is a checklist, not a feeling.",
      "Docs generate themselves — you just make sure they're right."
    ],
    achievement_stats: {
      label: "What You Just Pulled Off",
      stats: [
        { icon: "layout-grid", value: "22", label: "Slides Crushed" },
        { icon: "flask-conical", value: "2", label: "Labs Done" },
        { icon: "clipboard-check", value: "10", label: "Quiz Questions" },
        { icon: "clock", value: "60", label: "Minutes, Zero Wasted" }
      ]
    },
    closing_message: "And that's a wrap on Module 2. Everything else in this program builds on what you just locked in — conductor mindset, P.R.O.M.P.T., upstream quality. Module 3 is whenever you're ready. Let's gooo.",
    cta_button: "Let's Go to Module 3",
    narration: "Okay, you did it. Module 2: complete. Look at your score up there. You locked in the six principles, the six lifecycle stages, and the eight-component intent framework. You're building the machine now, not just driving. Take a second, celebrate, and we'll see you in Module 3. Let's gooo.",
    estimated_duration_seconds: 60,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "hyped",
        text: "Okay, you did it. Module 2: complete.",
        text_ssml: "<speak>Okay, you did it. Module 2: complete.</speak>",
        text_expressive: "[hyped] Okay, you did it. Module 2: complete."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "proud",
        text: "Look at your score up there. You locked in the six principles, the six lifecycle stages, and the eight-component intent framework.",
        text_ssml: "<speak>Look at your score up there. You locked in the <emphasis level=\"moderate\">six principles</emphasis>, the <emphasis level=\"moderate\">six lifecycle stages</emphasis>, and the <emphasis level=\"moderate\">eight-component intent framework</emphasis>.</speak>",
        text_expressive: "Look at your score up there. You locked in the six principles, the six lifecycle stages, and the eight-component intent framework."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "You're building the machine now, not just driving. Take a second, celebrate, and we'll see you in Module 3. Let's gooo.",
        text_ssml: "<speak>You're building the machine now, not just driving. Take a second, celebrate, and we'll see you in <emphasis level=\"moderate\">Module 3</emphasis>. Let's gooo.</speak>",
        text_expressive: "You're building the machine now, not just driving. Take a second, celebrate, and we'll see you in Module 3. Let's gooo."
      }
    ],
    background_music: {
      track_key: "outro_theme_m2",
      behavior: "fade_in_then_duck_under_narration",
      fade_in_ms: 1000,
      duck_volume_percent: 15,
      fade_out_ms: 2500,
      notes: "Outro theme plays on load, ducks, then fades out."
    }
  }
);


// FORMAL PRESET GENERATOR
// Transform GenZ slides into Formal slides
const formalData = {
  module: "Module 2 — The OrchestrAI Framework Architecture",
  preset: "formal",
  format: "single_narrator",
  speakers: {
    Narrator: {
      voice_key: "professional_narrator",
      gender: "neutral",
      persona: "Authoritative, measured training narrator"
    }
  },
  tts_field_priority: [
    "text_expressive",
    "text_ssml",
    "text"
  ],
  tts_notes: "Use text_expressive for ElevenLabs-style engines, text_ssml for Google/Azure/Polly, text as universal fallback. 'emotion' is a one-word hint for engines that accept an emotion param. Map voice key (professional_narrator) to real voice in your TTS dashboard.",
  schema_version: "v8_interactive",
  last_updated: "2026-06-23T18:28:39+05:30",
  acts: genzData.acts,
  slides: []
};

// Formal Slide Adaptations (manual mappings for key adaptations)
const formalAdaptations = {
  slide_01: {
    title: "Module 2 — The OrchestrAI Framework Architecture",
    subtitle: "Principles, Lifecycle, and Structured Intent for Enterprise Delivery",
    bullets: [
      "This module covers the governance framework underpinning all OrchestrAI delivery",
      "Six non-negotiable operating principles define what qualifies as OrchestrAI",
      "The six-stage lifecycle replaces the sprint cycle as the primary operating rhythm",
      "Completion requires 80% on the knowledge assessment"
    ],
    closing_thread: "We will begin with the six core principles.",
    analogy: {
      title: "Governance Framework, Not Guidelines",
      text: "ISO 27001 has mandatory controls, not suggestions. These six principles function identically — they are the mandatory controls for OrchestrAI governance. An engagement that violates any principle is not running OrchestrAI, regardless of what label is applied."
    },
    memory_hook: "Module 1: mindset. Module 2: operational architecture.",
    narration: "Welcome to Module 2: The OrchestrAI Framework Architecture. This module establishes the operational framework for OrchestrAI engagements. We will cover the six core principles and the six-stage lifecycle that structure all software delivery under this model. These principles are non-negotiable; they ensure consistency, safety, and velocity. The lifecycle provides a predictable path from business intent to production release. We will begin with the six core principles.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Welcome to Module 2: The OrchestrAI Framework Architecture. This module establishes the operational framework for OrchestrAI engagements.",
        text_ssml: "<speak>Welcome to Module 2: The OrchestrAI Framework Architecture. This module establishes the <emphasis level=\"moderate\">operational framework</emphasis> for OrchestrAI engagements.</speak>",
        text_expressive: "Welcome to Module 2: The OrchestrAI Framework Architecture. This module establishes the operational framework for OrchestrAI engagements."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We will cover the six core principles and the six-stage lifecycle that structure all software delivery under this model.",
        text_ssml: "<speak>We will cover the six core principles and the <emphasis level=\"moderate\">six-stage lifecycle</emphasis> that structure all software delivery under this model.</speak>",
        text_expressive: "We will cover the six core principles and the six-stage lifecycle that structure all software delivery under this model."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "authoritative",
        text: "These principles are non-negotiable; they ensure consistency, safety, and velocity.",
        text_ssml: "<speak>These principles are <emphasis level=\"strong\">non-negotiable</emphasis>; they ensure consistency, safety, and velocity.</speak>",
        text_expressive: "[authoritative] These principles are non-negotiable; they ensure consistency, safety, and velocity."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "The lifecycle provides a predictable path from business intent to production release. We will begin with the six core principles.",
        text_ssml: "<speak>The lifecycle provides a predictable path from business intent to production release. <emphasis level=\"moderate\">We will begin</emphasis> with the six core principles.</speak>",
        text_expressive: "The lifecycle provides a predictable path from business intent to production release. We will begin with the six core principles."
      }
    ]
  },
  slide_02: {
    title: "The Six Core Principles",
    subtitle: "Governance standards for OrchestrAI delivery models",
    bullets: [
      "AI as Primary Builder: The AI engine generates all code artifacts. Manual coding breaks the audit trail.",
      "Human as Orchestrator: The Lead manages constraints and approvals, operating as conductor.",
      "Plain-English Driven: Intent is defined in natural language, eliminating bureaucratic documentation.",
      "Continuous Delivery: Deliveries occur continuously, replacing fixed-duration sprints.",
      "Instant Iteration: Gaps are corrected in the current session through targeted prompting.",
      "Quality by Design: Constraints are defined in the intent, baking quality in from day one."
    ],
    analogy: {
      title: "Mandatory Operational Controls",
      text: "Similar to regulatory compliance controls, these six principles are mandatory. Skipping a control invalidates the governance framework, leading to developmental drift and unversioned code."
    },
    memory_hook: "Six principles. Zero exceptions. Governed delivery.",
    narration: "The OrchestrAI governance framework is built on six core principles. First: AI as Primary Builder. The AI engine generates all code artifacts; manual intervention breaks version control. Second: Human as Orchestrator. The Lead defines parameters and controls quality. Third: Plain-English Driven. Requirements are structured in precise natural language. Fourth: Continuous Delivery. Delivery is continuous rather than boxed into sprints. Fifth: Instant Iteration. Code correction happens in real-time. And sixth: Quality by Design. Security and validation are defined in the intent statement.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "The OrchestrAI governance framework is built on six core principles.",
        text_ssml: "<speak>The OrchestrAI governance framework is built on <emphasis level=\"moderate\">six core principles</emphasis>.</speak>",
        text_expressive: "The OrchestrAI governance framework is built on six core principles."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "First: AI as Primary Builder. The AI engine generates all code artifacts; manual intervention breaks version control. Second: Human as Orchestrator. The Lead defines parameters and controls quality.",
        text_ssml: "<speak>First: <emphasis level=\"moderate\">AI as Primary Builder</emphasis>. The AI engine generates all code artifacts; manual intervention breaks version control. Second: <emphasis level=\"moderate\">Human as Orchestrator</emphasis>. The Lead defines parameters and controls quality.</speak>",
        text_expressive: "First: AI as Primary Builder. The AI engine generates all code artifacts; manual intervention breaks version control. Second: Human as Orchestrator. The Lead defines parameters and controls quality."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Third: Plain-English Driven. Requirements are structured in precise natural language. Fourth: Continuous Delivery. Delivery is continuous rather than boxed into sprints.",
        text_ssml: "<speak>Third: <emphasis level=\"moderate\">Plain-English Driven</emphasis>. Requirements are structured in precise natural language. Fourth: <emphasis level=\"moderate\">Continuous Delivery</emphasis>. Delivery is continuous rather than boxed into sprints.</speak>",
        text_expressive: "Third: Plain-English Driven. Requirements are structured in precise natural language. Fourth: Continuous Delivery. Delivery is continuous rather than boxed into sprints."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Fifth: Instant Iteration. Code correction happens in real-time. And sixth: Quality by Design. Security and validation are defined in the intent statement.",
        text_ssml: "<speak>Fifth: <emphasis level=\"moderate\">Instant Iteration</emphasis>. Code correction happens in real-time. And sixth: <emphasis level=\"moderate\">Quality by Design</emphasis>. Security and validation are defined in the intent statement.</speak>",
        text_expressive: "Fifth: Instant Iteration. Code correction happens in real-time. And sixth: Quality by Design. Security and validation are defined in the intent statement."
      }
    ]
  },
  slide_03: {
    title: "AI as Builder. Lead as Orchestrator.",
    subtitle: "The separation of execution and governance",
    analogy: {
      title: "Managing Partner vs. Associate Consultant",
      text: "A managing partner at a consulting firm does not write the deliverables personally. They define the engagement scope, review the analysis, and ensure the final output meets client expectations. The consultants execute. The OrchestrAI Lead operates identically."
    },
    memory_hook: "Lead manages direction. AI manages implementation. Zero manual coding.",
    narration: "To understand this operational model, we compare traditional roles with OrchestrAI. In traditional models, the Lead patches code when AI fails. In OrchestrAI, the Lead re-prompts, never touching code directly. Traditional requirements are documented in bulky BRDs, whereas OrchestrAI uses plain-English briefs. Planning poker is replaced by continuous hourly loops. Security is baked in from the start, and documentation is auto-generated with the code, ensuring auditability.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "To understand this operational model, we compare traditional roles with OrchestrAI.",
        text_ssml: "<speak>To understand this operational model, we compare <emphasis level=\"moderate\">traditional roles</emphasis> with OrchestrAI.</speak>",
        text_expressive: "To understand this operational model, we compare traditional roles with OrchestrAI."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "In traditional models, the Lead patches code when AI fails. In OrchestrAI, the Lead re-prompts, never touching code directly.",
        text_ssml: "<speak>In traditional models, the Lead patches code when AI fails. In OrchestrAI, the Lead <emphasis level=\"moderate\">re-prompts</emphasis>, never touching code directly.</speak>",
        text_expressive: "In traditional models, the Lead patches code when AI fails. In OrchestrAI, the Lead re-prompts, never touching code directly."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Traditional requirements are documented in bulky BRDs, whereas OrchestrAI uses plain-English briefs. Planning poker is replaced by continuous hourly loops.",
        text_ssml: "<speak>Traditional requirements are documented in bulky BRDs, whereas OrchestrAI uses <emphasis level=\"moderate\">plain-English briefs</emphasis>. Planning poker is replaced by continuous hourly loops.</speak>",
        text_expressive: "Traditional requirements are documented in bulky BRDs, whereas OrchestrAI uses plain-English briefs. Planning poker is replaced by continuous hourly loops."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Security is baked in from the start, and documentation is auto-generated with the code, ensuring auditability.",
        text_ssml: "<speak>Security is <emphasis level=\"moderate\">baked in from the start</emphasis>, and documentation is auto-generated with the code, ensuring auditability.</speak>",
        text_expressive: "Security is baked in from the start, and documentation is auto-generated with the code, ensuring auditability."
      }
    ]
  },
  slide_03b: {
    title: "Governance Analysis Checklist",
    subtitle: "Identify which core principle is violated in each scenario",
    narration: "Let us perform a governance check. Review the four enterprise scenarios and identify which OrchestrAI principle is being violated in each case.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Let us perform a governance check. Review the four enterprise scenarios and identify which OrchestrAI principle is being violated in each case.",
        text_ssml: "<speak>Let us perform a governance check. Review the <emphasis level=\"moderate\">four enterprise scenarios</emphasis> and identify which OrchestrAI principle is being violated in each case.</speak>",
        text_expressive: "Let us perform a governance check. Review the four enterprise scenarios and identify which OrchestrAI principle is being violated in each case."
      }
    ]
  },
  slide_04: {
    title: "The Cost of Governance Deviations",
    subtitle: "Quantifying the impact of skipping controls",
    analogy: {
      title: "The Compliance Paradigm",
      text: "In regulatory audits, a single failed control invalidates the entire compliance certificate. Similarly, breaking one OrchestrAI principle compromises delivery safety. We enforce controls not for convenience, but to maintain architectural integrity."
    },
    memory_hook: "Principle deviations compound rework costs and compromise delivery speed.",
    narration: "Operational data shows that rework costs increase three-fold when even a single principle is bypassed. If you bypass AI as Primary Builder, you lose code auditability. Bypassing Plain-English Driven re-introduces document-heavy waterfall processes. Bypassing Continuous Delivery forces teams back into artificial sprint boxes. And bypassing Quality by Design creates late-stage security risks. Governance is essential to maintain delivery velocity.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "authoritative",
        text: "Operational data shows that rework costs increase three-fold when even a single principle is bypassed.",
        text_ssml: "<speak>Operational data shows that rework costs increase <emphasis level=\"strong\">three-fold</emphasis> when even a single principle is bypassed.</speak>",
        text_expressive: "[authoritative] Operational data shows that rework costs increase three-fold when even a single principle is bypassed."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "If you bypass AI as Primary Builder, you lose code auditability. Bypassing Plain-English Driven re-introduces document-heavy waterfall processes.",
        text_ssml: "<speak>If you bypass AI as Primary Builder, you lose <emphasis level=\"moderate\">code auditability</emphasis>. Bypassing Plain-English Driven re-introduces document-heavy waterfall processes.</speak>",
        text_expressive: "If you bypass AI as Primary Builder, you lose code auditability. Bypassing Plain-English Driven re-introduces document-heavy waterfall processes."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Bypassing Continuous Delivery forces teams back into artificial sprint boxes. And bypassing Quality by Design creates late-stage security risks.",
        text_ssml: "<speak>Bypassing Continuous Delivery forces teams back into <emphasis level=\"moderate\">artificial sprint boxes</emphasis>. And bypassing Quality by Design creates late-stage security risks.</speak>",
        text_expressive: "Bypassing Continuous Delivery forces teams back into artificial sprint boxes. And bypassing Quality by Design creates late-stage security risks."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "emphatic",
        text: "Governance is essential to maintain delivery velocity.",
        text_ssml: "<speak>Governance is <emphasis level=\"moderate\">essential</emphasis> to maintain delivery velocity.</speak>",
        text_expressive: "Governance is essential to maintain delivery velocity."
      }
    ]
  },
  slide_05: {
    title: "Operationalizing the Principles: The Lifecycle",
    subtitle: "Transitioning from rules to workflow execution",
    reflection_prompt: "We have established the six core principles. However, principles require a process framework to execute. Are you ready to review the delivery lifecycle?",
    bullets: [
      "Core Principles establish the governing constraints",
      "The Lifecycle provides the execution framework",
      "Process flow: INTENT -> ORCHESTRATE -> GENERATE -> VALIDATE -> EVOLVE -> DEPLOY",
      "A continuous loop replacing linear agile methodologies"
    ],
    memory_hook: "Principles define the boundaries. The lifecycle defines the workflow.",
    narration: "While principles define the operational boundaries, the lifecycle defines the execution process. Think of principles as the rules of the road, and the lifecycle as the navigation system. The process flows through six stages: Intent, Orchestrate, Generate, Validate, Evolve, and Deploy. This is a continuous loop, not a linear sequence. We will now examine each stage.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "While principles define the operational boundaries, the lifecycle defines the execution process.",
        text_ssml: "<speak>While principles define the operational boundaries, the lifecycle defines the <emphasis level=\"moderate\">execution process</emphasis>.</speak>",
        text_expressive: "While principles define the operational boundaries, the lifecycle defines the execution process."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Think of principles as the rules of the road, and the lifecycle as the navigation system. The process flows through six stages: Intent, Orchestrate, Generate, Validate, Evolve, and Deploy.",
        text_ssml: "<speak>Think of principles as the rules of the road, and the lifecycle as the navigation system. The process flows through <emphasis level=\"moderate\">six stages</emphasis>: Intent, Orchestrate, Generate, Validate, Evolve, and Deploy.</speak>",
        text_expressive: "Think of principles as the rules of the road, and the lifecycle as the navigation system. The process flows through six stages: Intent, Orchestrate, Generate, Validate, Evolve, and Deploy."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "This is a continuous loop, not a linear sequence. We will now examine each stage.",
        text_ssml: "<speak>This is a <emphasis level=\"moderate\">continuous loop</emphasis>, not a linear sequence. We will now examine each stage.</speak>",
        text_expressive: "This is a continuous loop, not a linear sequence. We will now examine each stage."
      }
    ]
  },
  slide_06: {
    title: "The Six-Stage Lifecycle",
    subtitle: "The operating sequence for OrchestrAI engagements",
    analogy: {
      title: "Dynamic Process Models",
      text: "A static delivery model follows a rigid sequence regardless of outcomes. A dynamic model, like a modern workflow router, shifts execution based on real-time feedback. The OrchestrAI lifecycle loops constantly to integrate feedback immediately."
    },
    memory_hook: "I-O-G-V-E-D: Intent, Orchestrate, Generate, Validate, Evolve, Deploy. The engine of delivery.",
    narration: "The delivery lifecycle contains six distinct stages. Stage one: Intent. This defines what is being built with high precision. Stage two: Orchestrate. This maps the dependency graph and API contracts. Stage three: Generate. The AI implements code under the Lead's supervision. Stage four: Validate. The code is tested against strict criteria. Stage five: Evolve. Feedback is rapidly integrated in the same session. Stage six: Deploy. Code is released continuously in a governed, auditable manner.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "The delivery lifecycle contains six distinct stages.",
        text_ssml: "<speak>The delivery lifecycle contains <emphasis level=\"moderate\">six distinct stages</emphasis>.</speak>",
        text_expressive: "The delivery lifecycle contains six distinct stages."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage one: Intent. This defines what is being built with high precision. Stage two: Orchestrate. This maps the dependency graph and API contracts.",
        text_ssml: "<speak>Stage one: <emphasis level=\"moderate\">Intent</emphasis>. This defines what is being built with high precision. Stage two: <emphasis level=\"moderate\">Orchestrate</emphasis>. This maps the dependency graph and API contracts.</speak>",
        text_expressive: "Stage one: Intent. This defines what is being built with high precision. Stage two: Orchestrate. This maps the dependency graph and API contracts."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage three: Generate. The AI implements code under the Lead's supervision. Stage four: Validate. The code is tested against strict criteria.",
        text_ssml: "<speak>Stage three: <emphasis level=\"moderate\">Generate</emphasis>. The AI implements code under the Lead's supervision. Stage four: <emphasis level=\"moderate\">Validate</emphasis>. The code is tested against strict criteria.</speak>",
        text_expressive: "Stage three: Generate. The AI implements code under the Lead's supervision. Stage four: Validate. The code is tested against strict criteria."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage five: Evolve. Feedback is rapidly integrated in the same session. Stage six: Deploy. Code is released continuously in a governed, auditable manner.",
        text_ssml: "<speak>Stage five: <emphasis level=\"moderate\">Evolve</emphasis>. Feedback is rapidly integrated in the same session. Stage six: <emphasis level=\"moderate\">Deploy</emphasis>. Code is released continuously in a governed, auditable manner.</speak>",
        text_expressive: "Stage five: Evolve. Feedback is rapidly integrated in the same session. Stage six: Deploy. Code is released continuously in a governed, auditable manner."
      }
    ]
  },
  slide_07: {
    title: "Stage 1: INTENT — Architectural Foundations",
    subtitle: "Precision in requirements prevents drift in generated artifacts",
    analogy: {
      title: "Foundation Engineering",
      text: "In civil engineering, minor alignment deviations at the foundation level compound into structural failures at higher stories. In AI delivery, an incomplete intent brief guarantees drift in the generated code."
    },
    bullets: [
      "Outcome: Specify the desired runtime behavior in a single sentence",
      "Actor & Role: Enumerate access privileges and constraints",
      "Validation Rules: Define explicit conditions for input correctness",
      "Security Constraints: Establish client and server-side enforcement",
      "Acceptance Signals: Define measurable criteria for success verification",
      "Edge Cases: Map boundary conditions and error state expectations",
      "Stack & Patterns: Provide structural technology constraints"
    ],
    closing_thread: "These components compose the structured intent framework, scaling Module 1's P.R.O.M.P.T. method.",
    memory_hook: "Precise intent structures guarantee predictable generated code. Define constraints upfront.",
    narration: "In Stage one: Intent, precision is paramount. A minor requirements omission compounds into severe code drift. We capture the core business outcome in one sentence, define actor roles, specify numbered validation rules, and establish security constraints on both client and server. Additionally, we list testable acceptance signals and map out boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to deliver enterprise-grade software.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "In Stage one: Intent, precision is paramount. A minor requirements omission compounds into severe code drift.",
        text_ssml: "<speak>In Stage one: Intent, precision is <emphasis level=\"moderate\">paramount</emphasis>. A minor requirements omission compounds into severe code drift.</speak>",
        text_expressive: "In Stage one: Intent, precision is paramount. A minor requirements omission compounds into severe code drift."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We capture the core business outcome in one sentence, define actor roles, specify numbered validation rules, and establish security constraints on both client and server.",
        text_ssml: "<speak>We capture the core business outcome in one sentence, define actor roles, specify numbered validation rules, and establish security constraints on <emphasis level=\"moderate\">both client and server</emphasis>.</speak>",
        text_expressive: "We capture the core business outcome in one sentence, define actor roles, specify numbered validation rules, and establish security constraints on both client and server."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Additionally, we list testable acceptance signals and map out boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to deliver enterprise-grade software.",
        text_ssml: "<speak>Additionally, we list testable acceptance signals and map out boundary edge cases. This structured approach <emphasis level=\"moderate\">builds on the P.R.O.M.P.T. method</emphasis> to deliver enterprise-grade software.</speak>",
        text_expressive: "Additionally, we list testable acceptance signals and map out boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to deliver enterprise-grade software."
      }
    ]
  },
  slide_08: {
    title: "Comparative Analysis: Intent Structure",
    subtitle: "Evaluating the outcomes of weak versus structured briefs",
    narration: "Review the contrast on screen. A weak intent brief lacks explicit validation, security boundaries, and architectural patterns, forcing the AI to make assumptions that lead to hours of manual refactoring. A strong intent brief contains precise validation logic, database structures, and security specifications, enabling the AI to output deployable code on the first attempt.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Review the contrast on screen.",
        text_ssml: "<speak>Review the <emphasis level=\"moderate\">contrast on screen</emphasis>.</speak>",
        text_expressive: "Review the contrast on screen."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "A weak intent brief lacks explicit validation, security boundaries, and architectural patterns, forcing the AI to make assumptions that lead to hours of manual refactoring.",
        text_ssml: "<speak>A weak intent brief lacks explicit validation, security boundaries, and architectural patterns, forcing the AI to make <emphasis level=\"moderate\">assumptions</emphasis> that lead to hours of manual refactoring.</speak>",
        text_expressive: "A weak intent brief lacks explicit validation, security boundaries, and architectural patterns, forcing the AI to make assumptions that lead to hours of manual refactoring."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Conversely, a strong intent brief contains precise validation logic, database structures, and security specifications, enabling the AI to output deployable code on the first attempt.",
        text_ssml: "<speak>Conversely, a strong intent brief contains precise validation logic, database structures, and security specifications, enabling the AI to output <emphasis level=\"moderate\">deployable code</emphasis> on the first attempt.</speak>",
        text_expressive: "Conversely, a strong intent brief contains precise validation logic, database structures, and security specifications, enabling the AI to output deployable code on the first attempt."
      }
    ]
  },
  slide_09: {
    title: "Stage 2: ORCHESTRATE — Dependency Architecture",
    subtitle: "Structuring the compilation sequence",
    analogy: {
      title: "Critical Path Analysis",
      text: "A project manager does not schedule UI design ahead of core systems architecture. We must identify the critical path. In OrchestrAI, this means establishing data schemas and API structures before generating consumer components."
    },
    memory_hook: "Dependency analysis precedes code generation. Plan the sequence.",
    narration: "Stage two is Orchestrate. Before beginning generation, the Lead maps the dependency sequence. Database schemas must be generated first, followed by services, API endpoints, and finally, frontend components. We identify reusable logic in the codebase, document API contracts, design data schemas, and define cross-cutting concerns like security logging. This structure prevents refactoring loops.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Stage two is Orchestrate. Before beginning generation, the Lead maps the dependency sequence.",
        text_ssml: "<speak>Stage two is <emphasis level=\"moderate\">Orchestrate</emphasis>. Before beginning generation, the Lead maps the dependency sequence.</speak>",
        text_expressive: "Stage two is Orchestrate. Before beginning generation, the Lead maps the dependency sequence."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Database schemas must be generated first, followed by services, API endpoints, and finally, frontend components.",
        text_ssml: "<speak>Database schemas must be generated first, followed by services, <emphasis level=\"moderate\">A P I endpoints</emphasis>, and finally, frontend components.</speak>",
        text_expressive: "Database schemas must be generated first, followed by services, API endpoints, and finally, frontend components."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We identify reusable logic in the codebase, document API contracts, design data schemas, and define cross-cutting concerns like security logging. This structure prevents refactoring loops.",
        text_ssml: "<speak>We identify reusable logic in the codebase, document A P I contracts, design data schemas, and define cross-cutting concerns like security logging. This structure <emphasis level=\"moderate\">prevents refactoring loops</emphasis>.</speak>",
        text_expressive: "We identify reusable logic in the codebase, document API contracts, design data schemas, and define cross-cutting concerns like security logging. This structure prevents refactoring loops."
      }
    ]
  },
  slide_10: {
    title: "Stage 3: GENERATE — Supervising Code Construction",
    subtitle: "Maintaining control through granular prompting and real-time oversight",
    analogy: {
      title: "Control Room Operations",
      text: "A reactor supervisor does not step away while automated systems execute adjustments. They monitor indicators in real-time, intervening at the first variance. The Lead operates with identical oversight during AI code generation."
    },
    memory_hook: "Granular prompts. Real-time review. No batch generations.",
    narration: "Stage three is Generate. The Lead acts as an active supervisor rather than a passive observer. Code is generated incrementally: one component, one prompt, and one validation step at a time. We avoid massive prompts that cover multiple components. We review output immediately, and if the AI engine deviates, we apply targeted constraint corrections. Under no circumstances do we accept code we cannot fully explain.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Stage three is Generate. The Lead acts as an active supervisor rather than a passive observer.",
        text_ssml: "<speak>Stage three is <emphasis level=\"moderate\">Generate</emphasis>. The Lead acts as an active supervisor rather than a passive observer.</speak>",
        text_expressive: "Stage three is Generate. The Lead acts as an active supervisor rather than a passive observer."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Code is generated incrementally: one component, one prompt, and one validation step at a time. We avoid massive prompts that cover multiple components.",
        text_ssml: "<speak>Code is generated incrementally: <emphasis level=\"moderate\">one component, one prompt</emphasis>, and one validation step at a time. We avoid massive prompts that cover multiple components.</speak>",
        text_expressive: "Code is generated incrementally: one component, one prompt, and one validation step at a time. We avoid massive prompts that cover multiple components."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We review output immediately, and if the AI engine deviates, we apply targeted constraint corrections. Under no circumstances do we accept code we cannot fully explain.",
        text_ssml: "<speak>We review output immediately, and if the A I engine deviates, we apply targeted constraint corrections. Under no circumstances do we <emphasis level=\"strong\">ever</emphasis> accept code we cannot fully explain.</speak>",
        text_expressive: "[authoritative] We review output immediately, and if the AI engine deviates, we apply targeted constraint corrections. Under no circumstances do we accept code we cannot fully explain."
      }
    ]
  },
  slide_10b: {
    title: "Dependency Sequence Challenge",
    subtitle: "Identify the correct sequence for application component generation",
    narration: "Order the components below according to their architectural dependencies. Select the sequence that ensures a clean build path.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Order the components below according to their architectural dependencies. Select the sequence that ensures a clean build path.",
        text_ssml: "<speak>Order the components below according to their architectural dependencies. Select the sequence that ensures a <emphasis level=\"moderate\">clean build path</emphasis>.</speak>",
        text_expressive: "Order the components below according to their architectural dependencies. Select the sequence that ensures a clean build path."
      }
    ]
  },
  slide_11: {
    title: "Validate, Evolve, and Deploy",
    subtitle: "Quality assurance, rapid iteration, and rollout governance",
    analogy: {
      title: "Quality Audit and Release Operations",
      text: "Validate acts as the pre-delivery audit. Evolve represents final adjustments based on stakeholder reviews. Deploy operates as the controlled rollout. Each step must adhere to governance standards before code is certified for release."
    },
    memory_hook: "Validate systematically. Evolve in-session. Deploy continuously with rollbacks.",
    narration: "We now review the final stages of the lifecycle. Validation requires testing against a systematic checklist covering functionality, security, data isolation, and error states. In the Evolve stage, client feedback is addressed in the same session by updating the intent statement and regenerating the component. Deployment occurs continuously to staging and production, governed by version control, automated tests, and rollback procedures.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "We now review the final stages of the lifecycle.",
        text_ssml: "<speak>We now review the <emphasis level=\"moderate\">final stages</emphasis> of the lifecycle.</speak>",
        text_expressive: "We now review the final stages of the lifecycle."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Validation requires testing against a systematic checklist covering functionality, security, data isolation, and error states.",
        text_ssml: "<speak>Validation requires testing against a <emphasis level=\"moderate\">systematic checklist</emphasis> covering functionality, security, data isolation, and error states.</speak>",
        text_expressive: "Validation requires testing against a systematic checklist covering functionality, security, data isolation, and error states."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "In the Evolve stage, client feedback is addressed in the same session by updating the intent statement and regenerating the component.",
        text_ssml: "<speak>In the Evolve stage, client feedback is addressed <emphasis level=\"moderate\">in the same session</emphasis> by updating the intent statement and regenerating the component.</speak>",
        text_expressive: "In the Evolve stage, client feedback is addressed in the same session by updating the intent statement and regenerating the component."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Deployment occurs continuously to staging and production, governed by version control, automated tests, and rollback procedures.",
        text_ssml: "<speak>Deployment occurs continuously to staging and production, governed by version control, automated tests, and <emphasis level=\"moderate\">rollback procedures</emphasis>.</speak>",
        text_expressive: "Deployment occurs continuously to staging and production, governed by version control, automated tests, and rollback procedures."
      }
    ]
  },
  slide_12: {
    title: "The 8-Component Intent Framework",
    subtitle: "The structured specification template for enterprise features",
    analogy: {
      title: "ISO Certification Controls",
      text: "An ISO compliance audit requires documented proof for every control. Skipping a single item invalidates the certification. The 8-component intent framework operates with equivalent rigour — every component must be complete."
    },
    memory_hook: "Outcome, Actor, Validation, Security, Stack, Acceptance, Edge, Data. Ensure all 8 are defined.",
    narration: "The structured intent framework consists of eight mandatory components. We specify the core Outcome in a single sentence, define the Actor roles and access rights, detail numbered Validation Rules, and set Security Constraints. We define the Stack and Patterns, establish testable Acceptance Signals, map out Edge Cases, and declare the Data Model. Omitting any component introduces delivery risks.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "The structured intent framework consists of eight mandatory components.",
        text_ssml: "<speak>The structured intent framework consists of <emphasis level=\"moderate\">eight mandatory components</emphasis>.</speak>",
        text_expressive: "The structured intent framework consists of eight mandatory components."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We specify the core Outcome in a single sentence, define the Actor roles and access rights, detail numbered Validation Rules, and set Security Constraints.",
        text_ssml: "<speak>We specify the core Outcome in a single sentence, define the Actor roles and access rights, detail numbered Validation Rules, and set <emphasis level=\"moderate\">Security Constraints</emphasis>.</speak>",
        text_expressive: "We specify the core Outcome in a single sentence, define the Actor roles and access rights, detail numbered Validation Rules, and set Security Constraints."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We define the Stack and Patterns, establish testable Acceptance Signals, map out Edge Cases, and declare the Data Model.",
        text_ssml: "<speak>We define the Stack and Patterns, establish testable Acceptance Signals, map out Edge Cases, and declare the <emphasis level=\"moderate\">Data Model</emphasis>.</speak>",
        text_expressive: "We define the Stack and Patterns, establish testable Acceptance Signals, map out Edge Cases, and declare the Data Model."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "authoritative",
        text: "Omitting any component introduces delivery risks.",
        text_ssml: "<speak>Omitting <emphasis level=\"moderate\">any</emphasis> component introduces delivery risks.</speak>",
        text_expressive: "[authoritative] Omitting any component introduces delivery risks."
      }
    ]
  },
  slide_13: {
    title: "Scaling from P.R.O.M.P.T. to Enterprise Intent",
    subtitle: "Upgrading the prompt formula for industrial-grade systems",
    analogy: {
      title: "Operational Evolution",
      text: "A start-up's basic protocol is sufficient for prototype validation. However, entering enterprise environments requires scaling those controls. The eight-component framework scales Module 1's P.R.O.M.P.T. method to handle architectural complexity."
    },
    memory_hook: "Structured intent formalizes the P.R.O.M.P.T. elements into strict design inputs.",
    narration: "Structured intent represents the scaling of the P.R.O.M.P.T. formula. Purpose scales to Outcome and Actor. Role scales to Stack and Patterns, ensuring technology alignment. Output scales to explicit Acceptance Signals. Marker constraints are formalized into Validation Rules and Security Constraints. Pattern maps to the Data Model and Edge Cases. Tone remains relevant for user interface copy.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Structured intent represents the scaling of the P.R.O.M.P.T. formula.",
        text_ssml: "<speak>Structured intent represents the <emphasis level=\"moderate\">scaling</emphasis> of the P.R.O.M.P.T. formula.</speak>",
        text_expressive: "Structured intent represents the scaling of the P.R.O.M.P.T. formula."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Purpose scales to Outcome and Actor. Role scales to Stack and Patterns, ensuring technology alignment. Output scales to explicit Acceptance Signals.",
        text_ssml: "<speak>Purpose scales to Outcome and Actor. Role scales to Stack and Patterns, ensuring technology alignment. Output scales to explicit <emphasis level=\"moderate\">Acceptance Signals</emphasis>.</speak>",
        text_expressive: "Purpose scales to Outcome and Actor. Role scales to Stack and Patterns, ensuring technology alignment. Output scales to explicit Acceptance Signals."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Marker constraints are formalized into Validation Rules and Security Constraints. Pattern maps to the Data Model and Edge Cases. Tone remains relevant for user interface copy.",
        text_ssml: "<speak>Marker constraints are formalized into Validation Rules and Security Constraints. Pattern maps to the Data Model and Edge Cases. Tone remains relevant for <emphasis level=\"moderate\">user interface copy</emphasis>.</speak>",
        text_expressive: "Marker constraints are formalized into Validation Rules and Security Constraints. Pattern maps to the Data Model and Edge Cases. Tone remains relevant for user interface copy."
      }
    ]
  },
  slide_13b: {
    title: "Architectural Defect Analysis",
    subtitle: "Identify missing governance constraints in this requirements brief",
    narration: "Analyze this expense approval brief. It appears functional, yet it lacks validation rules, server-side security controls, and boundary edge cases. Identify these omissions to prevent downstream defects.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Analyze this expense approval brief. It appears functional, yet it lacks validation rules, server-side security controls, and boundary edge cases. Identify these omissions to prevent downstream defects.",
        text_ssml: "<speak>Analyze this expense approval brief. It appears functional, yet it lacks validation rules, server-side security controls, and <emphasis level=\"moderate\">boundary edge cases</emphasis>. Identify these omissions to prevent downstream defects.</speak>",
        text_expressive: "Analyze this expense approval brief. It appears functional, yet it lacks validation rules, server-side security controls, and boundary edge cases. Identify these omissions to prevent downstream defects."
      }
    ]
  },
  slide_14: {
    title: "Common Intent Anti-Patterns",
    subtitle: "Recognizing and mitigating common prompting errors",
    analogy: {
      title: "Vague Service Requests",
      text: "Submitting an ambiguous work order to a contractor leads to cost overruns and incorrect materials. Software intent behaves identically. Vague specifications lead directly to structural drift and rework."
    },
    memory_hook: "Identify anti-patterns: Vague Outcomes, Mega-Prompts, Assumptions, Skip Testing, and Manual Patches.",
    narration: "We must avoid five common intent anti-patterns. First: the Vague Outcome, which lacks scope and specifications. Second: the Mega-Prompt, which attempts to generate large systems in a single pass, degrading output quality. Third: the Assumption Prompt, which fails to specify dependencies. Fourth: the Trust-and-Skip, which accepts code without verification. Fifth: the Manual Patch, which updates code directly, creating code drift.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "We must avoid five common intent anti-patterns.",
        text_ssml: "<speak>We must avoid <emphasis level=\"moderate\">five common intent anti-patterns</emphasis>.</speak>",
        text_expressive: "We must avoid five common intent anti-patterns."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "First: the Vague Outcome, which lacks scope and specifications. Second: the Mega-Prompt, which attempts to generate large systems in a single pass, degrading output quality.",
        text_ssml: "<speak>First: the Vague Outcome, which lacks scope and specifications. Second: the <emphasis level=\"moderate\">Mega-Prompt</emphasis>, which attempts to generate large systems in a single pass, degrading output quality.</speak>",
        text_expressive: "First: the Vague Outcome, which lacks scope and specifications. Second: the Mega-Prompt, which attempts to generate large systems in a single pass, degrading output quality."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Third: the Assumption Prompt, which fails to specify dependencies. Fourth: the Trust-and-Skip, which accepts code without verification. Fifth: the Manual Patch, which updates code directly, creating code drift.",
        text_ssml: "<speak>Third: the Assumption Prompt, which fails to specify dependencies. Fourth: the Trust-and-Skip, which accepts code without verification. Fifth: the <emphasis level=\"moderate\">Manual Patch</emphasis>, which updates code directly, creating code drift.</speak>",
        text_expressive: "Third: the Assumption Prompt, which fails to specify dependencies. Fourth: the Trust-and-Skip, which accepts code without verification. Fifth: the Manual Patch, which updates code directly, creating code drift."
      }
    ]
  },
  slide_15: {
    title: "The Validation Checklist",
    subtitle: "A systematic quality gate for generated components",
    analogy: {
      title: "ISO Quality Audit Checklist",
      text: "A certified quality auditor does not rely on subjective evaluations. They check and document compliance against defined criteria. Validation requires an identical approach — structured, systematic, and documented."
    },
    memory_hook: "Seven mandatory checks verify component security, logic, isolation, and integration.",
    narration: "Validation must be systematic. The Lead executes a checklist of seven points before accepting code. Functional correctness verifies acceptance criteria. Business rule enforcement checks server-side constraints. Data isolation ensures users cannot access other tenants' records. We also test error handling, security configurations, edge cases, and ensure auto-generated documentation remains current.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Validation must be systematic. The Lead executes a checklist of seven points before accepting code.",
        text_ssml: "<speak>Validation must be systematic. The Lead executes a checklist of <emphasis level=\"moderate\">seven points</emphasis> before accepting code.</speak>",
        text_expressive: "Validation must be systematic. The Lead executes a checklist of seven points before accepting code."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Functional correctness verifies acceptance criteria. Business rule enforcement checks server-side constraints. Data isolation ensures users cannot access other tenants' records.",
        text_ssml: "<speak>Functional correctness verifies acceptance criteria. Business rule enforcement checks server-side constraints. Data isolation ensures users <emphasis level=\"moderate\">cannot</emphasis> access other tenants' records.</speak>",
        text_expressive: "Functional correctness verifies acceptance criteria. Business rule enforcement checks server-side constraints. Data isolation ensures users cannot access other tenants' records."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We also test error handling, security configurations, edge cases, and ensure auto-generated documentation remains current.",
        text_ssml: "<speak>We also test error handling, security configurations, edge cases, and ensure <emphasis level=\"moderate\">auto-generated documentation</emphasis> remains current.</speak>",
        text_expressive: "We also test error handling, security configurations, edge cases, and ensure auto-generated documentation remains current."
      }
    ]
  },
  slide_16: {
    title: "The Escalation Decision Framework",
    subtitle: "Managing persistent code deviations and edge failures",
    analogy: {
      title: "Operational Triage Models",
      text: "In standard operations, minor events are resolved locally. Complex anomalies trigger a temporary halt to re-assess parameters. Escalation is not an operational failure; it is a critical governance control."
    },
    memory_hook: "Re-prompt on first variance. Pause and review after 3 failures. Escalate structural gaps.",
    narration: "When code generation deviates, the Lead applies a triage protocol. If the AI deviates initially, we apply targeted correction prompts. If deviations persist after three attempts, we pause and review the intent structure with an SME. Gaps in security logic require a security reviewer. Technological limits are escalated to the Solution Architect, and unexplained code is rejected until clarified.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "When code generation deviates, the Lead applies a triage protocol.",
        text_ssml: "<speak>When code generation deviates, the Lead applies a <emphasis level=\"moderate\">triage protocol</emphasis>.</speak>",
        text_expressive: "When code generation deviates, the Lead applies a triage protocol."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "If the AI deviates initially, we apply targeted correction prompts. If deviations persist after three attempts, we pause and review the intent structure with an SME.",
        text_ssml: "<speak>If the AI deviates initially, we apply targeted correction prompts. If deviations persist after <emphasis level=\"moderate\">three attempts</emphasis>, we pause and review the intent structure with an SME.</speak>",
        text_expressive: "If the AI deviates initially, we apply targeted correction prompts. If deviations persist after three attempts, we pause and review the intent structure with an SME."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Gaps in security logic require a security reviewer. Technological limits are escalated to the Solution Architect, and unexplained code is rejected until clarified.",
        text_ssml: "<speak>Gaps in security logic require a security reviewer. Technological limits are escalated to the <emphasis level=\"moderate\">Solution Architect</emphasis>, and unexplained code is rejected until clarified.</speak>",
        text_expressive: "Gaps in security logic require a security reviewer. Technological limits are escalated to the Solution Architect, and unexplained code is rejected until clarified."
      }
    ]
  },
  slide_17: {
    title: "Enterprise Delivery Workflow: Case Study",
    subtitle: "A step-by-step review of the six-stage loop",
    analogy: {
      title: "Structured Execution Review",
      text: "A post-incident review walks through the chronological log to identify system behavior. We will review a standard feature rollout chronology, analyzing the operational progression across a single working shift."
    },
    memory_hook: "Chronological progression of a feature release across all six lifecycle stages.",
    narration: "Let us trace a single feature through the lifecycle. At nine AM, we structure the Intent for leave requests. At ten AM, we Orchestrate: identifying schema relationships and interface contracts. At ten-thirty, we Generate the components incrementally. At eleven-thirty, we execute the Validation Checklist, verifying data security. At two PM, we Evolve the design based on feedback. By four-thirty, we Deploy to staging with audit logs.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Let us trace a single feature through the lifecycle.",
        text_ssml: "<speak>Let us trace a <emphasis level=\"moderate\">single feature</emphasis> through the lifecycle.</speak>",
        text_expressive: "Let us trace a single feature through the lifecycle."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "At nine AM, we structure the Intent for leave requests. At ten AM, we Orchestrate: identifying schema relationships and interface contracts.",
        text_ssml: "<speak>At <emphasis level=\"moderate\">nine A M</emphasis>, we structure the Intent for leave requests. At <emphasis level=\"moderate\">ten A M</emphasis>, we Orchestrate: identifying schema relationships and interface contracts.</speak>",
        text_expressive: "At nine AM, we structure the Intent for leave requests. At ten AM, we Orchestrate: identifying schema relationships and interface contracts."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "At ten-thirty, we Generate the components incrementally. At eleven-thirty, we execute the Validation Checklist, verifying data security.",
        text_ssml: "<speak>At ten-thirty, we Generate the components incrementally. At <emphasis level=\"moderate\">eleven-thirty</emphasis>, we execute the Validation Checklist, verifying data security.</speak>",
        text_expressive: "At ten-thirty, we Generate the components incrementally. At eleven-thirty, we execute the Validation Checklist, verifying data security."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "At two PM, we Evolve the design based on feedback. By four-thirty, we Deploy to staging with audit logs.",
        text_ssml: "<speak>At <emphasis level=\"moderate\">two P M</emphasis>, we Evolve the design based on feedback. By <emphasis level=\"moderate\">four-thirty</emphasis>, we Deploy to staging with audit logs.</speak>",
        text_expressive: "At two PM, we Evolve the design based on feedback. By four-thirty, we Deploy to staging with audit logs."
      }
    ]
  },
  slide_18: {
    title: "Living Documentation Standards",
    subtitle: "Integrating documentation into the automated generation pipeline",
    analogy: {
      title: "Audit Ledger vs. Manual Log",
      text: "A database transaction log is written automatically at execution. A manual audit sheet requires operators to record events after the fact, introducing error risks. OrchestrAI documentation acts as a transaction log."
    },
    memory_hook: "Documentation is generated programmatically alongside code. Out-of-date docs equal untrusted code.",
    narration: "In OrchestrAI, documentation is generated alongside code, not after. It logs what was built, structural decisions, and API constraints. Commit messages use standard naming formats, and the Lead reviews auto-generated docs daily for accuracy. Out-of-date documentation is classified as ungoverned code, which violates release protocols.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "In OrchestrAI, documentation is generated alongside code, not after.",
        text_ssml: "<speak>In OrchestrAI, documentation is generated <emphasis level=\"moderate\">alongside code</emphasis>, not after.</speak>",
        text_expressive: "In OrchestrAI, documentation is generated alongside code, not after."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "It logs what was built, structural decisions, and API constraints. Commit messages use standard naming formats, and the Lead reviews auto-generated docs daily for accuracy.",
        text_ssml: "<speak>It logs what was built, structural decisions, and A P I constraints. Commit messages use standard naming formats, and the Lead reviews auto-generated docs <emphasis level=\"moderate\">daily</emphasis> for accuracy.</speak>",
        text_expressive: "It logs what was built, structural decisions, and API constraints. Commit messages use standard naming formats, and the Lead reviews auto-generated docs daily for accuracy."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "authoritative",
        text: "Out-of-date documentation is classified as ungoverned code, which violates release protocols.",
        text_ssml: "<speak>Out-of-date documentation is classified as <emphasis level=\"strong\">ungoverned code</emphasis>, which violates release protocols.</speak>",
        text_expressive: "[authoritative] Out-of-date documentation is classified as ungoverned code, which violates release protocols."
      }
    ]
  },
  slide_19: {
    title: "Module 2 Executive Summary",
    subtitle: "Key takeaways for framework architecture",
    closing_thread: "Knowledge assessment follows. 80% passing grade required.",
    memory_hook: "Governance, processes, structured intent, validation, and living documentation.",
    narration: "Let us summarize the core concepts of Module 2. First: six principles govern all engagements. Second: delivery follows a six-stage loop. Third: structured intent requires eight distinct components. Fourth: validation requires systematic checklist execution. Fifth: documentation is generated programmatically. We will now proceed to the knowledge check.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "summarizing",
        text: "Let us summarize the core concepts of Module 2.",
        text_ssml: "<speak>Let us summarize the <emphasis level=\"moderate\">core concepts</emphasis> of Module 2.</speak>",
        text_expressive: "Let us summarize the core concepts of Module 2."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "First: six principles govern all engagements. Second: delivery follows a six-stage loop. Third: structured intent requires eight distinct components.",
        text_ssml: "<speak>First: six principles govern all engagements. Second: delivery follows a <emphasis level=\"moderate\">six-stage loop</emphasis>. Third: structured intent requires eight distinct components.</speak>",
        text_expressive: "First: six principles govern all engagements. Second: delivery follows a six-stage loop. Third: structured intent requires eight distinct components."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Fourth: validation requires systematic checklist execution. Fifth: documentation is generated programmatically. We will now proceed to the knowledge check.",
        text_ssml: "<speak>Fourth: validation requires systematic checklist execution. Fifth: documentation is generated programmatically. <emphasis level=\"moderate\">We will now proceed</emphasis> to the knowledge check.</speak>",
        text_expressive: "Fourth: validation requires systematic checklist execution. Fifth: documentation is generated programmatically. We will now proceed to the knowledge check."
      }
    ]
  },
  slide_19b: {
    title: "Operational Self-Assessment",
    subtitle: "Evaluate your preparedness for intent capture",
    prompt: "If a business partner requested a feature, do you feel prepared to structure the intent, map the critical path, and execute validation checkouts before generating code?",
    scale: { min_label: "Requires Review", max_label: "Fully Prepared" },
    narration: "Before beginning the assessment, take a moment to evaluate your readiness for structured intent capture.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Before beginning the assessment, take a moment to evaluate your readiness for structured intent capture.",
        text_ssml: "<speak>Before beginning the assessment, take a moment to evaluate your readiness for <emphasis level=\"moderate\">structured intent capture</emphasis>.</speak>",
        text_expressive: "Before beginning the assessment, take a moment to evaluate your readiness for structured intent capture."
      }
    ]
  },
  slide_20: {
    title: "Module 2 Knowledge Assessment",
    subtitle: "Verify governance and architectural understanding",
    narration: "We will now begin the knowledge assessment. A minimum score of eighty percent is required to pass and unlock the next module.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "We will now begin the knowledge assessment. A minimum score of eighty percent is required to pass and unlock the next module.",
        text_ssml: "<speak>We will now begin the knowledge assessment. A minimum score of <emphasis level=\"moderate\">eighty percent</emphasis> is required to pass and unlock the next module.</speak>",
        text_expressive: "We will now begin the knowledge assessment. A minimum score of eighty percent is required to pass and unlock the next module."
      }
    ]
  },
  slide_21: {
    title: "Case Study 1: Lifecycle Mapping",
    subtitle: "Deconstruct business requirements into structured specifications",
    task_prompt: "Construct the 8-component intent brief and sequence the development order for the leave request system.",
    narration: "We will now begin Case Study One. You are tasked with analyzing a basic leave request request. Structure the outcome, actor permissions, validation rules, security requirements, and build dependencies in the provided fields.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "We will now begin Case Study One. You are tasked with analyzing a basic leave request request.",
        text_ssml: "<speak>We will now begin Case Study One. You are tasked with analyzing a basic <emphasis level=\"moderate\">leave request request</emphasis>.</speak>",
        text_expressive: "We will now begin Case Study One. You are tasked with analyzing a basic leave request request."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Structure the outcome, actor permissions, validation rules, security requirements, and build dependencies in the provided fields.",
        text_ssml: "<speak>Structure the outcome, actor permissions, validation rules, security requirements, and <emphasis level=\"moderate\">build dependencies</emphasis> in the provided fields.</speak>",
        text_expressive: "Structure the outcome, actor permissions, validation rules, security requirements, and build dependencies in the provided fields."
      }
    ]
  },
  slide_22: {
    title: "Case Study 2: Validation Engineering",
    subtitle: "Establish systematic testing criteria for generated components",
    task_prompt: "Declare specific, executable validation checks for each criterion listed.",
    narration: "In Case Study Two, you must define the validation checks for the leave request backend generated in Case Study One. Outline specific test queries and actions to verify security and business rules.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "In Case Study Two, you must define the validation checks for the leave request backend generated in Case Study One.",
        text_ssml: "<speak>In Case Study Two, you must define the validation checks for the leave request backend generated in <emphasis level=\"moderate\">Case Study One</emphasis>.</speak>",
        text_expressive: "In Case Study Two, you must define the validation checks for the leave request backend generated in Case Study One."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Outline specific test queries and actions to verify security and business rules.",
        text_ssml: "<speak>Outline specific test queries and actions to verify <emphasis level=\"moderate\">security and business rules</emphasis>.</speak>",
        text_expressive: "Outline specific test queries and actions to verify security and business rules."
      }
    ]
  },
  slide_23: {
    title: "Certification Phase Complete",
    subtitle: "Module 2 Governance and Architecture Certified",
    achievement_stats: {
      label: "Session Summary",
      stats: [
        { icon: "layout-grid", value: "22", label: "Concepts Covered" },
        { icon: "flask-conical", value: "2", label: "Applied Exercises" },
        { icon: "clipboard-check", value: "10", label: "Assessment Items" },
        { icon: "clock", value: "60", label: "Minutes Invested" }
      ]
    },
    closing_message: "This concludes Module 2. The principles, lifecycle, and structured intent parameters established here form the operational framework for all delivery engagements. Proceed to Module 3.",
    cta_button: "Proceed to Module 3",
    narration: "You have completed Module 2. The governance principles and lifecycle processes established here are critical to executing safe and compliant OrchestrAI projects. Take a brief pause, then proceed to Module 3.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "encouraging",
        text: "You have completed Module 2.",
        text_ssml: "<speak>You have completed <emphasis level=\"moderate\">Module 2</emphasis>.</speak>",
        text_expressive: "You have completed Module 2."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "The governance principles and lifecycle processes established here are critical to executing safe and compliant OrchestrAI projects.",
        text_ssml: "<speak>The governance principles and lifecycle processes established here are <emphasis level=\"moderate\">critical</emphasis> to executing safe and compliant OrchestrAI projects.</speak>",
        text_expressive: "The governance principles and lifecycle processes established here are critical to executing safe and compliant OrchestrAI projects."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Take a brief pause, then proceed to Module 3.",
        text_ssml: "<speak>Take a brief pause, then <emphasis level=\"moderate\">proceed to Module 3</emphasis>.</speak>",
        text_expressive: "Take a brief pause, then proceed to Module 3."
      }
    ]
  }
};

// Generate Formal Slides from GenZ Slides
genzData.slides.forEach(genzSlide => {
  const slide_id = genzSlide.slide_id;
  const adaptation = formalAdaptations[slide_id] || {};

  // Build base slide copying structure
  const formalSlide = {
    slide_id: slide_id,
    type: genzSlide.type,
    title: adaptation.title || genzSlide.title,
    subtitle: adaptation.subtitle || genzSlide.subtitle,
    icon: genzSlide.icon,
    visual_cue: adaptation.visual_cue || genzSlide.visual_cue
  };

  // Add specific properties based on type
  if (genzSlide.hero_stat) {
    formalSlide.hero_stat = genzSlide.hero_stat;
  }
  if (genzSlide.opening_hook) {
    formalSlide.opening_hook = adaptation.opening_hook || genzSlide.opening_hook;
  }
  if (genzSlide.bullets) {
    formalSlide.bullets = adaptation.bullets || genzSlide.bullets;
  }
  if (genzSlide.closing_thread) {
    formalSlide.closing_thread = adaptation.closing_thread || genzSlide.closing_thread;
  }
  if (genzSlide.analogy) {
    formalSlide.analogy = adaptation.analogy || genzSlide.analogy;
  }
  if (genzSlide.memory_hook) {
    formalSlide.memory_hook = adaptation.memory_hook || genzSlide.memory_hook;
  }
  if (genzSlide.reflection_prompt) {
    formalSlide.reflection_prompt = adaptation.reflection_prompt || genzSlide.reflection_prompt;
  }
  if (genzSlide.table) {
    formalSlide.table = genzSlide.table.map(row => {
      // Clean up old vs new phrasing if needed or keep as is since tables are already pretty professional
      return {
        icon: row.icon,
        old: row.old.replace(/Lead writes code cuando AI no/i, "Lead manual fixes").replace(/Jira tickets/i, "Jira / BRDs"),
        new: row.new
      };
    });
  }
  if (genzSlide.list) {
    formalSlide.list = genzSlide.list;
  }
  if (genzSlide.before_after) {
    formalSlide.before_after = genzSlide.before_after;
  }
  if (genzSlide.timeline) {
    formalSlide.timeline = genzSlide.timeline;
  }
  if (genzSlide.cards) {
    formalSlide.cards = genzSlide.cards;
  }
  if (genzSlide.pairs) {
    formalSlide.pairs = genzSlide.pairs;
  }
  if (genzSlide.flaws) {
    formalSlide.flaws = genzSlide.flaws;
  }
  if (genzSlide.text) {
    formalSlide.text = genzSlide.text;
  }
  if (genzSlide.prompt) {
    formalSlide.prompt = genzSlide.prompt;
  }
  if (genzSlide.scale) {
    formalSlide.scale = adaptation.scale || genzSlide.scale;
  }
  if (genzSlide.pass_threshold) {
    formalSlide.pass_threshold = genzSlide.pass_threshold;
  }
  if (genzSlide.questions) {
    formalSlide.questions = genzSlide.questions;
  }
  if (genzSlide.lab_number) {
    formalSlide.lab_number = genzSlide.lab_number;
  }
  if (genzSlide.scenario) {
    formalSlide.scenario = genzSlide.scenario;
  }
  if (genzSlide.task_prompt) {
    formalSlide.task_prompt = adaptation.task_prompt || genzSlide.task_prompt;
  }
  if (genzSlide.input_fields) {
    formalSlide.input_fields = genzSlide.input_fields;
  }
  if (genzSlide.model_answer) {
    formalSlide.model_answer = genzSlide.model_answer;
  }
  if (genzSlide.comparison_report) {
    formalSlide.comparison_report = genzSlide.comparison_report;
  }
  if (genzSlide.hero_visual) {
    formalSlide.hero_visual = genzSlide.hero_visual;
  }
  if (genzSlide.score_display) {
    formalSlide.score_display = genzSlide.score_display;
  }
  if (genzSlide.summary_bullets) {
    formalSlide.summary_bullets = adaptation.summary_bullets || genzSlide.summary_bullets;
  }
  if (genzSlide.achievement_stats) {
    formalSlide.achievement_stats = adaptation.achievement_stats || genzSlide.achievement_stats;
  }
  if (genzSlide.closing_message) {
    formalSlide.closing_message = adaptation.closing_message || genzSlide.closing_message;
  }
  if (genzSlide.cta_button) {
    formalSlide.cta_button = adaptation.cta_button || genzSlide.cta_button;
  }
  if (genzSlide.background_music) {
    formalSlide.background_music = genzSlide.background_music;
  }

  // Formal specific narration & script
  formalSlide.narration = adaptation.narration || genzSlide.narration;
  formalSlide.narration_script = adaptation.narration_script || [
    {
      speaker: "Narrator",
      voice: "professional_narrator",
      emotion: "measured",
      text: formalSlide.narration,
      text_ssml: `<speak>${formalSlide.narration}</speak>`,
      text_expressive: formalSlide.narration
    }
  ];
  formalSlide.estimated_duration_seconds = genzSlide.estimated_duration_seconds;

  formalData.slides.push(formalSlide);
});


// WRITE FILES
fs.writeFileSync(path.join(outputDir, 'module2_genz.json'), JSON.stringify(genzData, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'module2_formal.json'), JSON.stringify(formalData, null, 2), 'utf8');

console.log("SUCCESS: Both module2_genz.json and module2_formal.json have been successfully generated!");
