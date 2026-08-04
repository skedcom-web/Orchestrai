import React from 'react';

/**
 * HeroAurora — premium animated backdrop for the hero band.
 *
 * Three slow-drifting aurora bands over a gradient-mesh wash, plus a travelling
 * light sheen. Colour values are theme-neutral (indigo / violet / cyan brand
 * ramp) and opacity is tuned per theme in index.css, so light, dark and glass
 * all stay legible. Transform/opacity only — no layout work, no repaint storms.
 */
export const HeroAurora: React.FC = () => (
  <div className="aurora-stage" aria-hidden="true">
    {/* Gradient mesh wash */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 60% 55% at 15% 10%, rgba(99,102,241,0.18) 0%, transparent 62%)',
          'radial-gradient(ellipse 55% 50% at 85% 15%, rgba(168,85,247,0.16) 0%, transparent 60%)',
          'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(6,182,212,0.12) 0%, transparent 65%)',
        ].join(','),
      }}
    />

    {/* Aurora band — indigo, upper left */}
    <div
      className="aurora-band aurora-drift-a"
      style={{
        top: '-18%',
        left: '-12%',
        width: 'min(720px, 90vw)',
        height: 'min(520px, 60vh)',
        background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(79,70,229,0.18) 45%, transparent 72%)',
      }}
    />

    {/* Aurora band — violet, upper right */}
    <div
      className="aurora-band aurora-drift-b"
      style={{
        top: '-10%',
        right: '-14%',
        width: 'min(680px, 88vw)',
        height: 'min(500px, 58vh)',
        background: 'radial-gradient(circle, rgba(168,85,247,0.50) 0%, rgba(139,92,246,0.16) 48%, transparent 72%)',
        animationDelay: '-8s',
      }}
    />

    {/* Aurora band — cyan, lower centre */}
    <div
      className="aurora-band aurora-drift-a"
      style={{
        bottom: '-24%',
        left: '28%',
        width: 'min(620px, 85vw)',
        height: 'min(440px, 52vh)',
        background: 'radial-gradient(circle, rgba(34,211,238,0.38) 0%, rgba(6,182,212,0.12) 50%, transparent 74%)',
        animationDelay: '-15s',
      }}
    />

    {/* Slow travelling light sheen */}
    <div className="aurora-sheen" />

    {/* Dot-grid texture retained from the original hero */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.07) 1px, transparent 0)',
        backgroundSize: '36px 36px',
      }}
    />
  </div>
);
