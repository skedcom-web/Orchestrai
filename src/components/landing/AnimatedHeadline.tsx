import React, { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './useReveal';

const HEADLINES = [
  'BUILD ENTERPRISE SOFTWARE',
  'ORCHESTRATE AI DELIVERY',
  'DELIVER IN DAYS',
  'OWN THE OUTCOME',
  'LEAD THE FUTURE',
];

const ROTATE_MS = 2600;

/**
 * AnimatedHeadline — the rotating brand statement above the hero headline.
 *
 * Each phrase fades/slides in, holds, then hands over to the next. The block
 * reserves its own height so nothing below it shifts (no CLS). With "reduce
 * motion" on, the phrases still rotate but without the transition, and the
 * live region is polite so screen readers are not interrupted.
 */
export const AnimatedHeadline: React.FC<{ centered?: boolean }> = ({ centered }) => {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % HEADLINES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`headline-rotator min-h-[1.9rem] sm:min-h-[2.1rem] mb-3 flex items-center ${centered ? 'justify-center' : ''}`}>
      <span
        key={reducedMotion ? 'static' : index}
        aria-hidden="true"
        className={`${reducedMotion ? '' : 'headline-line'} gradient-text text-base sm:text-lg font-extrabold uppercase tracking-[0.18em]`}
      >
        {HEADLINES[index]}
      </span>
      {/* Single accessible copy — announced politely, never duplicated visually */}
      <span className="sr-only" aria-live="polite">{HEADLINES[index]}</span>
    </div>
  );
};
