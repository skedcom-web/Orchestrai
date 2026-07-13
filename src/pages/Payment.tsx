import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, ShieldCheck, Info, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';

export const Payment: React.FC = () => {
  const { 
    currentUser, 
    systemConfig, 
    updateUserProfile, 
    addNotificationLog,
    addToast
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [showRazorpayMock, setShowRazorpayMock] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isPremiumUpgrade = queryParams.get('mode') === 'premium' || queryParams.get('upgrade') === 'true';

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-sm text-[var(--text-secondary)]">Please login first.</p>
      </div>
    );
  }

  if (!isPremiumUpgrade && !currentUser.quizPassed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h3 className="text-xl font-bold mb-2">Quiz Verification Required</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Please score ≥ 80% on the knowledge check before proceeding to payment.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all"
        >
          Go to Quiz
        </button>
      </div>
    );
  }

  const triggerEmailNotification = async (paymentId: string, isAutomated: boolean) => {
    const emailVariables = {
      name: currentUser.name,
      email: currentUser.email,
      paymentId: paymentId,
      loginUrl: window.location.origin + '/modules'
    };

    const config = systemConfig;
    const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;

    // Subject & Body details for log lookup
    const templateType = isAutomated ? 'account_approved' : 'payment_pending';
    const activeTemplate = config.templates[templateType];
    
    // Parse template body placeholders
    let emailBody = activeTemplate.body
      .replace(/{{name}}/g, currentUser.name)
      .replace(/{{email}}/g, currentUser.email)
      .replace(/{{paymentId}}/g, paymentId)
      .replace(/{{loginUrl}}/g, emailVariables.loginUrl);

    const emailSubject = activeTemplate.subject
      .replace(/{{name}}/g, currentUser.name)
      .replace(/{{email}}/g, currentUser.email);

    if (hasKeys) {
      try {
        await emailjs.send(
          config.emailjsServiceId,
          config.emailjsTemplateId,
          {
            to_email: isAutomated ? currentUser.email : config.adminEmail,
            subject: emailSubject,
            message: emailBody
          },
          config.emailjsPublicKey
        );

        addNotificationLog({
          type: isAutomated ? 'Candidate Approval Alert' : 'Admin Payment Pending Alert',
          recipient: isAutomated ? currentUser.email : config.adminEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Sent'
        });
        addToast(
          isAutomated 
            ? `Confirmation email sent to ${currentUser.email}`
            : `Payment pending notification sent to admin (${config.adminEmail})`,
          'success'
        );
      } catch (err: any) {
        addNotificationLog({
          type: isAutomated ? 'Candidate Approval Alert' : 'Admin Payment Pending Alert',
          recipient: isAutomated ? currentUser.email : config.adminEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Failed'
        });
        addToast(
          `Notification email failed to send: ${err?.message || err}`,
          'error'
        );
      }
    } else {
      // Keys are missing: Mock and log it for educational walkthrough
      addNotificationLog({
        type: `${isAutomated ? 'Candidate Approval Alert' : 'Admin Payment Pending Alert'} (Mocked - Keys Missing)`,
        recipient: isAutomated ? currentUser.email : config.adminEmail,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
      addToast(
        `Payment notification simulated (EmailJS keys missing)`,
        'info'
      );
    }
  };

  const handleCheckoutSubmit = (success: boolean) => {
    setLoading(true);
    setShowRazorpayMock(false);

    setTimeout(async () => {
      if (success) {
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
        
        if (isPremiumUpgrade) {
          updateUserProfile(currentUser.uid, {
            premiumStatus: 'PENDING'
          });
          setLoading(false);
          addToast("Premium upgrade request submitted. Waiting for admin approval!", "success");
          navigate('/capstone');
        } else {
          const mode = systemConfig.approvalMode;
          if (mode === 'AUTOMATED') {
            updateUserProfile(currentUser.uid, {
              accountStatus: 'APPROVED',
              paymentId: mockPaymentId
            });
            // Notify Student of instant approval
            await triggerEmailNotification(mockPaymentId, true);
          } else {
            updateUserProfile(currentUser.uid, {
              accountStatus: 'PENDING_APPROVAL',
              paymentId: mockPaymentId
            });
            // Notify Admin of pending approval
            await triggerEmailNotification(mockPaymentId, false);
          }
          setLoading(false);
          navigate('/modules');
        }
      } else {
        setLoading(false);
        addToast("Payment canceled or failed. Please try again.", "error");
      }
    }, 1200);
  };

  const price = isPremiumUpgrade 
    ? (systemConfig.premiumUpgradePrice ?? 499) 
    : (systemConfig.certificationPrice ?? 199);

  const title = isPremiumUpgrade 
    ? "Premium Case Studies Upgrade" 
    : "Accountability Verification";

  const desc = isPremiumUpgrade
    ? `Upgrade your account to Premium Access for ₹${price} INR to explore advanced case studies.`
    : `Verify your commitment to the certification tract with a nominal ₹${price} INR fee.`;

  const itemTitle = isPremiumUpgrade 
    ? "OrchestrAI Premium Case Studies Access" 
    : "OrchestrAI Lead Program Entry";

  const itemDesc = isPremiumUpgrade 
    ? "Unlocks post-certification Module 7 advanced labs and case studies"
    : "Full access to Modules 3–7, labs, and certification demo";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-4">
          <CreditCard className="h-4 w-4" />
          <span>Payment Gate</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {desc}
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 sm:p-8 space-y-6">
        
        {/* Invoice Summary Card */}
        <div className="border border-[var(--border-color)] rounded-lg p-5 bg-slate-500/5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Order Summary</h4>
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{itemTitle}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{itemDesc}</p>
            </div>
            <span className="text-base font-extrabold">₹{price}.00</span>
          </div>
          <div className="flex items-center justify-between font-bold text-sm">
            <span>Total Payable</span>
            <span className="text-indigo-500">₹{price}.00 INR</span>
          </div>
        </div>

        {/* Accountability Description */}
        <div className="flex items-start space-x-3 text-xs bg-slate-500/5 border border-[var(--border-color)] p-4 rounded-lg">
          <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[var(--text-secondary)]">
            {isPremiumUpgrade ? (
              <strong className="text-[var(--text-primary)] font-semibold">Premium Explorer Mode:</strong>
            ) : (
              <strong className="text-[var(--text-primary)] font-semibold">Why ₹{price} INR?</strong>
            )}
            {" "}
            {isPremiumUpgrade 
              ? "Upgrading to premium grants you full lifetime access to try other case studies, test additional architectures, package clean solution baselines, and receive continuous SME grading reviews."
              : "As detailed in the specifications, this program is offered for a nominal fee to act as an accountability gate. It filters out casual users to ensure support is spent on candidates seeking real IT company referrals."}
          </div>
        </div>

        {/* Pay Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowRazorpayMock(true)}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Initiate Razorpay Checkout</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* RAZORPAY MOCK OVERLAY MODAL */}
      {showRazorpayMock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-sm p-4">
          <div className="bg-[#111827] text-white border border-[#1f2937] w-full max-w-sm rounded-xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Brand Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3.5 mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center font-bold text-sm text-white">R</div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-blue-400">Razorpay Secure</h4>
                  <p className="text-[10px] text-gray-400">Test Mode Integration</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-blue-400">₹{price}.00</span>
            </div>

            {/* Merchant info */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Payment to</p>
              <h5 className="text-xs font-bold mt-0.5">OrchestrAI Lead Academy</h5>
              <p className="text-[10px] text-gray-500 mt-0.5">candidate: {currentUser.email}</p>
            </div>

            {/* Emulated success buttons */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-gray-400 text-center font-semibold mb-1 uppercase tracking-wider">
                Select Test Result
              </p>
              
              <button
                onClick={() => handleCheckoutSubmit(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                onClick={() => handleCheckoutSubmit(false)}
                className="w-full py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded text-xs font-semibold"
              >
                Cancel / Simulate Failure
              </button>
            </div>

            <div className="mt-4 border-t border-[#1f2937] pt-3 text-center">
              <p className="text-[10px] text-gray-500">
                Secured by Razorpay. This is a sandbox testing module. No real money will be charged.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
