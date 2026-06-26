import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../firebase', () => ({ getFirebaseDb: vi.fn(() => null) }));

import { getSlidesForModule, getQuizQuestions, resolveToneValue } from './TrainingPresenter';

describe('getSlidesForModule', () => {
  it('prefers customSlides when provided and non-empty', () => {
    const custom = [{ type: 'hero_welcome', title: 'Custom' }];
    expect(getSlidesForModule(1, custom)).toBe(custom);
  });

  it('falls back to the generated slides when customSlides is empty', () => {
    const slides = getSlidesForModule(99, []);
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0].type).toBe('hero_welcome');
  });

  it('generates a fallback deck with a hero + summary slide for unknown module ids', () => {
    const slides = getSlidesForModule(42);
    expect(slides).toHaveLength(2);
    expect(slides[0].title).toContain('Module 42');
    expect(slides[1].type).toBe('key_takeaways');
  });

  it('uses the known module name for modules 3-7', () => {
    const slides = getSlidesForModule(5);
    expect(slides[0].title).toContain('The Workflow Engine');
  });
});

describe('getQuizQuestions', () => {
  it('returns an empty array when the slide has no question data', () => {
    expect(getQuizQuestions({})).toEqual([]);
  });

  it('passes through a well-formed questions array unchanged', () => {
    const questions = [{ question: 'Q1', options: ['a', 'b'], answer: 0 }];
    expect(getQuizQuestions({ questions })).toBe(questions);
  });

  it('wraps a single legacy question/options/answer shape into a one-item array', () => {
    const slide = { question: 'What is X?', options: ['a', 'b', 'c'], answer: 1, explanation: 'because' };
    expect(getQuizQuestions(slide)).toEqual([
      { question: 'What is X?', options: ['a', 'b', 'c'], answer: 1, explanation: 'because' },
    ]);
  });

  it('ignores a questions array whose first element is not an object (legacy string array)', () => {
    const slide = { questions: ['not', 'an', 'object'], question: 'Real Q', options: ['x', 'y'] };
    expect(getQuizQuestions(slide)).toEqual([{ question: 'Real Q', options: ['x', 'y'], answer: undefined, explanation: undefined }]);
  });
});

describe('resolveToneValue', () => {
  it('returns primitives unchanged', () => {
    expect(resolveToneValue('hello', 'formal')).toBe('hello');
    expect(resolveToneValue(42, 'formal')).toBe(42);
    expect(resolveToneValue(null, 'formal')).toBeNull();
    expect(resolveToneValue(undefined, 'formal')).toBeUndefined();
  });

  it('picks the requested tone key out of a tone-keyed object', () => {
    const val = { conversational: 'Hey!', formal: 'Greetings.', genz: 'Yo' };
    expect(resolveToneValue(val, 'formal')).toBe('Greetings.');
    expect(resolveToneValue(val, 'genz')).toBe('Yo');
  });

  it('falls back to formal, then genz, then conversational when the requested tone is missing', () => {
    expect(resolveToneValue({ conversational: 'Hey!', formal: 'Greetings.' }, 'genz')).toBe('Greetings.');
    expect(resolveToneValue({ conversational: 'Hey!' }, 'formal')).toBe('Hey!');
  });

  it('recurses into plain nested objects, resolving tone per leaf', () => {
    const val = { title: { formal: 'Title F', conversational: 'Title C' }, count: 3 };
    expect(resolveToneValue(val, 'formal')).toEqual({ title: 'Title F', count: 3 });
  });

  it('recurses into arrays of tone-keyed objects', () => {
    const val = [{ formal: 'A', conversational: 'a' }, { formal: 'B', conversational: 'b' }];
    expect(resolveToneValue(val, 'formal')).toEqual(['A', 'B']);
  });
});
