import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { TimelineRoadmap } from './components/TimelineRoadmap';
import { GlowBackground } from './components/GlowBackground';
import { Landing } from './pages/Landing';
import { Modules } from './pages/Modules';
import { Quiz } from './pages/Quiz';
import { Payment } from './pages/Payment';
import { Admin } from './pages/Admin';
import { Certification } from './pages/Certification';
import { Capstone } from './pages/Capstone';
import { CapstoneWorkspace } from './pages/CapstoneWorkspace';
import { CapstoneSubmit } from './pages/CapstoneSubmit';
import { SmeLogin } from './pages/SmeLogin';
import { FeedbackPage } from './pages/FeedbackForm';
import { Resources } from './pages/Resources';
import { useApp } from './context/AppContext';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { QuickHelp } from './components/QuickHelp';
import { Sparkles, BookOpen, Shield, Award, X, CheckCircle2, AlertTriangle, XCircle, Info, Folder } from 'lucide-react';
import { getFirebaseDb } from './firebase';
import { ref, set } from 'firebase/database';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { toasts, removeToast, activeDialog, closeDialog, currentUser } = useApp();
  const isAdminRoute = location.pathname === '/admin';

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const db = getFirebaseDb();
      if (db) {
        const id = Math.random().toString(36).substring(2, 11);
        const newLog = {
          id,
          timestamp: new Date().toISOString(),
          type: 'WINDOW_ERROR',
          userEmail: 'anonymous-incognito',
          description: `Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}. Stack: ${event.error?.stack || 'no stack'}`
        };
        set(ref(db, `audit_logs/${id}`), newLog).catch(() => {});
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const db = getFirebaseDb();
      if (db) {
        const id = Math.random().toString(36).substring(2, 11);
        const newLog = {
          id,
          timestamp: new Date().toISOString(),
          type: 'UNHANDLED_REJECTION',
          userEmail: 'anonymous-incognito',
          description: `Promise Rejection: ${event.reason?.message || event.reason || 'no reason'}. Stack: ${event.reason?.stack || 'no stack'}`
        };
        set(ref(db, `audit_logs/${id}`), newLog).catch(() => {});
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Roadmap is shown on non-admin pages, only when a user is logged in
  // (on the landing page it shows for everyone to understand the journey)
  const showRoadmap = !isAdminRoute && !(currentUser?.isReviewer || currentUser?.role === 'SME' || currentUser?.role === 'ADMIN');

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Centralized Toasts Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let ToastIcon = Info;
          let colorClass = "border-blue-500/30 bg-blue-500/10 text-blue-400";
          if (toast.type === "success") {
            ToastIcon = CheckCircle2;
            colorClass = "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
          } else if (toast.type === "error") {
            ToastIcon = XCircle;
            colorClass = "border-red-500/25 bg-red-500/10 text-red-400";
          } else if (toast.type === "warning") {
            ToastIcon = AlertTriangle;
            colorClass = "border-yellow-500/25 bg-yellow-500/10 text-yellow-400";
          }

          return (
            <div
              key={toast.id}
              className={`glass-card p-4 rounded-xl border flex items-start gap-3 shadow-lg pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300 ${colorClass}`}
            >
              <ToastIcon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <p className="text-xs font-semibold leading-relaxed text-[var(--text-primary)]">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Centralized Custom Dialog Modal */}
      {activeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden p-6 shadow-2xl relative animate-in zoom-in-95 duration-250">
            {/* Header Icon & Title */}
            <div className="flex items-center gap-3.5 border-b border-[var(--border-color)] pb-4 mb-4">
              {(() => {
                let DialogIcon = Info;
                let iconColor = "text-indigo-400";
                if (activeDialog.iconType === "success") {
                  DialogIcon = CheckCircle2;
                  iconColor = "text-emerald-400";
                } else if (activeDialog.iconType === "error") {
                  DialogIcon = XCircle;
                  iconColor = "text-red-400";
                } else if (activeDialog.iconType === "warning") {
                  DialogIcon = AlertTriangle;
                  iconColor = "text-amber-400";
                }
                return (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 ${iconColor}`}>
                    <DialogIcon className="h-5 w-5" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                  {activeDialog.title}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Academy System Notification
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="py-2.5">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeDialog.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
              {activeDialog.type === "confirm" ? (
                <>
                  <button
                    onClick={() => {
                      if (activeDialog.onCancel) activeDialog.onCancel();
                      closeDialog();
                    }}
                    className="px-4 py-2 border border-[var(--border-color)] bg-slate-500/5 hover:bg-slate-500/10 text-[var(--text-primary)] rounded-lg text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (activeDialog.onConfirm) activeDialog.onConfirm();
                      closeDialog();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    Confirm Action
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    closeDialog();
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                >
                  Dismiss Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Gamification celebration modal (level-up / badge unlock) */}
      <CelebrationOverlay />

      {/* Floating Quick Help / Ask Assistant Chatbot */}
      <QuickHelp />

      {/* Premium Glow Background Blobs */}
      <GlowBackground />

      {/* Navigation Top Header */}
      <Header />

      {/* Candidate Progress Roadmap */}
      {showRoadmap && <TimelineRoadmap />}

      {/* Pages Viewport */}
      <main className="flex-grow z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/certification" element={<Certification />} />
          <Route path="/capstone" element={<Capstone />} />
          <Route path="/capstone/workspace" element={<CapstoneWorkspace />} />
          <Route path="/capstone/submit" element={<CapstoneSubmit />} />
          <Route path="/sme-login" element={<SmeLogin />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </main>

      {/* Website-Style Footer */}
      <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-sm py-10 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  OrchestrAI
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[220px]">
                AI-powered <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> Certification that gets you hired by top IT companies.
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">A <strong>vThink Global Technologies</strong> initiative.</p>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Free Modules (1 & 2)', path: '/modules', icon: BookOpen },
                  { label: 'Reference Vault', path: '/resources', icon: Folder },
                  { label: 'Admin Console', path: '/admin', icon: Shield },
                  { label: 'My Certification', path: '/certification', icon: Award },
                ].map(({ label, path, icon: Icon }) => (
                  <a key={path} href={path} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Founder */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Founder</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Sithanandham Radhakrishnan</strong>
                <br />
                <span className="text-indigo-500 font-semibold">Strategic Advisor &amp; Product Owner</span>
                <br />
                vThink Global Technologies Pvt Ltd
                <br />
                <span className="text-[var(--text-secondary)]">Chief OrchestrAI Architect</span>
              </p>
              <p className="text-[10px] text-indigo-400 italic">
                "Human Orchestrates. AI Builds. Value Delivers."
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]">
            <span>&copy; 2026 OrchestrAI Lead Academy. All rights reserved.</span>
            <span>Not-for-profit initiative. Training fee covers operational costs only.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
