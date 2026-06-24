/**
 * Lead Readiness — Talent Radar scoring + CSV export helpers.
 *
 * Pure functions / module constants so both the Admin tab and any future
 * "manager view" can reuse the same math and visuals.
 *
 * Weights (today's signals — prompt-text depth not yet captured):
 *   Quiz aptitude        30%
 *   Engagement & streak  30%
 *   Application (labs)   25%
 *   Mastery (level/badges) 15%
 */
import type { UserProfile, OutreachTag } from '../context/AppContext';

export interface LeadReadinessBreakdown {
  quiz: number;        // 0–30
  engagement: number;  // 0–30
  application: number; // 0–25
  mastery: number;     // 0–15
}
export interface LeadReadiness {
  score: number;
  breakdown: LeadReadinessBreakdown;
  isStandout: boolean;
}

export const computeLeadReadiness = (user: UserProfile, hasSubmission: boolean): LeadReadiness => {
  const p = user.progress;
  if (!p) return { score: 0, breakdown: { quiz: 0, engagement: 0, application: 0, mastery: 0 }, isStandout: false };

  // 1. Quiz aptitude (0–30) — average of all module quiz scores
  const quizScoreList = Object.values(p.quizScores || {});
  const avgQuiz = quizScoreList.length ? quizScoreList.reduce((a, b) => a + b, 0) / quizScoreList.length : 0;
  const quiz = Math.min(30, (avgQuiz / 100) * 30);

  // 2. Engagement & consistency (0–30)
  const slidesViewedTotal = Object.values(p.slidesViewed || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const modulesDone = (p.modulesCompleted || []).length;
  const streak = p.streakDays || 0;
  const engagement =
    Math.min(10, modulesDone * 2.5) +
    Math.min(10, slidesViewedTotal / 5) +
    Math.min(10, streak * 2);

  // 3. Application (0–25)
  const labsPassed = (p.labsPassed || []).length;
  const application = Math.min(15, labsPassed * 5) + (hasSubmission ? 10 : 0);

  // 4. Mastery (0–15)
  const level = p.level || 1;
  const badgeCount = (p.badges || []).length;
  const mastery = Math.min(8, (level - 1) * 2) + Math.min(7, badgeCount);

  const score = Math.min(100, Math.round(quiz + engagement + application + mastery));
  const isStandout = score >= 70 && (quizScoreList.some((s) => s >= 90) || labsPassed >= 1);

  return {
    score,
    breakdown: {
      quiz: Math.round(quiz),
      engagement: Math.round(engagement),
      application: Math.round(application),
      mastery: Math.round(mastery),
    },
    isStandout,
  };
};

// ── Visual classes ─────────────────────────────────────────────────────────
export const scoreColor = (s: number): string =>
  s >= 80 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
  : s >= 60 ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10'
  : s >= 40 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
  : 'text-[var(--text-secondary)] border-[var(--border-color)] bg-slate-500/5';

export const tagColor = (t?: OutreachTag): string => {
  switch (t) {
    case 'Shortlisted': return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
    case 'Contacted':   return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';
    case 'Hired':       return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    case 'Dismissed':   return 'bg-red-500/15 border-red-500/30 text-red-300 opacity-70';
    default:            return 'bg-slate-500/10 border-[var(--border-color)] text-[var(--text-secondary)]';
  }
};

export const OUTREACH_TAGS: OutreachTag[] = ['New', 'Shortlisted', 'Contacted', 'Hired', 'Dismissed'];

// ── CSV export ─────────────────────────────────────────────────────────────
const escapeCsv = (v: any): string => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const triggerCsvDownload = (rows: Record<string, any>[], filenamePrefix = 'talent-radar'): void => {
  if (rows.length === 0) return;
  const header = Object.keys(rows[0]);
  const lines = [header.join(','), ...rows.map((r) => header.map((k) => escapeCsv(r[k])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
