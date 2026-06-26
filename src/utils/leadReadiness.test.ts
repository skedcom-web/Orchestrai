import { describe, it, expect, vi } from 'vitest';
import { computeLeadReadiness, scoreColor, tagColor, triggerCsvDownload } from './leadReadiness';
import { DEFAULT_PROGRESS, type UserProfile } from '../context/AppContext';

const baseUser = (overrides: Partial<NonNullable<UserProfile['progress']>> = {}): UserProfile => ({
  uid: 'u1',
  email: 'u1@test.com',
  name: 'Test User',
  role: 'USER',
  accountStatus: 'FREE_TIER',
  quizPassed: false,
  progress: { ...DEFAULT_PROGRESS, ...overrides },
});

describe('computeLeadReadiness', () => {
  it('returns a zero score with no breakdown when progress is missing', () => {
    const user: UserProfile = { uid: 'u1', email: 'u1@test.com', name: 'x', role: 'USER', accountStatus: 'FREE_TIER', quizPassed: false };
    const r = computeLeadReadiness(user, false);
    expect(r.score).toBe(0);
    expect(r.isStandout).toBe(false);
    expect(r.breakdown).toEqual({ quiz: 0, engagement: 0, application: 0, mastery: 0 });
  });

  it('caps the quiz component at 30 even with quiz scores above 100', () => {
    const user = baseUser({ quizScores: { 1: 100, 2: 100 } });
    const r = computeLeadReadiness(user, false);
    expect(r.breakdown.quiz).toBe(30);
  });

  it('caps total score at 100 for a maxed-out learner', () => {
    const user = baseUser({
      quizScores: { 1: 100, 2: 100, 3: 100 },
      modulesCompleted: [1, 2, 3, 4],
      slidesViewed: { 1: Array.from({ length: 50 }, (_, i) => i) },
      streakDays: 30,
      labsPassed: [1, 2, 3],
      level: 10,
      badges: ['first-steps', 'quiz-master', 'guardian', 'module-1', 'foundation', 'streak-3', 'streak-7', 'level-5'],
    });
    const r = computeLeadReadiness(user, true);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.score).toBe(100);
  });

  it('marks standout only when score >= 70 AND (a 90+ quiz score OR a passed lab)', () => {
    const highScoreNoProof = baseUser({
      modulesCompleted: [1, 2, 3, 4],
      slidesViewed: { 1: Array.from({ length: 50 }, (_, i) => i) },
      streakDays: 30,
      level: 10,
      badges: ['level-5'],
    });
    const r1 = computeLeadReadiness(highScoreNoProof, false);
    expect(r1.isStandout).toBe(false);

    const withLab = baseUser({ ...highScoreNoProof.progress, labsPassed: [1] });
    const r2 = computeLeadReadiness(withLab, false);
    if (r2.score >= 70) expect(r2.isStandout).toBe(true);
  });

  it('gives partial application credit for hasSubmission without any labs passed', () => {
    const user = baseUser({});
    const withSubmission = computeLeadReadiness(user, true);
    const withoutSubmission = computeLeadReadiness(user, false);
    expect(withSubmission.breakdown.application).toBe(10);
    expect(withoutSubmission.breakdown.application).toBe(0);
  });
});

describe('scoreColor', () => {
  it('buckets scores into the right color tier', () => {
    expect(scoreColor(85)).toMatch(/emerald/);
    expect(scoreColor(65)).toMatch(/indigo/);
    expect(scoreColor(45)).toMatch(/amber/);
    expect(scoreColor(10)).not.toMatch(/emerald|indigo|amber/);
  });

  it('treats the tier boundaries as inclusive on the lower bound', () => {
    expect(scoreColor(80)).toMatch(/emerald/);
    expect(scoreColor(60)).toMatch(/indigo/);
    expect(scoreColor(40)).toMatch(/amber/);
  });
});

describe('tagColor', () => {
  it('returns a distinct class for every known tag', () => {
    const tags = ['Shortlisted', 'Contacted', 'Hired', 'Dismissed'] as const;
    const classes = tags.map((t) => tagColor(t));
    expect(new Set(classes).size).toBe(tags.length);
  });

  it('falls back to a default class for unknown/undefined tags', () => {
    expect(tagColor(undefined)).toMatch(/slate/);
  });
});

describe('triggerCsvDownload', () => {
  it('does nothing when rows is empty (no Blob/anchor created)', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    triggerCsvDownload([]);
    expect(createObjectURLSpy).not.toHaveBeenCalled();
    createObjectURLSpy.mockRestore();
  });

  it('escapes commas, quotes, and newlines per RFC 4180', () => {
    let capturedBlobParts: BlobPart[] = [];
    const OriginalBlob = globalThis.Blob;
    // @ts-expect-error - patch for inspection
    globalThis.Blob = class extends OriginalBlob {
      constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
        capturedBlobParts = parts;
        super(parts, opts);
      }
    };
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    triggerCsvDownload([{ name: 'Doe, Jane', note: 'He said "hi"\nthen left' }]);

    const csv = capturedBlobParts.join('');
    expect(csv).toContain('"Doe, Jane"');
    expect(csv).toContain('"He said ""hi""\nthen left"');

    globalThis.Blob = OriginalBlob;
    clickSpy.mockRestore();
  });
});
