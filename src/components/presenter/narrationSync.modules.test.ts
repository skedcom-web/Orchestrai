/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mapItemsToSegments, resolveReveal } from './narrationSync';

/**
 * Runs the narration→visual sync against the ACTUAL Modules 1–6 decks shipped
 * in this repo, rather than hand-written fixtures. This is what proves a
 * learner can never end a slide with content still dimmed, and that reveal
 * order always follows the narration order.
 */

const DECKS = [
  'module1_slides.json',
  'Module1/module1_genz_v8_interactive.json',
  'module2/module2_formal.json',
  'module2/module2_genz.json',
  'Module3/module3_formal.json',
  'Module3/module3_genz.json',
  'Module4/module4_formal.json',
  'Module4/module4_genz.json',
  'Module5/module5_formal.json',
  'Module5/module5_genz.json',
  'Module6/module6_formal.json',
  'Module6/module6_genz.json',
];

interface Slide {
  slide_id?: string;
  type?: string;
  bullets?: unknown[];
  items?: unknown[];
  list?: unknown[];
  table?: unknown[];
  narration_script?: { text?: string }[];
}

const loadDeck = (relativePath: string): Slide[] | null => {
  const file = resolve(process.cwd(), relativePath);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.slides)) return parsed.slides;
  if (Array.isArray(parsed.acts)) return parsed.acts.flatMap((act: { slides?: Slide[] }) => act.slides ?? []);
  return null;
};

/** Every list on a slide that the presenter reveals progressively. */
const syncedLists = (slide: Slide): { key: string; items: unknown[] }[] =>
  ([
    { key: 'bullets', items: slide.bullets || slide.items },
    { key: 'competencies', items: slide.list },
    { key: 'comparison', items: slide.table },
  ] as { key: string; items?: unknown[] }[])
    .filter((entry): entry is { key: string; items: unknown[] } =>
      Array.isArray(entry.items) && entry.items.length > 0);

const syncableSlides = (slides: Slide[]) =>
  slides.filter(
    (slide) => Array.isArray(slide.narration_script) && slide.narration_script.length > 0 && syncedLists(slide).length > 0
  );

const loadedDecks = DECKS.map((path) => [path, loadDeck(path)] as const).filter(
  (entry): entry is readonly [string, Slide[]] => entry[1] !== null
);

/** Decks authored with per-segment narration — the ones sync applies to. */
const segmentedDecks = loadedDecks.filter(([, slides]) => syncableSlides(slides).length > 0);

/** Legacy decks with only whole-slide narration — sync must stay out of the way. */
const legacyDecks = loadedDecks.filter(([, slides]) => syncableSlides(slides).length === 0);

describe('narration sync against the real Module 1–6 decks', () => {
  it('finds the module decks in the repo', () => {
    expect(loadedDecks.length).toBeGreaterThanOrEqual(6);
    expect(segmentedDecks.length).toBeGreaterThanOrEqual(6);
  });

  it('leaves legacy whole-slide-narration decks fully visible', () => {
    for (const [path, slides] of legacyDecks) {
      for (const slide of slides) {
        for (const { key, items } of syncedLists(slide)) {
          // No segments → nothing to sync to → the presenter shows the full slide
          const map = mapItemsToSegments(slide.narration_script, items);
          const state = resolveReveal(map, null);
          expect(state.visibleCount, `${path} · ${slide.slide_id ?? slide.type} · ${key}`).toBe(items.length);
          expect(state.synced).toBe(false);
        }
      }
    }
  });

  describe.each(segmentedDecks)('%s', (_path, slides) => {
    const syncable = syncableSlides(slides);

    it('has slides carrying both narration and visual items', () => {
      expect(syncable.length).toBeGreaterThan(0);
    });

    it('reveals every item by the time the narration ends', () => {
      for (const slide of syncable) {
        const segments = slide.narration_script!;
        for (const { key, items } of syncedLists(slide)) {
          const map = mapItemsToSegments(segments, items);
          const final = resolveReveal(map, segments.length - 1);
          expect(
            final.visibleCount,
            `${slide.slide_id ?? slide.type} · ${key}: ${final.visibleCount}/${items.length} revealed at the last segment`
          ).toBe(items.length);
        }
      }
    });

    it('never reveals an item before the one above it', () => {
      for (const slide of syncable) {
        const segments = slide.narration_script!;
        for (const { key, items } of syncedLists(slide)) {
          const map = mapItemsToSegments(segments, items);
          for (let i = 1; i < map.length; i++) {
            expect(
              map[i] >= map[i - 1],
              `${slide.slide_id ?? slide.type} · ${key}: item ${i} (segment ${map[i]}) precedes item ${i - 1} (segment ${map[i - 1]})`
            ).toBe(true);
          }
        }
      }
    });

    it('keeps every mapped segment inside the script', () => {
      for (const slide of syncable) {
        const segments = slide.narration_script!;
        for (const { key, items } of syncedLists(slide)) {
          const map = mapItemsToSegments(segments, items);
          for (const [i, segmentIndex] of map.entries()) {
            expect(
              segmentIndex >= 0 && segmentIndex < segments.length,
              `${slide.slide_id ?? slide.type} · ${key}: item ${i} mapped to out-of-range segment ${segmentIndex}`
            ).toBe(true);
          }
        }
      }
    });

    it('spreads the reveal across the narration instead of dumping it at once', () => {
      // A slide whose items all land on the same segment is not synced in any
      // useful sense. Allow it for 2-item lists, but flag whole decks that
      // collapse — that would mean the matcher is not doing its job.
      const multiItem = syncable.flatMap((slide) =>
        syncedLists(slide)
          .filter(({ items }) => items.length >= 3)
          .map(({ items }) => mapItemsToSegments(slide.narration_script!, items))
      );

      if (multiItem.length === 0) return;
      const spread = multiItem.filter((map) => new Set(map).size > 1);
      expect(spread.length / multiItem.length).toBeGreaterThan(0.8);
    });
  });
});
