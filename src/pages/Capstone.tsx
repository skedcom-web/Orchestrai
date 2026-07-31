import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import {
  Award, ArrowLeft, Lock, CheckCircle2, Filter,
  Users, Database, Workflow as WorkflowIcon, Wrench, X,
  GraduationCap, ServerCog, Sprout, HeartPulse, Briefcase, Search,
  BookOpen, FolderOpen, Sparkles, Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFirebaseDb } from '../firebase';
import {
  CAPSTONES, DOMAINS, COMPLEXITIES, DOMAIN_COLORS, COMPLEXITY_COLORS,
  type Capstone as CapstoneItem, type CapstoneDomain, type CapstoneComplexity
} from '../data/capstones';

const DOMAIN_ICON: Record<CapstoneDomain, React.ComponentType<{ className?: string }>> = {
  'Education': GraduationCap,
  'HR': Users,
  'IT Operations': ServerCog,
  'Agriculture': Sprout,
  'Healthcare': HeartPulse,
  'Operations': Briefcase,
  'Spiritual & Community': Sparkles,
  'Open Innovation': Lightbulb
};

type SelectionStatus = 'in_progress' | 'submitted' | 'passed' | 'rework';

interface CapstoneSelection {
  capstoneId: string;
  selectedAt: number;
  status: SelectionStatus;
}

const LOCAL_KEY = (uid: string) => `orchestrai_capstone_selection_${uid}`;

