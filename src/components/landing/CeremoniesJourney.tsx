import React from 'react';
import { Target, Timer, Cpu, Presentation, RefreshCw, Workflow, ChevronDown } from 'lucide-react';
import { useReveal } from './useReveal';

const CEREMONIES = [
  {
    icon: Target,
    title: 'Intent Workshop',
    desc: 'Define business outcomes and goals.',
    accent: 'text-indigo-400',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
  },
  {
    icon: Timer,
    title: 'Micro Sprint',
    desc: 'Execute focused delivery cycles.',
    accent: 'text-cyan-400',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
  },
  {
    icon: Cpu,
    title: 'AI Review',
    desc: 'Review AI-generated outcomes.',
    accent: 'text-purple-400',
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/20',
  },
  {
    icon: Presentation,
    title: 'Demo Review',
    desc: 'Validate business value and progress.',
    accent: 'text-emerald-400',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Evolution',
    desc: 'Improve continuously through feedback.',
    accent: 'text-amber-400',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
  },
];

/**
 * CeremoniesJourney — the high-level OrchestrAI ceremonies as an animated
 * roadmap. Horizontal track on desktop, vertical spine on mobile; the
 * connecting line draws itself once the section scrolls into view.
 * Ceremony definitions are presented exactly as specified — visual only.
 */
export const CeremoniesJourney: React.FC = () => {
  const { ref, visible } = useReveal<HTMLDivElement>(0.15);

  return (
    <section id="ceremonies" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
      <div className="mx-auto max-w-7xl">

        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/6 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Workflow className="h-3.5 w-3.5" />
            High-Level OrchestrAI Ceremonies
          </div>
          <h2 className="section-title font-extrabold tracking-tight">
            The Delivery <span className="gradient-text">Rhythm</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Five ceremonies carry a team from business intent to continuously improving software.
          </p>
        </div>

        <div ref={ref} className={visible ? 'is-visible' : ''}>

          {/* ── Desktop: horizontal animated roadmap ── */}
          <div className="hidden lg:block relative">
            {/* Base rail + drawn progress rail */}
            <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-[var(--border-color)]" aria-hidden="true">
              <div className="roadmap-track h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400" />
            </div>

            <div className="relative grid grid-cols-5 gap-4">
              {CEREMONIES.map(({ icon: Icon, title, desc, accent, dot, ring }, i) => (
                <div
                  key={title}
                  className={`flex flex-col items-center text-center reveal ${visible ? 'is-visible' : ''}`}
                  style={{ transitionDelay: `${300 + i * 140}ms` }}
                >
                  <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface-raised)] ring-4 ${ring} ${accent} shadow-lg`}>
                    <Icon className="h-6 w-6" />
                    <span className={`absolute -bottom-1.5 h-3 w-3 rounded-full ${dot} border-2 border-[var(--surface-raised)]`} aria-hidden="true" />
                  </div>
                  <div className="mt-6 glass-card hover-lift rounded-2xl p-5 w-full">
                    <div className={`text-xs font-extrabold tracking-widest mb-1.5 ${accent}`}>
                      STEP {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 leading-snug">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile / tablet: vertical spine ── */}
          <div className="lg:hidden relative pl-12">
            <div className="absolute left-[26px] top-3 bottom-3 w-0.5 bg-[var(--border-color)]" aria-hidden="true">
              <div className="roadmap-track-y h-full w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-400" />
            </div>

            <div className="space-y-4">
              {CEREMONIES.map(({ icon: Icon, title, desc, accent, ring }, i) => (
                <div
                  key={title}
                  className={`relative reveal ${visible ? 'is-visible' : ''}`}
                  style={{ transitionDelay: `${200 + i * 120}ms` }}
                >
                  <div className={`absolute -left-12 top-3 flex h-13 w-13 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface-raised)] ring-4 ${ring} ${accent}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="glass-card hover-lift rounded-2xl p-5">
                    <div className={`text-xs font-extrabold tracking-widest mb-1.5 ${accent}`}>
                      STEP {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 leading-snug">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                  {i < CEREMONIES.length - 1 && (
                    <div className="flex justify-center py-1 text-[var(--text-muted)]" aria-hidden="true">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
