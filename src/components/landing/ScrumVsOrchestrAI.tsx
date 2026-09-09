import React from 'react';
import { GitCompareArrows, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface Comparison {
  dimension: string;
  scrum: string;
  orchestrai: string;
}

/**
 * Every OrchestrAI column below restates the framework as the Academy already
 * teaches it — the six core principles and the six-stage loop from Module 2,
 * and the ceremonies from the high-level ceremonies section. Nothing new is
 * claimed here; this section only puts the existing method beside the delivery
 * model most enterprises are running today.
 */
const COMPARISONS: Comparison[] = [
  {
    dimension: 'Delivery Unit',
    scrum: 'A 2–4 week Sprint',
    orchestrai: 'A 1–2 day Micro Sprint',
  },
  {
    dimension: 'Who Builds',
    scrum: 'The team hand-writes every line of code',
    orchestrai: 'AI is the primary builder; the human orchestrates',
  },
  {
    dimension: 'How Work Is Specified',
    scrum: 'User stories groomed into a backlog',
    orchestrai: 'Plain-English intent with actors, rules and edge cases',
  },
  {
    dimension: 'Ceremonies',
    scrum: 'Planning · Daily Standup · Review · Retrospective',
    orchestrai: 'Intent Workshop · Micro Sprint · AI Review · Demo Review · Continuous Evolution',
  },
  {
    dimension: 'Feedback Loop',
    scrum: 'Feedback is scheduled into the next sprint',
    orchestrai: 'Feedback is re-prompted in the same session',
  },
  {
    dimension: 'Release Cadence',
    scrum: 'Ships at the end of the sprint',
    orchestrai: 'Continuous delivery as each component is validated',
  },
  {
    dimension: 'Quality',
    scrum: 'Verified after the build is done',
    orchestrai: 'Quality by design — security and logging are day-1 constraints',
  },
  {
    dimension: 'Accountability',
    scrum: 'Measured by team velocity',
    orchestrai: 'Human ownership of the delivered business outcome',
  },
];

/**
 * ScrumVsOrchestrAI — the differentiation section.
 *
 * One interactive card per dimension: Scrum on the left, OrchestrAI on the
 * right, with the OrchestrAI side lighting up on hover. Stacks vertically on
 * phones with the dimension label as the anchor, so the pairing survives the
 * single-column layout.
 */
export const ScrumVsOrchestrAI: React.FC = () => (
  <section id="scrum-vs-orchestrai" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
    <div className="mx-auto max-w-6xl">

      <Reveal className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/6 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <GitCompareArrows className="h-3.5 w-3.5" />
          Scrum vs OrchestrAI
        </div>
        <h2 className="section-title font-extrabold tracking-tight">
          Same Discipline. <span className="gradient-text">Different Engine.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          OrchestrAI does not throw away agile discipline — it rebuilds the delivery engine around
          AI execution and human ownership. Here is what actually changes.
        </p>
      </Reveal>

      {/* Column headers — desktop only, the cards carry their own labels on mobile */}
      <Reveal className="hidden md:grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] gap-4 items-center px-6 mb-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-rose-400">Traditional Scrum</span>
        <span className="w-9" aria-hidden="true" />
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-400">OrchestrAI</span>
      </Reveal>

      <Reveal stagger className="space-y-3">
        {COMPARISONS.map(({ dimension, scrum, orchestrai }) => (
          <div
            key={dimension}
            className="group glass-card hover-lift rounded-2xl p-5 sm:p-6 relative overflow-hidden"
          >
            {/* Accent rail lights up from the OrchestrAI side on hover */}
            <span
              className="absolute top-0 right-0 h-[3px] w-0 group-hover:w-2/3 bg-gradient-to-l from-emerald-400 via-indigo-500 to-transparent transition-all duration-700"
              aria-hidden="true"
            />

            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              {dimension}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] gap-3 md:gap-4 items-center">
              {/* Scrum side */}
              <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 md:grayscale-[0.3] md:group-hover:grayscale-0 transition-[filter] duration-500">
                <span className="md:hidden block text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-1">
                  Traditional Scrum
                </span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{scrum}</p>
              </div>

              {/* Pivot */}
              <div className="flex md:block justify-center" aria-hidden="true">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                </span>
              </div>

              {/* OrchestrAI side */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 px-4 py-3 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-colors duration-300">
                <span className="md:hidden block text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1">
                  OrchestrAI
                </span>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{orchestrai}</p>
              </div>
            </div>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-8 text-center" delay={120}>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          The ceremonies still exist. The accountability still sits with people. What changes is the
          <strong className="text-[var(--text-primary)]"> speed of execution</strong> — and who does the building.
        </p>
      </Reveal>
    </div>
  </section>
);
