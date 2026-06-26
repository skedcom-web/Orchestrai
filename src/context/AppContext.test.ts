import { describe, it, expect } from 'vitest';
import { getLevelInfo, deriveBadges, ensureProgress, DEFAULT_PROGRESS, type LearnerProgress } from './AppContext';

describe('getLevelInfo', () => {
  it('starts at level 1 with 0 xp', () => {
    const info = getLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
    expect(info.progressPct).toBe(0);
  });

  it('computes level from the sqrt(xp/100)+1 curve', () => {
    expect(getLevelInfo(0).level).toBe(1);
    expect(getLevelInfo(99).level).toBe(1);
    expect(getLevelInfo(100).level).toBe(2);
    expect(getLevelInfo(400).level).toBe(3);
    expect(getLevelInfo(900).level).toBe(4);
  });

  it('reports xpToNext that reaches exactly 0 right at the level boundary', () => {
    const info = getLevelInfo(100);
    expect(info.xpToNext).toBe(getLevelInfo(100).xpForNextLevel - info.xpIntoLevel);
    // at the exact boundary, xpIntoLevel should be 0
    expect(info.xpIntoLevel).toBe(0);
  });

  it('never reports progressPct above 100', () => {
    for (const xp of [0, 50, 100, 250, 999, 5000]) {
      expect(getLevelInfo(xp).progressPct).toBeLessThanOrEqual(100);
      expect(getLevelInfo(xp).progressPct).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles negative xp without throwing or going to a negative level', () => {
    expect(() => getLevelInfo(-50)).not.toThrow();
    expect(getLevelInfo(-50).level).toBeGreaterThanOrEqual(1);
  });
});

describe('deriveBadges', () => {
  const base: LearnerProgress = { ...DEFAULT_PROGRESS };

  it('returns no badges for a fresh progress object', () => {
    expect(deriveBadges(base)).toEqual([]);
  });

  it('returns empty array for null/undefined progress', () => {
    expect(deriveBadges(undefined as unknown as LearnerProgress)).toEqual([]);
  });

  it('awards first-steps once any slide has been viewed', () => {
    const p: LearnerProgress = { ...base, slidesViewed: { 1: [0] } };
    expect(deriveBadges(p)).toContain('first-steps');
  });

  it('awards quiz-master only at >= 80%, not below', () => {
    expect(deriveBadges({ ...base, quizScores: { 1: 79 } })).not.toContain('quiz-master');
    expect(deriveBadges({ ...base, quizScores: { 1: 80 } })).toContain('quiz-master');
  });

  it('awards guardian once a lab is passed', () => {
    expect(deriveBadges({ ...base, labsPassed: [1] })).toContain('guardian');
    expect(deriveBadges({ ...base, labsPassed: [] })).not.toContain('guardian');
  });

  it('awards module-1 and foundation correctly based on modulesCompleted', () => {
    expect(deriveBadges({ ...base, modulesCompleted: [1] })).toEqual(['module-1']);
    const both = deriveBadges({ ...base, modulesCompleted: [1, 2] });
    expect(both).toContain('module-1');
    expect(both).toContain('foundation');
    expect(deriveBadges({ ...base, modulesCompleted: [2] })).not.toContain('module-1');
  });

  it('awards streak badges at the 3 and 7 day thresholds', () => {
    expect(deriveBadges({ ...base, streakDays: 2 })).toEqual([]);
    expect(deriveBadges({ ...base, streakDays: 3 })).toEqual(['streak-3']);
    const both = deriveBadges({ ...base, streakDays: 7 });
    expect(both).toContain('streak-3');
    expect(both).toContain('streak-7');
  });

  it('awards level-5 only once level reaches 5', () => {
    expect(deriveBadges({ ...base, level: 4 })).not.toContain('level-5');
    expect(deriveBadges({ ...base, level: 5 })).toContain('level-5');
  });

  it('is idempotent — calling twice on the same progress yields the same result', () => {
    const p: LearnerProgress = { ...base, modulesCompleted: [1, 2], streakDays: 7, level: 5, labsPassed: [1], quizScores: { 1: 100 }, slidesViewed: { 1: [0, 1] } };
    expect(deriveBadges(p)).toEqual(deriveBadges(p));
  });
});

describe('ensureProgress', () => {
  it('backfills all defaults when given undefined', () => {
    const p = ensureProgress(undefined);
    expect(p).toEqual(DEFAULT_PROGRESS);
  });

  it('preserves provided fields while filling in the rest', () => {
    const p = ensureProgress({ xp: 250, level: 2 });
    expect(p.xp).toBe(250);
    expect(p.level).toBe(2);
    expect(p.badges).toEqual([]);
    expect(p.modulesCompleted).toEqual([]);
  });

  it('drops malformed (non-array) entries from slidesViewed', () => {
    const p = ensureProgress({ slidesViewed: { 1: [0, 1], 2: null as unknown as number[], 3: 'oops' as unknown as number[] } });
    expect(p.slidesViewed[1]).toEqual([0, 1]);
    expect(p.slidesViewed[2]).toBeUndefined();
    expect(p.slidesViewed[3]).toBeUndefined();
  });

  it('does not mutate the input object', () => {
    const input = { modulesCompleted: [1] };
    const p = ensureProgress(input);
    p.modulesCompleted.push(2);
    expect(input.modulesCompleted).toEqual([1]);
  });
});
