import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CapstoneSubmit } from './CapstoneSubmit';
import * as AppContextModule from '../context/AppContext';
import * as firebaseModule from '../firebase';
import { CAPSTONES } from '../data/capstones';

vi.mock('../context/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('../context/AppContext');
  return { ...actual, useApp: vi.fn() };
});

vi.mock('../firebase', () => ({
  getFirebaseApp: vi.fn(() => null),
  getFirebaseDb: vi.fn(() => null),
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@emailjs/browser', () => ({ default: { send: vi.fn() } }));

const mockedUseApp = AppContextModule.useApp as unknown as ReturnType<typeof vi.fn>;
const mockedGetFirebaseDb = firebaseModule.getFirebaseDb as unknown as ReturnType<typeof vi.fn>;

const user = {
  uid: 'u1', email: 'u1@test.com', name: 'Test User', role: 'USER' as const,
  accountStatus: 'FREE_TIER' as const, quizPassed: false,
};

const capstoneId = CAPSTONES[0].id;

const renderPage = () => {
  const addToast = vi.fn();
  const alertUser = vi.fn();
  mockedUseApp.mockReturnValue({
    currentUser: user,
    systemConfig: { emailjsServiceId: '', emailjsTemplateId: '', emailjsPublicKey: '', adminEmail: '' },
    addToast,
    alertUser,
  } as unknown as ReturnType<typeof AppContextModule.useApp>);
  render(<MemoryRouter><CapstoneSubmit /></MemoryRouter>);
  return { addToast, alertUser };
};

describe('CapstoneSubmit', () => {
  beforeEach(() => {
    mockedUseApp.mockReset();
    mockedGetFirebaseDb.mockReturnValue(null);
    localStorage.clear();
  });

  it('prompts to sign in when there is no current user', () => {
    mockedUseApp.mockReturnValue({ currentUser: null, systemConfig: {}, addToast: vi.fn(), alertUser: vi.fn() } as unknown as ReturnType<typeof AppContextModule.useApp>);
    render(<MemoryRouter><CapstoneSubmit /></MemoryRouter>);
    expect(screen.getByText(/Sign in to submit your capstone/i)).toBeInTheDocument();
  });

  it('shows "no capstone locked" when the learner has not selected one', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/No capstone locked/i)).toBeInTheDocument());
  });

  it('renders the submission form once a capstone selection exists in localStorage', async () => {
    localStorage.setItem(`orchestrai_capstone_selection_${user.uid}`, JSON.stringify({ capstoneId, selectedAt: Date.now(), status: 'locked' }));
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit for Review/i })).toBeInTheDocument());
  });

  it('rejects a non-github.com URL with a validation error and does not submit', async () => {
    localStorage.setItem(`orchestrai_capstone_selection_${user.uid}`, JSON.stringify({ capstoneId, selectedAt: Date.now(), status: 'locked' }));
    const { addToast } = renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit for Review/i })).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('https://github.com/yourname/your-capstone-repo'), { target: { value: 'https://gitlab.com/me/repo' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/i }));

    await waitFor(() => expect(screen.getByText(/Must be a github.com URL/i)).toBeInTheDocument());
    expect(addToast).toHaveBeenCalledWith(expect.stringMatching(/fix the highlighted fields/i), 'warning');
  });

  it('blocks submission entirely when no cloud database is configured', async () => {
    localStorage.setItem(`orchestrai_capstone_selection_${user.uid}`, JSON.stringify({ capstoneId, selectedAt: Date.now(), status: 'locked' }));
    const { addToast } = renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit for Review/i })).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('https://github.com/yourname/your-capstone-repo'), { target: { value: 'https://github.com/me/repo' } });
    fireEvent.change(screen.getByPlaceholderText('https://your-capstone.web.app'), { target: { value: 'https://my-app.web.app' } });
    fireEvent.change(screen.getByPlaceholderText('https://github.com/yourname/your-capstone-repo/blob/main/README.md'), { target: { value: 'https://github.com/me/repo/blob/main/README.md' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/i }));

    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.stringMatching(/Cloud database unavailable/i), 'error'));
  });
});
