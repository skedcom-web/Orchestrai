import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PromptSimulator } from './PromptSimulator';
import {
  ArrowLeft, ArrowRight, X, Pause, Tv, Play, RotateCcw,
  CheckCircle2, HelpCircle, AlertTriangle, Rocket,
  RefreshCw, Clock, MessageSquare, Gauge, ClipboardCheck,
  Target, ShieldAlert, LayoutTemplate, Smile, UserCog,
  Search, Users, Edit3, CheckCircle, Zap, GitCommit,
  BookOpen, UserX, AlertOctagon, Scale, Lightbulb,
  Sparkles, BrainCircuit,
  BarChart2, TrendingUp, TrendingDown, XCircle,
  Award, Layers, Shield, Activity,
  Frown, Music2, Headphones, Wand2, MonitorPlay, GitMerge,
  Compass, Languages, ArrowLeftRight
} from 'lucide-react';

interface TrainingPresenterProps {
  moduleId: number;
  onClose: () => void;
  onComplete: () => void;
}

// ── Mobile audio tuning ──
// Web Speech behaves differently on iOS Safari / Android Chrome: voices load async,
// pitch is often ignored, `onend` can mis-fire, and the engine silently pauses after ~15s on Chrome Android.
// These constants and the IS_MOBILE flag drive the platform-aware fixes in speakNarration().
const IS_MOBILE_DEVICE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const INTER_SEGMENT_PAUSE_MS = 300;       // breathing space between dialogue lines
const SPEAKER_CHANGE_PAUSE_MS = 500;      // longer pause when Sara → Arjun (or vice versa)
const ANDROID_KEEPALIVE_MS = 12000;       // Chrome Android pauses speech after ~15s; nudge before then

// ── ICON RESOLVER ──
const RI = (name: string, cls = 'h-4 w-4'): React.ReactNode => {
  const m: Record<string, React.ReactNode> = {
    rocket: <Rocket className={cls} />, 'trending-down': <TrendingDown className={cls} />,
    'trending-up': <TrendingUp className={cls} />, 'refresh-cw': <RefreshCw className={cls} />,
    clock: <Clock className={cls} />, 'calendar-clock': <Clock className={cls} />,
    'message-square-text': <MessageSquare className={cls} />, 'message-square': <MessageSquare className={cls} />,
    gauge: <Gauge className={cls} />, 'clipboard-check': <ClipboardCheck className={cls} />,
    target: <Target className={cls} />, 'shield-alert': <ShieldAlert className={cls} />, shield: <Shield className={cls} />,
    'layout-template': <LayoutTemplate className={cls} />, smile: <Smile className={cls} />, 'user-cog': <UserCog className={cls} />,
    search: <Search className={cls} />, users: <Users className={cls} />, 'edit-3': <Edit3 className={cls} />,
    'check-circle': <CheckCircle className={cls} />, zap: <Zap className={cls} />, 'git-commit': <GitCommit className={cls} />,
    'book-open': <BookOpen className={cls} />, 'user-x': <UserX className={cls} />, 'alert-octagon': <AlertOctagon className={cls} />,
    scale: <Scale className={cls} />, 'alert-triangle': <AlertTriangle className={cls} />, lightbulb: <Lightbulb className={cls} />,
    sparkles: <Sparkles className={cls} />, brain: <BrainCircuit className={cls} />, award: <Award className={cls} />,
    layers: <Layers className={cls} />, 'x-circle': <XCircle className={cls} />, 'file-text': <BookOpen className={cls} />,
    'code-2': <BrainCircuit className={cls} />, 'help-circle': <HelpCircle className={cls} />, timer: <Clock className={cls} />,
    'list-checks': <CheckCircle2 className={cls} />, presentation: <LayoutTemplate className={cls} />,
    'grid-3x3': <Layers className={cls} />, map: <Target className={cls} />, 'calendar-check': <CheckCircle2 className={cls} />,
    activity: <Activity className={cls} />, 'bar-chart-2': <BarChart2 className={cls} />,
    'check-circle-2': <CheckCircle2 className={cls} />, 'shield-check': <Shield className={cls} />,
    'flask-conical': <Sparkles className={cls} />,
    frown: <Frown className={cls} />,
    'music-2': <Music2 className={cls} />,
    headphones: <Headphones className={cls} />,
    'wand-2': <Wand2 className={cls} />,
    'monitor-play': <MonitorPlay className={cls} />,
    'git-merge': <GitMerge className={cls} />,
    compass: <Compass className={cls} />,
    languages: <Languages className={cls} />,
    'arrow-left-right': <ArrowLeftRight className={cls} />,
    'users-2': <Users className={cls} />,
    'user-cog-custom': <UserCog className={cls} />
  };
  return m[name] ?? <Sparkles className={cls} />;
};

const PILLAR_GRAD = [
  'from-violet-600 to-indigo-600', 'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600', 'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',    'from-purple-600 to-violet-600',
];

