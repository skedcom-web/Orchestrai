import React from 'react';
import { useReveal } from './useReveal';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger the direct children of this container */
  stagger?: boolean;
  /** Extra delay in ms before this block animates in */
  delay?: number;
  id?: string;
}

/**
 * Reveal — wraps a block so it fades/slides in the first time it enters the
 * viewport. Purely presentational: content is always in the DOM (so it stays
 * crawlable and accessible), only opacity/transform change.
 */
export const Reveal: React.FC<RevealProps> = ({ children, className = '', stagger, delay = 0, id }) => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      id={id}
      ref={ref}
      className={`reveal ${stagger ? 'reveal-stagger' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
