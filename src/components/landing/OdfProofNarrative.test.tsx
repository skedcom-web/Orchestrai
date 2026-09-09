import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OdfProofNarrative } from './OdfProofNarrative';

/**
 * Phase 1 hardening is a copy deliverable: specific approved lines, in a
 * specific place. These assertions exist so a future edit cannot quietly drop
 * the narrative while the page still looks fine.
 */
describe('OdfProofNarrative', () => {
  it('leads with the approved proof statement', () => {
    render(<OdfProofNarrative />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('This Academy is proof that ODF works.');
  });

  it('states the days-instead-of-months claim', () => {
    const { container } = render(<OdfProofNarrative />);
    expect(container.textContent).toContain('production-ready application in days instead of months');
  });

  it('shows the Idea → ODF → Production Application pipeline', () => {
    render(<OdfProofNarrative />);
    expect(screen.getByText('Idea')).toBeInTheDocument();
    expect(screen.getByText('ODF')).toBeInTheDocument();
    expect(screen.getByText('Production Application')).toBeInTheDocument();
    expect(screen.getByText('The OrchestrAI Delivery Framework.')).toBeInTheDocument();
  });

  it('carries all four narrative steps', () => {
    render(<OdfProofNarrative />);
    for (const line of [
      'Learn the framework.',
      'Apply the framework.',
      'Turn ideas into working solutions.',
      'Build your own proof.',
    ]) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it('reinforces POC → Proved in Practice', () => {
    render(<OdfProofNarrative />);
    expect(screen.getByText('POC')).toBeInTheDocument();
    expect(screen.getByText('Proved in Practice')).toBeInTheDocument();
  });

  it('keeps the framework, not the applications, as the product', () => {
    const { container } = render(<OdfProofNarrative />);
    expect(container.textContent).toContain('The application is never the story');
    expect(container.textContent).toContain('Certification is earned on the application you shipped');
  });
});
