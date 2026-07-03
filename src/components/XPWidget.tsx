import React, { useState, useEffect, useRef } from 'react';
import { useApp, ensureProgress, getLevelInfo, BADGES } from '../context/AppContext';
import { resolveBadgeIcon } from './badgeIcons';
import { Flame, Lock, Sparkles } from 'lucide-react';

/**
 * Header gamification widget — always-visible level + XP bar + streak chip,
 * expanding into a popover with full stats and the badge shelf.
 */
export const XPWidget: React.FC = () => {
  const { currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const btn = document.getElementById('xp-widget-btn');
        if (btn && btn.contains(event.target as Node)) {
          return;
        }
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  if (!currentUser) return null;

  const p = ensureProgress(currentUser.progress);
  const info = getLevelInfo(p.xp);
  const earned = new Set(p.badges);
  const earnedCount = BADGES.filter((b) => earned.has(b.id)).length;

  return (
    <div className="relative">
      {/* Chip */}
      <button
        id="xp-widget-btn"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-[var(--border-color)] bg-slate-500/5 hover:bg-slate-500/10 transition-colors"
        title="Your progress"
      >
        {/* Level orb */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-extrabold shadow shadow-indigo-500/30 shrink-0">
          {info.level}
        </span>

        {/* XP bar (hidden on very small screens) */}
        <span className="hidden sm:flex flex-col w-24 gap-0.5">
          <span className="flex items-center justify-between text-[10px] font-bold leading-none">
            <span className="text-[var(--text-secondary)]">Lv {info.level}</span>
            <span className="text-[var(--text-muted)]">{p.xp} XP</span>
          </span>
          <span className="h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-700 ease-out"
              style={{ width: `${info.progressPct}%` }}
            />
          </span>
        </span>

        {/* Streak */}
        <span
          className={`flex items-center gap-0.5 text-xs font-bold shrink-0 ${
            p.streakDays > 0 ? 'text-orange-400' : 'text-[var(--text-muted)]'
          }`}
          title={`${p.streakDays}-day streak`}
        >
          <Flame className="h-4 w-4" />
          {p.streakDays}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <>
          <div 
            ref={popoverRef}
            className="absolute right-0 mt-2 w-72 z-50 glass-card rounded-2xl p-5 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200"
          >
            {/* Level summary */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-black shadow-lg shadow-indigo-500/30 shrink-0">
                {info.level}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[var(--text-primary)] leading-tight">Level {info.level}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {info.xpToNext} XP to Level {info.level + 1}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-orange-400 font-bold text-sm shrink-0">
                <Flame className="h-4 w-4" /> {p.streakDays}
              </div>
            </div>

            {/* XP bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-semibold text-[var(--text-muted)] mb-1">
                <span>{p.xp} XP total</span>
                <span>{info.progressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-700 ease-out"
                  style={{ width: `${info.progressPct}%` }}
                />
              </div>
            </div>

            {/* Badge shelf */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Badges</span>
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                {earnedCount}/{BADGES.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((b) => {
                const has = earned.has(b.id);
                return (
                  <div
                    key={b.id}
                    title={`${b.name} — ${b.desc}`}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                      has
                        ? 'border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 text-indigo-400'
                        : 'border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-muted)]'
                    }`}
                  >
                    {has ? resolveBadgeIcon(b.icon, 'h-5 w-5') : <Lock className="h-4 w-4 opacity-60" />}
                  </div>
                );
              })}
            </div>

            {earnedCount === 0 && (
              <p className="mt-3 text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 leading-relaxed">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                Explore a module or pass the quiz to earn your first badge.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