export const Capstone: React.FC = () => {
  const { currentUser, submissions, systemConfig, addToast, alertUser } = useApp();
  const navigate = useNavigate();

  const [selection, setSelection] = useState<CapstoneSelection | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<CapstoneDomain | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<CapstoneComplexity | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeCap, setActiveCap] = useState<CapstoneItem | null>(null);
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);
  const [locking, setLocking] = useState(false);

  // Load existing selection (RTDB → localStorage fallback)
  useEffect(() => {
    if (!currentUser?.uid) {
      setSelection(null);
      return;
    }
    const uid = currentUser.uid;
    const localRaw = localStorage.getItem(LOCAL_KEY(uid));
    if (localRaw) {
      try { setSelection(JSON.parse(localRaw)); } catch { /* ignore */ }
    }
    const db = getFirebaseDb();
    if (db) {
      get(ref(db, `capstoneSelections/${uid}`))
        .then((snap) => {
          if (snap.exists()) {
            const remote = snap.val() as CapstoneSelection;
            setSelection(remote);
            localStorage.setItem(LOCAL_KEY(uid), JSON.stringify(remote));
          }
        })
        .catch(() => { /* RTDB unavailable — local copy is fine */ });
    }
  }, [currentUser?.uid]);

  const filtered = useMemo(() => {
    return CAPSTONES.filter((c) => {
      if (selectedDomain !== 'all' && c.domain !== selectedDomain) return false;
      if (selectedComplexity !== 'all' && c.complexity !== selectedComplexity) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.brief.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDomain, selectedComplexity, search]);

  const lockedCapstone = useMemo(() => {
    if (!selection) return null;
    return CAPSTONES.find((c) => c.id === selection.capstoneId) || null;
  }, [selection]);

  const isLockedCapstoneCertified = useMemo(() => {
    if (!selection || !currentUser) return false;
    return submissions.some(s => 
      (s.capstoneId === selection.capstoneId) &&
      (s.learnerUid === currentUser.uid || s.userId === currentUser.uid) &&
      (s.status?.toLowerCase() === 'certified' || s.status?.toLowerCase() === 'hire_eligible')
    );
  }, [selection, currentUser, submissions]);

  const performLock = async (cap: CapstoneItem) => {
    if (!currentUser?.uid) {
      addToast('Please sign in to lock a capstone.', 'warning');
      return;
    }
    setLocking(true);
    const payload: CapstoneSelection = {
      capstoneId: cap.id,
      selectedAt: Date.now(),
      status: 'in_progress'
    };
    localStorage.setItem(LOCAL_KEY(currentUser.uid), JSON.stringify(payload));
    setSelection(payload);

    const db = getFirebaseDb();
    if (db) {
      try {
        await set(ref(db, `capstoneSelections/${currentUser.uid}`), {
          ...payload,
          capstoneTitle: cap.title,
          capstoneDomain: cap.domain,
          userEmail: currentUser.email,
          userName: currentUser.name
        });
      } catch (err) {
        console.error('Capstone lock RTDB write failed:', err);
        addToast('Locked locally — cloud sync will retry on reconnect.', 'warning');
      }
    }
    setLocking(false);
    setConfirmLockOpen(false);
    setActiveCap(null);
    alertUser(
      'Capstone Locked',
      `${cap.id} · ${cap.title} is now your capstone. Open the workspace from your dashboard to begin Day 1 of the build.`,
      'success'
    );
  };

  // ─── Render: not signed in ────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Sign in to browse the Capstone Library</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Module 7 — Practical Demo — is the capstone stage of the OrchestrAI Lead Certification. Sign in with your candidate account to view all {CAPSTONES.length} capstones and lock one for your build.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const userSubmissions = submissions.filter(s => 
    s.userId === currentUser?.uid || 
    s.learnerUid === currentUser?.uid || 
    s.userEmail === currentUser?.email || 
    s.learnerEmail === currentUser?.email
  );
  const isCertified = userSubmissions.some(s => s.status?.toLowerCase() === 'certified' || s.status?.toLowerCase() === 'hire_eligible');
  const isPremium = currentUser?.isPremiumUpgraded === true;
  const isPremiumPending = currentUser?.premiumStatus === 'PENDING';

  if (isCertified && !isPremium) {
    const upgradePrice = systemConfig.premiumUpgradePrice ?? 499;
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-200">
        <div className="glass-card rounded-2xl p-10 text-center border border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-transparent">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 mb-6 animate-pulse">
            <Award className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-[var(--text-primary)]">
            {isPremiumPending ? "Premium Upgrade Pending Approval" : "Unlock Premium Case Studies & Lab Tools"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto mb-6 leading-relaxed">
            {isPremiumPending
              ? "Your premium upgrade payment has been recorded and is currently pending manual verification by our administrators. This usually takes less than an hour. You will receive a confirmation email shortly."
              : "Congratulations! You have successfully completed your OrchestrAI Lead Certification. To continue exploring advanced case studies, try out alternative business scenarios, package new project baselines, and receive continuous SME reviews, upgrade to the Premium Access tier."}
          </p>
          {!isPremiumPending ? (
            <>
              <div className="inline-flex items-center gap-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] mb-8">
                <span className="text-sm text-[var(--text-secondary)] font-medium">Premium Access Upgrade:</span>
                <span className="text-xl font-extrabold text-indigo-400">₹{upgradePrice} INR</span>
              </div>
              <div>
                <button
                  onClick={() => navigate('/payment?mode=premium')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Upgrade to Premium Access
                </button>
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs font-bold uppercase tracking-wider">
              Verification In Progress
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

      {/* Page Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-4">
          <Award className="h-4 w-4" />
          <span>Module 7 · Practical Demo</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Capstone Library</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Choose ONE capstone from {CAPSTONES.length} real-world business problems across 8 enterprise domains. Build it in 5 days using everything from Modules 1–6. Submit your GitHub + Firebase URL for certification review.
        </p>
      </div>

      {/* Locked Capstone Banner */}
      {lockedCapstone && (
        <div className="mb-6 glass-card rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Your locked capstone</div>
              <div className="text-base font-extrabold">{lockedCapstone.id} · {lockedCapstone.title}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                Locked {new Date(selection!.selectedAt).toLocaleDateString()} · Status: <span className="font-bold text-emerald-400">{isLockedCapstoneCertified ? 'certified' : selection!.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCap(lockedCapstone)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold transition-all"
            >
              View Brief
            </button>
            <button
              onClick={() => navigate('/capstone/workspace')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow shadow-emerald-500/25"
            >
              {isLockedCapstoneCertified ? 'Open Workspace (View Only) →' : 'Open Workspace →'}
            </button>
            {!isLockedCapstoneCertified && (
              <button
                onClick={() => navigate('/capstone/submit')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all"
              >
                Submit for Review →
              </button>
            )}
            {isLockedCapstoneCertified && isPremium && (
              <button
                onClick={() => {
                  const el = document.getElementById('library-filters');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all animate-pulse"
              >
                Select Another Capstone →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div id="library-filters" className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Filter Library</span>
          <span className="text-xs text-[var(--text-secondary)] ml-auto">{filtered.length} of {CAPSTONES.length} capstones</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brief, or capstone ID…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/40"
          />
        </div>

        {/* Domain pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedDomain === 'all'
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
            }`}
          >
            All Domains
          </button>
          {DOMAINS.map((d) => {
            const Icon = DOMAIN_ICON[d];
            const c = DOMAIN_COLORS[d];
            const isActive = selectedDomain === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDomain(isActive ? 'all' : d)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isActive
                    ? `${c.bg} ${c.border} border ${c.text}`
                    : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
                }`}
              >
                <Icon className="h-3 w-3" />
                {d}
              </button>
            );
          })}
        </div>

        {/* Complexity pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedComplexity('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedComplexity === 'all'
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
            }`}
          >
            All Complexities
          </button>
          {COMPLEXITIES.map((cx) => {
            const c = COMPLEXITY_COLORS[cx];
            const isActive = selectedComplexity === cx;
            return (
              <button
                key={cx}
                onClick={() => setSelectedComplexity(isActive ? 'all' : cx)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isActive ? `${c.bg} ${c.text}` : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-[var(--text-secondary)]">
          No capstones match those filters. Try widening your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cap) => {
            const dColors = DOMAIN_COLORS[cap.domain];
            const cColors = COMPLEXITY_COLORS[cap.complexity];
            const Icon = DOMAIN_ICON[cap.domain];
            const isLocked = selection?.capstoneId === cap.id;
            return (
              <button
                key={cap.id}
                onClick={() => setActiveCap(cap)}
                className={`glass-card rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isLocked
                    ? 'border-emerald-500/40 ring-2 ring-emerald-500/20'
                    : 'border-[var(--border-color)] hover:border-indigo-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-lg ${dColors.bg} ${dColors.border} border flex items-center justify-center ${dColors.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLocked && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Locked
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${cColors.bg} ${cColors.text}`}>
                      {cColors.label}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">{cap.id} · {cap.domain}</div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-3 leading-snug line-clamp-2">{cap.title}</h3>
            <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-3 border-t border-[var(--border-color)]">
                  <span className="inline-flex items-center gap-1"><WorkflowIcon className="h-3 w-3" /> {cap.workflow.length} states</span>
                  <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> {cap.masters.length} masters</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {cap.actors.length} roles</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeCap && (
        <DetailModal
          cap={activeCap}
          isLocked={selection?.capstoneId === activeCap.id}
          hasAnyLock={!!selection}
          isLockedCapstoneCertified={isLockedCapstoneCertified}
          onClose={() => setActiveCap(null)}
          onRequestLock={() => setConfirmLockOpen(true)}
        />
      )}

      {/* Confirm Lock Modal */}
      {confirmLockOpen && activeCap && (
        <ConfirmLockModal
          cap={activeCap}
          locking={locking}
          replacingExisting={!!selection && selection.capstoneId !== activeCap.id}
          existingId={selection?.capstoneId}
          isLockedCapstoneCertified={isLockedCapstoneCertified}
          onCancel={() => setConfirmLockOpen(false)}
          onConfirm={() => performLock(activeCap)}
        />
      )}
    </div>
  );
};

// ─── Detail Modal ───────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  cap: CapstoneItem;
  isLocked: boolean;
  hasAnyLock: boolean;
  isLockedCapstoneCertified: boolean;
  onClose: () => void;
  onRequestLock: () => void;
}> = ({ cap, isLocked, hasAnyLock, isLockedCapstoneCertified, onClose, onRequestLock }) => {
  const dColors = DOMAIN_COLORS[cap.domain];
  const cColors = COMPLEXITY_COLORS[cap.complexity];
  const Icon = DOMAIN_ICON[cap.domain];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${dColors.bg} ${dColors.text} ${dColors.border} border`}>
                <Icon className="h-3 w-3" />
                {cap.domain}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${cColors.bg} ${cColors.text}`}>
                {cColors.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{cap.id} · {cap.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Section icon={<BookOpen className="h-4 w-4" />} title="Business Scenario & Brief">
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{cap.brief}</p>
          </Section>

          <Section icon={<Users className="h-4 w-4" />} title="Core Roles & Actors">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {cap.actors.map((actor) => (
                <div key={actor} className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/20 text-xs font-bold text-center">
                  {actor}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<FolderOpen className="h-4 w-4" />} title="Database Entities (Masters & Transaction)">
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Master Data Lists</div>
                <div className="flex flex-wrap gap-2">
                  {cap.masters.map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] font-semibold border border-[var(--border-color)]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Core Transaction Entity</div>
                <span className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-400 font-extrabold">
                  {cap.transactionEntity}
                </span>
              </div>
            </div>
          </Section>

          <Section icon={<WorkflowIcon className="h-4 w-4" />} title="Workflow Lifecycle States">
            <div className="flex flex-wrap items-center gap-1.5">
              {cap.workflow.map((w, i) => (
                <React.Fragment key={w}>
                  <span className="px-2.5 py-1 rounded bg-slate-500/10 text-xs text-[var(--text-primary)] font-semibold border border-[var(--border-color)]">
                    {w}
                  </span>
                  {i < cap.workflow.length - 1 && (
                    <span className="text-[var(--text-secondary)] text-xs">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section icon={<Wrench className="h-4 w-4" />} title="Trainer Extension (your differentiator)">
            <div className="text-sm font-semibold text-amber-400">{cap.trainerExtension}</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              The extension is what lifts your score from <span className="font-bold">Pass (≥70)</span> to <span className="font-bold">Outstanding (≥85)</span>. Build it after the 9 mandatory modules are complete.
            </p>
          </Section>

          <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Universal Acceptance Criteria">
            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
              <li>• All 9 mandatory modules implemented: Auth, Dashboard, Master Data, Transactions, Workflow, Comments, Attachments, Reports, Administration</li>
              <li>• 3 mandatory roles enforced: Admin, Manager, User (RBAC visible in routes + actions)</li>
              <li>• 3 mandatory reports: Summary, Status, Activity (with Excel + PDF export)</li>
              <li>• Deployed to Firebase Hosting with a public URL</li>
              <li>• GitHub repository public with README, DESIGN.md, and per-component commits</li>
            </ul>
          </Section>
        </div>

        <div className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-sm border-t border-[var(--border-color)] p-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] transition-all"
          >
            Close
          </button>
          {isLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
              <CheckCircle2 className="h-4 w-4" /> This is your locked capstone
            </div>
          ) : (
            <button
              onClick={onRequestLock}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-lg text-xs font-extrabold shadow-md transition-all"
            >
              <Lock className="h-3.5 w-3.5" />
              {hasAnyLock && !isLockedCapstoneCertified ? 'Replace My Locked Capstone' : 'Lock This Capstone'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4">
    <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
    </div>
    {children}
  </div>
);

// ─── Confirm Lock Modal ─────────────────────────────────────────────────────
const ConfirmLockModal: React.FC<{
  cap: CapstoneItem;
  locking: boolean;
  replacingExisting: boolean;
  existingId?: string;
  isLockedCapstoneCertified?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ cap, locking, replacingExisting, existingId, isLockedCapstoneCertified, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-extrabold">Confirm capstone lock</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
        You're about to lock <span className="font-bold text-[var(--text-primary)]">{cap.id} · {cap.title}</span> as your certification capstone.
      </p>
      {replacingExisting && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
          <strong>Heads up:</strong> {isLockedCapstoneCertified
            ? "Your old capstone has been certified! Locking this new capstone will set up a new active workspace for it, but your certified progress remains safe."
            : `this will replace your previous lock (${existingId}). Any progress on the old capstone won't be deleted, but your active workspace switches to this one.`}
        </div>
      )}
      <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 mb-5">
        <li>• Your selection is saved to your candidate profile.</li>
        <li>• You can still swap capstones later (re-lock from any card).</li>
        <li>• When you're ready, submit via Module 7 → Submission.</li>
      </ul>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={locking}
          className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={locking}
          className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-lg text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
        >
          {locking ? 'Locking…' : 'Confirm Lock'}
        </button>
      </div>
    </div>
  </div>
);
