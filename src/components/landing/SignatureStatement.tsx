import React from 'react';
import { useReveal } from './useReveal';

const LINES = [
  { text: 'Human Orchestrates.', className: 'text-[var(--text-primary)]' },
  { text: 'AI Builds.',          className: 'gradient-text' },
  { text: 'Value Delivered.',    className: 'text-[var(--text-primary)]' },
];

/**
 * SignatureStatement — the core brand statement, given full-bleed premium
 * treatment: oversized type, aurora wash, and a line-by-line reveal.
 */
export const SignatureStatement: React.FC = () => {
  const { ref, visible } = useReveal<HTMLElement>(0.25);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-[var(--border-color)] py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      {/* Aurora wash */}
      <div className="aurora-stage" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse 70% 70% at 50% 0%, rgba(99,102,241,0.16) 0%, transparent 65%)',
              'radial-gradient(ellipse 60% 60% at 20% 100%, rgba(168,85,247,0.14) 0%, transparent 62%)',
              'radial-gradient(ellipse 60% 60% at 85% 90%, rgba(6,182,212,0.12) 0%, transparent 62%)',
            ].join(','),
          }}
        />
        <div
          className="aurora-band aurora-drift-b"
          style={{
            top: '-30%',
            left: '25%',
            width: 'min(760px, 92vw)',
            height: 'min(520px, 60vh)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.42) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-indigo-400 mb-7">
          The OrchestrAI Principle
        </p>

        <h2 className="space-y-1 sm:space-y-2">
          {LINES.map((line, i) => (
            <span
              key={line.text}
              className={`signature-line block reveal ${visible ? 'is-visible' : ''} ${line.className}`}
              style={{ transitionDelay: `${i * 160}ms` }}
            >
              {line.text}
            </span>
          ))}
        </h2>

        <p className={`mt-8 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed reveal ${visible ? 'is-visible' : ''}`}
           style={{ transitionDelay: '560ms' }}>
          The human sets the intent, the constraints and the standard. AI executes at machine speed.
          The business gets working software — governed, reviewable and owned.
        </p>
      </div>
    </section>
  );
};