// ── DEFAULT SLIDES ──
const DEFAULT_SLIDES_MAP: Record<number, any[]> = {
  1: [
    // SLIDE 1 — Hero Welcome
    {
      type: 'hero_welcome', icon: 'rocket',
      title: 'OrchestrAI Lead Certification',
      tagline: '"Stop typing code. Start commanding outcomes."',
      subtitle: 'Module 1 · The OrchestrAI Mindset',
      hero_stat: { value: '7 Days', label: 'From blank page to production baseline', note: 'Not 7 months.' },
      promises: [
        { icon: 'brain', color: 'from-violet-600 to-indigo-600', title: 'Rewire', desc: 'Shift from Manual Builder to Intent Orchestrator' },
        { icon: 'zap', color: 'from-amber-600 to-orange-600', title: 'Master', desc: 'The P.R.O.M.P.T. formula replacing manual coding' },
        { icon: 'award', color: 'from-emerald-600 to-teal-600', title: 'Certify', desc: 'Production-grade mindset in 60 minutes' },
      ],
      analogy: 'Think: A 747 pilot switching on autopilot. You don\'t stop being responsible for the flight — you stop touching every control manually. Set the destination, the constraints — and let the system fly.',
      narration: 'Welcome to the OrchestrAI Lead Certification. This one-hour intensive is designed to fundamentally rewire your professional approach. By the end, you will no longer think of yourself as a developer who writes code — you will think of yourself as an architect who orchestrates intent. The benchmark: seven working days from a blank page to a production-grade baseline. Not seven months. Let\'s begin.'
    },
    // SLIDE 2 — Industry Crisis
    {
      type: 'crisis_stat', icon: 'trending-down',
      title: 'The Industry Is Structurally Broken',
      subtitle: 'Why traditional software delivery fails — by the numbers',
      stats: [
        { value: '72%', label: 'of enterprise projects exceed their original budget', color: 'red' },
        { value: '63%', label: 'of projects miss their committed deadlines', color: 'orange' },
        { value: '₹40L+', label: 'average cost overrun per mid-size project', color: 'red' },
        { value: '31%', label: 'of projects cancelled before anyone uses them', color: 'orange' },
      ],
      insight_title: 'These are not outliers.',
      insight_text: 'These are industry averages from the Standish CHAOS Report, McKinsey, and PMI. Traditional software delivery is not a risk — it is a statistical certainty of failure. Hiring better developers does not fix a structural problem.',
      key_quote: '"Every month of traditional delivery costs your client more than a full year of an OrchestrAI engagement."',
      narration: 'Before we understand why OrchestrAI is necessary, we need to understand the collapse of the industry we operate in. Seventy-two percent of enterprise projects exceed budget. Sixty-three percent miss deadlines. Thirty-one percent are cancelled before anyone uses them. These numbers come from independent research bodies. They are not exceptions — they are norms. The model is structurally broken, and adding more sprints or better developers cannot fix a structural problem. OrchestrAI is the structural fix.'
    },
    // SLIDE 3 — Comparison Table
    {
      type: 'comparison_table', icon: 'bar-chart-2',
      title: 'Structural Failures of Legacy Delivery',
      subtitle: 'Traditional vs OrchestrAI — a measurable, side-by-side comparison',
      visual_chart: {
        chart_type: 'horizontal_bar_comparison', title: 'MVP Timeline',
        series: [
          { label: 'Traditional Delivery', value: 120, display: '3–6 months avg', color: 'warning' },
          { label: 'OrchestrAI Delivery',  value: 7,   display: '7 working days', color: 'success' },
        ]
      },
      table: [
        { pain: 'MVP Timeline',       icon: 'clock',          trad: '3–6 months for basic functionality',              orch: '7 working days to production baseline' },
        { pain: 'Delivery Cost',      icon: 'alert-triangle', trad: '₹25–50 Lakhs for mid-complexity apps',            orch: '70–80% savings on comparable scope' },
        { pain: 'Change Requests',    icon: 'refresh-cw',     trad: '2–4 weeks rework budget per change',              orch: 'Implemented same-day via plain-English intent' },
        { pain: 'Documentation',      icon: 'file-text',      trad: 'Written weeks after code (always lagging)',        orch: 'Real-time, living artifact alongside code' },
        { pain: 'Key Person Risk',    icon: 'user-x',         trad: 'Project stalls if one senior dev leaves',         orch: 'Knowledge lives in AI — always reproducible' },
      ],
      narration: 'Let\'s quantify the gap. A traditional MVP takes three to six months and costs twenty-five to fifty lakhs. OrchestrAI collapses that timeline to seven working days at seventy to eighty percent cost reduction. Change requests that cost weeks of rework are now plain-English adjustments implemented the same day. This isn\'t a minor efficiency gain — it\'s a category-level transformation.'
    },
    // SLIDE 4 — Paradigm Identity
    {
      type: 'paradigm_identity', icon: 'refresh-cw',
      title: 'The Identity Shift',
      subtitle: 'This is not about tools. It is about who you become as a professional.',
      left: { icon: 'code-2', label: 'Solo Violinist', desc: 'Controls one instrument manually. 80 notes per minute maximum. Every note is a direct human act.' },
      right: { icon: 'layers', label: 'Orchestra Conductor', desc: '80 instruments simultaneously. Zero hands on instruments. Unlimited output per minute through precise intent.' },
      transformations: [
        { from: 'I write the code',         to: 'I define the intent',        fi: 'code-2',         ti: 'target' },
        { from: 'I manage sprints',         to: 'I validate outcomes',        fi: 'clock',          ti: 'check-circle' },
        { from: 'I estimate timelines',     to: 'I prove in hours',           fi: 'alert-triangle', ti: 'zap' },
        { from: 'I clarify during dev',     to: 'I crystallize upfront',      fi: 'help-circle',    ti: 'shield-alert' },
      ],
      reflection: 'Think of one recent project where a requirement was "clarified during development." What would it have cost to crystallize that upfront instead?',
      narration: 'This module is called The OrchestrAI Mindset because the most powerful thing you will change is not what you use — it is who you are professionally. The conductor doesn\'t produce less music than the violinist. The conductor produces infinitely more. Your craftsmanship doesn\'t disappear — it moves upstream. Instead of crafting code, you craft constraints. Instead of writing syntax, you write intent.'
    },
    // SLIDE 5 — Mental Blocks
    {
      type: 'mental_blocks', icon: 'brain',
      title: '5 Mental Blocks You Must Break',
      subtitle: 'These mindset traps consistently stall the transformation to OrchestrAI Lead',
      blocks: [
        { icon: 'code-2',         color: 'red',    label: 'Block 1: "I Must Write Code to Add Value"',              desc: 'Reality: Your value is in the precision of your intent. One perfect prompt outweighs 500 lines of manual code.' },
        { icon: 'clock',          color: 'orange', label: 'Block 2: "Requirements Will Become Clear As We Build"',   desc: 'Reality: Vague requirements produce vague AI output. Crystallize 100% of requirements before generation begins.' },
        { icon: 'shield-alert',   color: 'red',    label: 'Block 3: "AI Will Handle Security Automatically"',       desc: 'Reality: AI generates exactly what you specify. Without explicit security Markers, it will produce vulnerable code.' },
        { icon: 'alert-triangle', color: 'orange', label: 'Block 4: "QA Will Catch What We Miss"',                  desc: 'Reality: Quality is a first-prompt discipline, not a last-step filter. Upstream intent = downstream correctness.' },
        { icon: 'users',          color: 'indigo', label: 'Block 5: "AI Will Replace My Team"',                     desc: 'Reality: AI replaces manual execution, not judgment. The Lead becomes more valuable — not redundant.' },
      ],
      narration: 'There are five mental blocks that consistently prevent experienced professionals from becoming effective OrchestrAI Leads. Each one is a belief that served you well in traditional delivery but actively sabotages you in this model. We will address each one systematically throughout this module. The first and most important block to break is the belief that writing code is how you add professional value.'
    },
    // SLIDE 6 — AI as Developer
    {
      type: 'ai_as_developer', icon: 'brain',
      title: 'AI Is Your Most Capable Developer',
      subtitle: 'The right mental model: brief it like a world-class specialist, not a vending machine',
      ai_traits: [
        { icon: 'zap',          color: 'amber',   trait: 'Infinite Speed',  desc: 'Generates in seconds what takes humans days. No fatigue. No mood. No estimation. Pure execution.' },
        { icon: 'check-circle', color: 'emerald', trait: 'No Ego',          desc: 'Accepts any correction without resistance or morale impact. Revises infinitely without complaint.' },
        { icon: 'book-open',    color: 'blue',    trait: 'Total Recall',    desc: 'Knows every best practice, security pattern, and framework pattern — all at once, all the time.' },
        { icon: 'shield',       color: 'violet',  trait: 'Literal Obedience', desc: 'Builds exactly what you specify — no more, no less. Your precision determines the output quality.' },
      ],
      critical_insight: 'A brilliant developer who follows instructions too literally will build exactly what you asked — and exactly what you didn\'t mean. The same is true of AI. Your job is to leave no room for interpretation.',
      narration: 'The most effective mental model for working with AI is this: imagine you have just hired the most technically brilliant developer in the world. They know every language, every framework, every security pattern. They work at machine speed. They never complain. The only catch: they follow your instructions exactly as stated. If you say "build a login," they build A login — not the secure, scalable, business-aligned login you had in mind. Your job as the Lead is to give this developer a brief so complete that the output requires zero manual correction. That brief is your prompt.'
    },
    // SLIDE 7 — PROMPT Formula Overview
    {
      type: 'prompt_formula', icon: 'message-square-text',
      title: 'The P.R.O.M.P.T. Formula',
      subtitle: 'Your professional briefing framework — six guardrails that eliminate AI drift',
      pillars: [
        { letter: 'P', name: 'Purpose',  icon: 'target',           grad: PILLAR_GRAD[0], tagline: 'The WHY — what problem are you solving?',         example: '"Build a secure timesheet API replacing a broken Excel workflow"' },
        { letter: 'R', name: 'Role',     icon: 'user-cog',         grad: PILLAR_GRAD[1], tagline: 'WHO should AI act as?',                            example: '"Act as a Senior Node.js security architect"' },
        { letter: 'O', name: 'Output',   icon: 'layout-template',  grad: PILLAR_GRAD[2], tagline: 'WHAT SHAPE should the result take?',               example: '"Express route + OpenAPI spec + Jest tests"' },
        { letter: 'M', name: 'Marker',   icon: 'shield-alert',     grad: PILLAR_GRAD[3], tagline: 'WHERE NOT TO GO — hard constraints & guardrails',  example: '"Prevent SQL injection. Enforce JWT auth. No plaintext."' },
        { letter: 'P', name: 'Pattern',  icon: 'layers',           grad: PILLAR_GRAD[4], tagline: 'HOW TO STRUCTURE the output internally',           example: '"Controller → Service → Repository pattern"' },
        { letter: 'T', name: 'Tone',     icon: 'smile',            grad: PILLAR_GRAD[5], tagline: 'HOW TO COMMUNICATE — style and register',          example: '"Production-ready code with JSDoc comments"' },
      ],
      memory_hook: 'Six letters. Six guardrails. Miss one and the AI has room to drift. Cover all six and the output is yours by design — not by luck.',
      narration: 'The P.R.O.M.P.T. formula is the core professional tool of every OrchestrAI Lead. It is not a suggestion — it is a non-negotiable framework that sits between your business intent and the AI generation engine. Each letter represents a specific category of constraint. Together they form a complete brief that eliminates the AI\'s ability to hallucinate, drift, or produce structurally incorrect output. Miss any one pillar and you have created an opening for the AI to make a decision on your behalf — and that decision may be wrong.'
    },
    // SLIDE 8 — PROMPT Deep: P + R
    {
      type: 'prompt_deep', icon: 'target',
      title: 'Deep Dive: Purpose & Role',
      subtitle: 'Pillars 1 & 2 — the stage-setting foundation of every AI brief',
      pillars: [
        {
          letter: 'P', name: 'Purpose', grad: PILLAR_GRAD[0],
          tagline: 'Define the WHY with measurable precision',
          rules: ['State the business problem being solved — not the technical task', 'Include scale and context (e.g., "50,000 daily users")', 'Reference the system it integrates with'],
          bad: '"Build me a login screen."',
          good: '"Build a secure, JWT-authenticated login API for a B2B SaaS platform handling 50,000 daily enterprise users, integrating with our existing PostgreSQL user schema."',
          bad_outcome: 'AI builds a generic login with no scale, security, or schema awareness.',
          good_outcome: 'AI calibrates for scale, selects correct JWT config, and respects existing schema.',
        },
        {
          letter: 'R', name: 'Role', grad: PILLAR_GRAD[1],
          tagline: 'Unlock specialist capabilities — activate the right expertise',
          rules: ['Specify domain of expertise (e.g., "backend security architect")', 'Include the technology stack in the role definition', 'Set seniority — it calibrates the depth of response'],
          bad: '"Build the API."',
          good: '"Act as a Senior Node.js backend architect specializing in financial data APIs and OWASP security compliance."',
          bad_outcome: 'AI responds as a generalist. Generic patterns, no security depth.',
          good_outcome: 'AI responds as a specialist. Applies OWASP controls and enterprise-grade patterns.',
        },
      ],
      narration: 'Purpose and Role work together to set the quality ceiling for everything that follows. Purpose answers: what problem are we solving, and in what context? Role answers: who is the AI being in this conversation? A vague purpose paired with no role produces a junior-level generic response. A precise purpose paired with a domain-expert role produces a senior-level, context-aware, enterprise-grade response. In production delivery, the difference between these two outputs can mean passing or failing a security audit.'
    },
    // SLIDE 9 — PROMPT Deep: O + M
    {
      type: 'prompt_deep', icon: 'layout-template',
      title: 'Deep Dive: Output & Marker',
      subtitle: 'Pillars 3 & 4 — the most underspecified and most critical pillars',
      pillars: [
        {
          letter: 'O', name: 'Output', grad: PILLAR_GRAD[2],
          tagline: 'Specify the exact form of every artifact you receive',
          rules: ['Define file type and structure (e.g., "Express route file")', 'Specify what is included: route + validation + tests + docs', 'State the format of any accompanying documentation'],
          bad: '"Give me the API code."',
          good: '"Output: (1) Express route with middleware chain, (2) Joi validation schema, (3) Jest unit tests with 100% coverage of happy + error paths, (4) OpenAPI 3.0 spec block."',
          bad_outcome: 'AI gives one file, no tests, no docs. You write the rest manually.',
          good_outcome: 'AI generates all four artifacts simultaneously. Zero manual follow-up.',
        },
        {
          letter: 'M', name: 'Marker', grad: PILLAR_GRAD[3],
          tagline: 'Set the fence lines — the AI cannot cross these constraints',
          rules: ['Explicitly name OWASP vulnerabilities to prevent', 'State what the AI must NOT do (as important as what it must do)', 'Define performance, compliance, or data governance limits'],
          bad: '"Make it secure."',
          good: '"Markers: Prevent SQL injection via parameterized queries only. Enforce JWT claim validation — userId in token must match :userId param. Never return password fields. Rate-limit: 100 req/min per user."',
          bad_outcome: 'AI makes its own interpretation of "secure." May miss critical constraints.',
          good_outcome: 'Every stated constraint enforced. Audit-ready from day one.',
        },
      ],
      narration: 'Output and Marker are the two most underspecified pillars in practice, and the two most critical for enterprise delivery. Output tells the AI what to produce — not just the primary code artifact, but every supporting file, test, and documentation block. Marker is the fence line around the AI\'s workspace. The brutal reality: what you don\'t specify, the AI decides. And AI decisions about security architecture are not appropriate to leave to chance.'
    },
    // SLIDE 10 — PROMPT Deep: P + T
    {
      type: 'prompt_deep', icon: 'layers',
      title: 'Deep Dive: Pattern & Tone',
      subtitle: 'Pillars 5 & 6 — what elevates output from "working code" to "production artifact"',
      pillars: [
        {
          letter: 'P', name: 'Pattern', grad: PILLAR_GRAD[4],
          tagline: 'Enforce your internal architecture standard',
          rules: ['Specify the design pattern (MVC, Repository, Clean Architecture)', 'Define folder structure expectations if relevant', 'Reference existing patterns in your codebase for consistency'],
          bad: '"Organize the code properly."',
          good: '"Pattern: Strict Controller → Service → Repository separation. One function per module file. All DB access exclusively through Repository layer. Zero business logic in controllers."',
          bad_outcome: 'AI chooses any pattern it prefers. Future code is inconsistent with your codebase.',
          good_outcome: 'Every generated file slots perfectly into your existing architecture. Zero refactoring.',
        },
        {
          letter: 'T', name: 'Tone', grad: PILLAR_GRAD[5],
          tagline: 'Control the communication register of every output',
          rules: ['Specify documentation style (JSDoc, inline, README)', 'Define code comment density: critical paths only vs. fully annotated', 'Set client-facing communication register for any reports'],
          bad: '"Add some comments."',
          good: '"Tone: Fully annotated with JSDoc on every exported function. Professional enterprise English. Error messages must be user-safe — no stack traces or internal paths. README in markdown with setup, env vars, and API contract."',
          bad_outcome: 'Random comments, no README. Error messages expose internal stack traces.',
          good_outcome: 'Production-ready documentation. Client-deliverable from day one.',
        },
      ],
      narration: 'The final two pillars elevate output from "working code" to "production-grade, client-deliverable artifacts." Pattern ensures every generated file plugs into your architecture without refactoring. If your codebase follows a layered architecture, the Pattern pillar enforces it on every generated file. Tone controls the communication register of everything — from code comments to error messages to client-facing documentation. An enterprise client should never see a raw stack trace in an error response. Tone is what prevents that.'
    },
    // SLIDE 11 — Case Study: Vacation Planner
    {
      type: 'case_study', icon: 'map',
      title: 'P.R.O.M.P.T. in Action: Vacation Planner',
      subtitle: 'A beginner case study — from vague request to precision-engineered output',
      scenario: 'Task: Plan a 5-day family vacation to Bali for 4 people within a ₹80,000 total budget.',
      vague_prompt: '"Plan a trip to Bali for me."',
      vague_result: 'Generic article-style text. 3 popular beaches listed with no budget. No day-by-day structure. Requires 3–4 hours of manual research to make actionable.',
      breakdown: [
        { pillar: 'P — Purpose',  value: 'Plan a 5-day family vacation to Bali for 4 people' },
        { pillar: 'R — Role',     value: 'Expert Tour Planner with 10 years Asia family travel experience' },
        { pillar: 'O — Output',   value: 'Day-by-day markdown table: Morning / Afternoon / Evening slots + costs' },
        { pillar: 'M — Marker',   value: 'Total budget ₹80,000. No adventure sports. Child-safe activities only.' },
        { pillar: 'P — Pattern',  value: 'Each day: main activity + meal recommendation + estimated daily cost' },
        { pillar: 'T — Tone',     value: 'Friendly, practical, parent-focused language' },
      ],
      engineered_result: 'Ready-to-use 5-day itinerary table. Budget tracked per day. All activities family-safe. Zero manual restructuring. Copy-paste ready for the client.',
      narration: 'Let\'s make the framework concrete with a relatable example before enterprise scenarios. A vague request — "plan a trip to Bali" — produces a generic article-style response that requires hours of manual restructuring before it\'s useful. Now apply the full P.R.O.M.P.T. framework. You have a precise Purpose, a specialist Role, a structured Output format, clear Markers for budget and safety, a Pattern for each day\'s content, and a family-friendly Tone. The output is a copy-paste ready itinerary. The difference between the two approaches is the difference between a starting point and a deliverable.'
    },
    // SLIDE 12 — Case Study: Enterprise API
    {
      type: 'case_study_enterprise', icon: 'shield',
      title: 'P.R.O.M.P.T. in Action: Enterprise Security API',
      subtitle: 'The formula applied to a real backend security scenario with OWASP compliance',
      scenario: 'Task: Replace a broken Excel timesheet workflow with a secure cloud API — GET /api/timesheets/:userId',
      vague_prompt: '"Build an API to get timesheet data for a user."',
      vulnerabilities: [
        'No authentication — any caller can query any userId (Broken Access Control)',
        'SQL built by string concatenation — SQL Injection exploitable',
        'Returns raw DB rows — exposes internal schema and sensitive fields',
        'No rate limiting — vulnerable to data enumeration attacks',
      ],
      engineered_prompt: [
        { pillar: 'Purpose', value: 'Fetch total hours logged by a specific employee for the current pay period via GET /api/timesheets/:userId — replacing a broken Excel export used by 200 employees.' },
        { pillar: 'Role',    value: 'Senior Node.js backend security architect with OWASP certification and financial data API experience.' },
        { pillar: 'Output',  value: '(1) Express route file + JWT middleware, (2) Joi input validation, (3) Jest tests: auth bypass, SQL injection, valid request.' },
        { pillar: 'Marker',  value: 'JWT claim must match :userId param — prevent cross-tenant access. Parameterized Knex queries ONLY. Rate-limit: 60 req/min. Never expose raw DB errors.' },
        { pillar: 'Pattern', value: 'Controller → Service → Repository. Validation in middleware. All DB calls in Repository only.' },
        { pillar: 'Tone',    value: 'JSDoc on all exported functions. Error messages: client-safe strings. No internal paths in responses.' },
      ],
      narration: 'Now the same task applied to an enterprise backend. With a vague prompt, you get working code with four critical security vulnerabilities — each one would fail a standard security audit. With the full P.R.O.M.P.T. framework, all four vulnerabilities are addressed before a single line of code is generated. The output is audit-ready from day one. This is the compounding value of the framework: each pillar eliminates an entire category of production risk.'
    },
    // SLIDE 13 — Daily Cadence
    {
      type: 'day_in_life', icon: 'clock',
      title: 'The Daily Cadence of the Lead',
      subtitle: 'From raw intent to live client demo — in a single business day',
      visual_chart: {
        chart_type: 'timeline_gantt', title: 'Phase Distribution',
        groups: [
          { label: 'Morning: Audit & Generate', pct: 40, color: 'from-indigo-600 to-violet-600' },
          { label: 'Midday: Demo & Evolve',     pct: 45, color: 'from-violet-600 to-pink-600' },
          { label: 'EOD: Commit & Document',    pct: 15, color: 'from-emerald-600 to-teal-500' },
        ]
      },
      schedule: [
        { time: '08:30', icon: 'search',        task: 'Audit generated artifacts from overnight runs: code quality, test results, documentation accuracy' },
        { time: '09:00', icon: 'users',          task: 'Intent sharpening session with Business SME — crystallize requirements for today\'s generation sprint' },
        { time: '09:30', icon: 'edit-3',         task: 'Translate business intent into structured P.R.O.M.P.T. sets — one per feature or component' },
        { time: '10:30', icon: 'check-circle',   task: 'Validate AI outputs against acceptance criteria — the Lead is the final quality gate before merge' },
        { time: '11:30', icon: 'presentation',   task: 'Live UAT demo to client stakeholders of working functional screens — not mockups, live code' },
        { time: '14:00', icon: 'zap',            task: 'Evolve session: implement client feedback as refined prompt iterations — same-day turnaround' },
        { time: '16:30', icon: 'git-commit',     task: 'Structured commit of reviewed, validated code to version control with living documentation' },
        { time: '17:00', icon: 'book-open',      task: 'Update architectural decision records and living technical documentation for the client file' },
      ],
      narration: 'This is the operational heartbeat of the OrchestrAI Lead. Your day is structured around tight validation cycles, not open-ended coding sessions. By eleven-thirty in the morning, you are not just showing prototypes — you are demonstrating live, functional screens. By end of day, client feedback from the afternoon demo has already been implemented. This velocity is impossible in traditional delivery because it depends on manual human execution. When AI handles execution, the Lead\'s job becomes surgical: precise intent in, validated artifact out, repeat.'
    },
    // SLIDE 14 — 7-Day Sprint Map
    {
      type: 'sprint_map', icon: 'zap',
      title: 'The 7-Day OrchestrAI Sprint Blueprint',
      subtitle: 'From blank page to production-baselined system in one working week',
      days: [
        { day: 1, theme: 'Foundation',    color: 'indigo', icon: 'layers',        items: ['System architecture intent doc', 'DB schema specification', 'API contract draft'] },
        { day: 2, theme: 'Core Backend',  color: 'blue',   icon: 'code-2',        items: ['Auth service', 'Core data models + migrations', 'CRUD APIs for primary entities'] },
        { day: 3, theme: 'Business Logic',color: 'cyan',   icon: 'brain',         items: ['Business rule engine', 'Validation layers', 'Integration service stubs'] },
        { day: 4, theme: 'Frontend',      color: 'emerald',icon: 'layout-template',items: ['All primary UI flows', 'API integration complete', 'Error handling'] },
        { day: 5, theme: 'Security & QA', color: 'amber',  icon: 'shield',        items: ['OWASP scan pass', 'Unit + integration tests', 'Performance baseline'] },
        { day: 6, theme: 'UAT & Polish',  color: 'orange', icon: 'users',         items: ['Live client UAT session', 'UI polish from feedback', 'Docs finalized'] },
        { day: 7, theme: 'Baseline',      color: 'violet', icon: 'award',         items: ['Production deploy', 'Stakeholder demo', 'Handover documentation'] },
      ],
      note: '75–80% production-ready baseline. Remaining 20% iterated in weekly sprints post-launch.',
      narration: 'The seven-day sprint is not a theoretical target — it is a repeatable, documented delivery pattern. Day one establishes the intent architecture before a single feature line is written. Days two through four build the core application in layers. Day five applies security and quality validation. Day six runs a live client UAT demo and implements feedback the same day. Day seven delivers the production baseline at seventy-five to eighty percent production readiness — immediately deployable and demonstrable.'
    },
    // SLIDE 15 — Competencies
    {
      type: 'competencies', icon: 'gauge',
      title: 'The 5 Core Lead Competencies',
      subtitle: 'The instrument panel every OrchestrAI Lead monitors simultaneously',
      analogy_line: 'A pilot reads five instruments simultaneously — miss one and the flight is at risk even if the other four look perfect.',
      list: [
        { name: 'Intent Articulation',    icon: 'target',        grad: PILLAR_GRAD[0], desc: 'Translating raw business requirements into precise, unambiguous P.R.O.M.P.T. specifications that leave the AI no room to interpret incorrectly.', gate: 'Could this prompt be given to two AI engines and produce the same result?' },
        { name: 'Constraint Definition',  icon: 'shield-alert',  grad: PILLAR_GRAD[3], desc: 'Proactively identifying all edge cases, security requirements, and non-functional constraints before generation begins — not after.', gate: 'Does every Marker explicitly name a vulnerability or constraint category?' },
        { name: 'Validation Discipline',  icon: 'check-circle',  grad: PILLAR_GRAD[2], desc: 'Systematic, criteria-based evaluation of every AI-generated artifact against business acceptance criteria. The Lead is the final quality gate.', gate: 'Has every acceptance criterion been tested against the generated output?' },
        { name: 'Escalation Judgment',    icon: 'alert-octagon', grad: PILLAR_GRAD[4], desc: 'Knowing when a problem requires a human architectural decision rather than a prompt refinement — and acting on that judgment without hesitation.', gate: 'Is this a prompt problem or a design problem?' },
        { name: 'Governance Awareness',   icon: 'scale',         grad: PILLAR_GRAD[5], desc: 'Operational command of the OGE framework: Observability (is AI behavior visible?), Guardrails (are constraints enforced?), Evaluation (are outputs measured?).', gate: 'Can you audit every AI decision in the system?' },
      ],
      narration: 'These five competencies are not a checklist to complete — they are a panel to monitor continuously throughout every engagement. A Lead who excels at intent articulation but neglects validation discipline will ship beautifully specified but unvalidated code. Mastery means all five are operating near full capacity simultaneously. Think of it as five cockpit instruments — you read all five, all the time.'
    },
    // SLIDE 16 — Anti-Patterns
    {
      type: 'anti_patterns', icon: 'alert-triangle',
      title: 'Anti-Patterns: The Most Costly Mistakes',
      subtitle: 'These four patterns cause 90% of OrchestrAI engagement failures',
      dont_items: [
        { icon: 'x-circle', title: '"Figure it out" prompts',         desc: '"Build a payment system." — No context, no constraints, no role. AI will hallucinate a plausible-but-wrong solution.' },
        { icon: 'x-circle', title: 'Skipping security Markers',       desc: 'Assuming AI defaults to OWASP compliance. It does not. Every vulnerability must be named explicitly in the Marker pillar.' },
        { icon: 'x-circle', title: 'Mid-generation requirement drift', desc: 'Changing requirements after generation has started forces complete re-generation. Crystallize fully before triggering any prompt.' },
        { icon: 'x-circle', title: 'Deploying without validation',    desc: 'AI output is a first draft. Every artifact must pass acceptance criteria validation before entering the codebase.' },
      ],
      do_items: [
        { icon: 'check-circle', title: 'Complete the 6-pillar brief first', desc: 'Draft all six P.R.O.M.P.T. pillars before running any generation. 20 minutes of briefing saves 2+ hours of correction.' },
        { icon: 'check-circle', title: 'Name vulnerabilities explicitly',   desc: 'List every OWASP control you need as a named Marker. SQL injection, broken access control, SSRF — name them all.' },
        { icon: 'check-circle', title: 'Crystallize before generating',     desc: 'Run a 15-minute intent validation session with your SME before every major generation sprint. Non-negotiable discipline.' },
        { icon: 'check-circle', title: 'Validate every artifact',           desc: 'Apply the same acceptance criteria discipline you would apply to any developer\'s pull request. AI is not exempt from code review.' },
      ],
      narration: 'These anti-patterns are the documented root causes of OrchestrAI engagements that underperformed. The most common: vague prompts that produce plausible-but-wrong outputs requiring more time to correct than rebuilding from scratch. The pattern is always the same — a shortcut in the brief becomes an expensive correction in production. Every minute invested in a complete six-pillar prompt saves thirty minutes to two hours of downstream correction.'
    },
    // SLIDE 17 — Key Takeaways
    {
      type: 'key_takeaways', icon: 'award',
      title: 'Module 1: Key Takeaways',
      subtitle: 'Your foundational principles as a certified OrchestrAI Lead',
      takeaways: [
        { num: '01', color: 'indigo',  title: 'Your value is in your intent',                     desc: 'A precisely specified prompt is worth more than 500 lines of manually written code. Leave no room for AI interpretation.' },
        { num: '02', color: 'violet',  title: 'P.R.O.M.P.T. is non-negotiable',                  desc: 'All six pillars must be completed before any generation session begins. Incomplete briefs produce incomplete outputs.' },
        { num: '03', color: 'emerald', title: 'Quality is upstream, not downstream',              desc: 'The Lead is the quality gate before generation, not after. Every acceptance criterion must be defined in the prompt.' },
        { num: '04', color: 'amber',   title: 'Validation discipline is mandatory',               desc: 'Every AI-generated artifact must be validated against acceptance criteria before it enters the codebase.' },
        { num: '05', color: 'cyan',    title: '7 days is the standard, not the exception',        desc: 'A fully crystallized intent architecture produces a 75-80% production-ready baseline in seven working days.' },
      ],
      cta: 'Complete the Module 1 Assessment below to validate your understanding and unlock Module 2.',
      narration: 'Before you move to the assessment, let\'s consolidate the five foundational principles of Module 1. First: your professional value is now measured by the precision of your intent, not the volume of your code. Second: the P.R.O.M.P.T. formula is the structural tool that gives that intent form. Third: quality is a first-prompt discipline. Fourth: validation is mandatory — AI output is a first draft. Fifth: seven working days to a production baseline is the expected standard. These five principles are the foundation of every module that follows.'
    },
    // SLIDE 18 — Interactive Quiz Engine (splits into quiz + prompt_eval)
    {
      type: 'interactive_quiz_engine', icon: 'clipboard-check',
      title: 'Module 1 Assessment: Interactive Exam Engine',
      subtitle: 'Dynamic Evaluation Gate',
      quiz_ui_package: {
        multiple_choice_items: [
          { id: 'q1', text: 'What is the primary operational difference between an OrchestrAI Lead and a traditional PM?', choices: [{ value: 'A', text: 'The Lead writes more lines of manual code than the traditional PM.' }, { value: 'B', text: 'The Lead manages sprint velocities, while the PM manages the client relationship.' }, { value: 'C', text: 'The Lead focuses on architectural intent articulation and outcome validation; the PM on legacy milestone tracking.' }, { value: 'D', text: 'There is no functional operational difference between the two.' }], correct_answer: 'C', explanation: 'An OrchestrAI Lead acts as the absolute quality gate and architect of intent, transforming raw client requests into clear AI parameters — not tracking sprint logs.' },
          { id: 'q2', text: 'Under the OrchestrAI framework, when must application engineering requirements be fully crystallized?', choices: [{ value: 'A', text: 'Continuously during the downstream QA and user-acceptance phases.' }, { value: 'B', text: 'Upstream, before the AI engine executes any prompt generation commands.' }, { value: 'C', text: 'At the tail-end of a three-month development milestone loop.' }, { value: 'D', text: 'Incrementally as manual developers begin writing baseline backend modules.' }], correct_answer: 'B', explanation: 'Requirements must be fully crystallized upstream before any generation session begins. Quality is engineered from the first prompt — not discovered in QA.' },
          { id: 'q3', text: 'How does the OrchestrAI model handle application system engineering documentation?', choices: [{ value: 'A', text: 'It is generated automatically in real time as a living byproduct alongside the code.' }, { value: 'B', text: 'It is compiled manually at the project\'s closing phase by technical writers.' }, { value: 'C', text: 'It is skipped entirely to ensure the MVP is deployed in 7 days.' }, { value: 'D', text: 'It is delayed until the client submits an engine change request.' }], correct_answer: 'A', explanation: 'OrchestrAI eliminates documentation debt by generating accurate technical docs concurrently with the application artifacts.' },
          { id: 'q4', text: 'Which element of the P.R.O.M.P.T. formula directly enforces architectural guardrails, edge cases, and compliance boundaries?', choices: [{ value: 'A', text: 'Purpose' }, { value: 'B', text: 'Role' }, { value: 'C', text: 'Marker' }, { value: 'D', text: 'Pattern' }], correct_answer: 'C', explanation: 'The Marker defines strict constraints, budget boundaries, non-functional demands, and explicit exclusions that prevent AI engines from drifting.' },
          { id: 'q5', text: 'What is the standard MVP baseline completion timeline using the OrchestrAI framework?', choices: [{ value: 'A', text: '3 to 6 months of continuous development team cycles.' }, { value: 'B', text: '7 working days to a production-baselined 75-80% quality system.' }, { value: 'C', text: 'A single continuous 24-hour rapid hacking marathon.' }, { value: 'D', text: '45 days including comprehensive manual QA remediation.' }], correct_answer: 'B', explanation: 'OrchestrAI targets a 75-80% operational quality baseline within its first week, bypassing standard alpha/beta bottlenecks.' },
          { id: 'q6', text: 'What is the core definition of "Validation Discipline" for an OrchestrAI Lead?', choices: [{ value: 'A', text: 'Allowing the autonomous system to deploy code directly to production without checks.' }, { value: 'B', text: 'The human-led, systematic verification of generated AI artifacts against business acceptance criteria.' }, { value: 'C', text: 'Delegating all evaluation metrics to an external legacy QA team.' }, { value: 'D', text: 'Writing automated unit tests after production code has run for a week.' }], correct_answer: 'B', explanation: 'Only rigorous human inspection validates that business constraints and technical rules are fully implemented — the Lead is the final quality gate.' },
          { id: 'q7', text: 'In the P.R.O.M.P.T. formula, specifying "Express route + Joi validation + Jest tests + OpenAPI spec" as requirements represents which pillar?', choices: [{ value: 'A', text: 'Tone' }, { value: 'B', text: 'Purpose' }, { value: 'C', text: 'Output' }, { value: 'D', text: 'Role' }], correct_answer: 'C', explanation: 'The Output parameter specifies the exact form of every artifact to receive — eliminating all manual follow-up generation work.' },
          { id: 'q8', text: 'How are unexpected mid-sprint change requests managed under the OrchestrAI paradigm?', choices: [{ value: 'A', text: 'They are placed in a deep backlog to be estimated during next quarter planning.' }, { value: 'B', text: 'They are rejected because automated platforms cannot process mid-stream changes.' }, { value: 'C', text: 'They are expressed in precise plain-English intent and implemented into production the same day.' }, { value: 'D', text: 'They require a complete human code refactor of all previous module releases.' }], correct_answer: 'C', explanation: 'Changes described in precise plain English are injected directly into the active prompt model, dropping implementation cost to a single day.' },
          { id: 'q9', text: 'What major enterprise risk is neutralized when engineering knowledge lives in an AI model rather than with a single human developer?', choices: [{ value: 'A', text: 'Cloud network routing latency risk.' }, { value: 'B', text: 'Key Person Risk.' }, { value: 'C', text: 'Choice of relational database compiler risk.' }, { value: 'D', text: 'Client contract billing cycles risk.' }], correct_answer: 'B', explanation: 'When system logic is defined via transparent prompt templates in an AI model, the knowledge base is corporate property — not trapped in one human\'s head.' },
          { id: 'q10', text: 'What is the systematic consequence of using generic, unconstrained instructions like "Build an application module"?', choices: [{ value: 'A', text: 'The generation engine runs out of allocated cloud storage boundaries.' }, { value: 'B', text: 'Immediate "Garbage In, Garbage Out" failures: unconstrained, hallucinated, or uncompilable artifacts.' }, { value: 'C', text: 'Too much technical architecture documentation is written concurrently.' }, { value: 'D', text: 'The application automatically switches to legacy language syntax.' }], correct_answer: 'B', explanation: 'Without roles, markers, structures, and precise scope definitions, AI engines drift — generating generic solutions that require more time to correct than rebuilding from scratch.' },
        ],
        dynamic_applied_scenario: {
          id: 'q11', label: 'Question 11 of 11 (Applied Engineering Lab)',
          context: 'Scenario: Replace a broken Excel sheet workflow with a cloud-native backend route `/api/timesheets` to fetch hours for a specific user ID.',
          requirement: 'Write an enterprise-grade prompt block applying the full P.R.O.M.P.T. blueprint. Your prompt must enforce security mitigations neutralizing: SQL Injection, Broken Access Control, and Cross-Tenant Data Leaks.',
          logic_engine_validation: {
            regex_required_tokens: ['Purpose', 'Role', 'Output', 'Marker', 'Pattern', 'Tone'],
            security_tokens: ['SQL injection', 'access control', 'cross-tenant'],
          }
        }
      },
      narration: 'Excellent work completing the lesson slides. The Interactive Exam Engine will now validate your understanding across ten multiple-choice questions — each one tying back to the analogies from this module. After the MCQ section, the Applied Engineering Lab challenges you to write a production-grade prompt that enforces enterprise security constraints. Go through each question carefully and click Submit Answers when you\'re ready.'
    }
  ],
  2: [
    { type: 'hero_welcome', icon: 'rocket', title: 'OrchestrAI Framework Architecture', tagline: '"Principles that make AI-accelerated delivery robust and secure."', subtitle: 'Module 2 · Framework & Lifecycle', hero_stat: { value: '6 Stages', label: 'The complete delivery lifecycle loop', note: 'Intent → Deploy, repeated.' }, promises: [{ icon: 'layers', color: PILLAR_GRAD[0], title: 'Principles', desc: 'The six core rules of OrchestrAI delivery' }, { icon: 'refresh-cw', color: PILLAR_GRAD[2], title: 'Lifecycle', desc: 'The six-stage loop from Intent to Deploy' }, { icon: 'shield', color: PILLAR_GRAD[3], title: 'Security', desc: 'Guardrails and governance built in from day one' }], analogy: 'Module 2 builds the structural skeleton. Module 1 gave you the mindset. Now we build the architecture around it.', narration: 'Welcome to Module 2: The OrchestrAI Framework Architecture. Here we establish the structural principles of our delivery model.' },
    { type: 'competencies', icon: 'gauge', title: '2.1 The Six Core Principles', subtitle: 'The guiding rules that govern every OrchestrAI delivery pipeline', list: [{ name: 'AI as Primary Builder', icon: 'brain', grad: PILLAR_GRAD[0], desc: 'The AI engine writes all code, schemas, and tests. The Lead never codes directly.' }, { name: 'Human as Orchestrator', icon: 'users', grad: PILLAR_GRAD[1], desc: 'Humans make all strategic decisions, define all boundaries, and approve all outputs.' }, { name: 'Plain-English Driven', icon: 'message-square-text', grad: PILLAR_GRAD[2], desc: 'Precision statements specify constraints instead of manual coding sessions.' }, { name: 'Continuous Delivery', icon: 'zap', grad: PILLAR_GRAD[3], desc: 'Continuous code baselining replaces long release sprint intervals.' }], narration: 'Our architecture relies on six core principles, primarily positioning AI as the builder while the human acts as the orchestrator.' },
    { type: 'day_in_life', icon: 'refresh-cw', title: '2.2 The Six-Stage Lifecycle Loop', subtitle: 'The continuous product iteration engine — Intent to Deploy', visual_chart: { chart_type: 'timeline_gantt', title: 'Lifecycle Stages', groups: [{ label: 'Intent → Generate', pct: 50, color: 'from-indigo-600 to-cyan-600' }, { label: 'Validate → Evolve', pct: 35, color: 'from-violet-600 to-pink-600' }, { label: 'Deploy', pct: 15, color: 'from-emerald-600 to-teal-500' }] }, schedule: [{ time: 'Stage 1', icon: 'target', task: 'Intent: Express business needs, constraints, and acceptance criteria clearly.' }, { time: 'Stage 2', icon: 'edit-3', task: 'Orchestrate: Formulate P.R.O.M.P.T. sets and direct AI resources.' }, { time: 'Stage 3', icon: 'brain', task: 'Generate: Trigger the AI code generator engine with your complete brief.' }, { time: 'Stage 4', icon: 'check-circle', task: 'Validate: Review correctness, security logs, test results, and edge cases.' }, { time: 'Stage 5', icon: 'refresh-cw', task: 'Evolve: Incorporate feedback and refine prompts for the next iteration.' }, { time: 'Stage 6', icon: 'git-commit', task: 'Deploy: Publish validated features to production checkins with documentation.' }], narration: 'The lifecycle loop moves continuously from Intent to Orchestrate, Generate, Validate, Evolve, and Deploy.' },
    { type: 'key_takeaways', icon: 'clipboard-check', title: 'Module 2 Knowledge Check', subtitle: 'Self-Assessment Gate — reflect before proceeding', takeaways: [{ num: '01', color: 'indigo', title: 'The Six Core Principles', desc: 'Can you name all six core principles of the OrchestrAI architecture from memory?' }, { num: '02', color: 'violet', title: 'The Lifecycle Loop', desc: 'What are the six stages of the lifecycle loop, and what is the primary output of each stage?' }, { num: '03', color: 'emerald', title: 'Why No Manual Code?', desc: 'Why does the Lead never write code manually, even when a quick fix seems obvious?' }], cta: 'Launch the Module 2 Quiz Challenge when ready to validate and unlock Module 3.', narration: 'Reflect on these check questions before completing the module.' }
  ]
};

