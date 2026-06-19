import React, { useMemo } from 'react';
import { useApp, BADGES } from '../context/AppContext';
import { resolveBadgeIcon } from './badgeIcons';
import { X, Sparkles } from 'lucide-react';

const CONFETTI_COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#34d399', '#ec4899'];

/**
 * Global celebration modal — pops one event at a time from the context queue.
 * Level-ups and badge unlocks land here as a confetti moment instead of a toast.
 */
export const CelebrationOverlay: React.FC = () => {
  const { celebrations, dismissCelebration } = useApp();
  const current = celebrations[0];

  // Regenerate confetti per celebration so each pop feels fresh.
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id]
  );

  if (!current) return null;

  const isLevel = current.kind === 'level';
  const badge = !isLevel ? BADGES.find((b) => b.id === current.badgeId) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.4}px`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              ['--rot' as any]: `${c.rotate}deg`,
            }}
          />
        ))}
      </div>

      <div className="glass-card relative w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in-90 fade-in duration-300 overflow-hidden">
        <button
          onClick={() => dismissCelebration(current.id)}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-extrabold uppercase tracking-widest mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          {isLevel ? 'Level Up' : 'Badge Unlocked'}
        </div>

        {/* Medallion */}
        <div className="relative mx-auto mb-5 h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-xl animate-pulse" />
          <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-4 ring-white/10">
            {isLevel ? (
              <span className="text-5xl font-black text-white drop-shadow-lg">{current.level}</span>
            ) : (
              <span className="text-white">{resolveBadgeIcon(badge?.icon || '', 'h-12 w-12')}</span>
            )}
          </div>
        </div>

        {isLevel ? (
          <>
            <h3 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              You reached Level {current.level}!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              Your orchestration skills are leveling up. Keep the momentum going to unlock the next tier.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{badge?.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{badge?.desc}</p>
          </>
        )}

        <button
          onClick={() => dismissCelebration(current.id)}
          className="mt-7 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          {celebrations.length > 1 ? `Next (${celebrations.length - 1} more)` : 'Keep Going'}
        </button>
      </div>
    </div>
  );
};
