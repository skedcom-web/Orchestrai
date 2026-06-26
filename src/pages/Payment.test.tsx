import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Payment } from './Payment';
import * as AppContextModule from '../context/AppContext';
import emailjs from '@emailjs/browser';

vi.mock('../context/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('../context/AppContext');
  return { ...actual, useApp: vi.fn() };
});

vi.mock('@emailjs/browser', () => ({ default: { send: vi.fn() } }));

const mockedUseApp = AppContextModule.useApp as unknown as ReturnType<typeof vi.fn>;
const mockedSend = emailjs.send as unknown as ReturnType<typeof vi.fn>;

const baseTemplates = {
  payment_pending: { subject: 'Pending {{name}}', body: 'Hi {{name}} ({{email}}), payment {{paymentId}} pending.' },
  account_approved: { subject: 'Approved {{name}}', body: 'Hi {{name}} ({{email}}), you are approved. {{loginUrl}}' },
};

const user = {
  uid: 'u1', email: 'u1@test.com', name: 'Test User', role: 'USER' as const,
  accountStatus: 'FREE_TIER' as const, quizPassed: true,
};

const renderPage = (configOverrides: Record<string, unknown> = {}) => {
  const updateUserProfile = vi.fn();
  const addNotificationLog = vi.fn();
  const addToast = vi.fn();
  mockedUseApp.mockReturnValue({
    currentUser: user,
    systemConfig: {
      emailjsServiceId: 'svc', emailjsTemplateId: 'tpl', emailjsPublicKey: 'key',
      adminEmail: 'admin@test.com', approvalMode: 'MANUAL', templates: baseTemplates,
      ...configOverrides,
    },
    updateUserProfile,
    addNotificationLog,
    addToast,
  } as unknown as ReturnType<typeof AppContextModule.useApp>);
  render(<MemoryRouter><Payment /></MemoryRouter>);
  return { updateUserProfile, addNotificationLog, addToast };
};

describe('Payment', () => {
  beforeEach(() => {
    mockedUseApp.mockReset();
    mockedSend.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks access when there is no current user', () => {
    mockedUseApp.mockReturnValue({ currentUser: null } as unknown as ReturnType<typeof AppContextModule.useApp>);
    render(<MemoryRouter><Payment /></MemoryRouter>);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it('gates the user out until the quiz is passed', () => {
    mockedUseApp.mockReturnValue({ currentUser: { ...user, quizPassed: false } } as unknown as ReturnType<typeof AppContextModule.useApp>);
    render(<MemoryRouter><Payment /></MemoryRouter>);
    expect(screen.getByText(/Quiz Verification Required/i)).toBeInTheDocument();
  });

  it('opens the mock Razorpay modal on checkout click', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    expect(screen.getByText(/Razorpay Secure/i)).toBeInTheDocument();
  });

  it('on payment failure, shows an error toast and never calls updateUserProfile', async () => {
    const { updateUserProfile, addToast } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel \/ Simulate Failure/i }));

    await vi.advanceTimersByTimeAsync(1200);

    expect(updateUserProfile).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith(expect.stringMatching(/Payment canceled or failed/i), 'error');
  });

  it('AUTOMATED mode approves the user immediately and sends the approval email to the learner', async () => {
    mockedSend.mockResolvedValue({ status: 200 });
    const { updateUserProfile, addNotificationLog } = renderPage({ approvalMode: 'AUTOMATED' });
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simulate Successful Payment/i }));

    await vi.advanceTimersByTimeAsync(1200);

    expect(updateUserProfile).toHaveBeenCalledWith('u1', expect.objectContaining({ accountStatus: 'APPROVED' }));
    expect(mockedSend).toHaveBeenCalledWith('svc', 'tpl', expect.objectContaining({ to_email: 'u1@test.com' }), 'key');
    expect(addNotificationLog).toHaveBeenCalledWith(expect.objectContaining({ status: 'Sent', recipient: 'u1@test.com' }));
  });

  it('MANUAL mode sets PENDING_APPROVAL and notifies the admin, not the learner', async () => {
    mockedSend.mockResolvedValue({ status: 200 });
    const { updateUserProfile, addNotificationLog } = renderPage({ approvalMode: 'MANUAL' });
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simulate Successful Payment/i }));

    await vi.advanceTimersByTimeAsync(1200);

    expect(updateUserProfile).toHaveBeenCalledWith('u1', expect.objectContaining({ accountStatus: 'PENDING_APPROVAL' }));
    expect(mockedSend).toHaveBeenCalledWith('svc', 'tpl', expect.objectContaining({ to_email: 'admin@test.com' }), 'key');
    expect(addNotificationLog).toHaveBeenCalledWith(expect.objectContaining({ status: 'Sent', recipient: 'admin@test.com' }));
  });

  it('falls back to a simulated/mocked notification when EmailJS keys are missing', async () => {
    const { updateUserProfile, addNotificationLog } = renderPage({ emailjsServiceId: '', approvalMode: 'AUTOMATED' });
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simulate Successful Payment/i }));

    await vi.advanceTimersByTimeAsync(1200);

    expect(updateUserProfile).toHaveBeenCalled();
    expect(mockedSend).not.toHaveBeenCalled();
    expect(addNotificationLog).toHaveBeenCalledWith(expect.objectContaining({ status: 'Sent', channel: expect.stringContaining('Simulated') }));
  });

  it('logs a Failed notification and shows an error toast when EmailJS rejects', async () => {
    mockedSend.mockRejectedValue({ message: 'network down' });
    const { addNotificationLog, addToast } = renderPage({ approvalMode: 'AUTOMATED' });
    fireEvent.click(screen.getByRole('button', { name: /Initiate Razorpay Checkout/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simulate Successful Payment/i }));

    await vi.advanceTimersByTimeAsync(1200);
    expect(addNotificationLog).toHaveBeenCalledWith(expect.objectContaining({ status: 'Failed' }));
    expect(addToast).toHaveBeenCalledWith(expect.stringMatching(/Notification email failed/i), 'error');
  });
});
