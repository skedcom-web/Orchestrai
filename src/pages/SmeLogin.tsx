import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { KeyRound, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFirebaseDb } from '../firebase';

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder().encode(`${salt}::${password}`);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const SmeLogin: React.FC = () => {
  const { setCurrentUser, addToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change states
  const [mustChange, setMustChange] = useState(false);
  const [reviewerRecord, setReviewerRecord] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }

    setSubmitting(true);
    const db = getFirebaseDb();
    if (!db) { setError('Cloud database unavailable. Try again in a moment.'); setSubmitting(false); return; }

    try {
      const snap = await get(ref(db, 'reviewers'));
      if (!snap.exists()) { setError('No reviewer accounts configured yet. Ask the admin to add you.'); setSubmitting(false); return; }

      const all = snap.val() as Record<string, any>;
      const entry = Object.entries(all).find(([, r]: [string, any]) => (r.email || '').toLowerCase() === email.trim().toLowerCase());

      if (!entry) { setError('No reviewer account found for this email.'); setSubmitting(false); return; }
      const [uid, r] = entry;

      if (r.disabled) { setError('Your reviewer account is disabled. Contact the admin to re-enable it.'); setSubmitting(false); return; }
      if (!r.passwordHash || !r.passwordSalt) { setError('No password is set on this account. Ask the admin to send credentials.'); setSubmitting(false); return; }

      const computed = await hashPassword(password, r.passwordSalt);
      if (computed !== r.passwordHash) { setError('Incorrect password.'); setSubmitting(false); return; }

      if (r.mustChangePassword !== false) {
        setReviewerRecord({ uid, email: r.email, name: r.name, data: r });
        setMustChange(true);
        setSubmitting(false);
        return;
      }

      // Set a session as this reviewer with role='SME' so /admin gates correctly
      const sessionUser: any = {
        uid,
        email: r.email,
        name: r.name,
        role: r.role === 'admin' ? 'ADMIN' : 'SME',
        accountStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: false,
        quizPassed: true,
        progress: { slidesViewed: {}, modulesCompleted: [], quizScores: {}, labsPassed: [], streakDays: 0, lastActiveDate: '', level: 1, xp: 0 },
        isReviewer: true,
        reviewerRole: r.role
      };
      setCurrentUser(sessionUser);
      try {
        sessionStorage.setItem('orchestrai_session_user', JSON.stringify(sessionUser));
        localStorage.setItem('orchestrai_db_currentUser', JSON.stringify(sessionUser));
      } catch { /* ignore */ }
      addToast(`Welcome, ${r.name}. Opening your review queue.`, 'success');
      setTimeout(() => navigate('/admin'), 200);
    } catch (err: any) {
      setError(`Login failed: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const changePasswordAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reviewerRecord) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const db = getFirebaseDb();
    if (!db) { setError('Database connection unavailable.'); setSubmitting(false); return; }

    try {
      const generateSalt = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const salt = generateSalt();
      const hash = await hashPassword(newPassword, salt);

      const updatePayload: any = {
        passwordHash: hash,
        passwordSalt: salt,
        mustChangePassword: false,
        lastPasswordResetAt: Date.now()
      };

      await update(ref(db, `reviewers/${reviewerRecord.uid}`), updatePayload);

      // Log in
      const r = reviewerRecord.data;
      const sessionUser: any = {
        uid: reviewerRecord.uid,
        email: r.email,
        name: r.name,
        role: r.role === 'admin' ? 'ADMIN' : 'SME',
        accountStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: false,
        quizPassed: true,
        progress: { slidesViewed: {}, modulesCompleted: [], quizScores: {}, labsPassed: [], streakDays: 0, lastActiveDate: '', level: 1, xp: 0 },
        isReviewer: true,
        reviewerRole: r.role
      };

      setCurrentUser(sessionUser);
      try {
        sessionStorage.setItem('orchestrai_session_user', JSON.stringify(sessionUser));
        localStorage.setItem('orchestrai_db_currentUser', JSON.stringify(sessionUser));
      } catch { /* ignore */ }
      addToast(`Password updated. Welcome, ${r.name}.`, 'success');
      setTimeout(() => navigate('/admin'), 200);
    } catch (err: any) {
      setError(`Failed to update password: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-card rounded-2xl p-7 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">OrchestrAI Reviewer Portal</div>
            <h1 className="text-xl font-extrabold">{mustChange ? 'Update Password' : 'Sign in to review capstones'}</h1>
          </div>
        </div>

        {mustChange ? (
          <div>
            <p className="text-xs text-yellow-500 leading-relaxed mb-5">
              ⚠️ You are logging in with a temporary password. You must set a new password before you can access the reviewer dashboard.
            </p>
            <form onSubmit={changePasswordAndLogin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min 6 chars)"
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm focus:outline-none focus:border-purple-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-[11px] text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMustChange(false);
                    setReviewerRecord(null);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPassword('');
                  }}
                  className="w-1/3 py-2.5 rounded-lg border border-[var(--border-color)] hover:bg-slate-500/5 text-xs font-semibold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="w-2/3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-sm font-extrabold shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save & Login'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
              Use the credentials emailed to you by the OrchestrAI admin. Forgot your password? Contact the admin to reset it — they can issue a fresh one in one click.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Paste the password from your invite email" autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm font-mono focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-[11px] text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <button
                type="submit" disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white text-sm font-extrabold shadow-md transition-all disabled:opacity-60"
              >
                {submitting ? 'Signing in…' : <>Sign in <ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
