/// <reference types="node" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Presenter-level guarantees for narration/visual sync.
 *
 * Uses the REAL Module 2 deck so the assertions run against authored content,
 * not a fixture that happens to match the matcher.
 */

const deck = JSON.parse(readFileSync(resolve(process.cwd(), 'module2/module2_formal.json'), 'utf8'));
const MODULE_2_SLIDES = deck.slides as Record<string, unknown>[];

const addToast = vi.fn();

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    systemConfig: {
      moduleSlides: { 2: { formal: MODULE_2_SLIDES } },
      moduleMedia: {},
    },
    addToast,
    recordSlideView: vi.fn(),
    recordModuleComplete: vi.fn(),
    recordQuizScore: vi.fn(),
    recordLabComplete: vi.fn(),
    trackVisitorActivity: vi.fn(),
    currentUser: { name: 'Test Learner', email: 'learner@example.com', progress: {} },
  }),
}));

// The prompt lab pulls in its own heavy deps and is not part of this behaviour
vi.mock('./PromptSimulator', () => ({ PromptSimulator: () => null }));

import { TrainingPresenter } from './TrainingPresenter';

/**
 * jsdom ships no speech engine. Define the stub once on window (rather than via
 * stubGlobal) so it is still there when React unmounts components and their
 * cleanup touches speechSynthesis.
 */
const installSpeechStub = () => {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    writable: true,
    value: {
      cancel: vi.fn(),
      speak: vi.fn(),
      resume: vi.fn(),
      pause: vi.fn(),
      getVoices: () => [],
      speaking: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    writable: true,
    value: class {
      text: string;
      constructor(text: string) { this.text = text; }
    },
  });
};

const renderPresenter = () =>
  render(<TrainingPresenter moduleId={2} onClose={vi.fn()} onComplete={vi.fn()} />);

describe('TrainingPresenter · narration sync', () => {
  beforeEach(() => {
    installSpeechStub();
    // jsdom implements neither of these; real browsers return a promise from play()
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the authored Module 2 deck', () => {
    renderPresenter();
    expect(screen.getByText(/Slide 1 of/)).toBeInTheDocument();
  });

  it('shows the whole slide when narration is not playing', () => {
    const { container } = renderPresenter();

    // Nothing may be dimmed while the learner is reading on their own
    expect(container.querySelectorAll('.sync-item--ahead')).toHaveLength(0);
    expect(container.querySelectorAll('.sync-item--active')).toHaveLength(0);

    // …and the slide's own points are all on screen
    const firstSlide = MODULE_2_SLIDES[0] as { bullets?: string[]; items?: string[] };
    const points = firstSlide.bullets || firstSlide.items || [];
    for (const point of points) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
  });

  it('does not show the live caption until narration starts', () => {
    const { container } = renderPresenter();
    expect(container.querySelector('.caption-line')).toBeNull();
  });

  it('keeps every narration line in the transcript with a segment anchor', () => {
    const { container } = renderPresenter();
    const firstSlide = MODULE_2_SLIDES[0] as { narration_script?: { text: string }[] };
    const segments = firstSlide.narration_script ?? [];

    expect(segments.length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-segment]')).toHaveLength(segments.length);
  });

  it('survives navigating forward through slides', () => {
    renderPresenter();
    const next = screen.getByRole('button', { name: /next/i });

    act(() => { next.click(); });
    expect(screen.getByText(/Slide 2 of/)).toBeInTheDocument();
  });
});

describe('TrainingPresenter · progressive reveal while narrating', () => {
  /** The utterance the presenter is currently speaking, so the test can end it. */
  let speaking: { onstart?: () => void; onend?: () => void; onerror?: () => void } | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    installSpeechStub();
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: class {
        createBuffer() { return {}; }
        createBufferSource() { return { buffer: null, connect() {}, start() {} }; }
        destination = {};
      },
    });

    speaking = null;
    window.speechSynthesis.speak = vi.fn((utterance: typeof speaking) => {
      speaking = utterance;
      utterance?.onstart?.();
    }) as unknown as typeof window.speechSynthesis.speak;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  /**
   * Finish the current utterance and let the presenter move to the next segment.
   * The presenter paces segments off the estimated speech duration (roughly
   * 65ms per character), so the timer jump has to clear that.
   */
  const finishSegment = () => {
    act(() => { speaking?.onend?.(); });
    act(() => { vi.advanceTimersByTime(30000); });
  };

  it('reveals slide points in step with the narration, then leaves them all visible', () => {
    const { container } = renderPresenter();

    // Idle → the sync layer is entirely absent, the learner reads the full slide
    expect(container.querySelectorAll('.sync-item')).toHaveLength(0);

    act(() => { screen.getAllByRole('button', { name: /play/i })[0].click(); });

    // Narration running → slide 1's points are now gated on the voiceover
    expect(container.querySelectorAll('.sync-item').length).toBeGreaterThan(2);
    const dimmedAtStart = container.querySelectorAll('.sync-item--ahead').length;
    expect(dimmedAtStart).toBeGreaterThan(0);
    expect(container.querySelector('.caption-line')).not.toBeNull();

    // Walk the narration forward — dimmed content must strictly decrease
    let previousDimmed = dimmedAtStart;
    for (let step = 0; step < 12 && previousDimmed > 0; step++) {
      finishSegment();
      const dimmed = container.querySelectorAll('.sync-item--ahead').length;
      expect(dimmed).toBeLessThanOrEqual(previousDimmed);
      previousDimmed = dimmed;
    }

    // By the end of the script every point has been revealed
    expect(previousDimmed).toBe(0);
  });

  it('restores the full slide when the learner stops the narration', () => {
    const { container } = renderPresenter();

    act(() => { screen.getAllByRole('button', { name: /play/i })[0].click(); });
    expect(container.querySelectorAll('.sync-item--ahead').length).toBeGreaterThan(0);

    // The stop control resets narration — content must not stay dimmed
    act(() => { screen.getAllByTitle('Stop & Reset')[0].click(); });

    expect(container.querySelectorAll('.sync-item--ahead')).toHaveLength(0);
    expect(container.querySelectorAll('.sync-item--active')).toHaveLength(0);
    expect(container.querySelector('.caption-line')).toBeNull();
  });
});
