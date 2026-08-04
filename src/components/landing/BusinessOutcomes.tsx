import React, { useEffect, useRef, useState } from 'react';
import { Gauge, Timer, MessageSquare, Scale, UserCheck, TrendingUp, BarChart3 } from 'lucide-react';
import { Reveal } from './Reveal';
import { observeOnce, usePrefersReducedMotion } from './useReveal';

interface Outcome {
  icon: React.ComponentType<{ className?: string }>;
  /** Numeric part that counts up when scrolled into view (optional) */
  count?: number;
  prefix?: string;
  suffix?: string;
  /** Static value shown when there is nothing to count */
  staticValue?: string;
  label: string;
  desc: string;
  accent: string;
}

const OUTCOMES: Outcome[] = [
  { icon: Gauge,          count: 10, suffix: 'X',      label: 'Faster Delivery',        desc: 'Outcomes shipped in a fraction of the traditional cycle time.', accent: 'text-indigo-400'  },
  { icon: Timer,          staticValue: '1–2 Days',     label: 'Micro Sprints',          desc: 'Short, focused delivery cycles instead of multi-week sprints.',  accent: 'text-cyan-400'    },
  { icon: MessageSquare,  staticValue: 'Same Day',     label: 'Faster Feedback Loops',  desc: 'Feedback re-enters delivery immediately, not next iteration.',   accent: 'text-purple-400'  },
  { icon: Scale,          staticValue: 'Built In',     label: 'Enterprise Governance',  desc: 'Controlled, auditable and measurable delivery at every stage.',  accent: 'text-emerald-400' },
  { icon: UserCheck,      staticValue: 'Always',       label: 'Human Ownership',        desc: 'People stay accountable for decisions, quality and outcomes.',   accent: 'text-amber-400'   },
  { icon: TrendingUp,     staticValue: 'Continuous',   label: 'Continuous Improvement', desc: 'Every cycle makes the next delivery cycle measurably better.',   accent: 'text-rose-400'    },
];

/** Counts up to `target` the first time the element scrolls into view. */
const useVisibleCounter = (target: number, duration = 1400) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const canAnimate = !reducedMotion && typeof IntersectionObserver !== 'undefined';

  useEffect(() => {
    if (!canAnimate) return;

    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let startedAt = 0;

    const stopObserving = observeOnce(
      el,
      () => {
        const tick = (now: number) => {
          if (!startedAt) startedAt = now;
          const progress = Math.min((now - startedAt) / duration, 1);
          // Ease-out so the number settles instead of stopping dead
          setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    return () => {
      stopObserving();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration, canAnimate]);

  // Without animation (reduced motion / no observer) the final number shows immediately
  return { ref, value: canAnimate ? value : target };
};

const OutcomeCard: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
  const { icon: Icon, count, prefix, suffix, staticValue, label, desc, accent } = outcome;
  const { ref, value } = useVisibleCounter(count ?? 0);

  return (
    <div ref={ref} className="glass-card hover-lift rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${accent}`}>
          {count !== undefined ? `${prefix ?? ''}${value}${suffix ?? ''}` : staticValue}
        </span>
      </div>
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">{label}</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

/**
 * BusinessOutcomes — the outcomes an enterprise actually buys, presented as
 * animated KPI cards. Counters run once, when the card first becomes visible.
 */
export const BusinessOutcomes: React.FC = () => (
  <section id="outcomes" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
    <div className="mx-auto max-w-7xl">

      <Reveal className="text-center mb-9 sm:mb-11">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/6 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
          <BarChart3 className="h-3.5 w-3.5" />
          Business Outcomes
        </div>
        <h2 className="section-title font-extrabold tracking-tight">
          What Enterprises <span className="gradient-text">Actually Get</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Not slideware. Measurable delivery outcomes, governed end to end.
        </p>
      </Reveal>

      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {OUTCOMES.map((outcome) => (
          <OutcomeCard key={outcome.label} outcome={outcome} />
        ))}
      </Reveal>
    </div>
  </section>
);
