import React from 'react';
import {
  Lightbulb, Workflow, Rocket, ChevronRight, ChevronDown,
  GraduationCap, Wrench, Sparkles, BadgeCheck, FlaskConical,
} from 'lucide-react';
import { Reveal } from './Reveal';

/** Idea → ODF → Production Application. The framework is the product. */
const PIPELINE = [
  {
    label: 'Idea',
    detail: 'A business outcome someone needs.',
    icon: Lightbulb,
    accent: 'text-amber-400',
    ring: 'border-amber-500/25 bg-amber-500/5',
  },
  {
    label: 'ODF',
    detail: 'The OrchestrAI Delivery Framework.',
    icon: Workflow,
    accent: 'text-indigo-400',
    ring: 'border-indigo-500/35 bg-indigo-500/10',
    emphasis: true,
  },
  {
    label: 'Production Application',
    detail: 'Running software, in real hands.',
    icon: Rocket,
    accent: 'text-emerald-400',
    ring: 'border-emerald-500/25 bg-emerald-500/5',
  },
];

/** The approved narrative, one card per line. */
const STEPS = [
  {
    icon: GraduationCap,
    title: 'Learn the framework.',
    desc: 'Modules 1–6 teach ODF end to end — how intent becomes governed, working software.',
    accent: 'text-indigo-400',
  },
  {
    icon: Wrench,
    title: 'Apply the framework.',
    desc: 'You run ODF yourself on a real build, not a walkthrough or a sandbox exercise.',
    accent: 'text-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Turn ideas into working solutions.',
    desc: 'The same loop that produced this portal turns your idea into something that runs.',
    accent: 'text-purple-400',
  },
  {
    icon: BadgeCheck,
    title: 'Build your own proof.',
    desc: 'Certification is earned on the application you shipped — not on a theory exam.',
    accent: 'text-emerald-400',
  },
];

/**
 * OdfProofNarrative — Phase 1 narrative hardening.
 *
 * Sits directly above "Real Apps. Real Speed." so the evidence below it is read
 * as evidence. The message is the framework, not the applications: an idea goes
 * in, ODF runs, a production application comes out — a claim that holds whether
 * there are four applications on this page or four hundred.
 */
export const OdfProofNarrative: React.FC = () => (
  <section id="odf-proof" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
    <div className="mx-auto max-w-6xl">

      <Reveal className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/6 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Workflow className="h-3.5 w-3.5" />
          The Framework Is The Product
        </div>
        <h2 className="section-title font-extrabold tracking-tight">
          This Academy is proof that <span className="gradient-text">ODF works.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          The same framework can transform an idea into a
          <strong className="text-[var(--text-primary)]"> production-ready application in days instead of months</strong>.
        </p>
      </Reveal>

      {/* ── Idea → ODF → Production Application ── */}
      <Reveal className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4">
          {PIPELINE.map(({ label, detail, icon: Icon, accent, ring, emphasis }, i) => (
            <React.Fragment key={label}>
              {i > 0 && (
                <div className="flex items-center justify-center text-[var(--text-muted)] shrink-0" aria-hidden="true">
                  <ChevronDown className="h-5 w-5 md:hidden" />
                  <ChevronRight className="hidden md:block h-5 w-5" />
                </div>
              )}
              <div
                className={`flex-1 rounded-2xl border p-5 text-center ${ring} ${emphasis ? 'md:scale-105 glow-soft' : ''}`}
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] ${accent} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`font-extrabold leading-tight ${emphasis ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} ${emphasis ? accent : 'text-[var(--text-primary)]'}`}>
                  {label}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1.5">{detail}</p>
              </div>
            </React.Fragment>
          ))}
        </div>

        <p className="text-center text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-6 max-w-2xl mx-auto">
          The application is never the story. The
          <strong className="text-[var(--text-primary)]"> repeatable framework</strong> that produced it is.
        </p>
      </Reveal>

      {/* ── Learn · Apply · Turn ideas into solutions · Build your own proof ── */}
      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map(({ icon: Icon, title, desc, accent }, i) => (
          <div key={title} className="group glass-card hover-lift rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] ${accent} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-extrabold tracking-widest text-[var(--text-muted)]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </Reveal>

      {/* ── POC → PIP, framed as an outcome rather than an acronym ── */}
      <Reveal className="mt-8 glass-card rounded-2xl px-5 py-5 sm:px-7 sm:py-6" delay={100}>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3.5 py-2 text-sm font-extrabold text-amber-400">
              <FlaskConical className="h-4 w-4" /> POC
            </span>
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3.5 py-2 text-sm font-extrabold text-emerald-400">
              <BadgeCheck className="h-4 w-4" /> Proved in Practice
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed text-center sm:text-left">
            Ideas do not stop at a proof of concept here. ODF carries them through to systems that are
            <strong className="text-[var(--text-primary)]"> demoed to real clients, deployed, and used</strong> —
            which is the only evidence that a delivery framework actually works.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);
