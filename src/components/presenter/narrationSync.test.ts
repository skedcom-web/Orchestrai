import { describe, it, expect } from 'vitest';
import { syncLabel, mapItemsToSegments, resolveReveal, revealClass } from './narrationSync';

/** Shaped like the real Module 2 "Six Core Principles" slide. */
const SIX_PRINCIPLES = [
  { name: 'AI as Primary Builder', desc: 'AI writes ALL the code.' },
  { name: 'Human as Orchestrator', desc: 'You define direction and approvals.' },
  { name: 'Plain-English Driven', desc: 'Requirements enter as natural language.' },
  { name: 'Continuous Delivery', desc: 'No sprints.' },
  { name: 'Instant Iteration', desc: 'Fixed same session.' },
  { name: 'Quality by Design', desc: 'Security specified as constraints.' },
];

const SIX_PRINCIPLES_NARRATION = [
  { text: 'The OrchestrAI governance framework is built on six core principles.' },
  { text: 'First: AI as Primary Builder. The AI engine generates all code artifacts.' },
  { text: 'Second: Human as Orchestrator. The Lead defines parameters and controls quality.' },
  { text: 'Third: Plain-English Driven. Requirements are structured in precise natural language.' },
  { text: 'Fourth: Continuous Delivery. Delivery is continuous rather than boxed into sprints.' },
  { text: 'Fifth: Instant Iteration. Code correction happens in real-time.' },
  { text: 'And sixth: Quality by Design. Security and validation are defined in the intent statement.' },
];

describe('syncLabel', () => {
  it('reads plain string bullets', () => {
    expect(syncLabel('Governance is measurable')).toBe('Governance is measurable');
  });

  it('prefers name, then title, then label', () => {
    expect(syncLabel({ name: 'Intent', title: 'Other' })).toBe('Intent');
    expect(syncLabel({ title: 'Micro Sprint' })).toBe('Micro Sprint');
    expect(syncLabel({ label: 'AI Review' })).toBe('AI Review');
  });

  it('returns an empty string for unusable items', () => {
    expect(syncLabel(null)).toBe('');
    expect(syncLabel(42)).toBe('');
    expect(syncLabel({})).toBe('');
  });
});

describe('mapItemsToSegments', () => {
  it('anchors each principle to the segment that names it', () => {
    const map = mapItemsToSegments(SIX_PRINCIPLES_NARRATION, SIX_PRINCIPLES);
    // Segment 0 is the intro; principles start at segment 1
    expect(map).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('never moves backwards', () => {
    const map = mapItemsToSegments(SIX_PRINCIPLES_NARRATION, SIX_PRINCIPLES);
    for (let i = 1; i < map.length; i++) {
      expect(map[i]).toBeGreaterThanOrEqual(map[i - 1]);
    }
  });

  it('spreads items across segments when the narration paraphrases', () => {
    const items = [{ name: 'Alpha' }, { name: 'Bravo' }, { name: 'Charlie' }];
    const segments = [
      { text: 'Let us walk through the operating model together.' },
      { text: 'It starts with framing the problem properly.' },
      { text: 'Then the team executes in short focused cycles.' },
      { text: 'Finally the outcome is reviewed with the business.' },
    ];
    const map = mapItemsToSegments(segments, items);

    expect(map).toHaveLength(3);
    expect(map[0]).toBeGreaterThanOrEqual(0);
    expect(map[2]).toBeLessThanOrEqual(segments.length - 1);
    for (let i = 1; i < map.length; i++) {
      expect(map[i]).toBeGreaterThanOrEqual(map[i - 1]);
    }
  });

  it('interpolates items the matcher could not anchor', () => {
    const items = [{ name: 'Intent Workshop' }, { name: 'Unnamed Middle Step' }, { name: 'Demo Review' }];
    const segments = [
      { text: 'We begin with the Intent Workshop to define outcomes.' },
      { text: 'Work then moves through a focused execution cycle.' },
      { text: 'The Demo Review validates business value.' },
    ];
    const map = mapItemsToSegments(segments, items);

    expect(map[0]).toBe(0);
    expect(map[2]).toBe(2);
    expect(map[1]).toBeGreaterThanOrEqual(0);
    expect(map[1]).toBeLessThanOrEqual(2);
  });

  it('handles empty inputs without throwing', () => {
    expect(mapItemsToSegments([], [])).toEqual([]);
    expect(mapItemsToSegments(undefined, undefined)).toEqual([]);
    expect(mapItemsToSegments([], SIX_PRINCIPLES)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});

describe('resolveReveal', () => {
  const map = [1, 2, 3, 4, 5, 6];

  it('shows the whole slide when narration is not running', () => {
    const state = resolveReveal(map, null);
    expect(state).toEqual({ visibleCount: 6, activeIndex: -1, synced: false });
  });

  it('reveals nothing while the intro segment is playing', () => {
    const state = resolveReveal(map, 0);
    expect(state.visibleCount).toBe(0);
    expect(state.activeIndex).toBe(-1);
    expect(state.synced).toBe(true);
  });

  it('reveals and highlights the principle being explained', () => {
    expect(resolveReveal(map, 1)).toMatchObject({ visibleCount: 1, activeIndex: 0 });
    expect(resolveReveal(map, 3)).toMatchObject({ visibleCount: 3, activeIndex: 2 });
    expect(resolveReveal(map, 6)).toMatchObject({ visibleCount: 6, activeIndex: 5 });
  });

  it('keeps the last item highlighted through a closing segment', () => {
    const state = resolveReveal(map, 9);
    expect(state.visibleCount).toBe(6);
    expect(state.activeIndex).toBe(5);
  });
});

describe('revealClass', () => {
  const state = resolveReveal([1, 2, 3], 2);

  it('marks seen, active and upcoming items differently', () => {
    expect(revealClass(state, 0)).toContain('sync-item--seen');
    expect(revealClass(state, 1)).toContain('sync-item--active');
    expect(revealClass(state, 2)).toContain('sync-item--ahead');
  });

  it('adds no classes when narration is not driving the slide', () => {
    expect(revealClass(resolveReveal([1, 2, 3], null), 2)).toBe('');
    expect(revealClass(null, 0)).toBe('');
  });
});