const getSlidesForModule = (moduleId: number, customSlides?: any[]) => {
  if (customSlides && customSlides.length > 0) return customSlides;
  if (DEFAULT_SLIDES_MAP[moduleId]) return DEFAULT_SLIDES_MAP[moduleId];
  const names: Record<number, string> = { 3: 'Intent Mastery', 4: 'Roles & Governance', 5: 'Live Iteration', 6: 'Observability', 7: 'Guardrails', 8: 'Evaluation & KPIs' };
  const n = names[moduleId] || `Module ${moduleId}`;
  return [
    { type: 'hero_welcome', icon: 'rocket', title: `Module ${moduleId}: ${n}`, tagline: '"Mastering the next level of OrchestrAI delivery."', subtitle: `Track Certified · ${n}`, hero_stat: { value: `Mod ${moduleId}`, label: n }, promises: [{ icon: 'target', color: PILLAR_GRAD[0], title: 'Learn', desc: `Core principles of ${n}` }, { icon: 'check-circle', color: PILLAR_GRAD[2], title: 'Apply', desc: 'Practical techniques in real engagements' }, { icon: 'award', color: PILLAR_GRAD[4], title: 'Certify', desc: 'Validate mastery with the assessment' }], analogy: `Module ${moduleId} builds on the foundations established in Modules 1 and 2.`, narration: `Welcome to Module ${moduleId}: ${n}.` },
    { type: 'key_takeaways', icon: 'clipboard-check', title: 'Module Summary', subtitle: 'Reflect before completing', takeaways: [{ num: '01', color: 'indigo', title: `Key objective of ${n}`, desc: 'What is the primary goal this module achieves in the OrchestrAI engagement?' }, { num: '02', color: 'violet', title: 'Defect measurement', desc: 'How do you measure defects escaping or alignment score indicators?' }, { num: '03', color: 'emerald', title: 'Security controls', desc: 'What are the required security controls for production deployment in this module?' }], cta: 'Complete the assessment to submit your progress.', narration: 'Reflect before completing this module.' },
  ];
};

