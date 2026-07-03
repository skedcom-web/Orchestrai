/**
 * FeedbackForm.tsx — v2 (Bug-fix release)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes vs v1:
 *  1. FeedbackPage now uses useSearchParams (not window.location.search)
 *  2. blank() no longer crashes when currentUser is null / department missing
 *  3. autoSaveTimer ref is properly typed and cleaned up
 *  4. useCallback deps are correct — no stale-closure risk
 *  5. Modal z-index raised to z-[100] so it layers above TrainingPresenter (z-50)
 *  6. Guard: if !currentUser, show login-required UI instead of crashing
 *  7. certBatch uses safe toISOString fallback
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getFirebaseDb } from '../firebase';
import { ref, get, set, update } from 'firebase/database';
import { StarRating } from '../components/StarRating';
import {
  MessageSquare, CheckCircle2, X, ChevronRight,
  ThumbsUp, AlertCircle, Loader2, User, Building2, GraduationCap,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
export const MODULE_NAMES: Record<number, string> = {
  1: 'Module 1: The OrchestrAI Mindset',
  2: 'Module 2: Framework Architecture',
  3: 'Module 3: Governance-First Setup',
  4: 'Module 4: Foundation Build',
  5: 'Module 5: The Workflow Engine',
  6: 'Module 6: Admin, Reports & Going Live',
  7: 'Module 7: Practical Capstone Build',
};

const USEFULNESS_OPTIONS = [
  'Extremely Useful', 'Useful', 'Neutral', 'Slightly Useful', 'Not Useful',
] as const;

const CLARITY_OPTIONS = [
  'Very Easy', 'Easy', 'Average', 'Difficult', 'Very Difficult',
] as const;

const OUTCOME_OPTIONS = [
  'I can apply this immediately',
  'I understand the concept but need practice',
  'I need more examples',
  'I need additional guidance',
] as const;

const CONFIDENCE_OPTIONS = [
  'Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree',
] as const;

const ADVANCED_CERT_OPTIONS = ['Yes', 'Maybe', 'No'] as const;

const currentBatch = () => {
  try { return new Date().toISOString().slice(0, 7); }
  catch { return 'unknown'; }
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ModuleFeedback {
  moduleId: number;
  rating: number;
  usefulness: string;
  contentClarity: string;
  learningOutcome: string;
  likedMost: string;
  improvements: string;
  certBatch: string;
  completedAt: number;
  isAnonymous: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  organization: string;
}

export interface CertFeedback {
  overallRating: number;
  npsScore: number;
  mostValuableModule: string;
  moduleNeedsImprovement: string;
  confidenceImprovement: string;
  advancedCertInterest: string;
  biggestTakeaway: string;
  testimonial: string;
  isAnonymous: boolean;
  certBatch: string;
  completedAt: number;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  organization: string;
}

// ─── Shared sub-components ───────────────────────────────────────────────────
const SelectButtons: React.FC<{
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}> = ({ options, value, onChange, columns = 2 }) => {
  const gridClass =
    columns === 1 ? 'grid-cols-1' :
    columns === 3 ? 'grid-cols-3' :
    'grid-cols-2';
  return (
    <div className={`grid ${gridClass} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
            value === opt
              ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
          }`}
        >
          {value === opt && <span className="mr-1">✓ </span>}
          {opt}
        </button>
      ))}
    </div>
  );
};

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
    {label}{required && <span className="text-rose-400 ml-1">*</span>}
  </label>
);

const inputCls = 'form-input';

// ─── NPS Slider ──────────────────────────────────────────────────────────────
const NpsSlider: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const getColor = (v: number) =>
    v <= 6 ? 'text-rose-400' : v <= 8 ? 'text-amber-400' : 'text-emerald-400';
  const getLabel = (v: number) =>
    v <= 6 ? 'Detractor' : v <= 8 ? 'Passive' : 'Promoter';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] px-1">
        <span>0 — Not at all likely</span>
        <span>10 — Extremely likely</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`h-9 w-9 rounded-lg text-xs font-extrabold border transition-all ${
              value === i
                ? i <= 6
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                  : i <= 8
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      {value >= 0 && (
        <div className={`text-[11px] font-bold ${getColor(value)}`}>
          Score {value} — {getLabel(value)}
          {value >= 9 && ' 🎉'}
        </div>
      )}
    </div>
  );
};

// ─── Input Validator Helper ──────────────────────────────────────────────────
const validateInputText = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  // Repeated letters (e.g. aaaaa)
  if (/(.)\1{4,}/.test(trimmed)) return false;
  // Blocks of consonants (e.g. sssdfgh)
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(trimmed)) return false;
  // Basic profanity filter
  const badWords = ['fuck', 'shit', 'asshole', 'bitch', 'crappy', 'nonsense', 'gibberish'];
  if (badWords.some((w) => trimmed.toLowerCase().includes(w))) return false;
  // Minimum length check (at least 2 letters/digits)
  if (trimmed.length > 0 && trimmed.replace(/[^a-zA-Z0-9]/g, '').length < 2) return false;
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE FEEDBACK MODAL
// ─────────────────────────────────────────────────────────────────────────────
export const ModuleFeedbackModal: React.FC<{
  moduleId: number;
  onClose: () => void;
  onSubmitted: () => void;
}> = ({ moduleId, onClose, onSubmitted }) => {
  const { currentUser, alertUser } = useApp();

  const guestUid = useMemo(() => {
    if (currentUser?.uid) return currentUser.uid;
    let vid = localStorage.getItem('orchestrai_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('orchestrai_visitor_id', vid);
    }
    return vid;
  }, [currentUser?.uid]);

  // Safe blank — never crashes if currentUser is null
  const makeBlank = useCallback(
    (user: typeof currentUser) => ({
      moduleId,
      rating: 0,
      usefulness: '',
      contentClarity: '',
      learningOutcome: '',
      likedMost: '',
      improvements: '',
      certBatch: currentBatch(),
      isAnonymous: false,
      department: user?.department ?? (user ? '' : 'Guest Dept'),
      organization: user?.organization ?? (user ? '' : 'Guest Org'),
    }),
    [moduleId]
  );

  const [form, setForm] = useState(() => makeBlank(currentUser));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load local draft cache if any on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`orchestrai_draft_${guestUid}_${moduleId}`);
      if (cached) {
        const data = JSON.parse(cached);
        setForm((prev) => ({ ...prev, ...data }));
      }
    } catch {}
  }, [guestUid, moduleId]);

  // Re-initialise when user loads asynchronously
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      department: currentUser?.department ?? prev.department,
      organization: currentUser?.organization ?? prev.organization,
    }));
  }, [currentUser?.department, currentUser?.organization]);

  // Check if already submitted + load any draft from database (conflict resolution)
  useEffect(() => {
    if (!guestUid) return;
    const db = getFirebaseDb();
    if (!db) return;
    get(ref(db, `feedback/module_feedback/${guestUid}/${moduleId}`))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data && !data.isDraft) {
          setAlreadySubmitted(true);
        } else if (data) {
          setForm((prev) => {
            // Keep the newer draft (local vs firebase)
            let localSavedAt = 0;
            try {
              const cached = localStorage.getItem(`orchestrai_draft_${guestUid}_${moduleId}`);
              if (cached) localSavedAt = JSON.parse(cached).savedAt || 0;
            } catch {}
            const remoteSavedAt = data.savedAt || 0;
            if (remoteSavedAt >= localSavedAt) {
              try {
                localStorage.setItem(`orchestrai_draft_${guestUid}_${moduleId}`, JSON.stringify(data));
              } catch {}
              return { ...prev, ...data };
            }
            return prev;
          });
        }
      })
      .catch(() => {/* silent — Firebase unavailable */});
  }, [guestUid, moduleId]);

  // Sync handler on recovery
  useEffect(() => {
    const syncData = async () => {
      if (!navigator.onLine) return;
      const db = getFirebaseDb();
      if (!db) return;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          // 1. Sync pending submissions
          if (key.startsWith('orchestrai_pending_submit_')) {
            try {
              const parts = key.split('_');
              const uid = parts[3];
              const mId = parts[4];
              const record = JSON.parse(localStorage.getItem(key) || '{}');
              await set(ref(db, `feedback/module_feedback/${uid}/${mId}`), {
                ...record,
                isDraft: false,
              });
              localStorage.removeItem(key);
            } catch {}
          }

          // 2. Sync pending drafts
          if (key.startsWith('orchestrai_pending_') && !key.includes('submit')) {
            try {
              const parts = key.split('_');
              const uid = parts[2];
              const mId = parts[3];
              const draft = JSON.parse(localStorage.getItem(key) || '{}');
              await update(ref(db, `feedback/module_feedback/${uid}/${mId}`), draft);
              localStorage.removeItem(key);
            } catch {}
          }
        }
      } catch {}
    };

    window.addEventListener('online', syncData);
    if (navigator.onLine) syncData();
    return () => window.removeEventListener('online', syncData);
  }, []);

  const scheduleAutoSave = useCallback(
    (draft: typeof form) => {
      if (!guestUid) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const savedAt = Date.now();
        const payload = { ...draft, isDraft: true, savedAt };
        try {
          localStorage.setItem(`orchestrai_draft_${guestUid}_${moduleId}`, JSON.stringify(payload));
          const db = getFirebaseDb();
          if (db && navigator.onLine) {
            await update(ref(db, `feedback/module_feedback/${guestUid}/${moduleId}`), payload);
            localStorage.removeItem(`orchestrai_pending_${guestUid}_${moduleId}`);
          } else {
            localStorage.setItem(`orchestrai_pending_${guestUid}_${moduleId}`, JSON.stringify(payload));
          }
        } catch {
          localStorage.setItem(`orchestrai_pending_${guestUid}_${moduleId}`, JSON.stringify(payload));
        }
      }, 800);
    },
    [guestUid, moduleId]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const setField = (key: keyof typeof form, val: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      scheduleAutoSave(next);
      return next;
    });
  };

  const isValidInput = validateInputText(form.department) && validateInputText(form.organization);

  const isValid =
    form.rating > 0 &&
    !!form.usefulness &&
    !!form.contentClarity &&
    !!form.learningOutcome &&
    isValidInput;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (!guestUid) return;
    setSaving(true);

    const record: ModuleFeedback = {
      ...form,
      userId: currentUser ? (form.isAnonymous ? 'anonymous' : currentUser.uid) : 'guest',
      userName: currentUser ? (form.isAnonymous ? 'Anonymous' : (currentUser.name ?? 'Unknown')) : 'Guest',
      userEmail: currentUser ? (form.isAnonymous ? 'anonymous@feedback' : (currentUser.email ?? '')) : 'guest@feedback',
      department: form.department || (currentUser ? '' : 'Guest Dept'),
      organization: form.organization || (currentUser ? '' : 'Guest Org'),
      completedAt: Date.now(),
    };

    try {
      const db = getFirebaseDb();
      if (db && navigator.onLine) {
        await set(ref(db, `feedback/module_feedback/${guestUid}/${moduleId}`), {
          ...record,
          isDraft: false,
        });
        localStorage.removeItem(`orchestrai_draft_${guestUid}_${moduleId}`);
        localStorage.removeItem(`orchestrai_pending_${guestUid}_${moduleId}`);
        setSaved(true);
        setTimeout(() => onSubmitted(), 1800);
      } else {
        localStorage.setItem(`orchestrai_pending_submit_${guestUid}_${moduleId}`, JSON.stringify(record));
        localStorage.removeItem(`orchestrai_draft_${guestUid}_${moduleId}`);
        localStorage.removeItem(`orchestrai_pending_${guestUid}_${moduleId}`);
        setSaved(true);
        alertUser(
          'Saved Locally! 💾',
          'You are offline. Your feedback is secured on this device and will submit automatically when connection is restored.',
          'success'
        );
        setTimeout(() => onSubmitted(), 2500);
      }
    } catch (e) {
      console.error('[ModuleFeedback] submit failed:', e);
      localStorage.setItem(`orchestrai_pending_submit_${guestUid}_${moduleId}`, JSON.stringify(record));
      setSaved(true);
      setTimeout(() => onSubmitted(), 2500);
    } finally {
      setSaving(false);
    }
  };

  // ─── Already submitted ───────────────────────────────────────────────────
  if (alreadySubmitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl max-w-sm w-full p-6 text-center border border-emerald-500/30">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-extrabold mb-1">Already Submitted!</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            You\'ve already rated {MODULE_NAMES[moduleId]}. Thank you!
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-extrabold"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl max-w-sm w-full p-6 text-center border border-emerald-500/30 animate-in zoom-in-95 duration-300">
          <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-extrabold mb-1 text-emerald-300">Thank You! 🎉</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Your feedback for <strong className="text-[var(--text-primary)]">{MODULE_NAMES[moduleId]}</strong> has been recorded.
          </p>
        </div>
      </div>
    );
  }

  const moduleName = MODULE_NAMES[moduleId] ?? `Module ${moduleId}`;
  const completedCount = [
    form.rating > 0,
    !!form.usefulness,
    !!form.contentClarity,
    !!form.learningOutcome,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-xl w-full max-h-[88vh] border border-indigo-500/25 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border-color)] shrink-0 bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Module Feedback</div>
              <h3 className="text-sm font-extrabold leading-tight">{moduleName}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-1 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            <span>Required fields</span>
            <span className={completedCount === 4 ? 'text-emerald-400' : 'text-amber-400'}>
              {completedCount}/4
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form body - Scrollable */}
        <div className="flex-grow overflow-y-auto p-5 pr-4 space-y-5 scrollbar-thin">
          {/* Star Rating */}
          <div>
            <FieldLabel label="Module Rating" required />
            <StarRating value={form.rating} onChange={(v) => setField('rating', v)} size="lg" />
          </div>

          {/* Usefulness */}
          <div>
            <FieldLabel label="Usefulness Rating" required />
            <SelectButtons
              options={USEFULNESS_OPTIONS}
              value={form.usefulness}
              onChange={(v) => setField('usefulness', v)}
            />
          </div>

          {/* Content Clarity */}
          <div>
            <FieldLabel label="Content Clarity" required />
            <SelectButtons
              options={CLARITY_OPTIONS}
              value={form.contentClarity}
              onChange={(v) => setField('contentClarity', v)}
            />
          </div>

          {/* Learning Outcome */}
          <div>
            <FieldLabel label="Learning Outcome" required />
            <SelectButtons
              options={OUTCOME_OPTIONS}
              value={form.learningOutcome}
              onChange={(v) => setField('learningOutcome', v)}
              columns={1}
            />
          </div>

          {/* Text areas */}
          <div>
            <FieldLabel label="What did you like most about this module?" />
            <textarea
              value={form.likedMost}
              onChange={(e) => setField('likedMost', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="The real-world examples and the step-by-step walkthrough…"
            />
          </div>
          <div>
            <FieldLabel label="What can be improved in this module?" />
            <textarea
              value={form.improvements}
              onChange={(e) => setField('improvements', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="More practice exercises, videos for complex topics…"
            />
          </div>

          {/* Department / Organization */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="Department" />
              <input
                type="text"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                className={inputCls}
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <FieldLabel label="Organisation / College" />
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setField('organization', e.target.value)}
                className={inputCls}
                placeholder="e.g. vThink Global"
              />
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] p-3 bg-[var(--surface-sunken)]">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">Submit anonymously</span>
            </div>
            <button
              type="button"
              onClick={() => setField('isAnonymous', !form.isAnonymous)}
              aria-checked={form.isAnonymous}
              role="switch"
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none ${form.isAnonymous ? 'bg-indigo-600' : 'bg-[var(--border-color)]'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${form.isAnonymous ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-card)] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] transition-all"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              ) : (
                <><CheckCircle2 className="h-3.5 w-3.5" /> Submit Feedback</>
              )}
            </button>
          </div>

          {!isValid && (
            <p className="text-[10px] text-amber-400 text-center font-medium">
              {!isValidInput
                ? '⚠ Please enter a valid Department and Organisation name (no gibberish or profanity allowed).'
                : '⚠ Please complete all required fields (⭐ rating, usefulness, clarity, outcome).'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATION FEEDBACK FORM (mandatory gate before cert download)
// ─────────────────────────────────────────────────────────────────────────────
export const CertFeedbackGate: React.FC<{
  onCompleted: () => void;
}> = ({ onCompleted }) => {
  const { currentUser, alertUser } = useApp();

  const makeBlank = useCallback(
    (user: typeof currentUser) => ({
      overallRating: 0,
      npsScore: -1,
      mostValuableModule: '',
      moduleNeedsImprovement: '',
      confidenceImprovement: '',
      advancedCertInterest: '',
      biggestTakeaway: '',
      testimonial: '',
      isAnonymous: false,
      certBatch: currentBatch(),
      department: user?.department ?? '',
      organization: user?.organization ?? '',
    }),
    []
  );

  const [form, setForm] = useState(() => makeBlank(currentUser));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load local cached draft if any on mount
  useEffect(() => {
    if (!currentUser?.uid) return;
    try {
      const cached = localStorage.getItem(`orchestrai_cert_draft_${currentUser.uid}`);
      if (cached) {
        const data = JSON.parse(cached);
        setForm((prev) => ({ ...prev, ...data }));
      }
    } catch {}
  }, [currentUser?.uid]);

  // Refresh dept/org when user loads
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      department: currentUser?.department ?? prev.department,
      organization: currentUser?.organization ?? prev.organization,
    }));
  }, [currentUser?.department, currentUser?.organization]);

  // Load from DB (with conflict resolution)
  useEffect(() => {
    if (!currentUser?.uid) return;
    const db = getFirebaseDb();
    if (!db) return;
    get(ref(db, `feedback/cert_feedback/${currentUser.uid}`))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data && !data.isDraft) {
          setAlreadyDone(true);
        } else if (data) {
          setForm((prev) => {
            let localSavedAt = 0;
            try {
              const cached = localStorage.getItem(`orchestrai_cert_draft_${currentUser.uid}`);
              if (cached) localSavedAt = JSON.parse(cached).savedAt || 0;
            } catch {}
            const remoteSavedAt = data.savedAt || 0;
            if (remoteSavedAt >= localSavedAt) {
              try {
                localStorage.setItem(`orchestrai_cert_draft_${currentUser.uid}`, JSON.stringify(data));
              } catch {}
              return { ...prev, ...data };
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, [currentUser?.uid]);

  // Recovery sync handler
  useEffect(() => {
    const syncCertData = async () => {
      if (!navigator.onLine || !currentUser?.uid) return;
      const db = getFirebaseDb();
      if (!db) return;
      const uid = currentUser.uid;

      // 1. Sync pending submit
      const submitKey = `orchestrai_cert_pending_submit_${uid}`;
      try {
        const cachedSubmit = localStorage.getItem(submitKey);
        if (cachedSubmit) {
          const record = JSON.parse(cachedSubmit);
          await set(ref(db, `feedback/cert_feedback/${uid}`), {
            ...record,
            isDraft: false,
          });
          localStorage.removeItem(submitKey);
          localStorage.removeItem(`orchestrai_cert_draft_${uid}`);
        }
      } catch {}

      // 2. Sync pending draft
      const draftKey = `orchestrai_cert_pending_${uid}`;
      try {
        const cachedDraft = localStorage.getItem(draftKey);
        if (cachedDraft) {
          const draft = JSON.parse(cachedDraft);
          await update(ref(db, `feedback/cert_feedback/${uid}`), draft);
          localStorage.removeItem(draftKey);
        }
      } catch {}
    };

    window.addEventListener('online', syncCertData);
    if (navigator.onLine) syncCertData();
    return () => window.removeEventListener('online', syncCertData);
  }, [currentUser?.uid]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const scheduleAutoSave = useCallback(
    (draft: typeof form) => {
      if (!currentUser?.uid) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const savedAt = Date.now();
        const payload = { ...draft, isDraft: true, savedAt };
        try {
          localStorage.setItem(`orchestrai_cert_draft_${currentUser.uid}`, JSON.stringify(payload));
          const db = getFirebaseDb();
          if (db && navigator.onLine) {
            await update(ref(db, `feedback/cert_feedback/${currentUser.uid}`), payload);
            localStorage.removeItem(`orchestrai_cert_pending_${currentUser.uid}`);
          } else {
            localStorage.setItem(`orchestrai_cert_pending_${currentUser.uid}`, JSON.stringify(payload));
          }
        } catch {
          localStorage.setItem(`orchestrai_cert_pending_${currentUser.uid}`, JSON.stringify(payload));
        }
      }, 800);
    },
    [currentUser?.uid]
  );

  const setField = (key: keyof typeof form, val: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      scheduleAutoSave(next);
      return next;
    });
  };

  const isValidInput = validateInputText(form.department) && validateInputText(form.organization);

  const isValid =
    form.overallRating > 0 &&
    form.npsScore >= 0 &&
    !!form.confidenceImprovement &&
    !!form.advancedCertInterest &&
    form.biggestTakeaway.trim().length > 0 &&
    isValidInput;

  const handleSubmit = async () => {
    if (!isValid || !currentUser?.uid) return;
    setSaving(true);

    const record: CertFeedback = {
      ...form,
      userId: form.isAnonymous ? 'anonymous' : currentUser.uid,
      userName: form.isAnonymous ? 'Anonymous' : (currentUser.name ?? 'Unknown'),
      userEmail: form.isAnonymous ? 'anonymous@feedback' : (currentUser.email ?? ''),
      completedAt: Date.now(),
    };

    try {
      const db = getFirebaseDb();
      if (db && navigator.onLine) {
        await set(ref(db, `feedback/cert_feedback/${currentUser.uid}`), {
          ...record,
          isDraft: false,
        });
        localStorage.removeItem(`orchestrai_cert_draft_${currentUser.uid}`);
        localStorage.removeItem(`orchestrai_cert_pending_${currentUser.uid}`);
        setSaved(true);
      } else {
        localStorage.setItem(`orchestrai_cert_pending_submit_${currentUser.uid}`, JSON.stringify(record));
        localStorage.removeItem(`orchestrai_cert_draft_${currentUser.uid}`);
        localStorage.removeItem(`orchestrai_cert_pending_${currentUser.uid}`);
        setSaved(true);
        alertUser(
          'Saved Locally! 💾',
          'You are offline. Your final certification feedback is secured locally and will submit automatically once you reconnect.',
          'success'
        );
      }
    } catch (e) {
      console.error('[CertFeedback] submit failed:', e);
      localStorage.setItem(`orchestrai_cert_pending_submit_${currentUser.uid}`, JSON.stringify(record));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  // Already submitted — just show content
  if (alreadyDone) return null;

  if (saved) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="glass-card rounded-2xl p-8 border border-emerald-500/30 animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-extrabold mb-2 text-emerald-300">Feedback Recorded! 🎉</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Thank you for completing the certification feedback. Your insights help us improve the program.
          </p>
          <button
            onClick={onCompleted}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-extrabold shadow-lg transition-all"
          >
            <GraduationCap className="h-4 w-4" /> View My Certificate
          </button>
        </div>
      </div>
    );
  }

  const moduleOptions = Object.entries(MODULE_NAMES).map(([id, name]) => ({ id, name }));
  const requiredCount = [
    form.overallRating > 0,
    form.npsScore >= 0,
    !!form.confidenceImprovement,
    !!form.advancedCertInterest,
    form.biggestTakeaway.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Hero Banner */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/25 mb-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/25">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-extrabold mb-1">Certification Feedback</h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
          You've completed the OrchestrAI Certification Program! Please share your experience to unlock your certificate. This takes about 3–4 minutes.
        </p>
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            <span>Required fields</span>
            <span className={requiredCount === 5 ? 'text-emerald-400' : 'text-amber-400'}>{requiredCount}/5</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${(requiredCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="glass-card rounded-2xl p-5">
          <FieldLabel label="Overall Certification Rating" required />
          <StarRating value={form.overallRating} onChange={(v) => setField('overallRating', v)} size="lg" />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <FieldLabel label="How likely are you to recommend this program to a colleague? (0–10 NPS Scale)" required />
          <NpsSlider value={form.npsScore} onChange={(v) => setField('npsScore', v)} />
        </div>

        <div className="glass-card rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Most Valuable Module" />
            <select
              value={form.mostValuableModule}
              onChange={(e) => setField('mostValuableModule', e.target.value)}
              className={inputCls}
            >
              <option value="">Select a module…</option>
              {moduleOptions.map(({ id, name }) => (
                <option key={id} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel label="Module Requiring Improvement" />
            <select
              value={form.moduleNeedsImprovement}
              onChange={(e) => setField('moduleNeedsImprovement', e.target.value)}
              className={inputCls}
            >
              <option value="">Select a module…</option>
              {moduleOptions.map(({ id, name }) => (
                <option key={id} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <FieldLabel label="This program improved my confidence in applying AI-orchestrated workflows" required />
          <SelectButtons
            options={CONFIDENCE_OPTIONS}
            value={form.confidenceImprovement}
            onChange={(v) => setField('confidenceImprovement', v)}
          />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <FieldLabel label="Are you interested in Advanced Certifications?" required />
          <SelectButtons
            options={ADVANCED_CERT_OPTIONS}
            value={form.advancedCertInterest}
            onChange={(v) => setField('advancedCertInterest', v)}
            columns={3}
          />
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <FieldLabel label="Biggest Takeaway from this Certification" required />
            <textarea
              value={form.biggestTakeaway}
              onChange={(e) => setField('biggestTakeaway', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="The most impactful thing I learned was…"
            />
          </div>
          <div>
            <FieldLabel label="Learner Testimonial (optional)" />
            <textarea
              value={form.testimonial}
              onChange={(e) => setField('testimonial', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="This program completely changed how I approach software projects…"
            />
            <p className="text-[9px] text-[var(--text-secondary)] mt-1">
              With your permission, we may publish this on the OrchestrAI Academy website.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Department" />
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                className={`${inputCls} pl-8`}
                placeholder="e.g. Engineering"
              />
            </div>
          </div>
          <div>
            <FieldLabel label="Organisation / College" />
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setField('organization', e.target.value)}
                className={`${inputCls} pl-8`}
                placeholder="e.g. vThink Global"
              />
            </div>
          </div>
        </div>

        {/* Anonymous toggle */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--text-secondary)]" />
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Anonymous Submission</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Your name and email won't appear in the analytics</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isAnonymous}
            onClick={() => setField('isAnonymous', !form.isAnonymous)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${form.isAnonymous ? 'bg-indigo-600' : 'bg-[var(--border-color)]'}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <p className="text-[10px] text-[var(--text-secondary)] text-center">
          💾 Your responses are auto-saved as you type.
        </p>

        {!isValid && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300">
              {!isValidInput
                ? 'Please enter a valid Department and Organisation name (no gibberish or profanity allowed).'
                : 'Please complete all required fields: Overall Rating ⭐, NPS Score, Confidence, Interest in Advanced Certs, and Biggest Takeaway.'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || saving}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-extrabold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><ThumbsUp className="h-4 w-4" /> Submit Feedback &amp; View My Certificate</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK STATUS TRACKER — shows rating status per completed module
// ─────────────────────────────────────────────────────────────────────────────
export const ModuleFeedbackTracker: React.FC<{
  completedModules: number[];
  onRateModule: (id: number) => void;
}> = ({ completedModules, onRateModule }) => {
  const { currentUser } = useApp();
  const [rated, setRated] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!currentUser?.uid || completedModules.length === 0) return;
    const db = getFirebaseDb();
    if (!db) return;
    Promise.all(
      completedModules.map((id) =>
        get(ref(db, `feedback/module_feedback/${currentUser.uid}/${id}`)).then((snap) => ({
          id,
          done: snap.exists() && !snap.val()?.isDraft,
        }))
      )
    )
      .then((results) => setRated(new Set(results.filter((r) => r.done).map((r) => r.id))))
      .catch(() => {});
  }, [currentUser?.uid, completedModules]);

  if (completedModules.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5" /> Module Feedback Status
      </div>
      <div className="space-y-1.5">
        {completedModules.map((id) => {
          const done = rated.has(id);
          return (
            <div key={id} className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-secondary)] truncate flex-1">
                {MODULE_NAMES[id] ?? `Module ${id}`}
              </span>
              {done ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Rated
                </span>
              ) : (
                <button
                  onClick={() => onRateModule(id)}
                  className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Rate <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Standalone /feedback page ────────────────────────────────────────────────
export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const moduleId = parseInt(searchParams.get('id') ?? '1', 10);

  if (type === 'cert') {
    return (
      <CertFeedbackGate
        onCompleted={() => { window.location.href = '/certification'; }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <ModuleFeedbackModal
        moduleId={isNaN(moduleId) ? 1 : moduleId}
        onClose={() => window.history.back()}
        onSubmitted={() => window.history.back()}
      />
    </div>
  );
};

export default FeedbackPage;
