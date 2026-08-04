import { useEffect, useRef, useState } from 'react';

const supportsObserver = () => typeof IntersectionObserver !== 'undefined';

/**
 * observeOnce — run `onEnter` the first time `el` scrolls into view.
 *
 * Safety net: an IntersectionObserver always delivers an initial report once
 * the page renders. If nothing is reported while the document is visible, the
 * pipeline is broken (or blocked) — so we run `onEnter` anyway rather than
 * strand content behind an animation that will never play. Hidden tabs are
 * exempt: they legitimately report nothing until the user comes back.
 */
export function observeOnce(
  el: Element,
  onEnter: () => void,
  { threshold = 0.12, rootMargin = '0px' }: { threshold?: number; rootMargin?: string } = {}
) {
  if (!supportsObserver()) {
    onEnter();
    return () => {};
  }

  let reported = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      reported = true;
      if (!entry.isIntersecting) return;
      observer.disconnect();
      clearInterval(guard);
      onEnter();
    },
    { threshold, rootMargin }
  );

  const guard = setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    clearInterval(guard);
    if (!reported) onEnter();
  }, 2000);

  observer.observe(el);

  return () => {
    observer.disconnect();
    clearInterval(guard);
  };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * useReveal — one-shot "animate when it scrolls into view" hook.
 *
 * Returns a ref to attach to the section wrapper and a `visible` flag.
 * Starts visible when IntersectionObserver is unavailable (jsdom in unit
 * tests, very old browsers) so content is never left hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(() => !supportsObserver());

  useEffect(() => {
    if (!supportsObserver()) return;

    const el = ref.current;
    if (!el) return;

    return observeOnce(el, () => setVisible(true), {
      threshold,
      rootMargin: '0px 0px -60px 0px',
    });
  }, [threshold]);

  return { ref, visible };
}

/**
 * usePrefersReducedMotion — mirrors the OS "reduce motion" setting.
 * CSS handles the declarative animations; this covers the JS-driven ones
 * (headline rotation, counters) so they hold still too.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}