const getQuizQuestions = (slide: any) => {
  if (Array.isArray(slide.questions) && slide.questions.length > 0 && typeof slide.questions[0] === 'object') return slide.questions;
  if (slide.question && Array.isArray(slide.options)) return [{ question: slide.question, options: slide.options, answer: slide.answer, explanation: slide.explanation }];
  return [];
};

const resolveToneValue = (val: any, tone: string): any => {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if ('conversational' in val || 'formal' in val || 'genz' in val || 'beginner' in val) {
      return val[tone] || val.conversational || '';
    }
    if (Array.isArray(val)) {
      return val.map(item => resolveToneValue(item, tone));
    }
    const resolved: any = {};
    for (const key of Object.keys(val)) {
      resolved[key] = resolveToneValue(val[key], tone);
    }
    return resolved;
  }
  return val;
};

const MUSIC_TRACKS: Record<string, string> = {
  intro_theme: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  outro_theme: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
};

export const TrainingPresenter: React.FC<TrainingPresenterProps> = ({ moduleId, onClose, onComplete }) => {
  const { systemConfig, addToast, recordSlideView, recordModuleComplete, recordQuizScore, recordLabComplete, currentUser, trackVisitorActivity } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [labPassed, setLabPassed] = useState(false);
  const [activeHour, setActiveHour] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, Record<number, number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [promptInput, setPromptInput] = useState<Record<number, string>>({});
  const [promptEvalResult, setPromptEvalResult] = useState<Record<number, { score: number; strengths: string[]; weaknesses: string[]; submitted: boolean }>>({});
  const [selectedTone, setSelectedTone] = useState<'conversational' | 'formal' | 'genz' | 'beginner' | null>(null);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [radarRatings, setRadarRatings] = useState<Record<string, number>>({
    "Intent Articulation": 3,
    "Quality Judgment": 3,
    "Stakeholder Translation": 3,
    "Iteration Discipline": 3,
    "Pattern Stewardship": 3
  });
  const [labAnswers, setLabAnswers] = useState<Record<string, Record<string, string>>>({});
  const [labSubmitted, setLabSubmitted] = useState<Record<string, boolean>>({});

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null); // Pre-rendered MP3 narration (per segment / slide)
  const activeAudioSlideRef = useRef<any>(null);
  const currentSegmentIndexRef = useRef<number>(0);
  const isPausedAudioRef = useRef<boolean>(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeTimersRef = useRef<number[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Listen for speech synthesis voices changed to ensure mobile compatibility
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // Stop background music on unmount
  useEffect(() => {
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []);

  const mediaConfig = systemConfig.moduleMedia?.[moduleId];
  const hasVideo = !!mediaConfig?.videoUrl;
  const videoUrl = mediaConfig?.videoUrl || '';
  const customSlides = systemConfig.moduleSlides?.[moduleId];

  useEffect(() => {
    if (!mediaConfig || !mediaConfig.hasPresets) {
      setSelectedTone('conversational');
    }
  }, [mediaConfig]);

  let slidesForSelectedTone: any[] = [];
  if (customSlides) {
    if (Array.isArray(customSlides)) {
      slidesForSelectedTone = customSlides;
    } else {
      const toneKey = selectedTone || 'conversational';
      slidesForSelectedTone = (customSlides as any)[toneKey] || (customSlides as any).conversational || [];
    }
  }
  const rawCoreSlides = getSlidesForModule(moduleId, slidesForSelectedTone) || [];
  const filteredRawCoreSlides = rawCoreSlides.filter(s => s && s.type && s.type !== 'tone_selector');

  // Expand quiz engine slides
  const coreSlides: any[] = [];
  filteredRawCoreSlides.forEach((slide) => {
    if (!slide) return;
    if (slide.type === 'interactive_quiz_engine') {
      if (slide.quiz_ui_package?.multiple_choice_items) {
        coreSlides.push({
          title: slide.title || 'Module Assessment: Quiz', subtitle: 'Questions 1–10 of 11 (Multiple Choice)', type: 'quiz',
          questions: slide.quiz_ui_package.multiple_choice_items.map((item: any) => ({
            question: item.text, options: item.choices.map((c: any) => `${c.value}. ${c.text}`),
            answer: item.choices.findIndex((c: any) => c.value === item.correct_answer), explanation: item.explanation
          })), narration: slide.narration || ''
        });
      } else if (Array.isArray(slide.questions)) {
        coreSlides.push({
          title: slide.title || 'Module Assessment: Quiz',
          subtitle: slide.subtitle || 'Module Assessment (Multiple Choice)',
          type: 'quiz',
          questions: slide.questions.map((item: any) => ({
            question: item.question,
            options: item.choices || [],
            answer: Array.isArray(item.choices) ? item.choices.indexOf(item.correct_answer) : -1,
            explanation: item.explanation || ''
          })),
          narration: slide.narration || ''
        });
      }
      if (slide.quiz_ui_package?.dynamic_applied_scenario) {
        const sc = slide.quiz_ui_package.dynamic_applied_scenario;
        coreSlides.push({ title: 'Question 11: Applied Engineering Lab', subtitle: sc.label || 'Practical Prompt Challenge', type: 'prompt_evaluation', scenario: `${sc.context}\n\nRequirement: ${sc.requirement}`, validation: sc.logic_engine_validation, narration: 'Write an enterprise-grade prompt applying the full P.R.O.M.P.T. blueprint with security constraints.' });
      }
    } else { coreSlides.push(slide); }
  });

  const slides = [...coreSlides];

  const rawTotalSlides = hasVideo && videoUrl
    ? [{ title: 'Intro Lecture Video', subtitle: `Module ${moduleId} Video Briefing`, type: 'video', narration: 'Please watch this introductory briefing video.' }, ...slides]
    : slides;
  const totalSlides = (rawTotalSlides || [])
    .filter(s => s !== null && s !== undefined)
    .map(s => resolveToneValue(s, selectedTone || 'conversational'));
  const slidesCount = totalSlides.length;

  // Background Music player effect
  useEffect(() => {
    const slide = totalSlides[currentSlide];
    const musicConfig = slide?.background_music;

    const stopBgMusic = (fadeMs = 1000) => {
      const audio = bgAudioRef.current;
      if (!audio) return;
      
      try {
        let volume = audio.volume;
        const interval = 50;
        const step = volume / (fadeMs / interval || 1);
        const fadeTimer = setInterval(() => {
          if (audio.volume > step) {
            audio.volume -= step;
          } else {
            clearInterval(fadeTimer);
            audio.pause();
            audio.currentTime = 0;
            bgAudioRef.current = null;
          }
        }, interval);
      } catch (e) {
        console.error("Error stopping bg music:", e);
        audio.pause();
        bgAudioRef.current = null;
      }
    };

    if (musicConfig && musicConfig.track_key) {
      const trackUrl = MUSIC_TRACKS[musicConfig.track_key];
      if (trackUrl) {
        if (bgAudioRef.current && bgAudioRef.current.src === trackUrl) {
          if (isPlayingAudio && !isPausedAudio) {
            bgAudioRef.current.volume = (musicConfig.duck_volume_percent || 15) / 100 * 0.3;
          } else {
            bgAudioRef.current.volume = 0.3;
          }
        } else {
          if (bgAudioRef.current) {
            bgAudioRef.current.pause();
          }

          const audio = new Audio(trackUrl);
          audio.loop = true;
          audio.volume = 0;
          bgAudioRef.current = audio;

          audio.play().then(() => {
            const fadeMs = musicConfig.fade_in_ms || 1000;
            const targetVolume = 0.3;
            const interval = 50;
            const step = targetVolume / (fadeMs / interval || 1);
            const fadeTimer = setInterval(() => {
              if (audio.volume < targetVolume - step) {
                audio.volume += step;
              } else {
                audio.volume = targetVolume;
                clearInterval(fadeTimer);
                if (isPlayingAudio && !isPausedAudio) {
                  audio.volume = (musicConfig.duck_volume_percent || 15) / 100 * targetVolume;
                }
              }
            }, interval);
          }).catch(err => {
            console.error("Failed to play background music:", err);
          });
        }
      } else {
        stopBgMusic(musicConfig.fade_out_ms || 1000);
      }
    } else {
      stopBgMusic(1000);
    }
  }, [currentSlide, totalSlides, isPlayingAudio, isPausedAudio]);

  const getSlideDuration = (slide: any): number => {
    if (slide.estimated_duration_seconds) return slide.estimated_duration_seconds;
    let text = '';
    if (Array.isArray(slide.narration_script) && slide.narration_script.length > 0) {
      text = slide.narration_script.map((s: any) => s.text).join(' ');
    } else {
      text = slide.narration || '';
    }
    // Estimate: ~15 characters per second (roughly 150 words per minute)
    return Math.max(5, Math.ceil(text.length / 15));
  };

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectVoice = (voiceKey: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
    const vk = voiceKey.toLowerCase();
    const isMale = !vk.includes('female') && (vk.includes('male') || vk.includes('dev') || vk.includes('kai') || vk.includes('ravi') || vk.includes('beginner') || vk.includes('arjun') || vk.includes('host_male'));

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    if (enVoices.length === 0) return voices[0];

    // Google Android TTS encodes gender into the voiceURI:
    //   en-us-x-iom-*, en-us-x-iol-*, en-us-x-sfg-*  → MALE
    //   en-us-x-tpc-*, en-us-x-tpf-*                  → FEMALE
    // We match these patterns first because on Android the human-readable `name` is often
    // just "English (United States)" with no gender hint — name-only matching fails there.
    const maleUriCodes = ['x-iom', 'x-iol', 'x-sfg', 'x-iog', 'x-ios'];
    const femaleUriCodes = ['x-tpc', 'x-tpf', 'x-tpd', 'x-tph'];

    const matchByUri = (v: SpeechSynthesisVoice, codes: string[]) => {
      const uri = (v.voiceURI || '').toLowerCase();
      return codes.some(c => uri.includes(c));
    };

    const maleNames = ['david', 'alex', 'daniel', 'fred', 'george', 'arthur', 'gordon', 'aaron', 'rishi', 'grandpa', 'reed', 'rocko', 'eddy', 'bruce', 'ralph', 'jarvis', 'siri voice 1', 'siri voice 3', 'siri voice 5', 'male'];
    const femaleNames = ['zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'sandy', 'shelley', 'siri female', 'sara', 'lisa', 'clara', 'elena', 'tracy', 'martha', 'catherine', 'siri voice 2', 'siri voice 4', 'female', 'google us english'];

    // Identify the voice that WOULD be picked for the opposite gender — we use this both for
    // exclusion (never pick the same voice for both speakers) and for diagnostics.
    const femaleCandidate =
      enVoices.find(v => matchByUri(v, femaleUriCodes)) ||
      enVoices.find(v => femaleNames.some(n => v.name.toLowerCase().includes(n))) ||
      enVoices[0];

    if (isMale) {
      // 1. Try male URI codes
      const byUri = enVoices.find(v => matchByUri(v, maleUriCodes));
      if (byUri) return byUri;
      // 2. Try male name list
      for (const name of maleNames) {
        const match = enVoices.find(v => v.name.toLowerCase().includes(name));
        if (match) return match;
      }
      // 3. Anything NOT known-female, but exclude the voice already picked for Sara
      const remaining = enVoices.filter(v => v !== femaleCandidate && !femaleNames.some(fn => v.name.toLowerCase().includes(fn)) && !matchByUri(v, femaleUriCodes));
      if (remaining.length > 0) return remaining[remaining.length - 1]; // last → maximize separation
      // 4. Last resort — at least pick a DIFFERENT voice than Sara even if it's also female.
      const anyOther = enVoices.filter(v => v !== femaleCandidate);
      if (anyOther.length > 0) return anyOther[anyOther.length - 1];
      return enVoices[0];
    } else {
      // Mirror for female: prefer URI match, then name match, then fallback.
      const byUri = enVoices.find(v => matchByUri(v, femaleUriCodes));
      if (byUri) return byUri;
      for (const name of femaleNames) {
        const match = enVoices.find(v => v.name.toLowerCase().includes(name));
        if (match) return match;
      }
      const nonMaleVoices = enVoices.filter(v => !maleNames.some(mn => v.name.toLowerCase().includes(mn)) && !matchByUri(v, maleUriCodes));
      if (nonMaleVoices.length > 0) {
        return nonMaleVoices[0];
      }
      return enVoices[0];
    }
  };

  const stopAudio = () => {
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setCurrentSpeaker(null);
    setAudioProgress(0);
    activeAudioSlideRef.current = null;
    currentSegmentIndexRef.current = 0;
    isPausedAudioRef.current = false;
    activeUtteranceRef.current = null;
    if (typeof window !== 'undefined') {
      (window as any)._activeUtterance = null;
    }
    // Clear all active pacing timeouts
    activeTimersRef.current.forEach(id => window.clearTimeout(id));
    activeTimersRef.current = [];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current.src = '';
      narrationAudioRef.current = null;
    }
  };

  const startAudio = (slide: any) => {
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    setAudioProgress(0);
    activeAudioSlideRef.current = slide;
    currentSegmentIndexRef.current = 0;
    isPausedAudioRef.current = false;
    const duration = getSlideDuration(slide);
    setAudioDuration(duration);

    // Android Chrome silently pauses the speech queue after ~15s. Periodically resume it.
    // No-op on iOS / desktop since resume() while speaking has no adverse effect.
    if ('speechSynthesis' in window && IS_MOBILE_DEVICE) {
      const keepaliveId = window.setInterval(() => {
        if (!window.speechSynthesis.speaking) return;
        if (isPausedAudioRef.current) return;
        // The pause-then-resume pair is the documented Chrome keepalive trick.
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, ANDROID_KEEPALIVE_MS);
      activeTimersRef.current.push(keepaliveId as unknown as number);
    }

    // Voice list may load asynchronously on mobile; wait briefly so the FIRST segment
    // doesn't grab the platform default voice (usually female) before our selectVoice() can pick.
    const proceed = () => speakNarration(slide, 0);
    if (IS_MOBILE_DEVICE && availableVoices.length === 0 && 'speechSynthesis' in window) {
      const ready = window.speechSynthesis.getVoices();
      if (ready.length === 0) {
        let resolved = false;
        const onLoaded = () => {
          if (resolved) return;
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onLoaded);
          proceed();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onLoaded);
        // Hard cap so we never block more than 600ms even if voiceschanged never fires.
        window.setTimeout(onLoaded, 600);
        return;
      }
    }
    proceed();
  };

  const speakNarration = (slide: any, startIdx: number = 0) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    if (!slide) {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setCurrentSpeaker(null);
      setAudioProgress(0);
      currentSegmentIndexRef.current = 0;
      activeAudioSlideRef.current = null;
      isPausedAudioRef.current = false;
      activeUtteranceRef.current = null;
      if (typeof window !== 'undefined') {
        (window as any)._activeUtterance = null;
      }
      activeTimersRef.current.forEach(id => window.clearTimeout(id));
      activeTimersRef.current = [];
      return;
    }

    activeAudioSlideRef.current = slide;
    const currentVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    // ── Voice diagnostics: log once per session so we can debug remotely.
    // Surfaces what voices a device actually has — critical because Android often hides male voices.
    if (typeof window !== 'undefined' && !(window as any)._orchestraiVoiceLogged) {
      (window as any)._orchestraiVoiceLogged = true;
      const summary = currentVoices.map((v) => ({ name: v.name, lang: v.lang, uri: v.voiceURI, default: v.default, localService: v.localService }));
      // eslint-disable-next-line no-console
      console.info('[OrchestrAI · TTS voices available]', { mobile: IS_MOBILE_DEVICE, count: currentVoices.length, voices: summary });
      (window as any)._orchestraiVoices = summary;
    }
    
    if (Array.isArray(slide.narration_script) && slide.narration_script.length > 0) {
      const playSegment = (index: number) => {
        if (activeAudioSlideRef.current !== slide) return;
        if (isPausedAudioRef.current) return;
        
        if (index >= slide.narration_script.length) {
          stopAudio();
          return;
        }

        currentSegmentIndexRef.current = index;
        const segment = slide.narration_script[index];
        const text = segment.text;
        const voiceKey = segment.voice || 'female_genz';

        // ── PRE-RENDERED MP3 PATH ──
        // If the segment carries an audio_url, play that file directly — same voice on every device.
        // Falls back to Web Speech (below) when audio_url is absent.
        if (segment.audio_url) {
          const audio = new Audio(segment.audio_url);
          audio.preload = 'auto';
          narrationAudioRef.current = audio;
          setCurrentSpeaker(segment.speaker || null);

          let proceeded = false;
          const finishSegment = () => {
            if (proceeded) return;
            proceeded = true;
            narrationAudioRef.current = null;
            if (activeAudioSlideRef.current !== slide) return;
            if (isPausedAudioRef.current) return;
            const nextSeg = slide.narration_script[index + 1];
            const pause = nextSeg && nextSeg.speaker && nextSeg.speaker !== segment.speaker
              ? SPEAKER_CHANGE_PAUSE_MS
              : INTER_SEGMENT_PAUSE_MS;
            const timerId = window.setTimeout(() => {
              activeTimersRef.current = activeTimersRef.current.filter(id => id !== timerId);
              playSegment(index + 1);
            }, pause);
            activeTimersRef.current.push(timerId);
          };

          audio.onended = finishSegment;
          audio.onerror = finishSegment;     // missing/broken file → skip ahead, don't stall
          audio.play().catch(finishSegment); // mobile autoplay restriction → skip ahead
          return;
        }

        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'en-US'; // Force English language to prevent speech engine errors on regional locales
        activeUtteranceRef.current = utt;
        (window as any)._activeUtterance = utt; // Prevent GC on iOS/Mobile
        
        const voiceObj = selectVoice(voiceKey, currentVoices);
        if (voiceObj) utt.voice = voiceObj;

        // Apply pitch + rate modulation to differentiate male/female on engines where the
        // voice list is thin (Android Chrome often serves the same voice for both keys).
        // Pitch is pushed wide on mobile; a small rate split adds perceived identity contrast.
        const vk = voiceKey.toLowerCase();
        const isMale = !vk.includes('female') && (vk.includes('male') || vk.includes('dev') || vk.includes('kai') || vk.includes('ravi') || vk.includes('beginner') || vk.includes('arjun') || vk.includes('host_male'));
        utt.pitch = isMale
          ? (IS_MOBILE_DEVICE ? 0.65 : 0.83)
          : (IS_MOBILE_DEVICE ? 1.35 : 1.12);
        // Mobile base rate is 0.94 to fight the inherent mobile speed-up. Add a tiny gender split.
        const baseRate = IS_MOBILE_DEVICE ? 0.94 : 1.0;
        utt.rate = isMale ? baseRate - 0.04 : baseRate + 0.02;
        
        const startTime = Date.now();
        const estimatedMs = Math.max(1500, text.length * 65);
        let proceeded = false;

        const handleNextSegment = () => {
          if (activeAudioSlideRef.current !== slide) return;
          if (isPausedAudioRef.current) return;
          if (proceeded) return;
          proceeded = true;

          const elapsed = Date.now() - startTime;
          const remaining = estimatedMs - elapsed;

          // Always insert a breathing pause between segments — longer when the speaker changes.
          // Fixes the "rushing without pauses" effect, most visible on mobile where TTS often ends early.
          const nextSeg = slide.narration_script[index + 1];
          const pause = nextSeg && nextSeg.speaker && nextSeg.speaker !== segment.speaker
            ? SPEAKER_CHANGE_PAUSE_MS
            : INTER_SEGMENT_PAUSE_MS;
          const wait = Math.max(remaining, pause);

          const timerId = window.setTimeout(() => {
            activeTimersRef.current = activeTimersRef.current.filter(id => id !== timerId);
            playSegment(index + 1);
          }, wait);
          activeTimersRef.current.push(timerId);
        };
        
        utt.onstart = () => {
          if (activeAudioSlideRef.current !== slide) return;
          setCurrentSpeaker(segment.speaker);
        };

        utt.onerror = (e) => {
          if (activeAudioSlideRef.current !== slide) return;
          if (isPausedAudioRef.current) return;
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            // Pacing fallback for browser SpeechSynthesis failure
            handleNextSegment();
          }
        };
        
        utt.onend = () => {
          if (activeAudioSlideRef.current !== slide) return;
          if (isPausedAudioRef.current) return;
          handleNextSegment();
        };

        window.speechSynthesis.speak(utt);

        // Watchdog: Chrome Android sometimes never fires `onend` on short utterances.
        // If we haven't proceeded by 1.8× the estimated time (min 4s), force the next segment.
        const watchdogId = window.setTimeout(() => {
          activeTimersRef.current = activeTimersRef.current.filter(id => id !== watchdogId);
          if (proceeded) return;
          if (activeAudioSlideRef.current !== slide) return;
          if (isPausedAudioRef.current) return;
          handleNextSegment();
        }, Math.max(4000, Math.ceil(estimatedMs * 1.8)));
        activeTimersRef.current.push(watchdogId);
      };

      playSegment(startIdx);
    } else {
      const text = slide.narration;
      // Slide-level pre-rendered MP3 — same idea as per-segment audio_url, just for slides without narration_script.
      if (slide.audio_url) {
        const audio = new Audio(slide.audio_url);
        audio.preload = 'auto';
        narrationAudioRef.current = audio;
        const speakers: Record<string, string> = { conversational: 'Maya', formal: 'Aanya', genz: 'Zo', beginner: 'Sir Ravi' };
        setCurrentSpeaker(speakers[selectedTone || 'conversational'] || 'Guide');
        const done = () => {
          narrationAudioRef.current = null;
          if (activeAudioSlideRef.current !== slide) return;
          if (isPausedAudioRef.current) return;
          stopAudio();
        };
        audio.onended = done;
        audio.onerror = done;
        audio.play().catch(done);
        return;
      }
      if (!text) {
        stopAudio();
        return;
      }
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      activeUtteranceRef.current = utt;
      (window as any)._activeUtterance = utt; // Prevent GC on iOS/Mobile
      
      const voiceObj = selectVoice(selectedTone || 'conversational', currentVoices);
      if (voiceObj) utt.voice = voiceObj;

      const toneKey = (selectedTone || 'conversational').toLowerCase();
      const isMaleSimple = toneKey === 'beginner';
      utt.pitch = isMaleSimple
        ? (IS_MOBILE_DEVICE ? 0.65 : 0.83)
        : (IS_MOBILE_DEVICE ? 1.35 : 1.12);
      const baseRateSimple = IS_MOBILE_DEVICE ? 0.94 : 1.0;
      utt.rate = isMaleSimple ? baseRateSimple - 0.04 : baseRateSimple + 0.02;
      
      const startTime = Date.now();
      const estimatedMs = Math.max(1500, text.length * 65);
      let proceeded = false;

      const handleEnd = () => {
        if (activeAudioSlideRef.current !== slide) return;
        if (isPausedAudioRef.current) return;
        if (proceeded) return;
        proceeded = true;
        
        const elapsed = Date.now() - startTime;
        const remaining = estimatedMs - elapsed;
        
        if (remaining > 0) {
          const timerId = window.setTimeout(() => {
            activeTimersRef.current = activeTimersRef.current.filter(id => id !== timerId);
            stopAudio();
          }, remaining);
          activeTimersRef.current.push(timerId);
        } else {
          stopAudio();
        }
      };

      utt.onstart = () => {
        if (activeAudioSlideRef.current !== slide) return;
        const speakers: Record<string, string> = { conversational: 'Maya', formal: 'Aanya', genz: 'Zo', beginner: 'Sir Ravi' };
        setCurrentSpeaker(speakers[selectedTone || 'conversational'] || 'Guide');
      };

      utt.onerror = (e) => {
        if (activeAudioSlideRef.current !== slide) return;
        if (isPausedAudioRef.current) return;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          handleEnd();
        }
      };
      
      utt.onend = () => {
        if (activeAudioSlideRef.current !== slide) return;
        if (isPausedAudioRef.current) return;
        handleEnd();
      };
      
      window.speechSynthesis.speak(utt);
    }
  };

  const handleNext = () => {
    if (currentSlide < slidesCount - 1) {
      setSlideDirection('right');
      setCurrentSlide(p => p + 1);
    }
  };
  const handlePrev = () => {
    if (currentSlide > 0) {
      setSlideDirection('left');
      setCurrentSlide(p => p - 1);
    }
  };
  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPlayingAudio) {
      if (isPausedAudio) {
        isPausedAudioRef.current = false;
        setIsPausedAudio(false);
        const s = totalSlides[currentSlide];
        if (s) {
          if (Array.isArray(s.narration_script) && s.narration_script.length > 0) {
            speakNarration(s, currentSegmentIndexRef.current);
          } else {
            speakNarration(s, 0);
          }
        }
      } else {
        isPausedAudioRef.current = true;
        setIsPausedAudio(true);
        // Clear active timeouts when pausing
        activeTimersRef.current.forEach(id => window.clearTimeout(id));
        activeTimersRef.current = [];
        window.speechSynthesis.cancel();
        // Also pause MP3 narration playback if active.
        if (narrationAudioRef.current) narrationAudioRef.current.pause();
      }
    } else {
      startAudio(totalSlides[currentSlide]);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isPlayingAudio && !isPausedAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            return audioDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio, isPausedAudio, audioDuration]);

  useEffect(() => {
    setAnimKey(k => k + 1);
    const s = totalSlides[currentSlide];
    if (s?.type === 'day_in_life' && s.schedule?.length > 0) setActiveHour(s.schedule[0].time);
    else setActiveHour(null);
    
    if (isPlayingAudio && s) {
      startAudio(s);
    } else {
      stopAudio();
    }
    // Award XP for exploring each unique slide (engine de-dupes repeat views).
    recordSlideView(moduleId, currentSlide);
    // Track visitor activity if user is anonymous
    if (!currentUser) {
      trackVisitorActivity(moduleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
    return () => window.speechSynthesis?.cancel();
  }, []);

  // Resume from where the learner left off (furthest slide seen for this module).
  useEffect(() => {
    const seen = currentUser?.progress?.slidesViewed?.[moduleId];
    if (seen && seen.length > 0) {
      const resume = Math.min(Math.max(...seen), slidesCount - 1);
      if (resume > 0) {
        setCurrentSlide(resume);
        addToast(`Resumed where you left off · slide ${resume + 1}`, 'info');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasUploadedSlides = !!(
    customSlides &&
    (Array.isArray(customSlides)
      ? customSlides.length > 0
      : !!(customSlides.conversational && customSlides.conversational.length > 0))
  );

  if (!hasUploadedSlides) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-lg p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 flex flex-col items-center text-center space-y-6">
          <div className="h-14 w-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Training Material Unavailable</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Module {moduleId}</p>
            <p className="text-xs font-bold mt-4 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-[var(--text-primary)]">
              Contact Admin. Training material not uploaded.
            </p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all">Close Presenter</button>
        </div>
      </div>
    );
  }

  const slide = totalSlides[currentSlide] || { title: 'End of Course', type: 'hero_welcome' };
  const progressPct = slidesCount > 1 ? Math.round((currentSlide / (slidesCount - 1)) * 100) : 0;

  // ── AVATAR ──
  const Avatar = () => (
    <svg viewBox="0 0 100 100" className={`w-20 h-20 mx-auto transition-transform ${isPlayingAudio ? 'animate-avatar-speak' : 'animate-avatar-breathe'}`}>
      <defs>
        <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {isPlayingAudio && <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ag2)" strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: '2s' }} />}
      <circle cx="50" cy="50" r="40" fill="var(--bg-card)" stroke="url(#ag2)" strokeWidth="2" />
      <circle cx="38" cy="44" r="3.5" fill="url(#ag2)" /><circle cx="62" cy="44" r="3.5" fill="url(#ag2)" />
      <circle cx="38" cy="44" r="1.5" fill="white" opacity="0.7" /><circle cx="62" cy="44" r="1.5" fill="white" opacity="0.7" />
      {isPlayingAudio
        ? <path d="M33,62 Q50,75 67,62" fill="none" stroke="#00f2fe" strokeWidth="3.5" strokeLinecap="round" className="animate-bounce" style={{ animationDuration: '0.4s' }} />
        : <path d="M35,60 Q50,68 65,60" fill="none" stroke="url(#ag2)" strokeWidth="2.5" strokeLinecap="round" />
      }
      <circle cx="50" cy="20" r="2" fill={isPlayingAudio ? '#00f2fe' : '#a855f7'} className="animate-pulse" />
    </svg>
  );



  // ── MAIN SLIDE RENDERERS ──
  const renderSlide = () => {
    switch (slide.type) {

      // ─────────────── HERO WELCOME ───────────────
      case 'hero_welcome': {
        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                {RI(slide.icon || 'sparkles', 'h-3.5 w-3.5')}
                {slide.subtitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-1">{slide.title}</h2>
              {slide.tagline && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic font-medium mt-1">
                  {slide.tagline}
                </p>
              )}
            </div>

            {/* Analogy/Description Banner */}
            {slide.analogy && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3 items-start animate-fade-in">
                <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-400">Core Briefing / Analogy</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                    {typeof slide.analogy === 'string' ? slide.analogy : slide.analogy.text}
                  </p>
                </div>
              </div>
            )}

            {/* Stats and Promises Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Stats Card */}
              {slide.hero_stat && (
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 shadow-lg text-center h-full">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{slide.hero_stat.value}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-2">{slide.hero_stat.label}</span>
                  {slide.hero_stat.note && (
                    <span className="text-[9px] text-indigo-400 font-bold mt-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      {slide.hero_stat.note}
                    </span>
                  )}
                </div>
              )}

              {/* Promises Card List */}
              {slide.promises && slide.promises.length > 0 && (
                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  {slide.promises.map((p: any, i: number) => {
                    // Resolve gradient/color classes
                    const colorClass = p.color || (i === 0 ? 'from-violet-600 to-indigo-600' : i === 1 ? 'from-amber-600 to-orange-600' : 'from-emerald-600 to-teal-600');
                    return (
                      <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex gap-3 items-center hover:border-indigo-500/25 transition-all">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shrink-0`}>
                          {RI(p.icon || 'sparkles', 'h-4 w-4')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">{p.title}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5 truncate md:whitespace-normal">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      }

      // ─────────────── VIDEO ───────────────
      case 'video': {
        const getYoutubeEmbedUrl = (url: string) => {
          if (!url) return '';
          let videoId = '';
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = url.match(regExp);
          if (match && match[2].length === 11) {
            videoId = match[2];
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
        };

        const ytEmbedUrl = getYoutubeEmbedUrl(videoUrl);

        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Tv className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{slide.subtitle}</span>
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] bg-black shadow-2xl">
              {ytEmbedUrl ? (
                <iframe
                  src={ytEmbedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] text-center">Watch this briefing, then click Next to proceed.</p>
          </div>
        );
      }

      // ─────────────── WELCOME ───────────────
      case 'welcome': {
        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                {RI(slide.icon || 'sparkles', 'h-3.5 w-3.5')}
                {slide.subtitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1">{slide.title}</h2>
            </div>

            {slide.analogy && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3 items-start">
                <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-400">{slide.analogy.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.analogy.text}</p>
                </div>
              </div>
            )}

            {slide.opening_hook && (
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed text-center max-w-2xl mx-auto bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                "{slide.opening_hook}"
              </p>
            )}

            {slide.hero_stat && (
              <div className="flex justify-center">
                <div className="inline-flex flex-col items-center px-8 py-3 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/15 border border-indigo-500/25 shadow-lg">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{slide.hero_stat.value}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-0.5">{slide.hero_stat.label}</span>
                  {slide.hero_stat.note && <span className="text-[9px] text-indigo-400 font-bold mt-0.5">{slide.hero_stat.note}</span>}
                </div>
              </div>
            )}

            {slide.before_after && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 hover:bg-red-500/10 transition-all duration-300">
                  <div className="flex items-center gap-2 text-red-400">
                    <Frown className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{slide.before_after.before.label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">"{slide.before_after.before.output}"</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 hover:bg-emerald-500/10 transition-all duration-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Smile className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{slide.before_after.after.label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-semibold">"{slide.before_after.after.output}"</p>
                </div>
              </div>
            )}

            {slide.bullets && slide.bullets.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {slide.bullets.map((b: string, i: number) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex gap-3 items-center hover:border-indigo-500/25 transition-all">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)] leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            )}

            {slide.reflection_prompt && (
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 flex gap-3 items-start">
                <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Reflection Focus</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.reflection_prompt}</p>
                </div>
              </div>
            )}

            {slide.memory_hook && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider mr-1">Hook:</span>
                  {slide.memory_hook}
                </p>
              </div>
            )}

            {slide.closing_thread && (
              <p className="text-[11px] text-[var(--text-secondary)] text-center font-medium mt-2">
                🎯 {slide.closing_thread}
              </p>
            )}
          </div>
        );
      }

      // ─────────────── CRISIS STAT ───────────────
      case 'crisis_stat': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider">{RI(slide.icon, 'h-3.5 w-3.5')}{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {slide.stats?.map((s: any, i: number) => (
              <div key={i} className={`rounded-xl border p-4 text-center space-y-1 ${s.color === 'red' ? 'border-red-500/20 bg-red-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                <div className={`text-2xl font-extrabold ${s.color === 'red' ? 'text-red-400' : 'text-orange-400'}`}>{s.value}</div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 space-y-2">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">{slide.insight_title}</p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{slide.insight_text}</p>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-center">
              <p className="text-[11px] text-indigo-300 italic leading-relaxed font-medium">{slide.key_quote}</p>
            </div>
          </div>
        </div>
      );

      // ─────────────── COMPARISON TABLE ───────────────
      case 'comparison_table': {
        const isOldNew = slide.table && slide.table.length > 0 && ('old' in slide.table[0]);
        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                {RI(slide.icon || 'arrow-left-right', 'h-3.5 w-3.5')}
                {slide.subtitle}
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{slide.title}</h2>
            </div>

            {slide.analogy && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 flex gap-3 items-start">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-amber-400">{slide.analogy.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.analogy.text}</p>
                </div>
              </div>
            )}

            {/* Render custom visual_chart if present */}
            {slide.visual_chart && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-4">
                <div className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-indigo-400" />
                  {slide.visual_chart.title}
                </div>
                <div className="space-y-3">
                  {slide.visual_chart.data?.map((item: any, i: number) => {
                    const maxVal = Math.max(...slide.visual_chart.data.map((d: any) => d.value));
                    const pct = Math.max(5, Math.round((item.value / maxVal) * 100));
                    const isTeal = item.color === 'teal';
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[var(--text-secondary)]">{item.label}</span>
                          <span className={`font-bold ${isTeal ? 'text-teal-400' : 'text-rose-400'}`}>
                            {item.value} {item.unit || ''}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-500/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${isTeal ? 'from-teal-500 to-emerald-400' : 'from-rose-500 to-orange-400'} transition-all duration-1000`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Traditional / Old Way
                </h4>
                <div className="space-y-2">
                  {slide.table?.map((r: any, i: number) => (
                    <div key={i} className="border-t border-red-500/10 pt-2 flex gap-2.5 items-start">
                      <span className="text-red-400/60 mt-0.5 shrink-0">{RI(r.icon, 'h-3.5 w-3.5')}</span>
                      <div>
                        {r.pain && <div className="text-[10px] font-extrabold text-red-300 uppercase tracking-wide">{r.pain}</div>}
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {isOldNew ? r.old : r.trad}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> OrchestrAI / New Way
                </h4>
                <div className="space-y-2">
                  {slide.table?.map((r: any, i: number) => (
                    <div key={i} className="border-t border-emerald-500/10 pt-2 flex gap-2.5 items-start">
                      <span className="text-emerald-400/60 mt-0.5 shrink-0">{RI(r.icon, 'h-3.5 w-3.5')}</span>
                      <div>
                        {r.pain && <div className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wide">{r.pain}</div>}
                        <div className="text-xs text-[var(--text-primary)] font-semibold leading-relaxed">
                          {isOldNew ? r.new : r.orch}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {slide.memory_hook && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider mr-1">Takeaway:</span>
                  {slide.memory_hook}
                </p>
              </div>
            )}
          </div>
        );
      }

      // ─────────────── PARADIGM IDENTITY ───────────────
      case 'paradigm_identity': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[slide.left, slide.right].map((side: any, i: number) => (
              <div key={i} className={`rounded-xl border p-3 space-y-2 ${i === 0 ? 'border-red-500/15 bg-red-500/5' : 'border-emerald-500/15 bg-emerald-500/5'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{RI(side?.icon, 'h-4 w-4')}</div>
                  <span className={`text-xs font-bold ${i === 0 ? 'text-red-400' : 'text-emerald-400'}`}>{side?.label}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{side?.desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {slide.transformations?.map((t: any, i: number) => (
              <div key={i} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/50 px-3 py-2 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="flex items-center gap-1.5 text-red-400"><span className="text-[10px] text-[var(--text-secondary)]">❌ {t.from}</span></div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                <div className="flex items-center gap-1.5 text-emerald-400"><span className="text-[10px] text-emerald-500 font-semibold">✅ {t.to}</span></div>
              </div>
            ))}
          </div>
          {slide.reflection && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 flex gap-2 items-start">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-[var(--text-secondary)] italic leading-relaxed"><span className="font-bold text-cyan-400">Reflect: </span>{slide.reflection}</p>
            </div>
          )}
        </div>
      );

      // ─────────────── MENTAL BLOCKS ───────────────
      case 'mental_blocks': return (
        <div className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="flex-1 space-y-2">
            {slide.blocks?.map((b: any, i: number) => {
              const cs = b.color === 'red' ? 'border-red-500/20 bg-red-500/5 text-red-400' : b.color === 'orange' ? 'border-orange-500/20 bg-orange-500/5 text-orange-400' : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400';
              return (
                <div key={i} className={`rounded-xl border p-3 flex gap-3 items-start ${cs}`}>
                  <div className="shrink-0 mt-0.5">{RI(b.icon, 'h-4 w-4')}</div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">{b.label}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

      // ─────────────── AI AS DEVELOPER ───────────────
      case 'ai_as_developer': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {slide.ai_traits?.map((t: any, i: number) => {
              const gc = ['from-amber-600 to-orange-500', 'from-emerald-600 to-teal-500', 'from-blue-600 to-cyan-500', 'from-violet-600 to-purple-500'];
              return (
                <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex gap-2.5 items-start">
                  <div className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${gc[i]} flex items-center justify-center text-white`}>{RI(t.icon, 'h-3.5 w-3.5')}</div>
                  <div><p className="text-[11px] font-bold text-[var(--text-primary)]">{t.trait}</p><p className="text-[10px] text-[var(--text-secondary)] leading-snug">{t.desc}</p></div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-1">
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Critical Insight</p>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">"{slide.critical_insight}"</p>
          </div>
        </div>
      );

      // ─────────────── PROMPT FORMULA ───────────────
      case 'prompt_formula': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {slide.pillars?.map((p: any, i: number) => (
              <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-extrabold text-sm shrink-0`}>{p.letter}</div>
                  <div><p className="text-xs font-bold text-[var(--text-primary)]">{p.name}</p><p className="text-[10px] text-[var(--text-secondary)]">{p.tagline}</p></div>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] italic bg-[var(--surface-sunken)] rounded-md px-2 py-1 leading-snug">e.g. {p.example}</p>
              </div>
            ))}
          </div>
          {slide.memory_hook && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 flex gap-2 items-start">
              <BrainCircuit className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <div><p className="text-[10px] font-extrabold text-violet-400 uppercase tracking-wider">Memory Hook</p><p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{slide.memory_hook}</p></div>
            </div>
          )}
        </div>
      );

      // ─────────────── PROMPT DEEP DIVE ───────────────
      case 'prompt_deep': return (
        <div className="flex-1 flex flex-col gap-3 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {slide.pillars?.map((p: any, i: number) => (
              <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2.5 flex flex-col">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-extrabold shrink-0`}>{p.letter}</div>
                  <div><p className="text-sm font-bold text-[var(--text-primary)]">{p.name}</p><p className="text-[10px] text-[var(--text-secondary)]">{p.tagline}</p></div>
                </div>
                <div className="space-y-1">
                  {p.rules?.map((r: string, j: number) => (
                    <div key={j} className="flex gap-1.5 items-start">
                      <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-[var(--text-secondary)] leading-snug">{r}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase">❌ Vague</span>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5">{p.bad}</p>
                    <p className="text-[10px] text-red-400/70 mt-1">→ {p.bad_outcome}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">✅ Engineered</span>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{p.good}</p>
                    <p className="text-[10px] text-emerald-400/70 mt-1">→ {p.good_outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // ─────────────── CASE STUDY (Simple) ───────────────
      case 'case_study': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-[11px] text-[var(--text-secondary)]">
            <span className="font-bold text-indigo-400">Scenario: </span>{slide.scenario}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 space-y-1.5">
              <p className="text-[10px] font-extrabold text-red-400 uppercase">❌ Vague Request</p>
              <p className="font-mono text-[10px] bg-[var(--surface-sunken)] p-2 rounded text-[var(--text-secondary)]">{slide.vague_prompt}</p>
              <p className="text-[10px] text-red-400/70 leading-snug">{slide.vague_result}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 space-y-1.5">
              <p className="text-[10px] font-extrabold text-emerald-400 uppercase">✅ Engineered Result</p>
              <div className="space-y-0.5">
                {slide.breakdown?.map((b: any, i: number) => (
                  <div key={i} className="grid grid-cols-[80px_1fr] gap-1 text-[10px]">
                    <span className="font-bold text-emerald-400 truncate">{b.pillar}</span>
                    <span className="text-[var(--text-secondary)] leading-snug">{b.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-400/80 font-semibold">{slide.engineered_result}</p>
            </div>
          </div>
        </div>
      );

      // ─────────────── CASE STUDY (Enterprise) ───────────────
      case 'case_study_enterprise': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-[11px] text-[var(--text-secondary)]">
            <span className="font-bold text-indigo-400">Scenario: </span>{slide.scenario}
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 space-y-2 flex flex-col">
              <p className="text-[10px] font-extrabold text-red-400 uppercase">❌ Vague Prompt → Vulnerabilities</p>
              <p className="font-mono text-[10px] bg-[var(--surface-sunken)] p-2 rounded text-[var(--text-secondary)]">{slide.vague_prompt}</p>
              <div className="space-y-1 flex-1">
                {slide.vulnerabilities?.map((v: string, i: number) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-[var(--text-secondary)] leading-snug">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 space-y-1.5 overflow-hidden flex flex-col">
              <p className="text-[10px] font-extrabold text-emerald-400 uppercase">✅ P.R.O.M.P.T. Engineered</p>
              <div className="space-y-1.5 flex-1 overflow-hidden">
                {slide.engineered_prompt?.map((e: any, i: number) => (
                  <div key={i} className="grid grid-cols-[52px_1fr] gap-1.5 items-start">
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 rounded px-1 py-0.5 text-center">{e.pillar}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] leading-snug">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      // ─────────────── MINDSET SHIFT ───────────────
      case 'mindset_shift': {
        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                {RI(slide.icon || 'music-2', 'h-3.5 w-3.5')}
                {slide.subtitle}
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{slide.title}</h2>
            </div>

            {slide.analogy && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex gap-3 items-start">
                <Music2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5 animate-bounce" style={{ animationDuration: '3s' }} />
                <div>
                  <p className="text-xs font-bold text-purple-400">{slide.analogy.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.analogy.text}</p>
                </div>
              </div>
            )}

            {/* Shift cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {slide.table?.map((item: any, i: number) => (
                <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 hover:border-purple-500/30 hover:bg-[var(--bg-card)]/80 transition-all duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_1fr] gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                      {RI(item.icon, 'h-4 w-4')}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] italic">
                      <span className="block text-[8px] font-extrabold text-red-400 uppercase tracking-widest mb-0.5">Old Mindset (Soloist)</span>
                      {item.old}
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] shrink-0 hidden md:block" />
                    <div className="text-xs text-[var(--text-primary)] font-bold">
                      <span className="block text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest mb-0.5">New Mindset (Conductor)</span>
                      {item.new}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {slide.reflection_prompt && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex gap-3 items-start">
                <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Self-Reflection Gate</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.reflection_prompt}</p>
                </div>
              </div>
            )}

            {slide.memory_hook && (
              <div className="rounded-lg border border-purple-500/25 bg-purple-500/5 px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  <span className="font-bold text-purple-400 uppercase tracking-wider mr-1">Conductor Rule:</span>
                  {slide.memory_hook}
                </p>
              </div>
            )}
          </div>
        );
      }

      // ─────────────── DAY IN LIFE ───────────────
      case 'day_in_life': {
        const timelineData = slide.timeline || slide.schedule || [];
        const chartPhases = slide.visual_chart?.phases || slide.visual_chart?.groups || [];

        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                {RI(slide.icon || 'clock', 'h-3.5 w-3.5')}
                {slide.subtitle}
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{slide.title}</h2>
            </div>

            {slide.analogy && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex gap-3 items-start">
                <Clock className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '10s' }} />
                <div>
                  <p className="text-xs font-bold text-cyan-400">{slide.analogy.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.analogy.text}</p>
                </div>
              </div>
            )}

            {/* Gantt Timeline visualization */}
            {chartPhases.length > 0 && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 mb-3">
                  <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
                  {slide.visual_chart?.title || "Daily Timeline Allocation"}
                </span>
                <div className="space-y-2">
                  {chartPhases.map((phase: any, i: number) => {
                    const parseTime = (t: string) => {
                      const [h, m] = t.split(':').map(Number);
                      return h + m / 60;
                    };
                    const startHr = parseTime(phase.start || "9:00");
                    const endHr = parseTime(phase.end || "17:00");
                    const duration = endHr - startHr;
                    const leftPct = ((startHr - 9) / 8) * 100;
                    const widthPct = (duration / 8) * 100;

                    const colorMap: Record<string, string> = {
                      gold: 'from-amber-500 to-orange-400',
                      teal: 'from-cyan-500 to-teal-400',
                      blue: 'from-blue-500 to-indigo-400',
                      indigo: 'from-indigo-500 to-violet-400'
                    };
                    const barColor = colorMap[phase.color] || phase.color || 'from-indigo-500 to-violet-400';

                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] w-20 shrink-0 truncate">{phase.label}</span>
                        <div className="flex-1 h-4 bg-slate-500/10 rounded-full overflow-hidden relative">
                          <div
                            className={`absolute h-full rounded-full bg-gradient-to-r ${
                              barColor.includes('from-') ? barColor : `from-${phase.color}-500 to-${phase.color}-400`
                            } flex items-center justify-end pr-2`}
                            style={{
                              left: `${Math.max(0, leftPct)}%`,
                              width: `${Math.max(5, widthPct)}%`
                            }}
                          >
                            <span className="text-[8px] text-white font-extrabold">{phase.start} - {phase.end}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid of timeline nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {timelineData.map((item: any, i: number) => {
                const isSelected = activeHour === item.time;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveHour(item.time)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1 text-cyan-400">
                      {RI(item.icon, 'h-3.5 w-3.5')}
                      <span className="text-[10px] font-extrabold">{item.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">
                      {item.phase || item.task?.split(':')[0]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected timeline detail */}
            {activeHour && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold">
                    {activeHour} · {timelineData.find((x: any) => x.time === activeHour)?.phase || "Detail"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {timelineData.find((x: any) => x.time === activeHour)?.desc ||
                    timelineData.find((x: any) => x.time === activeHour)?.task}
                </p>
              </div>
            )}

            {slide.memory_hook && (
              <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider mr-1">Day Recap:</span>
                  {slide.memory_hook}
                </p>
              </div>
            )}
          </div>
        );
      }

      // ─────────────── SPRINT MAP ───────────────
      case 'sprint_map': return (
        <div className="flex-1 flex flex-col gap-3 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-7 gap-1.5 flex-1">
            {slide.days?.map((d: any, i: number) => {
              const cs: Record<string, string> = { indigo: 'from-indigo-600 to-indigo-500', blue: 'from-blue-600 to-cyan-500', cyan: 'from-cyan-600 to-teal-500', emerald: 'from-emerald-600 to-teal-500', amber: 'from-amber-600 to-orange-500', orange: 'from-orange-600 to-rose-500', violet: 'from-violet-600 to-purple-500' };
              return (
                <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col">
                  <div className={`bg-gradient-to-b ${cs[d.color]} p-2 text-center`}>
                    <div className="text-white font-extrabold text-xs">Day {d.day}</div>
                    <div className="text-white/80 text-[10px] font-semibold leading-tight">{d.theme}</div>
                  </div>
                  <div className="p-2 space-y-1 flex-1">
                    {d.items?.map((item: string, j: number) => (
                      <div key={j} className="flex gap-1 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0" />
                        <span className="text-[10px] text-[var(--text-secondary)] leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {slide.note && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <p className="text-[10px] text-[var(--text-secondary)]">{slide.note}</p>
            </div>
          )}
        </div>
      );

      // ─────────────── COMPETENCIES ───────────────
      case 'competencies': {
        return (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto pr-1">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{slide.subtitle}</div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{slide.title}</h2>
            </div>

            {slide.analogy && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 flex gap-3 items-start">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-400">{slide.analogy.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{slide.analogy.text}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* Left Column: List of Competencies */}
              <div className="space-y-2.5">
                {slide.list?.map((item: any, i: number) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex gap-3 items-start hover:border-indigo-500/30 transition-all duration-200">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.grad || PILLAR_GRAD[i % 6]} flex items-center justify-center text-white shrink-0`}>
                      {RI(item.icon, 'h-4 w-4')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">{item.desc}</p>
                      {item.gate && <p className="text-[10px] text-indigo-400 mt-1 italic font-medium">🔍 Gate check: {item.gate}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Visual Cockpit / Skill Calibrator */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    <Gauge className="h-4 w-4 text-indigo-400" />
                    Cockpit Calibration Panel
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    {slide.visual_chart?.instruction || "Self-rate your capability on each competency dimension below to calibrate your radar flight envelope."}
                  </p>

                  <div className="space-y-3 mt-4">
                    {/* Render rating sliders */}
                    {(() => {
                      const axes = slide.visual_chart?.axes || (slide.list ? slide.list.map((item: any) => item.name) : ["Intent Articulation", "Quality Judgment", "Stakeholder Translation", "Iteration Discipline", "Pattern Stewardship"]);
                      const activeRatings = axes.map((axis: string) => radarRatings[axis] || 3);
                      const resultText = activeRatings.every((v: number) => v >= 4)
                        ? "🏆 Master Pilot - Ready for hypersonic baseline delivery!"
                        : activeRatings.every((v: number) => v === 3)
                        ? "✈️ Co-Pilot Baseline - Ready for standard autopilot delivery."
                        : Math.max(...activeRatings) - Math.min(...activeRatings) >= 3
                        ? "⚠️ Spiked Profile - High key-person risk! Stabilize weak dimensions."
                        : "🚀 Balanced Envelope - High structural flight stability.";

                      return (
                        <>
                          {axes.map((axis: string) => {
                            const currentVal = radarRatings[axis] || 3;
                            return (
                              <div key={axis} className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="font-semibold text-[var(--text-secondary)] text-left truncate max-w-[180px]">{axis}</span>
                                  <span className="font-extrabold text-indigo-400">Level {currentVal}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                      key={lvl}
                                      onClick={() => setRadarRatings(p => ({ ...p, [axis]: lvl }))}
                                      className={`flex-1 h-3 rounded transition-all duration-200 cursor-pointer ${
                                        lvl <= currentVal
                                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500 opacity-90 shadow-sm shadow-indigo-500/20'
                                          : 'bg-slate-500/10 hover:bg-slate-500/25'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-center text-[10px]">
                            <span className="font-bold text-indigo-400">CALIBRATION RESULT</span>
                            <p className="text-[var(--text-secondary)] mt-0.5 leading-snug">{resultText}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {slide.memory_hook && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider mr-1">Remember:</span>
                  {slide.memory_hook}
                </p>
              </div>
            )}
          </div>
        );
      }

      // ─────────────── ANTI-PATTERNS ───────────────
      case 'anti_patterns': return (
        <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 space-y-2.5">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" />Anti-Patterns (Don't)</h4>
              {slide.dont_items?.map((item: any, i: number) => (
                <div key={i} className="border-t border-red-500/10 pt-2 space-y-0.5">
                  <p className="text-[10px] font-bold text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Best Practices (Do)</h4>
              {slide.do_items?.map((item: any, i: number) => (
                <div key={i} className="border-t border-emerald-500/10 pt-2 space-y-0.5">
                  <p className="text-[10px] font-bold text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // ─────────────── KEY TAKEAWAYS ───────────────
      case 'key_takeaways': return (
        <div className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto w-full">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          <div className="flex-1 space-y-2">
            {slide.takeaways?.map((t: any, i: number) => {
              const cs: Record<string, string> = { indigo: 'text-indigo-400 bg-indigo-500/10', violet: 'text-violet-400 bg-violet-500/10', emerald: 'text-emerald-400 bg-emerald-500/10', amber: 'text-amber-400 bg-amber-500/10', cyan: 'text-cyan-400 bg-cyan-500/10' };
              return (
                <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0 ${cs[t.color] || cs.indigo}`}>{t.num}</div>
                  <div><p className="text-xs font-bold text-[var(--text-primary)]">{t.title}</p><p className="text-[10px] text-[var(--text-secondary)] leading-snug">{t.desc}</p></div>
                </div>
              );
            })}
          </div>
          {slide.cta && (
            <div className="rounded-lg bg-gradient-to-r from-indigo-600/15 to-violet-600/15 border border-indigo-500/20 px-4 py-2.5 text-center">
              <p className="text-xs font-semibold text-[var(--text-primary)]">{slide.cta}</p>
            </div>
          )}
        </div>
      );

      // ─────────────── LAB ───────────────
      case 'lab': return <div className="flex-1 overflow-auto"><PromptSimulator onComplete={() => { setLabPassed(true); recordLabComplete(moduleId); onComplete(); }} /></div>;

      // ─────────────── PROMPT LAB ───────────────
      case 'prompt_lab': return (() => {
        const slideId = slide.slide_id || `lab_${slide.lab_number}`;
        const submitted = !!labSubmitted[slideId];
        const answers = labAnswers[slideId] || {};
        const fields = slide.input_fields || [];
        
        const setAnswer = (fieldKey: string, val: string) => {
          setLabAnswers(prev => ({
            ...prev,
            [slideId]: {
              ...(prev[slideId] || {}),
              [fieldKey]: val
            }
          }));
        };

        const handleSubmit = () => {
          const filledCount = Object.values(answers).filter(v => v && v.trim()).length;
          if (filledCount < 2) {
            addToast('Please fill out at least a couple of P.R.O.M.P.T. fields first!', 'warning');
            return;
          }
          setLabSubmitted(prev => ({ ...prev, [slideId]: true }));
          recordLabComplete(moduleId);
          addToast(`Lab ${slide.lab_number} submitted successfully! XP awarded.`, 'success');
        };

        const handleReset = () => {
          setLabSubmitted(prev => ({ ...prev, [slideId]: false }));
          setLabAnswers(prev => ({ ...prev, [slideId]: {} }));
        };

        if (!submitted) {
          return (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 w-full max-w-5xl mx-auto overflow-hidden min-h-0">
              {/* Left Column: Briefing & Scenario */}
              <div className="lg:w-2/5 flex flex-col gap-4 shrink-0 overflow-y-auto pr-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Headphones className="h-3 w-3 animate-pulse" />
                    Practical Lab
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                    {slide.subtitle}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-[var(--border-color)] bg-slate-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wide">
                    <span>💡</span>
                    {slide.scenario?.label || 'The Scenario'}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {slide.scenario?.text}
                  </p>
                </div>

                <div className="rounded-xl border border-dashed border-indigo-500/20 bg-indigo-500/5 p-4 space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Your Objective</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {slide.task_prompt}
                  </p>
                </div>
              </div>

              {/* Right Column: Prompt Fields Editor */}
              <div className="lg:w-3/5 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields.map((f: any) => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                        {f.label}
                      </label>
                      <textarea
                        value={answers[f.key] || ''}
                        onChange={(e) => setAnswer(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-all placeholder-[var(--text-secondary)]/50 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-fit self-end px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {slide.submit_button_label || 'Submit & Compare'}
                </button>
              </div>
            </div>
          );
        }

        const report = slide.comparison_report || {};
        const model = slide.model_answer || {};

        return (
          <div className="flex-grow flex flex-col gap-5 w-full max-w-5xl mx-auto overflow-y-auto pr-2 pb-6 min-h-0 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {report.title || 'Your Brief vs. AI-Engineered Brief'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                  {report.intro}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-fit px-4 py-2 border border-slate-500/20 hover:bg-slate-500/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Lab
              </button>
            </div>

            {/* Grid comparing each field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f: any) => {
                const userAns = answers[f.key] || '(Skipped)';
                const modelAns = model[f.key] || '';
                return (
                  <div key={f.key} className="glass-card p-4 rounded-xl border border-[var(--border-color)] space-y-3">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                      {f.label}
                    </h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--text-secondary)] opacity-60">Your Answer:</span>
                        <p className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-card)]/45 p-2.5 rounded-lg border border-[var(--border-color)] leading-relaxed italic">
                          {userAns}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-emerald-400">AI Suggested Answer:</span>
                        <p className="text-[11px] text-emerald-400/90 bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10 leading-relaxed font-medium">
                          {modelAns}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gaps / Insights section */}
            {report.common_gaps && report.common_gaps.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  Common Gaps & Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.common_gaps.map((g: any, gi: number) => (
                    <div key={gi} className="p-3.5 rounded-xl border border-yellow-500/10 bg-yellow-500/5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-extrabold uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{g.element} Gap</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                        {g.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.closing_line && (
              <p className="text-xs text-[var(--text-secondary)] italic font-semibold text-center mt-3 pt-3 border-t border-[var(--border-color)]/50">
                {report.closing_line}
              </p>
            )}
          </div>
        );
      })();

      // ─────────────── QUIZ ───────────────
      case 'quiz': return (() => {
        const Qs = getQuizQuestions(slide);
        const submitted = !!quizSubmitted[currentSlide];
        const answers = quizAnswers[currentSlide] || {};
        const correct = Qs.reduce((a: number, q: any, i: number) => a + (answers[i] === q.answer ? 1 : 0), 0);
        const pct = Qs.length > 0 ? Math.round((correct / Qs.length) * 100) : 0;

        return (
          <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full min-h-0">
            <div className="text-center shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{slide.subtitle}</div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
            </div>
            {submitted && (
              <div className="shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-sm ${pct >= 80 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>{pct}%</div>
                  <div><p className="text-xs font-bold text-[var(--text-primary)]">Assessment Results</p><p className="text-[10px] text-[var(--text-secondary)]">{correct}/{Qs.length} correct. {pct >= 80 ? 'Excellent!' : 'Review explanations below.'}</p></div>
                </div>
                <button onClick={() => setQuizSubmitted(p => ({ ...p, [currentSlide]: false }))} className="text-[10px] font-bold text-indigo-400 border border-indigo-500/30 rounded px-2.5 py-1 hover:bg-indigo-500/10 transition-all">Retry</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {Qs.map((q: any, qi: number) => (
                <div key={qi} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                  <p className="text-xs font-bold text-[var(--text-primary)]">{qi + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt: string, oi: number) => {
                      const isSel = answers[qi] === oi, isRight = q.answer === oi;
                      let s = 'border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-secondary)] hover:border-indigo-500/30';
                      if (submitted) { if (isRight) s = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'; else if (isSel) s = 'border-red-500 bg-red-500/10 text-red-400 font-semibold'; else s = 'border-[var(--border-color)] opacity-40 text-[var(--text-secondary)]'; }
                      else if (isSel) s = 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold ring-1 ring-indigo-500/20';
                      return (
                        <button key={oi} onClick={() => { if (!submitted) setQuizAnswers(p => ({ ...p, [currentSlide]: { ...p[currentSlide], [qi]: oi } })); }} disabled={submitted}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-[10px] transition-all ${s}`}>
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {submitted && isRight && <span className="text-emerald-500 font-bold text-[10px] ml-2">✓</span>}
                            {submitted && isSel && !isRight && <span className="text-red-500 font-bold text-[10px] ml-2">✗</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <div className="flex gap-2 p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text-primary)]">Explanation: </strong>{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!submitted && (
              <button onClick={() => {
                if (Qs.some((_: any, i: number) => answers[i] === undefined)) { addToast('Please answer all questions first!', 'warning'); return; }
                setQuizSubmitted(p => ({ ...p, [currentSlide]: true }));
                recordQuizScore(moduleId, pct);
                addToast(`Quiz submitted! You scored ${correct}/${Qs.length} (${pct}%).`, 'info');
              }} className="shrink-0 w-fit px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all">
                Submit Answers
              </button>
            )}
          </div>
        );
      })();

      // ─────────────── PROMPT EVALUATION ───────────────
      case 'prompt_evaluation': return (() => {
        const ev = promptEvalResult[currentSlide] || { submitted: false, score: 0, strengths: [], weaknesses: [] };
        const input = promptInput[currentSlide] || '';
        const evaluate = () => {
          if (!input.trim()) { addToast('Please type your prompt first!', 'warning'); return; }
          const t = input.toLowerCase(); const strengths: string[] = []; const weaknesses: string[] = [];
          let score = 20;
          const val = slide.validation;
          if (val?.regex_required_tokens) {
            val.regex_required_tokens.forEach((tok: string) => {
              if (t.includes(tok.toLowerCase())) { score += 8; strengths.push(`✓ Included P.R.O.M.P.T. pillar: "${tok}"`); }
              else weaknesses.push(`✗ Missing P.R.O.M.P.T. pillar: "${tok}" — define it explicitly.`);
            });
          }
          if (val?.security_tokens) {
            val.security_tokens.forEach((tok: string) => {
              if (t.includes(tok.toLowerCase())) { score += 10; strengths.push(`✓ Security mitigation enforced: "${tok}"`); }
              else weaknesses.push(`✗ Missing security mitigation: "${tok}"`);
            });
          }
          const hasList = t.includes('\n-') || t.includes('\n*') || /\n\d\./.test(t) || t.split('\n').length > 4;
          if (hasList) { score += 10; strengths.push('✓ Uses structured formatting to isolate constraints.'); }
          else weaknesses.push('✗ Prompt is unstructured prose — use numbered lists per P.R.O.M.P.T. pillar.');
          score = Math.min(score, 100);
          setPromptEvalResult(p => ({ ...p, [currentSlide]: { submitted: true, score, strengths, weaknesses } }));
          addToast(`Prompt evaluated! Score: ${score}/100.`, 'success');
        };
        return (
          <div className="flex-1 flex flex-col gap-3 max-w-3xl mx-auto w-full min-h-0">
            <div className="text-center shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{slide.subtitle}</div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
            </div>
            <div className="shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-3">
              <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Sparkles className="h-3 w-3" />Challenge Scenario</p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{slide.scenario}</p>
            </div>
            {!ev.submitted ? (
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1"><Edit3 className="h-3 w-3" />Your P.R.O.M.P.T. Response</label>
                <textarea rows={7} value={input} onChange={e => setPromptInput(p => ({ ...p, [currentSlide]: e.target.value }))}
                  placeholder={"Purpose: ...\nRole: ...\nOutput: ...\nMarker: ...\nPattern: ...\nTone: ..."}
                  className="flex-1 w-full px-3 py-2.5 rounded-xl border-2 border-indigo-500/40 bg-[var(--bg-card)] text-[var(--text-primary)] text-[11px] font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none placeholder-[var(--text-secondary)]/40"
                />
                <p className="text-[10px] text-indigo-400/70">💡 Use one section per P.R.O.M.P.T. pillar for highest score.</p>
                <button onClick={evaluate} className="w-fit px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" /> Evaluate Prompt
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center font-extrabold shrink-0 ${ev.score >= 80 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ev.score >= 60 ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                      <span className="text-sm">{ev.score}</span><span className="text-[10px]">/100</span>
                    </div>
                    <div><p className="text-xs font-bold text-[var(--text-primary)]">Prompt Effectiveness Score</p><p className="text-[10px] text-[var(--text-secondary)]">{ev.score >= 80 ? '✅ Passes quality gate!' : ev.score >= 60 ? '⚠️ Good attempt — add missing pillars.' : '❌ Under 60% — review weaknesses.'}</p></div>
                  </div>
                  <button onClick={() => setPromptEvalResult(p => ({ ...p, [currentSlide]: { ...ev, submitted: false } }))} className="text-[10px] font-bold text-indigo-400 border border-indigo-500/30 rounded px-2.5 py-1 hover:bg-indigo-500/10 transition-all shrink-0">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden min-h-0">
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 overflow-y-auto">
                    <p className="text-[10px] font-extrabold text-emerald-400 uppercase mb-2">Strengths ({ev.strengths.length})</p>
                    {ev.strengths.map((s: string, i: number) => <p key={i} className="text-[10px] text-[var(--text-secondary)] leading-snug mb-1">{s}</p>)}
                    {ev.strengths.length === 0 && <p className="text-[10px] text-[var(--text-secondary)] italic">None identified. Add validation or security rules.</p>}
                  </div>
                  <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 overflow-y-auto">
                    <p className="text-[10px] font-extrabold text-amber-400 uppercase mb-2">Weaknesses ({ev.weaknesses.length})</p>
                    {ev.weaknesses.map((w: string, i: number) => <p key={i} className="text-[10px] text-[var(--text-secondary)] leading-snug mb-1">{w}</p>)}
                    {ev.weaknesses.length === 0 && <p className="text-[10px] text-emerald-400 italic font-semibold">Zero weaknesses! Perfect constraint engineering.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })();

      // ─────────────── KNOWLEDGE CHECK ───────────────
      case 'knowledge_check': return (
        <div className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto w-full justify-center">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{slide.subtitle}</div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2>
          </div>
          {slide.questions?.map((q: string, i: number) => (
            <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 flex gap-3 items-start">
              <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      );

      // ─────────────── MODULE COMPLETE ───────────────
      case 'module_complete': {
        const quizSlideIdx = totalSlides.findIndex(s => s.type === 'quiz');
        let quizScore = currentUser?.progress?.quizScores?.[moduleId] || 0;
        if (quizSlideIdx !== -1 && quizSubmitted[quizSlideIdx]) {
          const Qs = getQuizQuestions(totalSlides[quizSlideIdx]);
          const answers = quizAnswers[quizSlideIdx] || {};
          const correct = Qs.reduce((a: number, q: any, i: number) => a + (answers[i] === q.answer ? 1 : 0), 0);
          const pct = Qs.length > 0 ? Math.round((correct / Qs.length) * 100) : 0;
          quizScore = Math.max(quizScore, pct);
        }

        const passThreshold = slide.score_display?.pass_threshold || 80;
        const isPassed = quizScore >= passThreshold;

        return (
          <div className="flex-1 flex flex-col gap-5 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto p-4 sm:p-5">
            <div className="text-center shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-2">
                {RI(slide.icon || 'party-popper', 'h-4 w-4')}
                <span>{slide.subtitle || 'Module Complete'}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{slide.title || 'You Did It!'}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 items-start">
              <div className="glass-card p-4 rounded-2xl border border-[var(--border-color)] flex flex-col items-center text-center space-y-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {slide.score_display?.label || 'Your Quiz Score'}
                </p>
                
                <div className="relative flex items-center justify-center h-28 w-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="var(--surface-sunken)"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke={isPassed ? '#10b981' : '#f59e0b'}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - quizScore / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className={`absolute text-xl font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {quizScore}%
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed font-semibold ${
                  isPassed 
                    ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400' 
                    : 'border-amber-500/25 bg-amber-500/5 text-amber-400'
                }`}>
                  {isPassed 
                    ? (slide.score_display?.pass_message || 'You passed. Module 2 is unlocked.') 
                    : (slide.score_display?.retry_message || 'Review the recap and retake the quiz.')
                  }
                </div>
              </div>

              <div className="space-y-4">
                {slide.milestone_banner && (
                  <div className="border border-indigo-500/25 bg-indigo-500/5 p-3.5 rounded-xl text-xs font-bold text-indigo-300 leading-relaxed">
                    {slide.milestone_banner}
                  </div>
                )}

                {slide.summary_bullets && slide.summary_bullets.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">What You Locked In</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {slide.summary_bullets.map((b: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start p-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]">
                          <div className="text-indigo-400 mt-0.5 shrink-0">{RI(b.icon || 'check-circle-2', 'h-3.5 w-3.5')}</div>
                          <span className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-medium">{b.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slide.achievement_stats?.stats && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {slide.achievement_stats.label || 'Session stats'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {slide.achievement_stats.stats.map((st: any, idx: number) => (
                        <div key={idx} className="glass-card p-2 rounded-xl border border-[var(--border-color)] flex flex-col items-center justify-center text-center">
                          <span className="text-indigo-400 mb-0.5">{RI(st.icon, 'h-3.5 w-3.5')}</span>
                          <span className="text-sm font-extrabold text-[var(--text-primary)]">{st.value}</span>
                          <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-0.5 leading-snug">{st.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slide.closing_message && (
                  <p className="text-[11px] italic text-[var(--text-secondary)] leading-relaxed bg-slate-500/5 p-2.5 rounded-lg border border-[var(--border-color)]">
                    {slide.closing_message}
                  </p>
                )}

                <div className="pt-1">
                  {isPassed ? (
                    <button
                      onClick={() => {
                        recordModuleComplete(moduleId);
                        onComplete();
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      {slide.cta_button || 'Proceed to Module 2'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (quizSlideIdx !== -1) setCurrentSlide(quizSlideIdx);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      Retake Quiz Challenge
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ─────────────── DEFAULT WELCOME FALLBACK ───────────────
      default: return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">{RI(slide.icon || 'sparkles', 'h-8 w-8')}</div>
          <div><div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">{slide.subtitle}</div><h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{slide.title}</h2></div>
          {slide.bullets?.length > 0 && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-left space-y-2.5 w-full">
              {slide.bullets.map((b: string, i: number) => <div key={i} className="flex gap-2.5 items-start text-[11px] text-[var(--text-secondary)]"><CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /><span>{b}</span></div>)}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-lg p-4">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl flex flex-col overflow-hidden">
        {selectedTone === null ? (
          /* ── TONE SELECTION OVERLAY ── */
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 max-w-3xl mx-auto w-full text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Adaptive Voice Engine
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Choose Your Learning Tone
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed mt-2">
                This module supports adaptive voice phrasing. Select the tone that best matches your professional register or learning style.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              {[
                {
                  key: 'conversational',
                  title: '💬 Conversational',
                  subtitle: 'Default Voice',
                  desc: 'Warm, confident, and analogy-driven. Perfect for a standard balanced classroom pace.'
                },
                {
                  key: 'formal',
                  title: '🎯 Formal / Executive',
                  subtitle: 'ROI-Framed',
                  desc: 'Structured prose and precise explanations. Designed for CXOs and strategic leads.'
                },
                {
                  key: 'genz',
                  title: '⚡ Gen-Z / High-Energy',
                  subtitle: 'Modern & Direct',
                  desc: 'Punchy lines, key takeaways, and modern analogies. Respects your time and energy.'
                },
                {
                  key: 'beginner',
                  title: '🧪 Beginner / ELI5',
                  subtitle: 'Explain Like I\'m 5',
                  desc: 'Slower paced explainers, no jargon left unexplained, with hand-held guidance throughout.'
                }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTone(t.key as any)}
                  className="glass-card p-5 rounded-2xl border border-[var(--border-color)] hover:border-purple-500/40 hover:bg-purple-500/5 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
                        {t.title}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-500/10 text-[var(--text-secondary)]">
                        {t.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Select Tone &rarr;
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-[var(--border-color)] hover:bg-slate-500/5 text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel Presenter
            </button>
          </div>
        ) : (
          /* ── PRESENTATION SHADE ── */
          <>
            {/* Progress Bar */}
            <div className="h-0.5 shrink-0 bg-[var(--border-color)]">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-extrabold shrink-0">{moduleId}</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{slide.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Slide {currentSlide + 1} of {slidesCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex gap-1 items-center">
                  {Array.from({ length: slidesCount }).map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`rounded-full transition-all ${i === currentSlide ? 'w-5 h-1.5 bg-indigo-500' : i < currentSlide ? 'w-1.5 h-1.5 bg-emerald-500/50' : 'w-1.5 h-1.5 bg-[var(--border-color)] hover:bg-slate-400/40'}`} />
                  ))}
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-500/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Content Grid — NO OUTER SCROLL */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_220px]">

              {/* ── Left: Slide Panel ── */}
              <div className="flex flex-col min-h-0 lg:border-r border-[var(--border-color)]">
                {/* Slide Content — fills available space, designed to fit */}
                <div key={animKey} className={`flex-1 min-h-0 px-4 sm:px-6 py-4 flex flex-col ${slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
                  {renderSlide()}
                </div>

                {/* Mobile Audio Guide Controller (Visible on mobile/tablet, hidden on desktop) */}
                <div className="lg:hidden shrink-0 border-t border-[var(--border-color)] px-4 py-2.5 bg-[var(--bg-card)]/40 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={toggleAudio}
                      className={`h-8 px-2.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isPlayingAudio && !isPausedAudio
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]'
                      }`}
                    >
                      {isPlayingAudio ? (
                        isPausedAudio ? (
                          <><Play className="h-3 w-3 animate-pulse" /> Resume</>
                        ) : (
                          <><Pause className="h-3 w-3" /> Pause</>
                        )
                      ) : (
                        <><Play className="h-3 w-3" /> Play</>
                      )}
                    </button>
                    
                    {isPlayingAudio && (
                      <button 
                        onClick={stopAudio}
                        className="h-8 w-8 border border-[var(--border-color)] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-lg text-[10px] flex items-center justify-center transition-all text-[var(--text-secondary)]"
                        title="Stop & Reset"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between items-center text-[9px] text-[var(--text-secondary)]">
                      <span className="truncate">{isPlayingAudio ? (isPausedAudio ? 'Audio Paused' : `Narrating: ${currentSpeaker || 'Guide'}`) : 'Audio Guide'}</span>
                      <span className="font-mono shrink-0">{formatTime(audioProgress)} / {formatTime(audioDuration || getSlideDuration(slide))}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-500/10 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (audioProgress / (audioDuration || getSlideDuration(slide) || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Bar */}
                <div className="h-16 shrink-0 border-t border-[var(--border-color)] flex items-center justify-between px-4 sm:px-6 bg-[var(--bg-card)]/30">
                  <button onClick={handlePrev} disabled={currentSlide === 0}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed border border-[var(--border-color)] text-[var(--text-secondary)]' : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]/80 hover:shadow-sm'}`}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </button>

                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold">{currentSlide + 1} / {slidesCount}</span>

                  {currentSlide === slidesCount - 1 ? (
                    <button onClick={() => { recordModuleComplete(moduleId); onClose(); }} disabled={moduleId === 1 && !labPassed}
                      className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg hover:brightness-110 transition-all ${moduleId === 1 && !labPassed ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete Module
                    </button>
                  ) : (
                    <button onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-semibold hover:brightness-110 shadow transition-all">
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Right: Sidebar ── */}
              <div className="hidden lg:flex flex-col p-4 gap-3 overflow-y-auto bg-[var(--bg-card)]/20">
                {/* Avatar */}
                <div className="shrink-0"><Avatar /></div>
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">OrchestrAI Guide</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Autonomous AI Avatar</p>
                </div>

                {/* Narration */}
                <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-3 overflow-y-auto space-y-2.5">
                  {Array.isArray(slide.narration_script) && slide.narration_script.length > 0 ? (
                    slide.narration_script.map((seg: any, i: number) => {
                      const isTalking = isPlayingAudio && currentSpeaker === seg.speaker;
                      return (
                        <div key={i} className={`p-2 rounded-lg border transition-all ${isTalking ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-transparent opacity-80'}`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-[9px] uppercase tracking-widest font-extrabold ${isTalking ? 'text-indigo-400 font-bold' : 'text-[var(--text-secondary)]'}`}>{seg.speaker} ({seg.voice})</span>
                            {isTalking && <span className="flex h-1.5 w-1.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span></span>}
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed italic">"{seg.text}"</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed italic">"{slide.narration || 'No narration for this step.'}"</p>
                  )}
                </div>

                {/* Progress */}
                <div className="shrink-0 space-y-1.5">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Array.from({ length: slidesCount }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentSlide(i)} className={`rounded-full transition-all ${i === currentSlide ? 'w-5 h-2 bg-indigo-500' : i < currentSlide ? 'w-2 h-2 bg-emerald-500/60' : 'w-2 h-2 bg-[var(--border-color)]'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-[var(--text-secondary)]">{progressPct}% complete</p>
                </div>

                {/* Voiceover */}
                <div className="shrink-0 border-t border-[var(--border-color)] pt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Audio Guide</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {formatTime(audioProgress)} / {formatTime(audioDuration || getSlideDuration(slide))}
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (audioProgress / (audioDuration || getSlideDuration(slide) || 1)) * 100)}%` }}
                    />
                  </div>

                  {/* Media Controls */}
                  <div className="flex gap-2">
                    {/* Play / Pause / Resume Button */}
                    <button 
                      onClick={toggleAudio}
                      className={`flex-1 py-2 border rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isPlayingAudio && !isPausedAudio
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-[var(--border-color)] hover:bg-[var(--bg-card)] text-[var(--text-primary)]'
                      }`}
                    >
                      {isPlayingAudio ? (
                        isPausedAudio ? (
                          <><Play className="h-3.5 w-3.5 animate-pulse" /> Resume</>
                        ) : (
                          <><Pause className="h-3.5 w-3.5" /> Pause</>
                        )
                      ) : (
                        <><Play className="h-3.5 w-3.5" /> Play Voiceover</>
                      )}
                    </button>

                    {/* Stop / Reset Button */}
                    {isPlayingAudio && (
                      <button 
                        onClick={stopAudio}
                        className="px-2.5 py-2 border border-[var(--border-color)] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-lg text-[10px] font-bold transition-all text-[var(--text-secondary)] shrink-0 flex items-center justify-center"
                        title="Stop & Reset"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-center text-[var(--text-secondary)]">
                    {isPlayingAudio ? (
                      isPausedAudio ? 'Audio Paused' : `Narrating: ${currentSpeaker || 'Guide'}`
                    ) : 'Click Play to hear lesson audio'}
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};
