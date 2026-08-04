import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Reveal } from './Reveal';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

/** Installs a fake IntersectionObserver and hands back control of its callback. */
const installObserver = () => {
  const state = { callback: null as ObserverCallback | null, observed: 0, disconnected: 0 };

  class FakeIntersectionObserver {
    constructor(cb: ObserverCallback) { state.callback = cb; }
    observe() { state.observed += 1; }
    disconnect() { state.disconnected += 1; }
    unobserve() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds = [];
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return state;
};

describe('Reveal', () => {
  beforeEach(() => {
    // The safety-net guard only arms while the document is visible
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('starts hidden and reveals once the section intersects', () => {
    const observer = installObserver();

    render(<Reveal><p>Who is OrchestrAI for?</p></Reveal>);

    const block = screen.getByText('Who is OrchestrAI for?').parentElement!;
    expect(observer.observed).toBe(1);
    expect(block.className).toContain('reveal');
    expect(block.className).not.toContain('is-visible');

    act(() => observer.callback!([{ isIntersecting: true }]));

    expect(block.className).toContain('is-visible');
    expect(observer.disconnected).toBeGreaterThan(0);
  });

  it('stays hidden while the section is still off screen', () => {
    const observer = installObserver();

    render(<Reveal><p>Below the fold</p></Reveal>);
    act(() => observer.callback!([{ isIntersecting: false }]));

    expect(screen.getByText('Below the fold').parentElement!.className).not.toContain('is-visible');
  });

  it('reveals content anyway if the observer never reports (safety net)', () => {
    vi.useFakeTimers();
    installObserver(); // never invokes its callback

    render(<Reveal><p>Never observed</p></Reveal>);
    const block = screen.getByText('Never observed').parentElement!;
    expect(block.className).not.toContain('is-visible');

    act(() => { vi.advanceTimersByTime(2100); });

    expect(block.className).toContain('is-visible');
  });

  it('renders visible immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<Reveal><p>No observer support</p></Reveal>);

    expect(screen.getByText('No observer support').parentElement!.className).toContain('is-visible');
  });
});
