import React from 'react';
import { useApp } from '../context/AppContext';

/**
 * GlowBackground — Ambient light orbs.
 *
 * GLASS MODE design inspiration (crypto-app reference):
 * - Deep rich purple background (#0c0826)
 * - Vivid ORANGE + MAGENTA + VIOLET orbs (not teal/blue)
 * - Orbs at high opacity so they light up the purple base
 * - Creates the "glowing orbs behind frosted glass" effect
 *
 * DARK MODE: muted blue/indigo orbs — clearly different palette
 */
export const GlowBackground: React.FC = () => {
  const { theme } = useApp();

  if (theme === 'light') return null;

  const isGlass = theme === 'glass';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

      {/* ── GLASS ORBS ── Vivid orange / magenta / violet (reference style) */}

      {/* Orb 1 — ORANGE / CORAL — Top Left (dominant warm accent) */}
      <div
        className="glow-blob animate-float-up"
        style={{
          top: '-80px',
          left: '-60px',
          width: '650px',
          height: '650px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(255, 90, 30, 0.72) 0%, rgba(255, 60, 80, 0.28) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(60, 80, 200, 0.22) 0%, rgba(50, 60, 180, 0.07) 50%, transparent 100%)',
        }}
      />

      {/* Orb 2 — MAGENTA / HOT PINK — Top Right */}
      <div
        className="glow-blob animate-float-down"
        style={{
          top: '-40px',
          right: '-80px',
          width: '680px',
          height: '680px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(220, 40, 140, 0.68) 0%, rgba(180, 30, 200, 0.22) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(140, 60, 200, 0.18) 0%, rgba(100, 40, 180, 0.06) 55%, transparent 100%)',
          animationDelay: '-5s',
        }}
      />

      {/* Orb 3 — DEEP VIOLET — Mid Screen (large diffuse orb) */}
      <div
        className="glow-blob animate-float-spin"
        style={{
          top: '25%',
          left: '20%',
          width: '700px',
          height: '700px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(110, 40, 220, 0.55) 0%, rgba(80, 20, 200, 0.18) 50%, transparent 72%)'
            : 'radial-gradient(circle, rgba(80, 50, 200, 0.16) 0%, rgba(60, 40, 180, 0.05) 55%, transparent 100%)',
          animationDelay: '-9s',
        }}
      />

      {/* Orb 4 — AMBER / ORANGE — Bottom Left (warm anchor) */}
      <div
        className="glow-blob animate-float-down"
        style={{
          bottom: '-60px',
          left: '5%',
          width: '520px',
          height: '520px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(255, 140, 20, 0.60) 0%, rgba(255, 80, 40, 0.18) 48%, transparent 70%)'
            : 'radial-gradient(circle, rgba(50, 80, 200, 0.14) 0%, rgba(40, 60, 180, 0.05) 50%, transparent 100%)',
          animationDelay: '-7s',
        }}
      />

      {/* Orb 5 — FUCHSIA / ROSE — Bottom Right */}
      <div
        className="glow-blob animate-float-up"
        style={{
          bottom: '5%',
          right: '0%',
          width: '580px',
          height: '580px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(200, 30, 160, 0.52) 0%, rgba(150, 20, 200, 0.16) 48%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100, 40, 200, 0.16) 0%, rgba(80, 30, 180, 0.05) 50%, transparent 100%)',
          animationDelay: '-3s',
        }}
      />

      {/* Orb 6 — ELECTRIC VIOLET — Top Centre (secondary glow layer) */}
      <div
        className="glow-blob animate-float-down"
        style={{
          top: '10%',
          left: '35%',
          width: '500px',
          height: '500px',
          background: isGlass
            ? 'radial-gradient(circle, rgba(155, 60, 240, 0.42) 0%, rgba(100, 40, 220, 0.12) 50%, transparent 72%)'
            : 'radial-gradient(circle, rgba(80, 60, 210, 0.12) 0%, rgba(60, 40, 190, 0.04) 50%, transparent 100%)',
          animationDelay: '-11s',
        }}
      />

    </div>
  );
};
