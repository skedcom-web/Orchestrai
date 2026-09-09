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
      "Six ODF stages = the delivery GPS that gets you there",
      "01 Intent & Outcome → 02 Requirements & Context → 03 AI-Assisted Design → 04 AI-Generated Development → 05 Testing & QA → 06 Deployment & Improvement",
      "Not a waterfall. Not a sprint. A delivery loop."
    ],
    closing_thread: "ODF Stage 01: Intent & Outcome Definition. The foundation of literally everything.",
    memory_hook: "Principles = rules. ODF Stages = delivery GPS. Both required.",
    narration: "So, the principles tell you the what. But the six ODF stages are the how. Think of it as: principles are the rules of the road, and the ODF delivery stages are your GPS. We go through Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Quality Assurance, and finally Deployment and Improvement. Not a straight line — a delivery loop. Ready to see the actual engine? Let's dive in.",
    estimated_duration_seconds: 75,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "So, the principles tell you the what. But the six ODF stages are the how. Think of it: principles are the rules of the road, and the ODF delivery stages are your GPS.",
        text_ssml: "<speak>So, the principles tell you the what. But the six ODF stages are the <emphasis level=\"moderate\">how</emphasis>. Think of it: principles are the rules of the road, and the ODF delivery stages are your GPS.</speak>",
        text_expressive: "So, the principles tell you the what. But the six ODF stages are the how. Think of it: principles are the rules of the road, and the ODF delivery stages are your GPS."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "We go through Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, and finally Deployment and Improvement. Not a straight line — a delivery loop.",
        text_ssml: "<speak>We go through <emphasis level=\"moderate\">Intent and Outcome</emphasis>, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Q A, and finally Deployment and Improvement. Not a straight line — a delivery loop.</speak>",
        text_expressive: "We go through Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, and finally Deployment and Improvement. Not a straight line — a delivery loop."
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
    title: "The ODF — Six Delivery Stages",
    subtitle: "The OrchestrAI Delivery Framework: your GPS for every project, every feature, every day",
    icon: "route",
    visual_cue: "odf_six_stage_delivery_loop",
    analogy: {
      title: "GPS Navigation, Not a Printed Map",
      text: "A printed map gives you the route once and hopes you don't miss a turn. A GPS recalculates in real time based on where you actually are. The ODF works exactly like that — it loops, adapts, and always recalculates based on real delivery progress, not where a plan said you'd be."
    },
    list: [
      { name: "01 — Intent & Outcome Definition", icon: "target", desc: "Define the business goal in one clear sentence. Identify stakeholders, success metrics, and the specific problem being solved. Precision here prevents all downstream drift." },
      { name: "02 — Requirements & Context", icon: "file-text", desc: "Capture all business needs, constraints, technical context, and boundaries. AI cannot design well without full context — this stage makes that context explicit and complete." },
      { name: "03 — AI-Assisted Design", icon: "cpu", desc: "AI generates the architecture, solution designs, data models, and API contracts. The Lead reviews and approves. AI doesn't just code — it designs the blueprint first." },
      { name: "04 — AI-Generated Development", icon: "wand-2", desc: "AI accelerates the actual coding — frontend, backend, APIs, integrations. One focused prompt per component, validated before the next one begins." },
      { name: "05 — Testing & Quality Assurance", icon: "shield-check", desc: "AI-assisted and human-led validation. Every acceptance criterion tested. Security, data isolation, edge cases, and error handling — all verified systematically. Not a vibe check — a gate." },
      { name: "06 — Deployment & Improvement", icon: "rocket", desc: "Deliver rapidly and continuously evolve. Deploy to staging then production. Every release is documented, tested, and reversible. Stakeholder feedback triggers the next improvement loop." }
    ],
    memory_hook: "ODF: Intent → Requirements → AI Design → AI Dev → Testing & QA → Deploy & Improve. Six stages, one delivery loop.",
    narration: "Here's the full ODF — six stages, one delivery loop. Stage One: Intent and Outcome Definition — define the goal with precision. Stage Two: Requirements and Context — capture everything AI needs to design well. Stage Three: AI-Assisted Design — AI generates the architecture before a single line of code is written. Stage Four: AI-Generated Development — AI builds the feature, component by component. Stage Five: Testing and Quality Assurance — AI-plus-human validation against a hard checklist. Stage Six: Deployment and Improvement — ship fast, document everything, and use feedback to start the next loop.",
    estimated_duration_seconds: 120,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Here's the full ODF — six delivery stages, one continuous loop. Let's break them down.",
        text_ssml: "<speak>Here's the full <emphasis level=\"strong\">ODF</emphasis> — six delivery stages, one continuous loop. Let's break them down.</speak>",
        text_expressive: "Here's the full ODF — six delivery stages, one continuous loop. Let's break them down."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "confident",
        text: "Stage One: Intent and Outcome Definition — define the goal with precision. Stage Two: Requirements and Context — capture everything AI needs to design well.",
        text_ssml: "<speak>Stage One: <emphasis level=\"moderate\">Intent and Outcome Definition</emphasis> — define the goal with precision. Stage Two: <emphasis level=\"moderate\">Requirements and Context</emphasis> — capture everything AI needs to design well.</speak>",
        text_expressive: "Stage One: Intent and Outcome Definition — define the goal with precision. Stage Two: Requirements and Context — capture everything AI needs to design well."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "casual",
        text: "Stage Three: AI-Assisted Design — AI generates the architecture before a single line of code is written. Stage Four: AI-Generated Development — AI builds the feature, component by component.",
        text_ssml: "<speak>Stage Three: <emphasis level=\"moderate\">AI-Assisted Design</emphasis> — AI generates the architecture before a single line of code is written. Stage Four: <emphasis level=\"moderate\">AI-Generated Development</emphasis> — AI builds the feature, component by component.</speak>",
        text_expressive: "Stage Three: AI-Assisted Design — AI generates the architecture before a single line of code is written. Stage Four: AI-Generated Development — AI builds the feature, component by component."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Stage Five: Testing and Quality Assurance — AI-plus-human validation against a hard checklist. Stage Six: Deployment and Improvement — ship fast, document everything, and loop back for the next cycle.",
        text_ssml: "<speak>Stage Five: <emphasis level=\"moderate\">Testing and Quality Assurance</emphasis> — AI-plus-human validation against a hard checklist. Stage Six: <emphasis level=\"moderate\">Deployment and Improvement</emphasis> — ship fast, document everything, and loop back for the next cycle.</speak>",
        text_expressive: "Stage Five: Testing and Quality Assurance — AI-plus-human validation against a hard checklist. Stage Six: Deployment and Improvement — ship fast, document everything, and loop back for the next cycle."
      }
    ]
  },
  {
    slide_id: "slide_07",
    type: "welcome",
    title: "ODF Stage 01: Intent & Outcome Definition",
    subtitle: "Define goals, success metrics, and stakeholders — before AI touches anything",
    icon: "target",
    visual_cue: "blueprint_foundation_animation",
    analogy: {
      title: "Foundation of a Building",
      text: "Nobody sees the foundation of a skyscraper. But every millimeter it's off at the base becomes a meter off at the top. Intent and Outcome Definition is your foundation — get it wrong, and everything AI generates on top of it drifts."
    },
    bullets: [
      "Define the business GOAL in ONE clear sentence — what outcome should exist that doesn't exist today?",
      "Identify ALL stakeholders — who is affected, who needs access, who approves?",
      "Define SUCCESS METRICS — how will you know when it's done and working correctly?",
      "List ALL validation rules — what makes input valid or invalid?",
      "State ALL security constraints — who accesses what, enforced where?",
      "Define acceptance signals — explicit, testable criteria for each goal",
      "List known edge cases — boundary conditions, error states, empty states",
      "Specify technology context — Stack & Patterns the AI must follow"
    ],
    closing_thread: "This is Stage 01 done right. It feeds directly into Stage 02: Requirements & Context.",
    memory_hook: "Vague intent = drifted AI output. Precise intent & outcome definition = precise delivery. Every. Single. Time.",
    narration: "Let's zoom into ODF Stage One: Intent and Outcome Definition. If you define the goal poorly, everything AI generates will drift from what the business actually needed. You must define the goal in one sentence, identify stakeholders and their roles, set success metrics, list validation rules, state security constraints, and enumerate edge cases. This structured intent is the eight-component framework — it's the big sibling of the P.R.O.M.P.T. formula from Module 1, scaled for real delivery.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "ODF Stage One: Intent and Outcome Definition. Get this wrong, and everything AI generates will drift — by a lot.",
        text_ssml: "<speak>ODF Stage One: <emphasis level=\"moderate\">Intent and Outcome Definition</emphasis>. Get this wrong, and everything AI generates will drift — by a lot.</speak>",
        text_expressive: "ODF Stage One: Intent and Outcome Definition. Get this wrong, and everything AI generates will drift — by a lot."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "Define the goal in one sentence. Identify stakeholders and their roles. Set success metrics. List validation rules, security constraints, and edge cases. All of it — before AI starts.",
        text_ssml: "<speak>Define the goal in one sentence. Identify stakeholders and their roles. Set success metrics. List validation rules, security constraints, and edge cases. <emphasis level=\"moderate\">All of it</emphasis> — before AI starts.</speak>",
        text_expressive: "Define the goal in one sentence. Identify stakeholders and their roles. Set success metrics. List validation rules, security constraints, and edge cases. All of it — before AI starts."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "This is the eight-component structured intent framework — P.R.O.M.P.T.'s big sibling, scaled for real delivery.",
        text_ssml: "<speak>This is the <emphasis level=\"moderate\">eight-component structured intent framework</emphasis> — P.R.O.M.P.T.'s big sibling, scaled for real delivery.</speak>",
        text_expressive: "This is the eight-component structured intent framework — P.R.O.M.P.T.'s big sibling, scaled for real delivery."
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
    title: "ODF Stage 02: Requirements & Context",
    subtitle: "Capture everything AI needs — before design begins",
    icon: "file-text",
    visual_cue: "requirements_context_capture_animation",
    analogy: {
      title: "Briefing the Architect",
      text: "An architect doesn't start drawing walls before understanding the full client brief. You don't just say 'build me a house.' You describe the family's needs, the budget, the land constraints, local regulations. Stage 02 is that full brief — so AI can design accurately, not approximately."
    },
    list: [
      { name: "Business Needs", icon: "briefcase", desc: "What problem is the business actually solving? Document it from the stakeholder's perspective — not in tech jargon, but in business outcomes." },
      { name: "Constraints & Boundaries", icon: "shield-alert", desc: "Budget, timeline, regulatory limits, existing system constraints — what limits the solution? Document every boundary AI must work within." },
      { name: "Technical Context", icon: "code-2", desc: "Current tech stack, existing systems, APIs to integrate with, data sources available. This is what enables AI to design inside your real environment." },
      { name: "Acceptance Criteria", icon: "check-circle", desc: "How will success be measured? These become the test cases in Stage 05. If you can't test it, it's not a real requirement." },
      { name: "Non-Functional Requirements", icon: "layers", desc: "Performance targets, security standards, accessibility, scalability expectations — all documented before AI designs a single component." }
    ],
    memory_hook: "Requirements & Context = everything AI needs to design accurately. Incomplete context = wrong design.",
    narration: "ODF Stage Two is Requirements and Context. Before AI can design anything, it needs complete context. Think of it like briefing an architect — you don't say 'build me a house' and walk away. You describe every constraint: the budget, the site, the family's needs, local regulations. In ODF, we document the full business problem, all constraints, the current tech landscape, and the acceptance criteria that define done. This is what enables AI to design accurately in Stage Three.",
    estimated_duration_seconds: 105,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "ODF Stage Two: Requirements and Context. Before AI designs anything, it needs complete context. Think of briefing an architect — you don't just say 'build me a house' and walk away.",
        text_ssml: "<speak>ODF Stage Two: <emphasis level=\"moderate\">Requirements and Context</emphasis>. Before AI designs anything, it needs complete context. Think of briefing an architect — you don't just say 'build me a house' and walk away.</speak>",
        text_expressive: "ODF Stage Two: Requirements and Context. Before AI designs anything, it needs complete context. Think of briefing an architect — you don't just say 'build me a house' and walk away."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "We document the full business problem, all constraints, the current tech landscape, and the acceptance criteria that define done.",
        text_ssml: "<speak>We document the full business problem, all constraints, the current tech landscape, and the <emphasis level=\"moderate\">acceptance criteria</emphasis> that define done.</speak>",
        text_expressive: "We document the full business problem, all constraints, the current tech landscape, and the acceptance criteria that define done."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "This is what enables AI to design accurately in Stage Three. Incomplete context equals wrong design. Every time.",
        text_ssml: "<speak>This is what enables AI to design accurately in Stage Three. <emphasis level=\"moderate\">Incomplete context equals wrong design.</emphasis> Every time.</speak>",
        text_expressive: "This is what enables AI to design accurately in Stage Three. Incomplete context equals wrong design. Every time."
      }
    ]
  },
  {
    slide_id: "slide_10",
    type: "welcome",
    title: "ODF Stage 03: AI-Assisted Design",
    subtitle: "AI generates the architecture before a single line of code is written",
    icon: "cpu",
    visual_cue: "ai_architecture_design_blueprint",
    analogy: {
      title: "Lead Architect, Not Just a Contractor",
      text: "A contractor executes construction from blueprints. An architect creates the blueprints. In ODF Stage 03, AI acts as the lead architect — generating system architecture, data models, API contracts, and the solution design blueprint. The Lead reviews and approves before any development begins."
    },
    bullets: [
      "AI generates the SYSTEM ARCHITECTURE — component structure, services, dependency map",
      "AI designs DATA MODELS: tables, relationships, constraints, indexes — before any coding",
      "AI defines API CONTRACTS: endpoints, request/response shapes, authentication guards",
      "Lead REVIEWS and APPROVES the design blueprint before Stage 04 begins",
      "Design decisions are DOCUMENTED — why this architecture, why this data model",
      "NEVER skip this stage: code built without a reviewed design requires expensive refactoring"
    ],
    closing_thread: "Design approved? Now we build. Stage 04: AI-Generated Development.",
    memory_hook: "AI Designs First. Lead Approves. Then development begins. Not the other way around.",
    narration: "ODF Stage Three is AI-Assisted Design. And this is where ODF changes the game. Before writing a single line of code, AI generates the architecture. It designs the component structure, the data model, the API contracts — all from your Stage Two requirements. You review it. You approve it. You refine it. Only then does development begin. This is what separates ODF from just using AI as a faster typist — AI doesn't just code. It designs first.",
    estimated_duration_seconds: 110,
    narration_script: [
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "explaining",
        text: "ODF Stage Three: AI-Assisted Design. Before a single line of code is written, AI designs the architecture. That's right — AI is the lead architect here.",
        text_ssml: "<speak>ODF Stage Three: <emphasis level=\"strong\">AI-Assisted Design</emphasis>. Before a single line of code is written, AI designs the architecture. That's right — AI is the lead architect here.</speak>",
        text_expressive: "ODF Stage Three: AI-Assisted Design. Before a single line of code is written, AI designs the architecture. That's right — AI is the lead architect here."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "earnest",
        text: "AI generates the component structure, the data model, the API contracts — all from your Stage Two requirements. You review it, approve it, and refine it.",
        text_ssml: "<speak>AI generates the component structure, the data model, the A P I contracts — all from your Stage Two requirements. You <emphasis level=\"moderate\">review it, approve it</emphasis>, and refine it.</speak>",
        text_expressive: "AI generates the component structure, the data model, the API contracts — all from your Stage Two requirements. You review it, approve it, and refine it."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "confident",
        text: "This is what separates ODF from just using AI as a faster typist. AI doesn't just code. It designs first.",
        text_ssml: "<speak>This is what separates ODF from just using A I as a faster typist. A I doesn't just code. It <emphasis level=\"strong\">designs first</emphasis>.</speak>",
        text_expressive: "[emphatic] This is what separates ODF from just using AI as a faster typist. AI doesn't just code. It designs first."
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
    title: "ODF Stages 04-05-06: Build, Test & Deploy",
    subtitle: "AI builds it, humans verify it, the team ships it — and the loop continues",
    icon: "check-circle",
    visual_cue: "odf_stages_04_05_06_pipeline",
    analogy: {
      title: "Formula One Pit Stop",
      text: "A Formula One pit stop has mechanics who each play a precise role. Stage 04: AI generates the code at speed. Stage 05: QA engineers check every bolt systematically. Stage 06: the car returns to track — and the team uses what they learned to improve the next lap."
    },
    list: [
      { name: "04 — AI-Generated Development", icon: "wand-2", desc: "AI accelerates actual coding — frontend, backend, APIs, integrations — under active Lead supervision. One focused prompt per component, reviewed before the next begins. Never accept code you cannot fully explain." },
      { name: "05 — Testing & Quality Assurance", icon: "clipboard-check", desc: "AI-assisted and human-led validation against a systematic checklist. Functional correctness, security, data isolation, error handling, edge cases — all verified. Not a vibe check — a hard gate before deployment." },
      { name: "06 — Deployment & Improvement", icon: "rocket", desc: "Rapid, continuous delivery to staging then production. Every deployment is documented, tested, and reversible. Stakeholder feedback captured here triggers the next improvement loop — back to Stage 01." }
    ],
    memory_hook: "Build with AI. Test with precision. Deploy fast. Loop back. That's Stages 04-05-06.",
    narration: "The final three ODF stages bring it home. Stage Four: AI-Generated Development. AI writes the actual code — backend, frontend, integrations — under your active supervision. One component, one prompt, one validation before the next begins. Stage Five: Testing and Quality Assurance. AI-plus-human validation against a hard checklist — security, data isolation, edge cases, all of it. Stage Six: Deployment and Improvement. Ship fast, document everything, and use stakeholder feedback to kick off the next improvement loop. That is the ODF in action.",
    estimated_duration_seconds: 115,
    narration_script: [
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "explaining",
        text: "The final three ODF stages. Stage Four: AI-Generated Development. AI writes the actual code under your active supervision.",
        text_ssml: "<speak>The final three ODF stages. Stage Four: <emphasis level=\"moderate\">AI-Generated Development</emphasis>. AI writes the actual code under your active supervision.</speak>",
        text_expressive: "The final three ODF stages. Stage Four: AI-Generated Development. AI writes the actual code under your active supervision."
      },
      {
        speaker: "Arjun",
        voice: "male_genz",
        emotion: "earnest",
        text: "Stage Five: Testing and Quality Assurance. AI-plus-human validation against a hard checklist. Security, data isolation, edge cases — all verified. Not a vibe check — a hard gate.",
        text_ssml: "<speak>Stage Five: <emphasis level=\"moderate\">Testing and Quality Assurance</emphasis>. A I-plus-human validation against a hard checklist. Security, data isolation, edge cases — all verified. Not a vibe check — a <emphasis level=\"strong\">hard gate</emphasis>.</speak>",
        text_expressive: "Stage Five: Testing and Quality Assurance. AI-plus-human validation against a hard checklist. Security, data isolation, edge cases — all verified. Not a vibe check — a hard gate."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Stage Six: Deployment and Improvement. Ship fast, document everything, and use stakeholder feedback to kick off the next improvement loop. That is the ODF in action.",
        text_ssml: "<speak>Stage Six: <emphasis level=\"moderate\">Deployment and Improvement</emphasis>. Ship fast, document everything, and use stakeholder feedback to kick off the next improvement loop. That is the ODF in action.</speak>",
        text_expressive: "Stage Six: Deployment and Improvement. Ship fast, document everything, and use stakeholder feedback to kick off the next improvement loop. That is the ODF in action."
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
      { time: "09:00 AM", icon: "target", phase: "INTENT & OUTCOME", desc: "Stakeholder says: 'We need employees to submit expenses.' You define the outcome in one sentence, identify 3 stakeholder roles, and list success metrics and acceptance criteria before AI touches anything." },
      { time: "09:30 AM", icon: "file-text", phase: "REQUIREMENTS & CONTEXT", desc: "Document all business needs: 6 validation rules, expense categories, approval workflow, tech stack constraints. Full context captured so AI can design accurately." },
      { time: "10:00 AM", icon: "cpu", phase: "AI-ASSISTED DESIGN", desc: "AI generates: ExpenseReport data model, API contracts for 4 endpoints, component architecture blueprint. Lead reviews and approves the design before development begins." },
      { time: "10:30 AM", icon: "wand-2", phase: "AI-GENERATED DEV", desc: "Prompt 1: DB migrations. Prompt 2: service layer with business rules. Prompt 3: API endpoints with guards. Prompt 4: React form with validation. Each validated before next." },
      { time: "11:30 AM", icon: "shield-check", phase: "TESTING & QA", desc: "All 6 validation rules tested. Server-side enforcement confirmed. Manager can't see other teams' expenses. Error messages clean. Edge cases covered. Gate passed." },
      { time: "04:30 PM", icon: "rocket", phase: "DEPLOY & IMPROVE", desc: "Deployed to staging. Demo at 2PM — stakeholder requests receipt upload. New requirement captured, loop restarts at Stage 01. Feature live by 4:30 with improvement queued." }
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
      "The ODF is a loop, not a line: Intent & Outcome → Requirements & Context → AI-Assisted Design → AI-Generated Development → Testing & QA → Deployment & Improvement.",
      "Intent & Outcome Definition is the foundation — eight components, all eight, every time.",
      "Testing & Quality Assurance is a systematic checklist, not a vibe check.",
      "Documentation lives alongside the code — generated, not written after."
    ],
    closing_thread: "Quiz time. Ten questions, 80% to pass, Module 3 unlocks.",
    memory_hook: "Principles. ODF Loop. Intent & Outcome. Checklist. Living docs. Five things, whole module.",
    narration: "Time to recap. If you remember nothing else from this module, remember these five. First: six principles govern everything. Break one? It's not OrchestrAI. Second: the ODF is a loop — Intent and Outcome, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, Deployment and Improvement. Third: Intent and Outcome Definition is the foundation — eight components, all eight, every time. Fourth: Testing and QA is a checklist, not a vibe. Fifth: documentation lives alongside code. Quiz time. Ten questions, eighty percent to pass. Let's do it.",
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
        text: "First: six principles govern everything. Break one? It's not OrchestrAI. Second: the ODF is a loop — Intent and Outcome, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, Deployment and Improvement.",
        text_ssml: "<speak>First: six principles govern everything. Break one? It's not OrchestrAI. Second: the <emphasis level=\"moderate\">ODF is a loop</emphasis> — Intent and Outcome, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, Deployment and Improvement.</speak>",
        text_expressive: "First: six principles govern everything. Break one? It's not OrchestrAI. Second: the ODF is a loop — Intent and Outcome, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and QA, Deployment and Improvement."
      },
      {
        speaker: "Sara",
        voice: "female_genz",
        emotion: "upbeat",
        text: "Third: Intent and Outcome Definition is the foundation — eight components, all eight, every time. Fourth: Testing and QA is a checklist, not a vibe. Fifth: documentation lives alongside code.",
        text_ssml: "<speak>Third: <emphasis level=\"moderate\">Intent and Outcome Definition</emphasis> is the foundation — eight components, all eight, every time. Fourth: Testing and QA is a checklist, not a vibe. Fifth: documentation lives alongside code.</speak>",
        text_expressive: "Third: Intent and Outcome Definition is the foundation — eight components, all eight, every time. Fourth: Testing and QA is a checklist, not a vibe. Fifth: documentation lives alongside code."
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
        category: "ODF Stages",
        icon: "route",
        question: "What is the correct order of the six ODF (OrchestrAI Delivery Framework) stages?",
        choices: [
          "Intent & Outcome → Requirements & Context → AI-Assisted Design → AI-Generated Development → Testing & QA → Deployment & Improvement",
          "Requirements & Context → Intent & Outcome → AI-Assisted Design → Testing & QA → AI-Generated Development → Deployment & Improvement",
          "Intent & Outcome → AI-Assisted Design → Requirements & Context → AI-Generated Development → Testing & QA → Deployment & Improvement",
          "Intent & Outcome → Requirements & Context → AI-Generated Development → AI-Assisted Design → Testing & QA → Deployment & Improvement"
        ],
        correct_answer: "Intent & Outcome → Requirements & Context → AI-Assisted Design → AI-Generated Development → Testing & QA → Deployment & Improvement",
        explanation: "The ODF always starts with Intent & Outcome Definition to set the goal, then Requirements & Context to inform AI, then AI-Assisted Design, AI-Generated Development, Testing & QA, and finally Deployment & Improvement — a continuous loop."
      },
      {
        id: "q5",
        category: "ODF Stages",
        icon: "cpu",
        question: "What does ODF Stage 03 (AI-Assisted Design) produce BEFORE any code is written?",
        choices: [
          "System architecture, data models, and API contracts reviewed and approved by the Lead",
          "The first working version of the frontend UI",
          "A list of sprint tasks for the development team",
          "A completed codebase ready for testing"
        ],
        correct_answer: "System architecture, data models, and API contracts reviewed and approved by the Lead",
        explanation: "In Stage 03 (AI-Assisted Design), AI generates the architecture blueprint — component structure, data models, API contracts — before a single line of code is written. The Lead reviews and approves before Stage 04 begins."
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
    title: "Operationalizing the Principles: The ODF Delivery Stages",
    subtitle: "Transitioning from governance principles to the ODF execution workflow",
    reflection_prompt: "We have established the six core principles. However, principles require a process framework to execute. Are you ready to review the OrchestrAI Delivery Framework stages?",
    bullets: [
      "Core Principles establish the governing constraints",
      "The ODF provides the execution process framework",
      "Stage flow: 01 Intent & Outcome → 02 Requirements & Context → 03 AI-Assisted Design → 04 AI-Generated Development → 05 Testing & QA → 06 Deployment & Improvement",
      "A continuous delivery loop replacing linear agile methodologies"
    ],
    memory_hook: "Principles define the boundaries. The ODF stages define the workflow.",
    narration: "While principles define the operational boundaries, the ODF delivery stages define the execution process. Think of principles as the rules of the road, and the six ODF stages as the navigation system. The process flows through: Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Quality Assurance, and Deployment and Improvement. This is a continuous loop, not a linear sequence. We will now examine each stage.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "While principles define the operational boundaries, the ODF delivery stages define the execution process.",
        text_ssml: "<speak>While principles define the operational boundaries, the <emphasis level=\"moderate\">ODF delivery stages</emphasis> define the execution process.</speak>",
        text_expressive: "While principles define the operational boundaries, the ODF delivery stages define the execution process."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "The process flows through six stages: Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Quality Assurance, and Deployment and Improvement.",
        text_ssml: "<speak>The process flows through <emphasis level=\"moderate\">six stages</emphasis>: Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Quality Assurance, and Deployment and Improvement.</speak>",
        text_expressive: "The process flows through six stages: Intent and Outcome Definition, Requirements and Context, AI-Assisted Design, AI-Generated Development, Testing and Quality Assurance, and Deployment and Improvement."
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
    title: "The ODF — Six Delivery Stages",
    subtitle: "The OrchestrAI Delivery Framework: the operating sequence for all engagements",
    analogy: {
      title: "Dynamic Process Models",
      text: "A static delivery model follows a rigid sequence regardless of outcomes. The ODF is dynamic — it loops constantly to integrate feedback and improve with every cycle. This is what enables AI-powered teams to outperform traditional project-based delivery."
    },
    memory_hook: "ODF: Intent & Outcome → Requirements & Context → AI-Assisted Design → AI-Generated Development → Testing & QA → Deployment & Improvement. The engine of delivery.",
    narration: "The OrchestrAI Delivery Framework contains six distinct stages. Stage one: Intent and Outcome Definition. Define the business goal, stakeholders, and success metrics with precision. Stage two: Requirements and Context. Capture all business needs, constraints, and technical context so AI can design accurately. Stage three: AI-Assisted Design. AI generates the system architecture, data models, and API contracts for Lead review. Stage four: AI-Generated Development. AI accelerates coding under active supervision. Stage five: Testing and Quality Assurance. AI-assisted and human-led validation against a systematic checklist. Stage six: Deployment and Improvement. Rapid, governed deployment with continuous improvement loops.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "The OrchestrAI Delivery Framework contains six distinct stages.",
        text_ssml: "<speak>The OrchestrAI Delivery Framework contains <emphasis level=\"moderate\">six distinct stages</emphasis>.</speak>",
        text_expressive: "The OrchestrAI Delivery Framework contains six distinct stages."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage one: Intent and Outcome Definition. Define the business goal, stakeholders, and success metrics with precision. Stage two: Requirements and Context. Capture all business needs, constraints, and technical context so AI can design accurately.",
        text_ssml: "<speak>Stage one: <emphasis level=\"moderate\">Intent and Outcome Definition</emphasis>. Define the business goal, stakeholders, and success metrics with precision. Stage two: <emphasis level=\"moderate\">Requirements and Context</emphasis>. Capture all business needs, constraints, and technical context so AI can design accurately.</speak>",
        text_expressive: "Stage one: Intent and Outcome Definition. Define the business goal, stakeholders, and success metrics with precision. Stage two: Requirements and Context. Capture all business needs, constraints, and technical context so AI can design accurately."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage three: AI-Assisted Design. AI generates the system architecture, data models, and API contracts for Lead review. Stage four: AI-Generated Development. AI accelerates coding under active supervision.",
        text_ssml: "<speak>Stage three: <emphasis level=\"moderate\">AI-Assisted Design</emphasis>. AI generates the system architecture, data models, and A P I contracts for Lead review. Stage four: <emphasis level=\"moderate\">AI-Generated Development</emphasis>. AI accelerates coding under active supervision.</speak>",
        text_expressive: "Stage three: AI-Assisted Design. AI generates the system architecture, data models, and API contracts for Lead review. Stage four: AI-Generated Development. AI accelerates coding under active supervision."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage five: Testing and Quality Assurance. AI-assisted and human-led validation against a systematic checklist. Stage six: Deployment and Improvement. Rapid, governed deployment with continuous improvement loops.",
        text_ssml: "<speak>Stage five: <emphasis level=\"moderate\">Testing and Quality Assurance</emphasis>. AI-assisted and human-led validation against a systematic checklist. Stage six: <emphasis level=\"moderate\">Deployment and Improvement</emphasis>. Rapid, governed deployment with continuous improvement loops.</speak>",
        text_expressive: "Stage five: Testing and Quality Assurance. AI-assisted and human-led validation against a systematic checklist. Stage six: Deployment and Improvement. Rapid, governed deployment with continuous improvement loops."
      }
    ]
  },
  slide_07: {
    title: "ODF Stage 01: Intent & Outcome Definition — Architectural Foundations",
    subtitle: "Precision in goal definition, stakeholder mapping, and success metrics",
    analogy: {
      title: "Foundation Engineering",
      text: "In civil engineering, minor alignment deviations at the foundation level compound into structural failures at higher stories. In ODF, an incomplete Intent and Outcome Definition guarantees drift in all AI-generated artifacts."
    },
    bullets: [
      "Business Goal: Specify the desired business outcome in a single sentence",
      "Stakeholder Mapping: Enumerate all stakeholders, access privileges, and constraints",
      "Success Metrics: Define measurable criteria for what 'done' looks like",
      "Validation Rules: Define explicit conditions for input correctness",
      "Security Constraints: Establish client and server-side enforcement",
      "Acceptance Signals: Define testable criteria for each goal",
      "Edge Cases: Map boundary conditions and error state expectations",
      "Stack & Patterns: Provide structural technology constraints for AI"
    ],
    closing_thread: "These components compose the structured intent framework, feeding directly into Stage 02: Requirements & Context.",
    memory_hook: "Precise intent and outcome definition guarantees predictable AI output. Define goals, stakeholders, and metrics upfront.",
    narration: "In ODF Stage one: Intent and Outcome Definition, precision is paramount. A minor goal specification omission compounds into severe AI output drift. We define the business goal in one sentence, identify all stakeholders and their access rights, set measurable success metrics, specify numbered validation rules, and establish security constraints on both client and server. We also list testable acceptance signals and map boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to enable accurate AI-generated delivery.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "In ODF Stage one: Intent and Outcome Definition, precision is paramount. A minor goal specification omission compounds into severe AI output drift.",
        text_ssml: "<speak>In ODF Stage one: Intent and Outcome Definition, precision is <emphasis level=\"moderate\">paramount</emphasis>. A minor goal specification omission compounds into severe AI output drift.</speak>",
        text_expressive: "In ODF Stage one: Intent and Outcome Definition, precision is paramount. A minor goal specification omission compounds into severe AI output drift."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We define the business goal in one sentence, identify all stakeholders and their access rights, set measurable success metrics, and specify numbered validation rules and security constraints.",
        text_ssml: "<speak>We define the business goal in one sentence, identify all stakeholders and their access rights, set measurable success metrics, and specify numbered validation rules and <emphasis level=\"moderate\">security constraints</emphasis>.</speak>",
        text_expressive: "We define the business goal in one sentence, identify all stakeholders and their access rights, set measurable success metrics, and specify numbered validation rules and security constraints."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Additionally, we list testable acceptance signals and map boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to enable accurate AI-generated delivery.",
        text_ssml: "<speak>Additionally, we list testable acceptance signals and map boundary edge cases. This structured approach <emphasis level=\"moderate\">builds on the P.R.O.M.P.T. method</emphasis> to enable accurate AI-generated delivery.</speak>",
        text_expressive: "Additionally, we list testable acceptance signals and map boundary edge cases. This structured approach builds on the P.R.O.M.P.T. method to enable accurate AI-generated delivery."
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
    title: "ODF Stage 02: Requirements & Context — Dependency Architecture",
    subtitle: "Capturing all business needs and context before AI-Assisted Design begins",
    analogy: {
      title: "Critical Client Brief Analysis",
      text: "A consultant does not begin designing solutions before fully understanding the client's constraints, environment, and objectives. Stage 02 is the complete client brief that enables AI to design accurately in Stage 03, not approximately."
    },
    memory_hook: "Requirements & Context precedes AI design. Document all needs, constraints, and technical context first.",
    narration: "Stage two of the ODF is Requirements and Context. Before AI can design the architecture, it needs complete information about the business problem, constraints, and technical environment. We document the full business need from the stakeholder perspective, all boundaries and regulatory constraints, the existing tech stack and integration points, and the acceptance criteria that will be used to validate the solution in Stage 05. This prevents AI from designing into the wrong environment.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Stage two of the ODF is Requirements and Context. Before AI can design the architecture, it needs complete information.",
        text_ssml: "<speak>Stage two of the ODF is <emphasis level=\"moderate\">Requirements and Context</emphasis>. Before AI can design the architecture, it needs complete information.</speak>",
        text_expressive: "Stage two of the ODF is Requirements and Context. Before AI can design the architecture, it needs complete information."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "We document the full business need, all boundaries and regulatory constraints, the existing tech stack and integration points, and the acceptance criteria that will validate the solution.",
        text_ssml: "<speak>We document the full business need, all boundaries and regulatory constraints, the existing tech stack and <emphasis level=\"moderate\">integration points</emphasis>, and the acceptance criteria that will validate the solution.</speak>",
        text_expressive: "We document the full business need, all boundaries and regulatory constraints, the existing tech stack and integration points, and the acceptance criteria that will validate the solution."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "This prevents AI from designing into the wrong environment, and ensures Stage 03 AI-Assisted Design produces accurate, deployable blueprints.",
        text_ssml: "<speak>This prevents AI from designing into the wrong environment, and ensures Stage 03 AI-Assisted Design produces <emphasis level=\"moderate\">accurate, deployable blueprints</emphasis>.</speak>",
        text_expressive: "This prevents AI from designing into the wrong environment, and ensures Stage 03 AI-Assisted Design produces accurate, deployable blueprints."
      }
    ]
  },
  slide_10: {
    title: "ODF Stage 03: AI-Assisted Design — Architecture Generation",
    subtitle: "AI generates the system design blueprint before development begins",
    analogy: {
      title: "Chief Architect Engagement",
      text: "A chief architect does not begin construction without reviewed blueprints. In ODF Stage 03, AI operates as chief architect — generating system architecture, data models, and API contracts from the requirements captured in Stage 02. The Lead reviews and approves before a single line of code is generated."
    },
    memory_hook: "AI generates the architecture first. Lead reviews and approves. Then development begins.",
    narration: "Stage three of the ODF is AI-Assisted Design. This is where the OrchestrAI Delivery Framework fundamentally diverges from using AI as a code generator. Before any development begins, AI generates the complete system architecture: component structure, data models, API contracts, and the dependency map. The Lead reviews this design output, validates it against the requirements from Stage 02, and approves it before Stage 04 begins. Under no circumstances does code generation precede an approved design.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "Stage three of the ODF is AI-Assisted Design. This is where the OrchestrAI Delivery Framework fundamentally diverges from using AI as a code generator.",
        text_ssml: "<speak>Stage three of the ODF is <emphasis level=\"moderate\">AI-Assisted Design</emphasis>. This is where the OrchestrAI Delivery Framework fundamentally diverges from using AI as a code generator.</speak>",
        text_expressive: "Stage three of the ODF is AI-Assisted Design. This is where the OrchestrAI Delivery Framework fundamentally diverges from using AI as a code generator."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Before any development begins, AI generates the complete system architecture: component structure, data models, API contracts, and the dependency map.",
        text_ssml: "<speak>Before any development begins, AI generates the complete system architecture: component structure, data models, A P I contracts, and the <emphasis level=\"moderate\">dependency map</emphasis>.</speak>",
        text_expressive: "Before any development begins, AI generates the complete system architecture: component structure, data models, API contracts, and the dependency map."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "The Lead reviews this design, validates it against Stage 02 requirements, and approves it. Under no circumstances does code generation precede an approved design.",
        text_ssml: "<speak>The Lead reviews this design, validates it against Stage 02 requirements, and approves it. Under no circumstances does code generation precede an <emphasis level=\"strong\">approved design</emphasis>.</speak>",
        text_expressive: "[authoritative] The Lead reviews this design, validates it against Stage 02 requirements, and approves it. Under no circumstances does code generation precede an approved design."
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
    title: "ODF Stages 04-05-06: AI Development, Testing & Deployment",
    subtitle: "Governed AI-powered development, systematic quality assurance, and continuous deployment",
    analogy: {
      title: "Quality-Controlled Production and Release",
      text: "Stage 04 is the production line: AI generates components at speed under supervised quality controls. Stage 05 is the quality assurance gate: systematic inspection before any item ships. Stage 06 is the controlled release: governed deployment with continuous improvement feeding back into the next production cycle."
    },
    memory_hook: "AI-Generated Development under supervision. Systematic Testing & QA gate. Governed Deployment with improvement loops.",
    narration: "We now review the final three ODF stages. Stage four, AI-Generated Development: code is produced incrementally under active Lead supervision. One prompt, one component, validated before the next begins. Stage five, Testing and Quality Assurance: AI-assisted and human-led validation against the systematic checklist covering functionality, security, data isolation, and error states. Stage six, Deployment and Improvement: code is released continuously to staging and production in a governed manner, with stakeholder feedback captured to initiate the next improvement cycle.",
    narration_script: [
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "instructive",
        text: "We now review the final three ODF stages.",
        text_ssml: "<speak>We now review the <emphasis level=\"moderate\">final three ODF stages</emphasis>.</speak>",
        text_expressive: "We now review the final three ODF stages."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage four, AI-Generated Development: code is produced incrementally under active Lead supervision. One prompt, one component, validated before the next begins.",
        text_ssml: "<speak>Stage four, <emphasis level=\"moderate\">AI-Generated Development</emphasis>: code is produced incrementally under active Lead supervision. One prompt, one component, validated before the next begins.</speak>",
        text_expressive: "Stage four, AI-Generated Development: code is produced incrementally under active Lead supervision. One prompt, one component, validated before the next begins."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage five, Testing and Quality Assurance: AI-assisted and human-led validation against the systematic checklist covering functionality, security, data isolation, and error states.",
        text_ssml: "<speak>Stage five, <emphasis level=\"moderate\">Testing and Quality Assurance</emphasis>: AI-assisted and human-led validation against the systematic checklist covering functionality, security, data isolation, and error states.</speak>",
        text_expressive: "Stage five, Testing and Quality Assurance: AI-assisted and human-led validation against the systematic checklist covering functionality, security, data isolation, and error states."
      },
      {
        speaker: "Narrator",
        voice: "professional_narrator",
        emotion: "measured",
        text: "Stage six, Deployment and Improvement: code is released continuously in a governed manner, with stakeholder feedback captured to initiate the next improvement cycle.",
        text_ssml: "<speak>Stage six, <emphasis level=\"moderate\">Deployment and Improvement</emphasis>: code is released continuously in a governed manner, with stakeholder feedback captured to initiate the next improvement cycle.</speak>",
        text_expressive: "Stage six, Deployment and Improvement: code is released continuously in a governed manner, with stakeholder feedback captured to initiate the next improvement cycle."
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
