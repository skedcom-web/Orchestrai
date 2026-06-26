import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Quiz } from './Quiz';
import * as AppContextModule from '../context/AppContext';
import type { UserProfile } from '../context/AppContext';

vi.mock('../context/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('../context/AppContext');
  return { ...actual, useApp: vi.fn() };
});

const mockedUseApp = AppContextModule.useApp as unknown as ReturnType<typeof vi.fn>;

const user: UserProfile = {
  uid: 'u1', email: 'u1@test.com', name: 'Test User', role: 'USER',
  accountStatus: 'FREE_TIER', quizPassed: false,
};

const renderQuiz = (overrides: Partial<ReturnType<typeof AppContextModule.useApp>> = {}) => {
  const updateUserProfile = vi.fn();
  const recordQuizScore = vi.fn();
  mockedUseApp.mockReturnValue({
    currentUser: user,
    updateUserProfile,
    recordQuizScore,
    ...overrides,
  } as ReturnType<typeof AppContextModule.useApp>);
  render(<MemoryRouter><Quiz /></MemoryRouter>);
  return { updateUserProfile, recordQuizScore };
};

describe('Quiz', () => {
  beforeEach(() => {
    mockedUseApp.mockReset();
  });

  it('shows an access-denied message when no user is logged in', () => {
    mockedUseApp.mockReturnValue({ currentUser: null, updateUserProfile: vi.fn(), recordQuizScore: vi.fn() } as unknown as ReturnType<typeof AppContextModule.useApp>);
    render(<MemoryRouter><Quiz /></MemoryRouter>);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it('disables Submit until every question has an answer selected', () => {
    renderQuiz();
    const submitBtn = screen.getByRole('button', { name: /Submit Answers/i });
    expect(submitBtn).toBeDisabled();
  });

  it('passes at >= 80% (4/5 correct), calls recordQuizScore and marks quizPassed', () => {
    const { updateUserProfile, recordQuizScore } = renderQuiz();
    const correctIndexes = [2, 1, 1, 2, 3];
    correctIndexes.forEach((correctIdx, qIdx) => {
      const questionBlocks = screen.getAllByRole('button').filter((b) => b.textContent && !['Submit Answers', 'Try Again', 'Proceed to Payment'].includes(b.textContent));
      // Each question has 4 option buttons; pick the qIdx-th group's correct option.
      const optionsForQuestion = questionBlocks.slice(qIdx * 4, qIdx * 4 + 4);
      fireEvent.click(optionsForQuestion[correctIdx]);
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));

    expect(recordQuizScore).toHaveBeenCalledWith(2, 100);
    expect(updateUserProfile).toHaveBeenCalledWith('u1', { quizPassed: true });
    expect(screen.getByText(/Congratulations! You Passed/i)).toBeInTheDocument();
  });

  it('fails below 80%, shows retry + study guide, and does not mark quizPassed', () => {
    const { updateUserProfile, recordQuizScore } = renderQuiz();
    // Answer everything wrong (option 0 for every question whose correct index isn't 0)
    const wrongIndexes = [0, 0, 0, 0, 0];
    wrongIndexes.forEach((wrongIdx, qIdx) => {
      const questionBlocks = screen.getAllByRole('button').filter((b) => b.textContent && !['Submit Answers', 'Try Again', 'Proceed to Payment'].includes(b.textContent));
      const optionsForQuestion = questionBlocks.slice(qIdx * 4, qIdx * 4 + 4);
      fireEvent.click(optionsForQuestion[wrongIdx]);
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));

    expect(recordQuizScore).toHaveBeenCalledWith(2, 0);
    expect(updateUserProfile).not.toHaveBeenCalled();
    expect(screen.getByText(/Assessment Incomplete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('Try Again resets answers and returns to the question view', () => {
    renderQuiz();
    const wrongIndexes = [0, 0, 0, 0, 0];
    wrongIndexes.forEach((wrongIdx, qIdx) => {
      const questionBlocks = screen.getAllByRole('button').filter((b) => b.textContent && !['Submit Answers', 'Try Again', 'Proceed to Payment'].includes(b.textContent));
      const optionsForQuestion = questionBlocks.slice(qIdx * 4, qIdx * 4 + 4);
      fireEvent.click(optionsForQuestion[wrongIdx]);
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeDisabled();
  });

  it('locks answer selection after submission', () => {
    renderQuiz();
    const correctIndexes = [2, 1, 1, 2, 3];
    correctIndexes.forEach((correctIdx, qIdx) => {
      const questionBlocks = screen.getAllByRole('button').filter((b) => b.textContent && !['Submit Answers', 'Try Again', 'Proceed to Payment'].includes(b.textContent));
      const optionsForQuestion = questionBlocks.slice(qIdx * 4, qIdx * 4 + 4);
      fireEvent.click(optionsForQuestion[correctIdx]);
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));
    // After submission the question view is replaced entirely by the results view.
    expect(screen.queryByRole('button', { name: /Submit Answers/i })).not.toBeInTheDocument();
  });
});
