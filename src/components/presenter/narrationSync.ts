/**
 * narrationSync — keeps what a learner SEES aligned with what they HEAR.
 *
 * Module slides carry a `narration_script` (an ordered list of spoken segments)
 * and a list of visual items (bullets, competencies, comparison rows). Nothing
 * in the authored content links the two, so this module infers the link by
 * matching each item's label against the segment texts, in order.
 *
 * The result drives progressive reveal: items the narrator has not reached yet
 * are dimmed, the one being explained is highlighted. Content is never removed
 * from the DOM — a learner who never plays the audio sees the full slide.
 */

export interface NarrationSegment {
  text?: string;
  speaker?: string;
}

export interface RevealState {
  /** How many items the narrator has reached so far */
  visibleCount: number;
  /** Index of the item currently being explained (-1 when none) */
  activeIndex: number;
  /** False when narration is not driving the slide — render everything normally */
  synced: boolean;
}

/** Words too common to identify which item a segment is talking about. */
const STOPWORDS = new Set([
  'this', 'that', 'these', 'those', 'with', 'from', 'your', 'their', 'they',
  'them', 'then', 'than', 'when', 'what', 'which', 'while', 'where', 'have',
  'has', 'been', 'being', 'into', 'onto', 'over', 'under', 'about', 'after',
  'before', 'because', 'every', 'each', 'more', 'most', 'some', 'such', 'only',
  'also', 'just', 'very', 'much', 'like', 'will', 'would', 'could', 'should',
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'next', 'last',
]);

/** Pull the human-readable label out of an item, whatever shape it has. */
export const syncLabel = (item: unknown): string => {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>;
    const keys = ['name', 'title', 'label', 'term', 'concept', 'phase', 'task', 'old', 'question', 'text', 'desc', 'description'];
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  return '';
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const significantWords = (value: string) =>
  normalize(value).split(' ').filter((word) => word.length > 3 && !STOPWORDS.has(word));

/** 0 → no relation, 1 → the segment names this item outright. */
const matchScore = (segmentText: string, label: string): number => {
  const haystack = normalize(segmentText);
  const needle = normalize(label);
  if (!haystack || !needle) return 0;
  if (needle.length >= 5 && haystack.includes(needle)) return 1;

  const words = significantWords(label);
  if (words.length === 0) return 0;
  const hits = words.filter((word) => haystack.includes(word)).length;
  return hits / words.length;
};

/**
 * For each visual item, the index of the narration segment that explains it.
 * Always non-decreasing, so reveal only ever moves forward.
 */
export const mapItemsToSegments = (
  segments: NarrationSegment[] | undefined,
  items: unknown[] | undefined,
  threshold = 0.5
): number[] => {
  const itemCount = items?.length ?? 0;
  if (itemCount === 0) return [];

  const segmentCount = segments?.length ?? 0;
  // No narration to sync against — everything belongs to "segment 0", i.e. visible at once
  if (segmentCount === 0) return new Array(itemCount).fill(0);

  const map: number[] = new Array(itemCount).fill(-1);
  let cursor = 0;

  for (let i = 0; i < itemCount; i++) {
    const label = syncLabel(items![i]);
    let best = -1;
    let bestScore = 0;

    for (let s = cursor; s < segmentCount; s++) {
      const score = matchScore(segments![s]?.text ?? '', label);
      if (score >= threshold && score > bestScore) {
        best = s;
        bestScore = score;
        if (score === 1) break; // outright name match — no better candidate exists
      }
    }

    if (best >= 0) {
      map[i] = best;
      cursor = best; // Allow multiple items to match the same segment!
    }
  }

  const anchors = map.reduce<number[]>((acc, value, index) => (value >= 0 ? [...acc, index] : acc), []);

  // Nothing matched — the narration paraphrases. Spread items across the segments,
  // skipping the first one when there is room, since it is usually a topic intro.
  if (anchors.length === 0) {
    const offset = segmentCount > itemCount ? 1 : 0;
    const span = Math.max(1, segmentCount - offset);
    for (let i = 0; i < itemCount; i++) {
      map[i] = Math.min(segmentCount - 1, offset + Math.floor((i * span) / itemCount));
    }
    return map;
  }

  // Interpolate the unmatched items between the ones we did anchor
  for (let i = 0; i < itemCount; i++) {
    if (map[i] >= 0) continue;

    const prev = anchors.filter((a) => a < i).pop();
    const next = anchors.find((a) => a > i);

    const lo = prev === undefined ? 0 : map[prev];
    const hi = next === undefined ? segmentCount - 1 : map[next];
    const from = prev === undefined ? -1 : prev;
    const to = next === undefined ? itemCount : next;
    const ratio = (i - from) / Math.max(1, to - from);

    map[i] = Math.min(hi, Math.max(lo, Math.round(lo + (hi - lo) * ratio)));
  }

  return map;
};

/**
 * Given the item→segment map and the segment being spoken right now, work out
 * what should be visible and what should be highlighted.
 *
 * `activeSegment` of null means narration is not running: show everything.
 */
export const resolveReveal = (map: number[], activeSegment: number | null): RevealState => {
  if (activeSegment === null || activeSegment < 0 || map.length === 0) {
    return { visibleCount: map.length, activeIndex: -1, synced: false };
  }

  let visibleCount = 0;
  let activeIndex = -1;

  for (let i = 0; i < map.length; i++) {
    if (map[i] <= activeSegment) {
      visibleCount = i + 1;
      if (map[i] === activeSegment) activeIndex = i;
    }
  }

  // A segment that explains no single item (intro, closing thought) keeps the
  // most recently revealed item highlighted rather than clearing the focus.
  if (activeIndex === -1 && visibleCount > 0) activeIndex = visibleCount - 1;

  return { visibleCount, activeIndex, synced: true };
};

/**
 * Presentation class for one item. `seen` items read normally, the `active` one
 * is highlighted, and items the narrator has not reached are dimmed back.
 */
export const revealClass = (state: RevealState | null, index: number): string => {
  if (!state || !state.synced) return '';
  if (index === state.activeIndex) return 'sync-item sync-item--active';
  if (index < state.visibleCount) return 'sync-item sync-item--seen';
  return 'sync-item sync-item--ahead';
};
