import React from 'react';
import { Zap, UserCheck, Cpu, Scale, RefreshCw, Building2, Sparkles } from 'lucide-react';
import { Reveal } from './Reveal';

const REASONS = [
  {
    icon: Zap,
    title: 'Faster Delivery',
    desc: 'Reduce traditional delivery delays.',
    accent: 'text-indigo-400',
    tint: 'from-indigo-500/18',
  },
  {
    icon: UserCheck,
    title: 'Human Ownership',
    desc: 'Humans remain accountable.',
    accent: 'text-emerald-400',
    tint: 'from-emerald-500/18',
  },
  {
    icon: Cpu,
    title: 'AI Acceleration',
    desc: 'AI accelerates execution.',
    accent: 'text-purple-400',
    tint: 'from-purple-500/18',
  },
  {
    icon: Scale,
    title: 'Governance',
    desc: 'Controlled and measurable delivery.',
    accent: 'text-cyan-400',
    tint: 'from-cyan-500/18',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Evolution',
    desc: 'Delivery improves continuously.',
    accent: 'text-amber-400',
    tint: 'from-amber-500/18',
  },
  {
    icon: Building2,
    title: 'Enterprise Readiness',
    desc: 'Built for enterprise-scale adoption.',
    accent: 'text-rose-400',
    tint: 'from-rose-500/18',
  },
];

/**
 * WhyOrchestrAI — the six-reason value story, told visually.
 * Each card carries a tinted gradient wash that warms up on hover.
 */
export const WhyOrchestrAI: React.FC = () => (
  <section id="why-orchestrai" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
    <div className="mx-auto max-w-7xl">

      <Reveal className="text-center mb-9 sm:mb-11">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/6 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Why It Exists
        </div>
        <h2 className="section-title font-extrabold tracking-tight">
          Why was <span className="gradient-text">OrchestrAI</span> created?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Enterprise delivery was too slow, and AI alone was too unaccountable. Six reasons enterprises
          adopt OrchestrAI — and six reasons professionals learn it.
        </p>
      </Reveal>

      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {REASONS.map(({ icon: Icon, title, desc, accent, tint }) => (
          <div
            key={title}
            className="group glass-card hover-lift rounded-2xl p-6 relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${tint} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] ${accent} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5 leading-snug">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);
