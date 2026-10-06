import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ref, get, set, update } from 'firebase/database';
import emailjs from '@emailjs/browser';
import {
  Award, ClipboardList, Users as UsersIcon, Plus, Save,
  CheckCircle2, ExternalLink, FileText, Workflow as WorkflowIcon,
  Sparkles, Send, Search, ArrowLeft, Bot, UserPlus,
  TrendingUp, FileSpreadsheet, MessageSquare, Shield, Database,
  ToggleLeft, ToggleRight, KeyRound, Copy, Check, Mail, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFirebaseDb, getFirebaseApp } from '../firebase';
import { CAPSTONES, DOMAINS, type CapstoneDomain } from '../data/capstones';

// ─── Types ──────────────────────────────────────────────────────────────────
type ReviewerRole = 'admin' | 'sme';
type ReviewMode = 'manual' | 'auto' | null;
type SubmissionStatus =
  | 'submitted'
  | 'mode_chosen'
  | 'assigned_to_sme'
  | 'ai_reviewing'
  | 'review_complete'
  | 'awaiting_admin_approval'
  | 'feedback_sent'
  | 'certified'
  | 'rework_requested';

interface Reviewer {
  uid: string;
  name: string;
  email: string;
  role: ReviewerRole;
  domainsCovered: CapstoneDomain[];
  activeAssignments: number;
  completedReviews: number;
  addedAt: number;
  addedBy?: string;
  sourceUserUid?: string;
  disabled?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  lastPasswordResetAt?: number;
  lastEmailSentAt?: number;
  invitePending?: boolean;
}

// ─── Password utilities ────────────────────────────────────────────────────
const PWD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
const generatePassword = (length = 14): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => PWD_CHARS[b % PWD_CHARS.length]).join('');
};
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder().encode(`${salt}::${password}`);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};
const generateSalt = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const SME_LOGIN_URL = typeof window !== 'undefined' ? `${window.location.origin}/sme-login` : 'https://orchestrai.academy/sme-login';

interface SubmissionFlat {
  submissionId: string;        // {uid}_{capstoneId}
  learnerUid: string;
  learnerName: string;
  learnerEmail: string;
  capstoneId: string;
  capstoneTitle: string;
  capstoneDomain: CapstoneDomain;
  githubUrl: string;
  firebaseUrl: string;
  appAdminUserId?: string;
  appAdminPassword?: string;
  readmeUrl: string;
  workflowDiagramUrl?: string;
  supportingDocs?: Array<{ name: string; storageUrl: string; size: number }>;
  submittedAt: number;
  status: SubmissionStatus;
  assignedReviewerUid?: string;
  assignedReviewerName?: string;
  reviewMode?: ReviewMode;
  certifiedAt?: number;
}

/** Why GitHub evidence could (not) be gathered. Written by the review service. */
interface GithubCheck {
  status: string;
  httpStatus?: number | null;
  evidenceAvailable?: boolean;
  message?: string;
  rateLimitRemaining?: number | null;
  rateLimitResetAt?: number | null;
  tokenConfigured?: boolean;
  tokenRejected?: boolean;
}

interface AutoChecks {
  githubReachable?: boolean;
  githubPublic?: boolean;
  hasReadme?: boolean;
  hasDesignDoc?: boolean;
  hasPackageJson?: boolean;
  fileCount?: number;
  firebaseReachable?: boolean;
  checkedAt?: number;
  githubCheck?: GithubCheck;
  firebaseUrlKind?: 'hosting' | 'console' | 'other' | 'invalid';
  liveUrlNote?: string;
}

interface EvidenceSummary {
  listing?: string;
  filesListed?: number;
  sourceFilesSampled?: number;
  confidence?: 'high' | 'medium' | 'low';
  gaps?: string[];
}

interface TierBSuggestion {
  perCategory: Record<string, number>;
  rationale: Record<string, string>;
  overallObservations?: string;
  total: number;
  model: string;
  generatedAt: number;
  tokensUsed?: any;
  autoChecks?: AutoChecks;
  evidence?: EvidenceSummary;
}

interface ReviewRecord {
  submissionId: string;
  scores: Record<string, number>;
  total: number;
  decision: 'outstanding' | 'pass' | 'rework' | 'rebuild';
  feedback: { strengths: string; gaps: string; reworkChecklist: string };
  reviewerUid: string;
  reviewerName: string;
  savedAt: number;
  isDraft: boolean;
  autoChecks?: AutoChecks;
  tierBSuggestion?: TierBSuggestion;
  notifiedAt?: number;
  certifiedAt?: number;
}

// ─── Rubric (v7 manual) ─────────────────────────────────────────────────────
const RUBRIC: Array<{ key: string; label: string; max: number; group: string }> = [
  { key: 'authentication', label: 'Authentication', max: 10, group: 'Foundation' },
  { key: 'dashboard',      label: 'Dashboard',      max: 10, group: 'Foundation' },
  { key: 'masterData',     label: 'Master Data',    max: 10, group: 'Foundation' },
  { key: 'transactions',   label: 'Transactions',   max: 15, group: 'Core' },
  { key: 'workflow',       label: 'Workflow',       max: 20, group: 'Core' },
  { key: 'rbac',           label: 'RBAC',           max: 15, group: 'Core' },
  { key: 'reports',        label: 'Reports',        max: 10, group: 'Polish' },
  { key: 'deployment',     label: 'Deployment',     max: 5,  group: 'Polish' },
  { key: 'documentation',  label: 'Documentation',  max: 5,  group: 'Polish' }
];

const decideOutcome = (total: number): ReviewRecord['decision'] => {
  if (total >= 85) return 'outstanding';
  if (total >= 70) return 'pass';
  if (total >= 50) return 'rework';
  return 'rebuild';
};

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  submitted:               'bg-amber-500/15 border-amber-500/30 text-amber-400',
  mode_chosen:             'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  assigned_to_sme:         'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  ai_reviewing:            'bg-purple-500/15 border-purple-500/30 text-purple-400',
  review_complete:         'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
  awaiting_admin_approval: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
  feedback_sent:           'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  certified:               'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  rework_requested:        'bg-rose-500/15 border-rose-500/30 text-rose-400'
};

const DECISION_COLORS: Record<ReviewRecord['decision'], string> = {
  outstanding: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  pass:        'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
  rework:      'text-amber-400 bg-amber-500/15 border-amber-500/30',
  rebuild:     'text-rose-400 bg-rose-500/15 border-rose-500/30'
};

// ─── Main Component ────────────────────────────────────────────────────────
export const CapstoneReviewsAdmin: React.FC = () => {
  const { currentUser, usersList, addToast } = useApp();
  const isSme = currentUser?.role === 'SME' || (currentUser as any)?.reviewerRole === 'sme';
  const [subTab, setSubTab] = useState<'queue' | 'pool'>('queue');
  const [submissions, setSubmissions] = useState<SubmissionFlat[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionFlat | null>(null);

  // Initial load
  const loadAll = async (silent: boolean | any = false) => {
    if (silent !== true) setLoading(true);
    const db = getFirebaseDb();
    if (!db) {
      addToast('Cloud database not available.', 'warning');
      setLoading(false);
      return;
    }
    try {
      const [subsSnap, revsSnap, reviewsSnap] = await Promise.all([
        get(ref(db, 'submissions')),
        get(ref(db, 'reviewers')),
        get(ref(db, 'reviews'))
      ]);

      const subsRaw = subsSnap.exists() ? subsSnap.val() : {};
      const flat: SubmissionFlat[] = [];
      Object.entries(subsRaw).forEach(([, capMap]: [string, any]) => {
        Object.entries(capMap || {}).forEach(([, sub]: [string, any]) => {
          if (!sub || !sub.submissionId) return;
          flat.push(sub as SubmissionFlat);
        });
      });
      flat.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      // SMEs only see submissions assigned to them
      const visibleFlat = isSme && currentUser?.uid
        ? flat.filter((s) => s.assignedReviewerUid === currentUser.uid)
        : flat;
      setSubmissions(visibleFlat);

      const revsRaw = revsSnap.exists() ? revsSnap.val() : {};
      const reviewerList: Reviewer[] = Object.entries(revsRaw).map(([uid, v]: [string, any]) => ({
        uid,
        name: v.name || '(unnamed)',
        email: v.email || '',
        role: v.role || (uid.includes('vthink') ? 'admin' : 'sme'),
        domainsCovered: v.domainsCovered || [],
        activeAssignments: v.activeAssignments || 0,
        completedReviews: v.completedReviews || 0,
        addedAt: v.addedAt || v.seededAt || 0,
        addedBy: v.addedBy,
        sourceUserUid: v.sourceUserUid,
        // Fields added in P4b — without these passthroughs the UI never sees the latest state
        disabled: !!v.disabled,
        passwordHash: v.passwordHash,
        passwordSalt: v.passwordSalt,
        lastPasswordResetAt: v.lastPasswordResetAt,
        lastEmailSentAt: v.lastEmailSentAt,
        invitePending: v.invitePending
      }));
      reviewerList.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
      setReviewers(reviewerList);

      const reviewsRaw = reviewsSnap.exists() ? reviewsSnap.val() : {};
      const reviewsMap: Record<string, ReviewRecord> = {};
      Object.entries(reviewsRaw).forEach(([, v]: [string, any]) => {
        if (v && v.submissionId) reviewsMap[v.submissionId] = v as ReviewRecord;
      });
      setReviews(reviewsMap);
    } catch (err: any) {
      console.error('[CapstoneReviewsAdmin] Load failed:', err);
      addToast('Failed to load review data: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  if (selectedSubmission) {
    return (
      <ReviewDetail
        submission={selectedSubmission}
        existingReview={reviews[selectedSubmission.submissionId]}
        reviewers={reviewers}
        currentUser={currentUser}
        isSme={isSme}
        onBack={() => setSelectedSubmission(null)}
        onSaved={async () => { await loadAll(); }}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[11px] font-bold mb-2">
            <Award className="h-3.5 w-3.5" /> Module 7 · Capstone Reviews
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Submission Review Workflow</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Score capstone submissions against the 9-category rubric. Choose Manual mode (assign to SME) or Auto mode (Tier B AI scoring) per submission. Admin retains final authority for feedback notification and certificate deployment.
          </p>
        </div>
        <button
          onClick={loadAll}
          className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
        <button
          onClick={() => setSubTab('queue')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'queue' ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400' : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Submission Queue
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[10px]">{submissions.length}</span>
        </button>
        <button
          onClick={() => setSubTab('pool')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'pool' ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400' : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <UsersIcon className="h-3.5 w-3.5" /> Reviewer Pool
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[10px]">{reviewers.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-[var(--text-secondary)]">Loading…</div>
      ) : subTab === 'queue' ? (
        <SubmissionQueue
          submissions={submissions}
          reviews={reviews}
          reviewers={reviewers}
          onOpen={setSelectedSubmission}
        />
      ) : isSme ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-[var(--text-secondary)]">
          Reviewer pool management is admin-only. Switch back to the Submission Queue to review your assigned capstones.
        </div>
      ) : (
        <ReviewerPool
          reviewers={reviewers}
          usersList={usersList}
          currentUser={currentUser}
          onChanged={loadAll}
        />
      )}
    </div>
  );
};

// ─── Submission Queue ───────────────────────────────────────────────────────
const SubmissionQueue: React.FC<{
  submissions: SubmissionFlat[];
  reviews: Record<string, ReviewRecord>;
  reviewers: Reviewer[];
  onOpen: (s: SubmissionFlat) => void;
}> = ({ submissions, reviews, onOpen }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<CapstoneDomain | 'all'>('all');

  const filtered = useMemo(() => submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (domainFilter !== 'all' && s.capstoneDomain !== domainFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${s.learnerName} ${s.learnerEmail} ${s.capstoneId} ${s.capstoneTitle}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [submissions, search, statusFilter, domainFilter]);

  if (submissions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <ClipboardList className="h-10 w-10 text-[var(--text-secondary)] mx-auto mb-3" />
        <h3 className="text-base font-bold mb-1">No submissions yet</h3>
        <p className="text-xs text-[var(--text-secondary)]">When learners submit capstones via /capstone/submit, they appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="glass-card rounded-xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learner, capstone…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="relative z-10 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none cursor-pointer hover:border-indigo-500/40 transition-all"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_COLORS) as SubmissionStatus[]).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value as any)}
          className="relative z-10 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none cursor-pointer hover:border-indigo-500/40 transition-all"
        >
          <option value="all">All Domains</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="text-[11px] text-[var(--text-secondary)] ml-auto">
          {filtered.length} of {submissions.length}
        </div>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-[var(--text-secondary)]">No submissions match the current filters.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const review = reviews[s.submissionId];
            return (
              <button
                key={s.submissionId}
                onClick={() => onOpen(s)}
                className="w-full text-left glass-card rounded-xl p-4 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${STATUS_COLORS[s.status]}`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{s.capstoneId} · {s.capstoneDomain}</span>
                      {s.reviewMode && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-purple-500/30 bg-purple-500/10 text-purple-400">
                          {s.reviewMode}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-[var(--text-primary)]">{s.capstoneTitle}</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {s.learnerName} · {s.learnerEmail} · submitted {new Date(s.submittedAt).toLocaleString()}
                    </div>
                    {s.assignedReviewerName && (
                      <div className="text-[11px] text-cyan-400 mt-0.5">Reviewer: {s.assignedReviewerName}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {review && (
                      <>
                        <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{review.total}</div>
                        <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">/ 100</div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${DECISION_COLORS[review.decision]}`}>
                          {review.decision}{review.isDraft ? ' · DRAFT' : ''}
                        </span>
                      </>
                    )}
                    {!review && (
                      <span className="text-[10px] text-[var(--text-secondary)] italic">Not yet scored</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Reviewer Pool ──────────────────────────────────────────────────────────
const ReviewerPool: React.FC<{
  reviewers: Reviewer[];
  usersList: any[];
  currentUser: any;
  onChanged: (silent?: boolean) => void;
}> = ({ reviewers, usersList, currentUser, onChanged }) => {
  const { systemConfig, addToast, addNotificationLog } = useApp();
  const [adding, setAdding] = useState<'new' | 'promote' | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    password: string;
    purpose: 'new' | 'reenabled' | 'reset';
    emailStatus: 'sending' | 'sent' | 'failed' | 'skipped';
    emailError?: string;
  } | null>(null);

  // New SME form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<ReviewerRole>('sme');
  const [newDomains, setNewDomains] = useState<CapstoneDomain[]>([]);

  // Promote form state
  const [promoteUid, setPromoteUid] = useState('');
  const [promoteDomains, setPromoteDomains] = useState<CapstoneDomain[]>([]);
  const [promoteRole, setPromoteRole] = useState<ReviewerRole>('sme');

  const resetForms = () => {
    setNewName(''); setNewEmail(''); setNewRole('sme'); setNewDomains([]);
    setPromoteUid(''); setPromoteDomains([]); setPromoteRole('sme');
    setAdding(null);
  };

  const sendCredentialsEmail = async (
    name: string,
    email: string,
    password: string,
    purpose: 'new' | 'reenabled' | 'reset'
  ): Promise<{ status: 'sent' | 'failed' | 'skipped'; error?: string }> => {
    const serviceId = systemConfig.emailjsServiceId;
    const templateId = systemConfig.emailjsTemplateIdSmeWelcome || systemConfig.emailjsTemplateId;
    const publicKey = systemConfig.emailjsPublicKey;
    const typeLabel = purpose === 'new' ? 'Reviewer Welcome' : purpose === 'reenabled' ? 'Reviewer Re-enable' : 'Reviewer Password Reset';

    const templateKey =
      purpose === 'new' ? 'sme_welcome' :
      purpose === 'reenabled' ? 'reviewer_reenabled' :
                                'reviewer_password_reset';

    // Use the Admin-managed template (seeded from DEFAULT_CONFIG, editable via Admin → Settings → Email Templates)
    const temp = systemConfig.templates?.[templateKey] || { subject: '', body: '' };

    const replacePlaceholders = (txt: string) => {
      if (!txt) return '';
      return txt
        .replace(/{{name}}/g, name)
        .replace(/{{email}}/g, email)
        .replace(/{{password}}/g, password)
        .replace(/{{loginUrl}}/g, SME_LOGIN_URL)
        .replace(/{{adminEmail}}/g, systemConfig.adminEmail || 'vthinkorchestrai@gmail.com');
    };

    const emailSubject = replacePlaceholders(temp.subject);
    const emailBody = replacePlaceholders(temp.body);

    if (!serviceId || !templateId || !publicKey) {
      const errMsg = `EmailJS not configured (missing ${
        [!serviceId && 'serviceId', !templateId && 'templateId (SmeWelcome or default)', !publicKey && 'publicKey'].filter(Boolean).join(', ')
      }). Open System Settings → Email Config to set them.`;
      addNotificationLog({
        type: typeLabel,
        recipient: email,
        subject: emailSubject,
        channel: 'EmailJS API (skipped)',
        status: 'Failed'
      });
      addToast(`Email skipped: EmailJS not configured. Please copy credentials manually.`, 'warning');
      return { status: 'skipped', error: errMsg };
    }

    try {
      await emailjs.send(serviceId, templateId, {
        to_email: email,
        subject: emailSubject,
        message: emailBody
      }, { publicKey });

      addNotificationLog({
        type: typeLabel,
        recipient: email,
        subject: emailSubject,
        channel: 'EmailJS API',
        status: 'Sent'
      });
      addToast(`Credentials email successfully sent to ${email}`, 'success');
      return { status: 'sent' };
    } catch (err: any) {
      console.error('[ReviewerPool] EmailJS send failed:', err);
      const errStr = err?.text || err?.message || String(err);
      addNotificationLog({
        type: typeLabel,
        recipient: email,
        subject: emailSubject,
        channel: `EmailJS API (error: ${errStr.slice(0, 80)})`,
        status: 'Failed'
      });
      addToast(`Credentials email failed to send: ${errStr}. Please copy credentials manually.`, 'error');
      return { status: 'failed', error: errStr };
    }
  };

  const writeReviewerWithPassword = async (uid: string, baseRecord: Omit<Reviewer, 'uid'>, plainPassword: string) => {
    const db = getFirebaseDb();
    if (!db) throw new Error('Cloud database not available.');
    const salt = generateSalt();
    const hash = await hashPassword(plainPassword, salt);
    await set(ref(db, `reviewers/${uid}`), {
      ...baseRecord,
      passwordHash: hash,
      passwordSalt: salt,
      lastPasswordResetAt: Date.now(),
      lastEmailSentAt: Date.now(),
      mustChangePassword: true
    });
  };

  const addNewReviewer = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      addToast('Name and email are required.', 'warning'); return;
    }
    if (reviewers.some((r) => r.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      addToast('A reviewer with that email already exists.', 'warning'); return;
    }

    const password = generatePassword(14);
    const uid = `reviewer-${newEmail.trim().replace(/[^\w]/g, '_').slice(0, 30)}-${Date.now().toString(36)}`;
    const payload: Omit<Reviewer, 'uid'> = {
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      domainsCovered: newDomains.length > 0 ? newDomains : DOMAINS,
      activeAssignments: 0,
      completedReviews: 0,
      addedAt: Date.now(),
      addedBy: currentUser?.email || 'admin',
      disabled: false,
      invitePending: false
    };

    setCredentialsModal({ name: newName.trim(), email: newEmail.trim().toLowerCase(), password, purpose: 'new', emailStatus: 'sending' });
    try {
      await writeReviewerWithPassword(uid, payload, password);
    } catch (err: any) {
      setCredentialsModal((m) => m ? { ...m, emailStatus: 'failed', emailError: err?.message } : m);
      addToast(`Failed to save reviewer: ${err?.message || err}`, 'error');
      return;
    }
    const res = await sendCredentialsEmail(newName.trim(), newEmail.trim().toLowerCase(), password, 'new');
    setCredentialsModal((m) => m ? { ...m, emailStatus: res.status, emailError: res.error } : m);
    resetForms();
    onChanged(true);
  };

  const promoteExistingUser = async () => {
    const user = usersList.find((u) => u.uid === promoteUid);
    if (!user) { addToast('Pick a user to promote.', 'warning'); return; }
    if (reviewers.some((r) => r.email.toLowerCase() === user.email.toLowerCase())) {
      addToast(`${user.name} is already in the reviewer pool.`, 'warning'); return;
    }

    const password = generatePassword(14);
    const uid = `reviewer-promoted-${user.uid}`;
    const payload: Omit<Reviewer, 'uid'> = {
      name: user.name,
      email: user.email,
      role: promoteRole,
      domainsCovered: promoteDomains.length > 0 ? promoteDomains : DOMAINS,
      activeAssignments: 0,
      completedReviews: 0,
      addedAt: Date.now(),
      addedBy: currentUser?.email || 'admin',
      sourceUserUid: user.uid,
      disabled: false
    };

    setCredentialsModal({ name: user.name, email: user.email, password, purpose: 'new', emailStatus: 'sending' });
    try {
      await writeReviewerWithPassword(uid, payload, password);
    } catch (err: any) {
      setCredentialsModal((m) => m ? { ...m, emailStatus: 'failed', emailError: err?.message } : m);
      addToast(`Failed to promote: ${err?.message || err}`, 'error');
      return;
    }
    const res = await sendCredentialsEmail(user.name, user.email, password, 'new');
    setCredentialsModal((m) => m ? { ...m, emailStatus: res.status, emailError: res.error } : m);
    resetForms();
    onChanged(true);
  };

  const toggleDisabled = async (r: Reviewer) => {
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }
    if (r.activeAssignments > 0 && !r.disabled) {
      addToast(`Cannot disable — ${r.name} has ${r.activeAssignments} active assignment(s). Reassign first.`, 'warning');
      return;
    }
    const willEnable = !!r.disabled;
    if (!willEnable) {
      // Disabling — just flip flag, no email, no password change
      try {
        await update(ref(db, `reviewers/${r.uid}`), { disabled: true, disabledAt: Date.now() });
        addToast(`${r.name} disabled. Their review history is preserved.`, 'success');
        onChanged(true);
      } catch (err: any) {
        addToast(`Failed to disable: ${err?.message || err}`, 'error');
      }
      return;
    }
    // Re-enabling — generate fresh password + email
    const password = generatePassword(14);
    setCredentialsModal({ name: r.name, email: r.email, password, purpose: 'reenabled', emailStatus: 'sending' });
    try {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      await update(ref(db, `reviewers/${r.uid}`), {
        disabled: false,
        passwordHash: hash,
        passwordSalt: salt,
        lastPasswordResetAt: Date.now(),
        lastEmailSentAt: Date.now(),
        reEnabledAt: Date.now(),
        mustChangePassword: true
      });
    } catch (err: any) {
      setCredentialsModal((m) => m ? { ...m, emailStatus: 'failed', emailError: err?.message } : m);
      addToast(`Failed to re-enable: ${err?.message || err}`, 'error');
      return;
    }
    const res = await sendCredentialsEmail(r.name, r.email, password, 'reenabled');
    setCredentialsModal((m) => m ? { ...m, emailStatus: res.status, emailError: res.error } : m);
    onChanged(true);
  };

  const resetReviewerPassword = async (r: Reviewer) => {
    if (!window.confirm(`Reset password for ${r.name}? Their existing password will be invalidated and a new one emailed to ${r.email}.`)) return;
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }

    const password = generatePassword(14);
    setCredentialsModal({ name: r.name, email: r.email, password, purpose: 'reset', emailStatus: 'sending' });
    try {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      await update(ref(db, `reviewers/${r.uid}`), {
        passwordHash: hash,
        passwordSalt: salt,
        lastPasswordResetAt: Date.now(),
        lastEmailSentAt: Date.now(),
        mustChangePassword: true
      });
    } catch (err: any) {
      setCredentialsModal((m) => m ? { ...m, emailStatus: 'failed', emailError: err?.message } : m);
      addToast(`Failed to reset: ${err?.message || err}`, 'error');
      return;
    }
    const res = await sendCredentialsEmail(r.name, r.email, password, 'reset');
    setCredentialsModal((m) => m ? { ...m, emailStatus: res.status, emailError: res.error } : m);
    onChanged(true);
  };

  const promotableUsers = usersList.filter(u =>
    u.email !== 'vthinkorchestrai@gmail.com' &&
    !reviewers.some(r => r.email.toLowerCase() === u.email.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Add Reviewer CTAs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAdding(adding === 'new' ? null : 'new')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            adding === 'new' ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:brightness-110'
          }`}
        >
          <Plus className="h-3.5 w-3.5" /> Add New SME (by email)
        </button>
        <button
          onClick={() => setAdding(adding === 'promote' ? null : 'promote')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            adding === 'promote' ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400' : 'border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400'
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Promote Existing User
        </button>
      </div>

      {/* New SME form */}
      {adding === 'new' && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/25 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><UserPlus className="h-4 w-4 text-purple-400" /> Add New SME / Reviewer</h3>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Add an external Subject Matter Expert by email. In <strong>P4b</strong> this will send them a credentials email with a magic-link to access their review queue. Right now it just creates the reviewer record (marked <code className="font-mono">invitePending: true</code>) so you can plan assignments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Name *">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Priya R." className="form-input" />
            </Field>
            <Field label="Email *">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="priya@example.com" className="form-input" />
            </Field>
            <Field label="Role">
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as ReviewerRole)} className="form-input">
                <option value="sme">SME (review-only)</option>
                <option value="admin">Admin (review + final approval)</option>
              </select>
            </Field>
            <Field label={`Domains Covered (${newDomains.length}/${DOMAINS.length} — empty = all)`}>
              <DomainMultiSelect value={newDomains} onChange={setNewDomains} />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={addNewReviewer} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold">Add Reviewer</button>
            <button onClick={resetForms} className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">Cancel</button>
          </div>
        </div>
      )}

      {/* Promote existing user form */}
      {adding === 'promote' && (
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/25 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-indigo-400" /> Promote Existing User to Reviewer</h3>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Pick a registered learner and promote them to a reviewer role. They already have login credentials — they'll see the Capstone Reviews tab the next time they visit /admin.
          </p>
          {promotableUsers.length === 0 ? (
            <div className="text-xs text-[var(--text-secondary)] italic p-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/40">
              No promotable users — all registered users are already reviewers or the admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="User *">
                <select value={promoteUid} onChange={(e) => setPromoteUid(e.target.value)} className="form-input">
                  <option value="">Pick a user…</option>
                  {promotableUsers.map(u => (
                    <option key={u.uid} value={u.uid}>{u.name} · {u.email}</option>
                  ))}
                </select>
              </Field>
              <Field label="Role">
                <select value={promoteRole} onChange={(e) => setPromoteRole(e.target.value as ReviewerRole)} className="form-input">
                  <option value="sme">SME (review-only)</option>
                  <option value="admin">Admin (review + final approval)</option>
                </select>
              </Field>
              <Field label={`Domains Covered (empty = all)`}>
                <DomainMultiSelect value={promoteDomains} onChange={setPromoteDomains} />
              </Field>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={promoteExistingUser} disabled={promotableUsers.length === 0} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold disabled:opacity-50">Promote</button>
            <button onClick={resetForms} className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">Cancel</button>
          </div>
        </div>
      )}

      {/* Reviewer list */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><UsersIcon className="h-4 w-4 text-indigo-400" /> Current Reviewer Pool ({reviewers.length})</h3>
        {reviewers.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-secondary)]">No reviewers yet. Use the buttons above to add one.</div>
        ) : (
          <div className="space-y-2">
            {reviewers.map((r) => {
              const isProtectedAdmin = r.email === 'vthinkorchestrai@gmail.com';
              return (
              <div key={r.uid} className={`rounded-xl border p-3 flex items-start justify-between gap-3 flex-wrap transition-all ${
                r.disabled ? 'border-[var(--border-color)] bg-slate-500/5 opacity-70' : 'border-[var(--border-color)] bg-[var(--surface-sunken)]/40'
              }`}>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-extrabold ${r.disabled ? 'line-through text-[var(--text-secondary)]' : ''}`}>{r.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      r.role === 'admin' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                    }`}>{r.role}</span>
                    {r.sourceUserUid && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">promoted</span>
                    )}
                    {r.disabled && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/15 border border-rose-500/30 text-rose-400">disabled</span>
                    )}
                    {!r.passwordHash && !isProtectedAdmin && !r.disabled && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400">no password</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{r.email}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                    Domains: {r.domainsCovered.length === DOMAINS.length || r.domainsCovered.length === 0 ? 'All' : r.domainsCovered.join(', ')}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-secondary)] flex-wrap">
                    <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Active: <strong className="text-indigo-400">{r.activeAssignments}</strong></span>
                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed: <strong className="text-emerald-400">{r.completedReviews}</strong></span>
                    {r.lastPasswordResetAt && (
                      <span className="inline-flex items-center gap-1"><KeyRound className="h-3 w-3" /> Pwd reset: {new Date(r.lastPasswordResetAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {!isProtectedAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => resetReviewerPassword(r)}
                      disabled={r.disabled}
                      className="px-2.5 py-1 rounded-md border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 text-[10px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
                      title={r.disabled ? 'Re-enable first to reset password' : 'Generate new password + email reviewer'}
                    >
                      <KeyRound className="h-3 w-3" /> Reset PW
                    </button>
                    <button
                      onClick={() => toggleDisabled(r)}
                      className={`px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all inline-flex items-center gap-1 ${
                        r.disabled
                          ? 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/30 hover:bg-rose-500/10 text-rose-400'
                      }`}
                      title={r.disabled ? 'Re-enable + email new password' : 'Disable (keeps history, blocks new assignments)'}
                    >
                      {r.disabled ? <><ToggleRight className="h-3 w-3" /> Enable</> : <><ToggleLeft className="h-3 w-3" /> Disable</>}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Credentials modal */}
      {credentialsModal && (
        <CredentialsModal
          data={credentialsModal}
          onClose={() => setCredentialsModal(null)}
        />
      )}
    </div>
  );
};

// ─── Credentials Modal (shown after add/re-enable/reset) ───────────────────
const CredentialsModal: React.FC<{
  data: {
    name: string; email: string; password: string;
    purpose: 'new' | 'reenabled' | 'reset';
    emailStatus: 'sending' | 'sent' | 'failed' | 'skipped';
    emailError?: string;
  };
  onClose: () => void;
}> = ({ data, onClose }) => {
  const [copied, setCopied] = useState<'pw' | 'all' | null>(null);
  const copy = async (text: string, key: 'pw' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* ignore */ }
  };
  const purposeLabel = data.purpose === 'new' ? 'Reviewer created' : data.purpose === 'reenabled' ? 'Reviewer re-enabled' : 'Password reset';
  const allCredentials = `Login URL: ${SME_LOGIN_URL}\nEmail: ${data.email}\nPassword: ${data.password}`;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-md w-full p-5 border border-purple-500/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{purposeLabel}</div>
              <h3 className="text-base font-extrabold">{data.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>

        {/* Email status */}
        <div className={`rounded-lg p-2.5 mb-3 text-[11px] flex items-start gap-2 ${
          data.emailStatus === 'sent'    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' :
          data.emailStatus === 'sending' ? 'bg-indigo-500/10  border border-indigo-500/30  text-indigo-300' :
          data.emailStatus === 'skipped' ? 'bg-amber-500/10   border border-amber-500/30   text-amber-300' :
                                            'bg-rose-500/10    border border-rose-500/30    text-rose-300'
        }`}>
          <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            {data.emailStatus === 'sending'  && <>Sending credentials to <strong>{data.email}</strong>…</>}
            {data.emailStatus === 'sent'     && <>Credentials emailed to <strong>{data.email}</strong>.</>}
            {data.emailStatus === 'skipped'  && <>EmailJS not configured — credentials NOT emailed. Copy them below and send manually.</>}
            {data.emailStatus === 'failed'   && <>Email send failed: <code className="text-[10px]">{data.emailError}</code>. Copy credentials below and send manually.</>}
          </div>
        </div>

        {/* Credentials display */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] p-3 space-y-2 mb-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">Login URL</div>
            <div className="text-[11px] font-mono text-[var(--text-primary)] break-all">{SME_LOGIN_URL}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">Email</div>
            <div className="text-[11px] font-mono text-[var(--text-primary)] break-all">{data.email}</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Password</div>
              <button onClick={() => copy(data.password, 'pw')} className="text-[10px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                {copied === 'pw' ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </div>
            <div className="text-sm font-mono font-extrabold text-purple-400 bg-[var(--bg-card)] rounded px-2 py-1 break-all select-all">{data.password}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button onClick={() => copy(allCredentials, 'all')} className="px-3 py-1.5 rounded-md border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] inline-flex items-center gap-1.5">
            {copied === 'all' ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
          </button>
          <button onClick={onClose} className="px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-extrabold">Done</button>
        </div>

        <p className="text-[10px] text-[var(--text-secondary)] mt-3 leading-relaxed">
          For security, this password is shown <strong>only once</strong>. The hash is stored — the plaintext is not. If the reviewer loses it, use the <em>Reset PW</em> button to generate a new one.
        </p>
      </div>
    </div>
  );
};

// ─── Review Detail (admin scoring view) ─────────────────────────────────────
const ReviewDetail: React.FC<{
  submission: SubmissionFlat;
  existingReview?: ReviewRecord;
  reviewers: Reviewer[];
  currentUser: any;
  isSme: boolean;
  onBack: () => void;
  onSaved: () => void;
}> = ({ submission, existingReview, reviewers, currentUser, isSme, onBack, onSaved }) => {
  const { systemConfig, addToast, addNotificationLog } = useApp();
  const isCertified = submission.status?.toLowerCase() === 'certified' || submission.status?.toLowerCase() === 'hire_eligible';
  const disableEditing = isSme && isCertified;

  const [scores, setScores] = useState<Record<string, number>>(
    existingReview?.scores || Object.fromEntries(RUBRIC.map(r => [r.key, 0]))
  );
  const [strengths, setStrengths] = useState(existingReview?.feedback?.strengths || '');
  const [gaps, setGaps] = useState(existingReview?.feedback?.gaps || '');
  const [reworkChecklist, setReworkChecklist] = useState(existingReview?.feedback?.reworkChecklist || '');
  const [reviewMode, setReviewMode] = useState<ReviewMode>(submission.reviewMode || null);
  const [assignedUid, setAssignedUid] = useState<string>(submission.assignedReviewerUid || '');
  const [saving, setSaving] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [runningAi, setRunningAi] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<TierBSuggestion | null>(existingReview?.tierBSuggestion || null);
  const [autoChecks, setAutoChecks] = useState<AutoChecks | null>(existingReview?.autoChecks || null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState<number>(1);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const rubricRef = useRef<HTMLDivElement>(null);

  const cap = useMemo(() => CAPSTONES.find(c => c.id === submission.capstoneId), [submission.capstoneId]);

  const total = useMemo(() => RUBRIC.reduce((s, r) => s + Math.max(0, Math.min(r.max, scores[r.key] || 0)), 0), [scores]);
  const decision = decideOutcome(total);

  const setScore = (key: string, val: number) => {
    const rubric = RUBRIC.find(r => r.key === key);
    if (!rubric) return;
    const clamped = Math.max(0, Math.min(rubric.max, Math.round(val) || 0));
    setScores(prev => ({ ...prev, [key]: clamped }));
  };

  const sendReassignmentEmail = async (reviewerName: string, reviewerEmail: string) => {
    const serviceId = systemConfig.emailjsServiceId;
    const templateId = systemConfig.emailjsTemplateIdSmeReassigned || systemConfig.emailjsTemplateId;
    const publicKey = systemConfig.emailjsPublicKey;
    
    if (!serviceId || !templateId || !publicKey) {
      console.warn('[SubmissionReviewDetail] EmailJS not configured — skipping reassignment notification.');
      addToast('Reassigned. EmailJS not configured to alert SME.', 'warning');
      return;
    }

    // Use Admin-managed template (Admin → Settings → Email Templates → sme_reassigned)
    const smeReassignedTpl = systemConfig.templates?.sme_reassigned || { subject: '', body: '' };
    const templateSubject = smeReassignedTpl.subject;
    const templateBody = smeReassignedTpl.body;


    const subject = templateSubject
      .replace(/{{capstoneId}}/g, submission.capstoneId)
      .replace(/{{capstoneTitle}}/g, submission.capstoneTitle)
      .replace(/{{name}}/g, reviewerName);

    const body = templateBody
      .replace(/{{name}}/g, reviewerName)
      .replace(/{{learnerName}}/g, submission.learnerName)
      .replace(/{{learnerEmail}}/g, submission.learnerEmail)
      .replace(/{{capstoneId}}/g, submission.capstoneId)
      .replace(/{{capstoneTitle}}/g, submission.capstoneTitle)
      .replace(/{{capstoneDomain}}/g, submission.capstoneDomain)
      .replace(/{{submittedAt}}/g, new Date(submission.submittedAt).toLocaleString())
      .replace(/{{githubUrl}}/g, submission.githubUrl)
      .replace(/{{firebaseUrl}}/g, submission.firebaseUrl)
      .replace(/{{appAdminUserId}}/g, submission.appAdminUserId || '')
      .replace(/{{appAdminPassword}}/g, submission.appAdminPassword || '')
      .replace(/{{readmeUrl}}/g, submission.readmeUrl);

    let emailStatus = 'sent';
    let emailErr = '';

    try {
      await emailjs.send(serviceId, templateId, {
        name: reviewerName,
        email: reviewerEmail,
        to_email: reviewerEmail,
        reviewerEmail: reviewerEmail,
        recipient: reviewerEmail,
        to: reviewerEmail,
        subject,
        message: body,
        body,
        learnerName: submission.learnerName,
        learnerEmail: submission.learnerEmail,
        capstoneId: submission.capstoneId,
        capstoneTitle: submission.capstoneTitle,
        githubUrl: submission.githubUrl,
        firebaseUrl: submission.firebaseUrl,
        appAdminUserId: submission.appAdminUserId || '',
        appAdminPassword: submission.appAdminPassword || ''
      }, { publicKey });
    } catch (e: any) {
      emailStatus = 'failed';
      emailErr = e?.text || e?.message || String(e);
      console.error('[sendReassignmentEmail] failed:', e);
    }

    addNotificationLog({
      type: 'SME Review Assigned',
      recipient: reviewerEmail,
      subject,
      channel: emailStatus === 'sent' ? 'EmailJS API' : `EmailJS API (${emailStatus}${emailErr ? ': ' + emailErr.slice(0, 80) : ''})`,
      status: emailStatus === 'sent' ? 'Sent' : 'Failed'
    });

    if (emailStatus === 'sent') {
      addToast(`Reassigned. Notification email sent to ${reviewerName}.`, 'success');
    } else {
      addToast(`Reassigned, but notification email failed to send to ${reviewerName}. Check logs.`, 'warning');
    }
  };

  const saveDraft = async () => {
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }
    setSaving(true);
    const record: ReviewRecord = {
      submissionId: submission.submissionId,
      scores,
      total,
      decision,
      feedback: { strengths, gaps, reworkChecklist },
      reviewerUid: currentUser?.uid || 'admin',
      reviewerName: currentUser?.name || 'Admin',
      savedAt: Date.now(),
      isDraft: true
    };
    try {
      await update(ref(db, `reviews/${submission.submissionId}`), record);
      // Persist mode + assignment if changed
      const subUpdates: any = {};
      if (reviewMode && reviewMode !== submission.reviewMode) subUpdates.reviewMode = reviewMode;
      
      let hasReassigned = false;
      let chosenReviewerName = '';
      let chosenReviewerEmail = '';

      if (assignedUid && assignedUid !== submission.assignedReviewerUid) {
        const r = reviewers.find(x => x.uid === assignedUid);
        if (r) {
          subUpdates.assignedReviewerUid = r.uid;
          subUpdates.assignedReviewerName = r.name;
          subUpdates.assignedReviewerEmail = r.email;
          subUpdates.assignedAt = Date.now();
          if (r.uid !== 'admin-new-uid') {
            subUpdates.status = 'assigned_to_sme';
            hasReassigned = true;
            chosenReviewerName = r.name;
            chosenReviewerEmail = r.email;
          } else {
            subUpdates.status = 'submitted';
          }
        }
      }
      if (Object.keys(subUpdates).length > 0) {
        await update(ref(db, `submissions/${submission.learnerUid}/${submission.capstoneId}`), subUpdates);
      }
      addToast('Draft saved.', 'success');
      
      if (hasReassigned) {
        await sendReassignmentEmail(chosenReviewerName, chosenReviewerEmail);
      }

      onSaved();
    } catch (err: any) {
      addToast(`Save failed: ${err?.message || err}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── P4c · Run AI Review (Tier B via Render → OpenRouter → Qwen) ─────────
  const runAiReview = async () => {
    if (!systemConfig.aiReviewEnabled) {
      addToast('AI Review is disabled in System Settings → AI Review (Tier B). Enable it first.', 'warning');
      return;
    }
    setAiError(null);
    setRunningAi(true);
    setAiModalOpen(true);
    setAiProgressStep(1);

    // Progressive step simulation while async request is active
    const timer1 = setTimeout(() => setAiProgressStep(2), 1800);
    const timer2 = setTimeout(() => setAiProgressStep(3), 4200);

    const provider = systemConfig.aiReviewProvider || 'render';
    const subId = submission.submissionId || `${submission.learnerUid}_${submission.capstoneId}`;

    try {
      let responseData: any;

      if (provider === 'render') {
        // ── A2 Path: Render REST service ──────────────────────────────────
        const serviceUrl = (systemConfig.aiReviewServiceUrl || '').trim();
        if (!serviceUrl) throw new Error('AI Review Service URL is not configured. Go to System Settings → AI Review (Tier B) and enter your Render service URL.');

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (systemConfig.aiReviewApiKey) headers['x-api-key'] = systemConfig.aiReviewApiKey;

        const res = await fetch(`${serviceUrl}/api/score-capstone`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            submissionId: subId,
            modelOverride: systemConfig.aiReviewModel,
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          // The service answers with { error, code, githubCheck } — show the real reason,
          // not raw JSON, and keep the GitHub diagnosis visible in the Tier A panel.
          let parsedErr: { error?: string; code?: string; githubCheck?: GithubCheck } | null = null;
          try { parsedErr = JSON.parse(errText); } catch { /* not JSON */ }
          const failedCheck = parsedErr?.githubCheck;
          if (failedCheck) setAutoChecks((prev) => ({ ...(prev || {}), githubCheck: failedCheck }));
          if (parsedErr?.code === 'GITHUB_EVIDENCE_UNAVAILABLE') {
            throw new Error(`${parsedErr.error} No score was generated and any previous results are unchanged.`);
          }
          throw new Error(parsedErr?.error || `Render service error ${res.status}: ${errText.slice(0, 400) || 'Service unreachable'}`);
        }
        responseData = await res.json();

      } else {
        // ── Legacy Path: Firebase Cloud Function ──────────────────────────
        const app = getFirebaseApp();
        if (!app) throw new Error('Firebase app not initialised.');
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions(app);
        const fnName = systemConfig.aiReviewFunctionName || 'scoreCapstoneTierB';
        const fn = httpsCallable(functions, fnName);
        const res: any = await fn({
          submissionId: subId,
          modelOverride: systemConfig.aiReviewModel
        });
        responseData = res?.data;
      }

      const suggestion = responseData?.tierBSuggestion as TierBSuggestion | undefined;
      if (!suggestion) throw new Error('Service returned no tierBSuggestion. Check service logs.');
      
      setAiResult(suggestion);
      if (suggestion.autoChecks) setAutoChecks(suggestion.autoChecks);

      // Persist reviewMode = 'auto'
      const db = getFirebaseDb();
      if (db) {
        await update(ref(db, `submissions/${submission.learnerUid}/${submission.capstoneId}`), {
          reviewMode: 'auto', aiReviewedAt: Date.now()
        });
      }
      setAiProgressStep(4);
      addToast(`AI Review complete — ${suggestion.total}/100 from ${suggestion.model}.`, 'success');
      onSaved();
    } catch (err: any) {
      const code = err?.code || '';
      let friendly = err?.message || String(err);
      if (code === 'functions/not-found' || /not[- ]found/i.test(friendly)) {
        friendly = `Firebase Cloud Function not deployed. Switch provider to "Render" in System Settings → AI Review (Tier B).`;
      } else if (code === 'functions/failed-precondition') {
        friendly = err?.message || 'OPENROUTER_API_KEY secret is not set on the function.';
      } else if (code === 'functions/internal') {
        friendly = err?.message || 'AI scoring threw an error — check service logs.';
      } else if (/failed to fetch|network/i.test(friendly)) {
        friendly = `Cannot connect to ${systemConfig.aiReviewServiceUrl || 'Render service'}. If using free tier, service might be waking up — please retry in 15 seconds.`;
      }
      setAiError(friendly);
      addToast('AI Review failed — see popup for details.', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setRunningAi(false);
    }
  };

  const adoptAllAiScores = () => {
    if (!aiResult) return;
    setScores({ ...scores, ...aiResult.perCategory });
    if (!strengths.trim() && aiResult.overallObservations) {
      setStrengths(`AI Review Summary (${aiResult.model}):\n${aiResult.overallObservations}`);
    }
    setAiModalOpen(false);
    addToast('Adopted all AI-suggested scores! Form updated.', 'success');
    setTimeout(() => {
      rubricRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };
  const adoptCategoryScore = (key: string) => {
    if (!aiResult?.perCategory?.[key] && aiResult?.perCategory?.[key] !== 0) return;
    setScore(key, aiResult.perCategory[key]);
  };

  // ─── P4d · Notify Feedback (sends decision email to learner) ────────────
  const notifyFeedback = async () => {
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }

    // Validation guards
    const hasAnyScore = RUBRIC.some(r => (scores[r.key] || 0) > 0);
    if (!hasAnyScore) {
      addToast('Please enter scores for at least one rubric category before notifying.', 'warning');
      return;
    }
    if (total === 0) {
      if (!window.confirm('Total score is 0/100. Are you sure you want to notify the learner with a zero score?')) return;
    }
    if (!strengths.trim()) {
      addToast('Please fill in the Strengths (What Worked Well) field before notifying.', 'warning');
      return;
    }
    if (!gaps.trim()) {
      addToast('Please fill in the Gaps (What\'s Missing or Weak) field before notifying.', 'warning');
      return;
    }
    if ((decision === 'rework' || decision === 'rebuild') && !reworkChecklist.trim()) {
      addToast(`Decision is ${decision.toUpperCase()} — please fill in the Rework Checklist before notifying.`, 'warning');
      return;
    }

    if (!window.confirm(`Notify ${submission.learnerName} of the decision (${decision.toUpperCase()} · ${total}/100)? This sends them the feedback email and updates their submission status.`)) return;

    setNotifying(true);
    const now = Date.now();
    const record: any = {
      submissionId: submission.submissionId,
      scores, total, decision,
      feedback: { strengths, gaps, reworkChecklist },
      reviewerUid: currentUser?.uid || 'admin',
      reviewerName: currentUser?.name || 'Admin',
      savedAt: now,
      isDraft: false,
      notifiedAt: now
    };
    if (autoChecks) {
      record.autoChecks = autoChecks;
    }
    if (aiResult) {
      record.tierBSuggestion = aiResult;
    }
    try {
      // 1. Persist final review
      await update(ref(db, `reviews/${submission.submissionId}`), record);

      // 2. Update submission + selection status per decision
      const subStatusMap: Record<string, string> = {
        outstanding: 'feedback_sent', pass: 'feedback_sent',
        rework: 'rework_requested', rebuild: 'rebuild_required'
      };
      const selStatusMap: Record<string, string> = {
        outstanding: 'feedback_sent', pass: 'feedback_sent',
        rework: 'rework_needed', rebuild: 'rebuild_locked'
      };
      await update(ref(db, `submissions/${submission.learnerUid}/${submission.capstoneId}`), {
        status: subStatusMap[decision], decisionNotifiedAt: now
      });
      await update(ref(db, `capstoneSelections/${submission.learnerUid}`), {
        status: selStatusMap[decision], decisionAt: now, lastDecision: decision
      });

      // 3. Email learner — use Admin-managed template (Admin → Settings → Email Templates → decision_feedback)
      const serviceId = systemConfig.emailjsServiceId;
      const templateId = systemConfig.emailjsTemplateIdFeedback || systemConfig.emailjsTemplateId;
      const publicKey = systemConfig.emailjsPublicKey;

      const temp = systemConfig.templates?.['decision_feedback'] || { subject: '', body: '' };

      const breakdown = RUBRIC.map((r) => `  ${r.label}: ${scores[r.key] || 0}/${r.max}`).join('\n');
      const nextSteps =
        decision === 'outstanding' || decision === 'pass'
          ? 'Your certificate is pending admin deployment. You will receive a separate email when it is issued.'
          : decision === 'rework'
          ? 'Action required: address the rework checklist below and resubmit via /capstone/submit. Your capstone selection remains locked.'
          : 'Rebuild required: this capstone selection has been closed. Please lock a different capstone via /capstone and start fresh.';

      const replacePlaceholders = (txt: string) => {
        if (!txt) return '';
        return txt
          .replace(/{{name}}/g, submission.learnerName)
          .replace(/{{email}}/g, submission.learnerEmail)
          .replace(/{{capstoneId}}/g, submission.capstoneId)
          .replace(/{{capstoneTitle}}/g, submission.capstoneTitle)
          .replace(/{{decision}}/g, decision.toUpperCase())
          .replace(/{{score}}/g, String(total))
          .replace(/{{scoreBreakdown}}/g, breakdown)
          .replace(/{{strengths}}/g, strengths || '(none recorded)')
          .replace(/{{gaps}}/g, gaps || '(none recorded)')
          .replace(/{{reworkChecklist}}/g, reworkChecklist || '(none)')
          .replace(/{{nextSteps}}/g, nextSteps)
          .replace(/{{reviewerName}}/g, currentUser?.name || 'Admin')
          .replace(/{{reviewedAt}}/g, new Date(now).toLocaleString());
      };

      const emailSubject = replacePlaceholders(temp.subject);
      const emailBody = replacePlaceholders(temp.body);

      let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
      let emailErr = '';
      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(serviceId, templateId, {
            to_email: submission.learnerEmail,
            subject: emailSubject,
            message: emailBody
          }, { publicKey });
          emailStatus = 'sent';
        } catch (e: any) {
          emailStatus = 'failed';
          emailErr = e?.text || e?.message || String(e);
          console.error('[notifyFeedback] email failed:', e);
        }
      } else {
        emailErr = 'EmailJS not configured (serviceId/templateId/publicKey missing).';
      }

      addNotificationLog({
        type: 'Capstone Decision Feedback',
        recipient: submission.learnerEmail,
        subject: emailSubject,
        channel: emailStatus === 'sent' ? 'EmailJS API' : `EmailJS API (${emailStatus}${emailErr ? ': ' + emailErr.slice(0, 80) : ''})`,
        status: emailStatus === 'sent' ? 'Sent' : 'Failed'
      });

      addToast(
        emailStatus === 'sent'
          ? `Feedback notified to ${submission.learnerName}. Status: ${subStatusMap[decision]}.`
          : `Status updated but email ${emailStatus} (${emailErr.slice(0, 80)}). See Notification Log.`,
        emailStatus === 'sent' ? 'success' : 'warning'
      );
      onSaved();
    } catch (err: any) {
      addToast(`Notify failed: ${err?.message || err}`, 'error');
    } finally {
      setNotifying(false);
    }
  };

  // ─── P4d · Deploy Certification (issues cert + emails learner) ──────────
  const deployCertification = async () => {
    if (decision !== 'pass' && decision !== 'outstanding') {
      addToast(`Cannot certify — decision is ${decision.toUpperCase()}. Only Pass (≥70) and Outstanding (≥85) qualify.`, 'warning');
      return;
    }
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }

    const isRedeploy = submission.status === 'certified';
    const confirmMessage = isRedeploy
      ? `⚠️ REDEPLOY CERTIFICATION\n\n${submission.learnerName} has already been certified for ${submission.capstoneId}.\n\nThis will resend the certificate email to ${submission.learnerEmail}. Use this only if the previous email failed to deliver.\n\nProceed with redeployment?`
      : `Issue OrchestrAI Lead Certification to ${submission.learnerName} for ${submission.capstoneId}? This is final — they receive the cert email and the certificate becomes downloadable from their /certification page.`;

    if (!window.confirm(confirmMessage)) return;

    setDeploying(true);
    const now = Date.now();
    const certUrl = typeof window !== 'undefined' ? `${window.location.origin}/certification` : `https://orchestrai.academy/certification`;
    try {
      // 1. Write certification record
      await set(ref(db, `certifications/${submission.learnerUid}/${submission.capstoneId}`), {
        learnerUid: submission.learnerUid,
        learnerName: submission.learnerName,
        learnerEmail: submission.learnerEmail,
        capstoneId: submission.capstoneId,
        capstoneTitle: submission.capstoneTitle,
        capstoneDomain: submission.capstoneDomain,
        scores, total, decision,
        feedback: { strengths, gaps },
        certifiedAt: now,
        certifiedByUid: currentUser?.uid || 'admin',
        certifiedByName: currentUser?.name || 'Admin',
        reviewMode: submission.reviewMode || 'manual',
        status: 'active'
      });

      // 2. Update submission + selection statuses
      await update(ref(db, `submissions/${submission.learnerUid}/${submission.capstoneId}`), {
        status: 'certified', certifiedAt: now
      });
      await update(ref(db, `capstoneSelections/${submission.learnerUid}`), {
        status: 'certified', certifiedAt: now
      });
      await update(ref(db, `reviews/${submission.submissionId}`), { certifiedAt: now });

      // 3. Email learner — use Admin-managed template (Admin → Settings → Email Templates → certification_issued)
      const serviceId = systemConfig.emailjsServiceId;
      const templateId = systemConfig.emailjsTemplateIdCertification || systemConfig.emailjsTemplateId;
      const publicKey = systemConfig.emailjsPublicKey;

      const temp = systemConfig.templates?.['certification_issued'] || { subject: '', body: '' };

      const replacePlaceholders = (txt: string) => {
        if (!txt) return '';
        return txt
          .replace(/{{name}}/g, submission.learnerName)
          .replace(/{{email}}/g, submission.learnerEmail)
          .replace(/{{capstoneId}}/g, submission.capstoneId)
          .replace(/{{capstoneTitle}}/g, submission.capstoneTitle)
          .replace(/{{capstoneDomain}}/g, submission.capstoneDomain)
          .replace(/{{decision}}/g, decision.toUpperCase())
          .replace(/{{score}}/g, String(total))
          .replace(/{{certificateUrl}}/g, certUrl)
          .replace(/{{certifiedAt}}/g, new Date(now).toLocaleString())
          .replace(/{{certifiedBy}}/g, currentUser?.name || 'OrchestrAI Admin');
      };

      const emailSubject = replacePlaceholders(temp.subject);
      const emailBody = replacePlaceholders(temp.body);

      let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
      let emailErr = '';
      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(serviceId, templateId, {
            to_email: submission.learnerEmail,
            subject: emailSubject,
            message: emailBody
          }, { publicKey });
          emailStatus = 'sent';
        } catch (e: any) {
          emailStatus = 'failed';
          emailErr = e?.text || e?.message || String(e);
          console.error('[deployCertification] email failed:', e);
        }
      } else {
        emailErr = 'EmailJS not configured.';
      }

      addNotificationLog({
        type: 'Capstone Certification Issued',
        recipient: submission.learnerEmail,
        subject: emailSubject,
        channel: emailStatus === 'sent' ? 'EmailJS API' : `EmailJS API (${emailStatus}${emailErr ? ': ' + emailErr.slice(0, 80) : ''})`,
        status: emailStatus === 'sent' ? 'Sent' : 'Failed'
      });

      addToast(`Certification deployed for ${submission.learnerName}. ${emailStatus === 'sent' ? 'Email sent.' : `Email ${emailStatus} — see Notification Log.`}`, emailStatus === 'sent' ? 'success' : 'warning');
      onSaved();
    } catch (err: any) {
      addToast(`Certification deploy failed: ${err?.message || err}`, 'error');
    } finally {
      setDeploying(false);
    }
  };

  const submitFeedbackToAdmin = async () => {
    const db = getFirebaseDb();
    if (!db) { addToast('Cloud database not available.', 'error'); return; }

    // ── Validation guards ─────────────────────────────────────────────────
    const hasAnyScore = RUBRIC.some(r => (scores[r.key] || 0) > 0);
    if (!hasAnyScore) {
      addToast('⚠️ Please enter rubric scores before submitting. All scores are currently 0.', 'warning');
      return;
    }
    if (total === 0) {
      if (!window.confirm('Total score is 0/100. Are you absolutely sure you want to submit with a zero score?')) return;
    }
    if (!strengths.trim()) {
      addToast('⚠️ Strengths (What Worked Well) is required. Please describe what the learner did well.', 'warning');
      return;
    }
    if (!gaps.trim()) {
      addToast('⚠️ Gaps (What\'s Missing or Weak) is required. Please describe the areas needing improvement.', 'warning');
      return;
    }
    if ((decision === 'rework' || decision === 'rebuild') && !reworkChecklist.trim()) {
      addToast(`⚠️ Rework Checklist is required when decision is ${decision.toUpperCase()}. Please list specific items the learner must address.`, 'warning');
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    if (!window.confirm('Submit this feedback to the admin? Once submitted, the admin reviews + applies the final decision. You can still update the draft if needed.')) return;
    setSubmittingFeedback(true);
    const record: ReviewRecord = {
      submissionId: submission.submissionId,
      scores,
      total,
      decision,
      feedback: { strengths, gaps, reworkChecklist },
      reviewerUid: currentUser?.uid || 'sme',
      reviewerName: currentUser?.name || 'SME',
      savedAt: Date.now(),
      isDraft: false
    };
    try {
      await update(ref(db, `reviews/${submission.submissionId}`), record);
      await update(ref(db, `submissions/${submission.learnerUid}/${submission.capstoneId}`), {
        status: 'awaiting_admin_approval',
        smeReviewedAt: Date.now()
      });
      addToast('Feedback submitted to admin. They will apply the final decision.', 'success');
      onSaved();
      onBack();
    } catch (err: any) {
      addToast(`Submit failed: ${err?.message || err}`, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const eligibleReviewers = reviewers.filter(r => !r.disabled);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Submission Queue
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${STATUS_COLORS[submission.status]}`}>
            {submission.status === 'certified' && submission.certifiedAt
              ? `certified · ${new Date(submission.certifiedAt).toLocaleDateString()}`
              : submission.status.replace(/_/g, ' ')}
          </span>
          {existingReview && (
            <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${DECISION_COLORS[existingReview.decision]}`}>
              {existingReview.decision}{existingReview.isDraft ? ' · draft' : ''}
            </span>
          )}
        </div>
      </div>

      {isCertified && (
        <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-350">
          <span>✅ This capstone project has already been certified and closed. {isSme ? 'It is now in read-only mode.' : 'You can review or redeploy certification below.'}</span>
        </div>
      )}

      {/* Capstone Header Card */}
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">{submission.capstoneId} · {submission.capstoneDomain}</div>
            <h2 className="text-xl font-extrabold mb-1">{submission.capstoneTitle}</h2>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Submitted by <strong className="text-[var(--text-primary)]">{submission.learnerName}</strong> ({submission.learnerEmail}) · {new Date(submission.submittedAt).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Total Score</div>
            <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{total}<span className="text-base text-[var(--text-secondary)]">/100</span></div>
            <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${DECISION_COLORS[decision]}`}>
              {decision}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Submission Package */}
        <div className="space-y-4 lg:col-span-1">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-400" /> Submission Package</h3>
            <div className="space-y-2 text-xs">
              <LinkRow icon={<ExternalLink className="h-3.5 w-3.5" />} label="GitHub Repo" url={submission.githubUrl} />
              <LinkRow icon={<ExternalLink className="h-3.5 w-3.5" />} label="Firebase Live" url={submission.firebaseUrl} />
              {(submission.appAdminUserId || submission.appAdminPassword) && (
                <div className="mt-2 p-2 rounded-lg border border-indigo-500/10 bg-indigo-500/5 space-y-1">
                  {submission.appAdminUserId && (
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">ADMIN USER:</span>
                      <code className="text-indigo-300 font-mono select-all bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded truncate" title={submission.appAdminUserId}>{submission.appAdminUserId}</code>
                    </div>
                  )}
                  {submission.appAdminPassword && (
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">ADMIN PASS:</span>
                      <code className="text-indigo-300 font-mono select-all bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded truncate" title={submission.appAdminPassword}>{submission.appAdminPassword}</code>
                    </div>
                  )}
                </div>
              )}
              <LinkRow icon={<FileText className="h-3.5 w-3.5" />} label="README" url={submission.readmeUrl} />
              {submission.workflowDiagramUrl && (
                <LinkRow icon={<WorkflowIcon className="h-3.5 w-3.5" />} label="Workflow Diagram" url={submission.workflowDiagramUrl} />
              )}
            </div>
            {submission.supportingDocs && submission.supportingDocs.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-4 mb-2">Supporting Docs ({submission.supportingDocs.length})</div>
                <div className="space-y-1.5">
                  {submission.supportingDocs.map((d, i) => (
                    <a key={i} href={d.storageUrl} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-indigo-400 hover:underline truncate">
                      📎 {d.name}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mode Picker */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-400" /> Review Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setReviewMode('manual')}
                className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                  reviewMode === 'manual' ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
                }`}
              >
                <UsersIcon className="h-4 w-4 mx-auto mb-1" />
                Manual<div className="text-[9px] font-normal mt-0.5">Assign SME</div>
              </button>
              <button
                onClick={() => setReviewMode('auto')}
                className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                  reviewMode === 'auto' ? 'border-purple-500/50 bg-purple-500/15 text-purple-300' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-purple-500/30'
                }`}
              >
                <Bot className="h-4 w-4 mx-auto mb-1" />
                Auto<div className="text-[9px] font-normal mt-0.5">AI scoring</div>
              </button>
            </div>

            {reviewMode === 'manual' && (
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">Assign to Reviewer</label>
                <select value={assignedUid} onChange={(e) => setAssignedUid(e.target.value)} className="form-input">
                  <option value="">Pick a reviewer…</option>
                  {eligibleReviewers.map(r => (
                    <option key={r.uid} value={r.uid}>
                      {r.name} ({r.role}) · {r.activeAssignments} active
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">SME invite email ships in P4b. For now, the assignment is recorded — admin notifies the SME manually.</p>
              </div>
            )}
            {reviewMode === 'auto' && (
              <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-[11px] text-purple-300">
                <Bot className="h-3.5 w-3.5 inline mr-1" /> Auto mode wires to the Cloud Function in <strong>P4c</strong>. For now, the mode is recorded — scoring still requires manual entry below.
              </div>
            )}
          </div>

          {/* Capstone Context */}
          {cap && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-cyan-400" /> Capstone Spec</h3>
              <div className="text-[11px] space-y-2">
                <div><strong>Actors:</strong> <span className="text-[var(--text-secondary)]">{cap.actors.join(', ')}</span></div>
                <div><strong>Masters:</strong> <span className="text-[var(--text-secondary)]">{cap.masters.join(', ')}</span></div>
                <div><strong>Transaction:</strong> <span className="text-[var(--text-secondary)]">{cap.transactionEntity}</span></div>
                <div><strong>Workflow:</strong> <span className="text-[var(--text-secondary)]">{cap.workflow.join(' → ')}</span></div>
                <div><strong>Extension:</strong> <span className="text-[var(--text-secondary)]">{cap.trainerExtension}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Scoring + Feedback */}
        <div className="space-y-4 lg:col-span-2">
          {/* Tier B AI Suggestion panel */}
          {(aiResult || autoChecks || aiError || runningAi) && !isSme && (
            <div ref={aiPanelRef} className="glass-card rounded-2xl p-5 border border-purple-500/25 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold flex items-center gap-2"><Bot className="h-4 w-4 text-purple-400" /> AI Review (Tier B)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={runAiReview} disabled={runningAi} className="px-2.5 py-1 rounded-md border border-purple-500/30 hover:bg-purple-500/15 text-purple-300 text-[10px] font-extrabold transition-all disabled:opacity-50">
                    {runningAi ? 'Scoring…' : 'Re-run AI'}
                  </button>
                  {aiResult && (
                    <button onClick={adoptAllAiScores} className="px-3 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-300 text-[10px] font-extrabold transition-all">
                      Adopt All ({aiResult.total}/100)
                    </button>
                  )}
                </div>
              </div>

              {runningAi && (
                <div className="text-xs text-purple-300 py-3 text-center animate-pulse">
                  Calling AI Review Service (Render) · {systemConfig.aiReviewModel || 'qwen/qwen-2.5-72b-instruct'}…
                </div>
              )}

              {aiError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-[11px] text-rose-300 leading-relaxed">
                  <strong className="text-rose-400">AI Review failed:</strong> {aiError}
                </div>
              )}

              {autoChecks && (() => {
                // A failed GitHub call is "unknown", not "✗ missing" — otherwise a rate limit
                // looks identical to an empty or private repository.
                const gh = autoChecks.githubCheck;
                const githubUnknown = !!gh && gh.evidenceAvailable === false;
                const unk = (v?: boolean) => (githubUnknown ? undefined : v);
                return (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">Tier A · Deterministic Checks</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                      <AutoCheck label="GitHub URL" ok={autoChecks.githubReachable} />
                      <AutoCheck label="Repo public" ok={unk(autoChecks.githubPublic)} />
                      <AutoCheck label="README exists" ok={unk(autoChecks.hasReadme)} />
                      <AutoCheck label="DESIGN doc" ok={unk(autoChecks.hasDesignDoc)} />
                      <AutoCheck label="package.json" ok={unk(autoChecks.hasPackageJson)} />
                      <AutoCheck label="Firebase URL" ok={autoChecks.firebaseReachable} />
                    </div>
                    {autoChecks.fileCount !== undefined && !githubUnknown && (
                      <div className="text-[10px] text-[var(--text-secondary)] mt-2">{autoChecks.fileCount} files in repo</div>
                    )}
                    {githubUnknown && (
                      <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-[10px] text-amber-300 leading-relaxed">
                        <strong className="text-amber-400">GitHub evidence unavailable ({gh?.status?.replace('_', ' ')}).</strong>{' '}
                        {gh?.message} The "·" marks above mean <em>unknown</em>, not missing.
                      </div>
                    )}
                    {gh?.tokenRejected && (
                      <div className="mt-2 text-[10px] text-amber-300 leading-relaxed">
                        The review service's GITHUB_TOKEN was rejected by GitHub; it continued anonymously. Replace the token on Render.
                      </div>
                    )}
                    {autoChecks.firebaseUrlKind === 'console' && (
                      <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-[10px] text-amber-300 leading-relaxed">
                        <strong className="text-amber-400">Live URL is a Firebase console link, not a running app.</strong>{' '}
                        {autoChecks.liveUrlNote}
                      </div>
                    )}
                  </div>
                );
              })()}

              {aiResult && (
                <>
                  <div className="text-[10px] text-[var(--text-secondary)] mb-2">
                    Suggested by <strong className="text-purple-400">{aiResult.model}</strong> · {new Date(aiResult.generatedAt).toLocaleString()}
                    {aiResult.evidence && (
                      <> · evidence: {aiResult.evidence.filesListed ?? 0} files listed, {aiResult.evidence.sourceFilesSampled ?? 0} source files read</>
                    )}
                  </div>
                  {aiResult.evidence?.confidence && aiResult.evidence.confidence !== 'high' && (
                    <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-[10px] text-amber-300 leading-relaxed">
                      <strong className="text-amber-400">Evidence confidence: {aiResult.evidence.confidence.toUpperCase()}.</strong>{' '}
                      {(aiResult.evidence.gaps || []).join(' ')} Treat these scores as a starting point and verify against the repository.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    {RUBRIC.map((r) => {
                      const v = aiResult.perCategory[r.key] ?? 0;
                      const rat = aiResult.rationale?.[r.key];
                      return (
                        <div key={r.key} className="rounded-md border border-purple-500/15 bg-[var(--surface-sunken)]/40 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{r.label}</span>
                            <button onClick={() => adoptCategoryScore(r.key)} className="text-[9px] text-purple-400 hover:text-purple-300 underline" title="Copy this score to manual scoring">Adopt</button>
                          </div>
                          <div className="text-base font-extrabold text-purple-400">{v}<span className="text-[10px] text-[var(--text-secondary)] font-normal">/{r.max}</span></div>
                          {rat && <p className="text-[10px] text-[var(--text-secondary)] leading-snug mt-1 line-clamp-3" title={rat}>{rat}</p>}
                        </div>
                      );
                    })}
                  </div>
                  {aiResult.overallObservations && (
                    <div className="rounded-lg bg-[var(--surface-sunken)]/60 p-3 text-[11px] text-[var(--text-secondary)] leading-relaxed border-l-2 border-purple-500/40">
                      <strong className="text-purple-400">Overall:</strong> {aiResult.overallObservations}
                    </div>
                  )}
                </>
              )}

              <p className="text-[10px] text-[var(--text-secondary)] mt-3 leading-relaxed">
                AI suggestions assist — admin retains final authority. Adopt the suggestion, then override per-category as needed before Notify Feedback / Deploy Certification.
              </p>
            </div>
          )}

          {/* 9-category scoring */}
          <div ref={rubricRef} className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-emerald-400" /> 9-Category Rubric Scoring</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mb-4 leading-relaxed">
              Score each category from 0 to its max. Total auto-computes. Workflow carries the highest weight (20 pts) — that's where orchestration discipline shows.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RUBRIC.map(r => (
                <div key={r.key} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{r.label}</label>
                    <span className="text-[10px] text-[var(--text-secondary)]">max {r.max}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={r.max}
                    value={scores[r.key] ?? 0}
                    onChange={(e) => setScore(r.key, parseInt(e.target.value, 10) || 0)}
                    disabled={disableEditing}
                    className={`w-full px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-extrabold text-center text-indigo-400 focus:outline-none focus:border-indigo-500/40 ${
                      disableEditing ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="mt-1.5 h-1 rounded-full bg-[var(--border-color)] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{ width: `${((scores[r.key] || 0) / r.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-secondary)]">
                Decision thresholds: ≥85 Outstanding · ≥70 Pass · 50–69 Rework · &lt;50 Rebuild
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total</div>
                <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{total}/100</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-400" /> Reviewer Feedback</h3>
            <p className="text-[10px] text-[var(--text-secondary)] mb-3 leading-relaxed">
              All fields marked <span className="text-rose-400 font-bold">*</span> are required before submitting.
              {(decision === 'rework' || decision === 'rebuild') && (
                <span className="ml-1 text-amber-400 font-bold">Rework Checklist is required for {decision.toUpperCase()} decisions.</span>
              )}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Strengths (What Worked Well) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  rows={3}
                  disabled={disableEditing}
                  className={`form-input resize-none w-full ${
                    !strengths.trim() ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-emerald-500/30'
                  } ${disableEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Strong workflow implementation, clean RBAC matrix, …"
                />
                {!strengths.trim() && (
                  <p className="text-[10px] text-rose-400 mt-1">⚠ This field is required.</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Gaps (What's Missing or Weak) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={gaps}
                  onChange={(e) => setGaps(e.target.value)}
                  rows={3}
                  disabled={disableEditing}
                  className={`form-input resize-none w-full ${
                    !gaps.trim() ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-emerald-500/30'
                  } ${disableEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="No Excel export on reports, comments lack pagination, …"
                />
                {!gaps.trim() && (
                  <p className="text-[10px] text-rose-400 mt-1">⚠ This field is required.</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Rework Checklist
                  {(decision === 'rework' || decision === 'rebuild') && (
                    <span className="text-rose-400"> *</span>
                  )}
                  <span className="ml-1 text-[9px] font-normal normal-case text-[var(--text-secondary)]">
                    (required when decision is Rework / Rebuild)
                  </span>
                </label>
                <textarea
                  value={reworkChecklist}
                  onChange={(e) => setReworkChecklist(e.target.value)}
                  rows={3}
                  disabled={disableEditing}
                  className={`form-input resize-none w-full ${
                    (decision === 'rework' || decision === 'rebuild') && !reworkChecklist.trim()
                      ? 'border-amber-500/50 focus:border-amber-500/70'
                      : reworkChecklist.trim() ? 'border-emerald-500/30' : ''
                  } ${disableEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder={`1. Add Excel export to Status Report\n2. Fix RBAC bypass on /admin/users\n…`}
                />
                {(decision === 'rework' || decision === 'rebuild') && !reworkChecklist.trim() && (
                  <p className="text-[10px] text-amber-400 mt-1">⚠ Required for {decision.toUpperCase()} — list each item the learner must address.</p>
                )}
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3">Actions</h3>

            {/* SME validation summary */}
            {isSme && (() => {
              const hasAnyScore = RUBRIC.some(r => (scores[r.key] || 0) > 0);
              const missingFields: string[] = [];
              if (!hasAnyScore) missingFields.push('Enter at least one rubric score');
              if (!strengths.trim()) missingFields.push('Fill in Strengths');
              if (!gaps.trim()) missingFields.push('Fill in Gaps');
              if ((decision === 'rework' || decision === 'rebuild') && !reworkChecklist.trim()) missingFields.push(`Fill in Rework Checklist (${decision.toUpperCase()})`);
              if (missingFields.length === 0) return null;
              return (
                <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="text-[11px] font-bold text-amber-400 mb-1.5">⚠ Complete before submitting:</div>
                  <ul className="space-y-0.5">
                    {missingFields.map((f, i) => (
                      <li key={i} className="text-[10px] text-amber-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-2">
              {!disableEditing && (
                <button
                  onClick={saveDraft}
                  disabled={saving || submittingFeedback}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save Draft'}
                </button>
              )}

              {isSme ? (
                !disableEditing && (
                  <button
                    onClick={submitFeedbackToAdmin}
                    disabled={saving || submittingFeedback}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" /> {submittingFeedback ? 'Submitting…' : 'Submit Feedback to Admin'}
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={runAiReview}
                    disabled={saving || runningAi || notifying || deploying}
                    title={!systemConfig.aiReviewEnabled ? 'Enable AI Review in System Settings → AI Review (Tier B) first' : 'Run Tier B AI scoring via Render Service'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/10 text-purple-400 text-xs font-extrabold transition-all disabled:opacity-50"
                  >
                    <Bot className="h-3.5 w-3.5" /> {runningAi ? 'Running AI…' : 'Run AI Review'}
                  </button>
                  {aiResult && (
                    <button
                      onClick={adoptAllAiScores}
                      disabled={saving || runningAi || notifying || deploying}
                      title="Copy all AI suggested scores into the rubric form"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all"
                    >
                      ✨ Adopt AI Scores ({aiResult.total}/100)
                    </button>
                  )}
                  <button
                    onClick={notifyFeedback}
                    disabled={saving || runningAi || notifying || deploying}
                    title="Send decision email to learner + update submission status"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" /> {notifying ? 'Notifying…' : 'Notify Feedback'}
                  </button>
                  <button
                    onClick={deployCertification}
                    disabled={saving || runningAi || notifying || deploying || (decision !== 'pass' && decision !== 'outstanding')}
                    title={decision !== 'pass' && decision !== 'outstanding' ? `Decision is ${decision.toUpperCase()} — only Pass/Outstanding qualify` : 'Issue certificate + email learner + unlock in-app cert'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Award className="h-3.5 w-3.5" /> {deploying ? 'Deploying…' : (submission.status === 'certified' ? 'Redeploy Certification' : 'Deploy Certification')}
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-3 leading-relaxed">
              {isSme ? (
                <><strong>SME workflow:</strong> Save Draft to persist as you go. When ready, click <strong>Submit Feedback to Admin</strong> — your scores + feedback get flagged as final, and the admin sees it in their approval queue for the final decision (Notify Feedback / Deploy Certification).</>
              ) : (
                <><strong>Admin workflow:</strong> Save Draft persists your scores. Run AI Review, Notify Feedback, and Deploy Certification ship in P4c–d. Admin keeps final authority on all learner-facing actions.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ─── AI Review Progress & Completion Modal ─── */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 border border-purple-500/30 shadow-2xl bg-[var(--surface-sunken)] space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Bot className={`h-5 w-5 ${runningAi ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {runningAi ? 'AI Review in Progress…' : aiError ? 'AI Review Failed' : 'AI Review Complete!'}
                  </h3>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {runningAi
                      ? `Evaluating via Render · ${systemConfig.aiReviewModel || 'qwen/qwen-2.5-72b-instruct'}`
                      : aiError
                      ? 'Error communicating with AI service'
                      : `Evaluated by ${aiResult?.model || 'OpenRouter'}`}
                  </div>
                </div>
              </div>
              {!runningAi && (
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm px-2 py-1 rounded"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body: RUNNING */}
            {runningAi && (
              <div className="py-2 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    aiProgressStep >= 1 ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-transparent text-[var(--text-secondary)]'
                  }`}>
                    <span className="text-base">🌐</span>
                    <div className="flex-1">
                      <div className="font-bold">1. Connecting to Render AI Service</div>
                      <div className="text-[10px] opacity-75">Reading submission from database</div>
                    </div>
                    {aiProgressStep > 1 && <span className="text-emerald-400 font-bold">✓</span>}
                  </div>

                  <div className={`p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    aiProgressStep >= 2 ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-transparent text-[var(--text-secondary)]'
                  }`}>
                    <span className="text-base">📦</span>
                    <div className="flex-1">
                      <div className="font-bold">2. Inspecting GitHub Repository</div>
                      <div className="text-[10px] opacity-75">Fetching README, package.json & file tree</div>
                    </div>
                    {aiProgressStep > 2 && <span className="text-emerald-400 font-bold">✓</span>}
                  </div>

                  <div className={`p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    aiProgressStep >= 3 ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-transparent text-[var(--text-secondary)]'
                  }`}>
                    <span className="text-base">⚡</span>
                    <div className="flex-1">
                      <div className="font-bold">3. Verifying Live URL & Structure</div>
                      <div className="text-[10px] opacity-75">Running deterministic checks</div>
                    </div>
                    {aiProgressStep > 3 && <span className="text-emerald-400 font-bold">✓</span>}
                  </div>

                  <div className={`p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                    aiProgressStep >= 4 ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-transparent text-[var(--text-secondary)]'
                  }`}>
                    <span className="text-base">🧠</span>
                    <div className="flex-1">
                      <div className="font-bold">4. Scoring Rubric with Qwen 2.5 72B</div>
                      <div className="text-[10px] opacity-75">Generating evidence-based score breakdown</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-300 text-center animate-pulse">
                  ⏳ Please hold on ~10–20 seconds while the model thoroughly evaluates the code…
                </div>
              </div>
            )}

            {/* Modal Body: SUCCESS */}
            {!runningAi && aiResult && !aiError && (
              <div className="py-2 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Suggested Score</div>
                    <div className="text-3xl font-extrabold text-emerald-300">{aiResult.total} <span className="text-sm font-normal text-[var(--text-secondary)]">/ 100</span></div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">Outcome: {decideOutcome(aiResult.total).toUpperCase()}</div>
                  </div>
                  <div className="text-right text-[11px] text-[var(--text-secondary)] space-y-1">
                    <div>Model: <strong className="text-[var(--text-primary)] font-mono text-[10px]">{aiResult.model}</strong></div>
                    <div>AutoChecks: <strong className="text-cyan-400">{aiResult.autoChecks?.fileCount || 0} files</strong></div>
                  </div>
                </div>

                {/* Score breakdown grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {RUBRIC.map(r => (
                    <div key={r.key} className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/60">
                      <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] truncate">{r.label}</div>
                      <div className="text-sm font-extrabold text-purple-400 mt-0.5">
                        {aiResult.perCategory[r.key] ?? 0}<span className="text-[10px] font-normal text-[var(--text-secondary)]">/{r.max}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {aiResult.overallObservations && (
                  <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-purple-400 block mb-1">AI Observations:</strong>
                    {aiResult.overallObservations}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                  <button
                    onClick={adoptAllAiScores}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white text-xs font-extrabold shadow-lg transition-all"
                  >
                    ✨ Adopt All AI Scores ({aiResult.total}/100)
                  </button>
                  <button
                    onClick={() => {
                      setAiModalOpen(false);
                      setTimeout(() => aiPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--surface-sunken)] text-xs font-bold text-[var(--text-secondary)]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: ERROR */}
            {!runningAi && aiError && (
              <div className="py-2 space-y-4">
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs leading-relaxed space-y-2">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <span>⚠️</span> Scoring Failed
                  </div>
                  <p>{aiError}</p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                  <button
                    onClick={runAiReview}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all"
                  >
                    🔄 Retry AI Review
                  </button>
                  <button
                    onClick={() => setAiModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--surface-sunken)] text-xs font-bold text-[var(--text-secondary)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">{label}</label>
    {children}
  </div>
);

const LinkRow: React.FC<{ icon: React.ReactNode; label: string; url: string }> = ({ icon, label, url }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">{icon} {label}</div>
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-400 hover:underline break-all">{url}</a>
  </div>
);

const DomainMultiSelect: React.FC<{ value: CapstoneDomain[]; onChange: (v: CapstoneDomain[]) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]">
    {DOMAINS.map(d => {
      const active = value.includes(d);
      return (
        <button
          type="button"
          key={d}
          onClick={() => onChange(active ? value.filter(x => x !== d) : [...value, d])}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
            active ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/30'
          }`}
        >
          {d}
        </button>
      );
    })}
  </div>
);

const AutoCheck: React.FC<{ label: string; ok?: boolean }> = ({ label, ok }) => (
  <div className="flex items-center gap-1.5">
    <span className={ok ? 'text-emerald-400' : ok === false ? 'text-rose-400' : 'text-[var(--text-secondary)]'}>
      {ok ? '✓' : ok === false ? '✗' : '·'}
    </span>
    <span className={ok ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{label}</span>
  </div>
);
