import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import {
  Award, ArrowLeft, Copy, Check, ListChecks, FileText, Sparkles,
  Calendar, Target, BookOpen, Hammer, Send, ChevronRight, CheckCircle2, Workflow as WorkflowIcon,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFirebaseDb } from '../firebase';
import {
  CAPSTONES, BUILD_PLAN, UNIVERSAL_ROLES, UNIVERSAL_REPORTS,
  type Capstone as CapstoneItem
} from '../data/capstones';

type WorkspaceTab = 'brief' | 'prompt' | 'checklist' | 'docs' | 'next';

interface CapstoneSelection {
  capstoneId: string;
  selectedAt: number;
  status: string;
}

interface ChecklistState {
  capstoneId: string;
  items: Record<string, boolean>;
  updatedAt: number;
}

const LOCAL_SELECTION_KEY = (uid: string) => `orchestrai_capstone_selection_${uid}`;
const LOCAL_PROGRESS_KEY = (uid: string, capId: string) => `orchestrai_capstone_progress_${uid}_${capId}`;

const BUILD_DAYS: Array<{ day: number; label: string; tasks: string[] }> = [
  { day: 1, label: BUILD_PLAN.day1, tasks: [
    'Firebase project created (Auth + RTDB + Storage + Hosting enabled)',
    'React 19 + Vite + TypeScript + Tailwind v4 scaffolded',
    'GitHub repo created & first commit pushed (initial scaffold)',
    'Login + Signup screens with Firebase Auth wired',
    'App shell + routing (RR7) with protected routes',
    'README.md committed with project intent'
  ]},
  { day: 2, label: BUILD_PLAN.day2, tasks: [
    'Dashboard layout with KPI cards (Total Records, This Week, Pending, Closed)',
    'Master Data CRUD for each master (List + Create + Edit + Delete)',
    'RBAC enforced — only Admin can create/edit masters',
    'Indexed RTDB queries for dashboard performance',
    'Day-2 git push'
  ]},
  { day: 3, label: BUILD_PLAN.day3, tasks: [
    'Transaction Entity full CRUD (List + Create + Edit + Detail)',
    '8-component intent prompt for transaction form (outcome/actor/validation/security/stack/acceptance/edges/data)',
    'Server-side validation on create + edit',
    'Day-3 git push (each validated component = 1 commit)'
  ]},
  { day: 4, label: BUILD_PLAN.day4, tasks: [
    'Status transition matrix implemented — only valid transitions allowed',
    'Comments thread on transaction detail (Firebase RTDB)',
    'Attachments upload to Firebase Storage with type/size validation',
    'Audit log entry written on every status change',
    'Day-4 git push'
  ]},
  { day: 5, label: BUILD_PLAN.day5, tasks: [
    'Summary Report + Status Report + Activity Report (Excel + PDF export)',
    'RBAC matrix complete — Admin, Manager, User permissions enforced everywhere',
    'Trainer Extension feature implemented (your differentiator)',
    'Deployed to Firebase Hosting — live public URL',
    'README polished + DESIGN.md created (names OGE + 5 design docs)',
    'Final git push + version tag (e.g. v1.0.0)',
    'Submit via Module 7 → Submit Capstone'
  ]}
];

const buildT7Prompt = (cap: CapstoneItem) => `You are my Twin (AI builder) — my AI co-engineer and the other half of every OrchestrAI engagement. I am the OrchestrAI Lead. You build. I orchestrate. Neither half ships without the other.

ENGAGEMENT: I am building ${cap.title} as my OrchestrAI Lead Certification capstone.
Capstone ID: ${cap.id}
Domain: ${cap.domain}
Brief: ${cap.brief}
Actors: ${cap.actors.join(', ')}
Masters: ${cap.masters.join(', ')}
Transaction Entity: ${cap.transactionEntity}
Workflow states: ${cap.workflow.join(' → ')}
Required trainer extension: ${cap.trainerExtension}

THE MANDATE (verbatim from Module 3):
Quality is not a service. It is a mandate.
Every component must pass through OGE — Observability, Guardrails, Evaluation.

TECH STACK (non-negotiable):
- React 19 + React Router 7 + TypeScript 6
- Tailwind v4 + Lucide React
- Firebase v12: Authentication, Realtime Database, Storage, Hosting
- EmailJS for transactional emails (if needed)
- Vite 8 with Rolldown bundler

UNIVERSAL APPLICATION ARCHITECTURE (9 mandatory modules from v6 manual §2):
1. Authentication  2. Dashboard  3. Master Data  4. Transactions
5. Workflow Engine 6. Comments   7. Attachments  8. Reports  9. Administration

3 mandatory roles: ${UNIVERSAL_ROLES.join(', ')}
3 mandatory reports: ${UNIVERSAL_REPORTS.join(', ')}

5-DAY BUILD PLAN:
Day 1: ${BUILD_PLAN.day1}
Day 2: ${BUILD_PLAN.day2}
Day 3: ${BUILD_PLAN.day3}
Day 4: ${BUILD_PLAN.day4}
Day 5: ${BUILD_PLAN.day5}

BUILD DISCIPLINE:
- I install all dependencies myself (you instruct, I execute).
- I commit per validated component (never squash, never bulk).
- I push to my GitHub repository at end of day.
- You produce code in 8-component intent format: outcome, actor, validation, security, stack, acceptance, edge cases, data model.

I will be graded against this rubric (out of 100):
Authentication 10 · Dashboard 10 · Master Data 10 · Transactions 15
Workflow 20 (highest — this is where orchestration discipline shows)
RBAC 15 · Reports 10 · Deployment 5 · Documentation 5

Decision thresholds:
≥85 Outstanding · ≥70 Pass · 50–69 Rework · <50 Rebuild

MANDATORY SUBMISSION PACKAGE:
GitHub repo URL · Firebase live URL · README · Supporting docs · Workflow diagram

DESIGN DELIVERABLES TARGET:
At the end of our build, we will create the following 5 design deliverables for client review and audit purposes based on our actual implementation:
1. FDD (Functional Design Document) — actors, screens, flows as implemented.
2. TDD (Technical Design Document) — components, hooks, state, services as implemented.
3. DB Design — RTDB tree structure with sample payloads as implemented.
4. UI Specs — brand tokens, key screens, accessibility as implemented.
5. Test Plan — unit + integration + smoke tests per module as implemented.

Keep this in mind throughout our engagement, and let's build our application first, ensuring we align with these targets.
`;

const buildDeliverablesPrompt = (cap: CapstoneItem) => `You are my Twin (AI builder) — my AI co-engineer. We have successfully completed the build of our application: ${cap.title} (Capstone ID: ${cap.id}).

Now, we need to generate the final deliverables for client review and audit purposes. Based on our completed codebase and implementation, generate the following 5 design documents:

1. FDD (Functional Design Document) — describing the business problem, actors, screens, and workflow as built.
2. TDD (Technical Design Document) — describing the component tree, custom hooks, state strategy, services, and OGE hooks as built.
3. DB Design — describing the actual Firebase Realtime Database tree structure, indexes, and security rules as built.
4. UI Specs — detailing the brand tokens, key screens, status pill colors, and accessibility features implemented.
5. Test Plan — outlining the test strategy, module coverage matrix, workflow transition test cases, RBAC test cases, and smoke test checklist.

Please generate each document fully, without placeholders or summaries, matching the exact implementation we built.
`;

export const CapstoneWorkspace: React.FC = () => {
  const { currentUser, addToast, submissions } = useApp();
  const navigate = useNavigate();

  const [selection, setSelection] = useState<CapstoneSelection | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('brief');
  const [promptCopied, setPromptCopied] = useState(false);
  const [deliverablesPromptCopied, setDeliverablesPromptCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  const [meetingRequest, setMeetingRequest] = useState<any | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const isPremium = currentUser?.isPremiumUpgraded === true;

  const isCurrentCapstoneCertified = useMemo(() => {
    if (!currentUser || !selection) return false;
    return submissions.some(s => 
      (s.capstoneId === selection.capstoneId) &&
      (s.learnerUid === currentUser.uid || s.userId === currentUser.uid) &&
      (s.status?.toLowerCase() === 'certified' || s.status?.toLowerCase() === 'hire_eligible')
    );
  }, [currentUser, selection, submissions]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const db = getFirebaseDb();
    if (!db) return;
    get(ref(db, `meetingRequests/${currentUser.uid}`)).then((snap) => {
      if (snap.exists()) {
        setMeetingRequest(snap.val());
      }
    });
  }, [currentUser]);

  // Load selection + checklist
  useEffect(() => {
    if (!currentUser?.uid) { setLoading(false); return; }
    const uid = currentUser.uid;

    const localSel = localStorage.getItem(LOCAL_SELECTION_KEY(uid));
    if (localSel) {
      try { setSelection(JSON.parse(localSel)); } catch { /* ignore */ }
    }

    const db = getFirebaseDb();
    if (db) {
      get(ref(db, `capstoneSelections/${uid}`))
        .then((snap) => {
          if (snap.exists()) {
            const remote = snap.val();
            setSelection(remote);
            localStorage.setItem(LOCAL_SELECTION_KEY(uid), JSON.stringify(remote));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const handleAcknowledge = () => {
    setAcknowledged(true);
  };

  useEffect(() => {
    if (!currentUser?.uid || !selection) return;
    const uid = currentUser.uid;
    const capId = selection.capstoneId;

    const localProg = localStorage.getItem(LOCAL_PROGRESS_KEY(uid, capId));
    if (localProg) {
      try { setChecklist((JSON.parse(localProg) as ChecklistState).items || {}); } catch { /* ignore */ }
    }

    const db = getFirebaseDb();
    if (db) {
      get(ref(db, `capstoneProgress/${uid}`))
        .then((snap) => {
          if (snap.exists()) {
            const remote = snap.val() as ChecklistState;
            if (remote.capstoneId === capId && remote.items) {
              setChecklist(remote.items);
              localStorage.setItem(LOCAL_PROGRESS_KEY(uid, capId), JSON.stringify(remote));
            }
          }
        })
        .catch(() => { /* fine — local is fallback */ });
    }
  }, [currentUser?.uid, selection?.capstoneId]);

  const capstone = useMemo(() => {
    if (!selection) return null;
    return CAPSTONES.find((c) => c.id === selection.capstoneId) || null;
  }, [selection]);

  const t7Prompt = useMemo(() => capstone ? buildT7Prompt(capstone) : '', [capstone]);
  const deliverablesPrompt = useMemo(() => capstone ? buildDeliverablesPrompt(capstone) : '', [capstone]);

  const totalTasks = BUILD_DAYS.reduce((sum, d) => sum + d.tasks.length, 0);
  const doneTasks = Object.values(checklist).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const toggleTask = async (key: string) => {
    if (isCurrentCapstoneCertified) {
      addToast('This project is completed & certified. Progress is locked.', 'warning');
      return;
    }
    if (!currentUser?.uid || !selection) return;
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);

    const payload: ChecklistState = {
      capstoneId: selection.capstoneId,
      items: next,
      updatedAt: Date.now()
    };
    localStorage.setItem(LOCAL_PROGRESS_KEY(currentUser.uid, selection.capstoneId), JSON.stringify(payload));

    const db = getFirebaseDb();
    if (db) {
      try {
        await set(ref(db, `capstoneProgress/${currentUser.uid}`), payload);
      } catch (err) {
        console.error('Progress save failed:', err);
      }
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(t7Prompt);
      setPromptCopied(true);
      addToast('T7 Master Prompt copied — paste into Claude / Copilot to begin', 'success');
      setTimeout(() => setPromptCopied(false), 2400);
    } catch {
      addToast('Could not copy automatically. Select the text and copy manually.', 'warning');
    }
  };

  const copyDeliverablesPrompt = async () => {
    try {
      await navigator.clipboard.writeText(deliverablesPrompt);
      setDeliverablesPromptCopied(true);
      addToast('Deliverables Generation Prompt copied!', 'success');
      setTimeout(() => setDeliverablesPromptCopied(false), 2400);
    } catch {
      addToast('Could not copy automatically. Select the text and copy manually.', 'warning');
    }
  };



  // ─── No user ───────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-extrabold mb-2">Sign in to open your workspace</h1>
          <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center text-[var(--text-secondary)] text-sm">
        Loading your capstone workspace…
      </div>
    );
  }

  if (!capstone) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-2xl p-10 text-center">
          <Award className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold mb-2">No capstone locked yet</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Visit the Capstone Library to browse all 30 capstones and lock the one you'll build for certification.
          </p>
          <button
            onClick={() => navigate('/capstone')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            <BookOpen className="h-4 w-4" /> Browse Capstone Library
          </button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'brief',     label: 'Capstone Brief',     icon: Target },
    { id: 'prompt',    label: 'T7 Master Prompt',   icon: Sparkles },
    { id: 'checklist', label: '5-Day Build Plan',   icon: ListChecks },
    { id: 'docs',      label: 'Design Doc Templates', icon: FileText },
    { id: 'next',      label: "What's Next",        icon: Send }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

      {/* Learning Discipline Acknowledgement Pop-up */}
      <WorkspaceAcknowledgementModal
        isOpen={!acknowledged}
        onAcknowledge={handleAcknowledge}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <button
          onClick={() => navigate('/capstone')}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Capstone Library
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Workspace · {capstone.id} locked
        </div>
      </div>

      {/* Title Card */}
      <div className="glass-card rounded-2xl p-6 mb-6 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              {capstone.id} · {capstone.domain} · {capstone.complexity}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{capstone.title}</h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">{capstone.brief}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Build Progress</div>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{progressPct}%</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{doneTasks} / {totalTasks} tasks</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5 border-b border-[var(--border-color)]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {isCurrentCapstoneCertified && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
          <span>This project is completed and certified! The workspace is in View-Only mode. Visit the <a href="/capstone" className="underline text-emerald-300 hover:text-emerald-200">Capstone Library</a> to select another capstone to start a new project.</span>
        </div>
      )}

      {/* Tab Body */}
      {activeTab === 'brief' && (
        <BriefTab cap={capstone} />
      )}

      {activeTab === 'prompt' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-400" /> T7 Master Prompt
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                The reusable session-opener prompt for your capstone — pre-filled with your locked capstone's brief, workflow, rubric, and submission requirements. Paste this into your Twin (AI builder — Claude, Copilot, or whichever AI engine you use) on Day 1 before writing a single line of code. Your Twin builds. You orchestrate.
              </p>
            </div>
            <button
              onClick={copyPrompt}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold shadow-md transition-all ${
                promptCopied
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110'
              }`}
            >
              {promptCopied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy Prompt</>}
            </button>
          </div>
          <pre className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] p-4 text-[11px] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto font-mono">
{t7Prompt}
          </pre>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="text-xs text-[var(--text-secondary)] mb-2">
            Tick each task as you complete it. Progress saves to your candidate profile and persists across devices.
          </div>
          {BUILD_DAYS.map((day) => {
            const dayTasks = day.tasks;
            const dayDone = dayTasks.filter((_, i) => checklist[`day${day.day}_t${i}`]).length;
            const dayPct = dayTasks.length > 0 ? Math.round((dayDone / dayTasks.length) * 100) : 0;
            return (
              <div key={day.day} className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-extrabold">
                      D{day.day}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">Day {day.day}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{day.label}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-indigo-400">{dayPct}%</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{dayDone}/{dayTasks.length} done</div>
                  </div>
                </div>
                <div className="space-y-1.5 pl-1">
                  {dayTasks.map((task, i) => {
                    const key = `day${day.day}_t${i}`;
                    const checked = !!checklist[key];
                    return (
                      <label key={key} className="flex items-start gap-3 cursor-pointer group py-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isCurrentCapstoneCertified}
                          onChange={() => toggleTask(key)}
                          className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-indigo-500 focus:ring-indigo-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-xs leading-relaxed ${checked ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)] group-hover:text-indigo-400'} transition-colors`}>
                          {task}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="glass-card rounded-2xl p-6 text-left">
          <div className="flex items-center gap-2 mb-3 text-amber-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
              Deliverables Generation Process
            </h2>
          </div>
          
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mb-6 text-xs text-indigo-300 leading-relaxed space-y-2">
            <p>
              <strong>IMPORTANT:</strong> Learners are <strong>not</strong> supposed to download pre-defined deliverables before writing code. Instead, you must build the application first.
            </p>
            <p>
              After the successful build of your application, use the prompt below to generate these final 5 deliverables from your Twin (AI builder) for client review and audit purposes. These generated documents should be attached in the final <strong>Submit your Capstone</strong> screen.
            </p>
          </div>

          <div className="flex items-start justify-between gap-4 mb-3 border-t border-[var(--border-color)] pt-5">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-400" /> Deliverables Generation Prompt
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Copy and run this prompt against your Twin (AI builder) once the application is fully built to generate the final audit-ready design documentation.
              </p>
            </div>
            <button
              onClick={copyDeliverablesPrompt}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold shadow-md transition-all ${
                deliverablesPromptCopied
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110'
              }`}
            >
              {deliverablesPromptCopied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy Prompt</>}
            </button>
          </div>
          
          <pre className="mt-2 mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] p-4 text-[11px] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-auto font-mono">
{deliverablesPrompt}
          </pre>

          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            5 Required Deliverables to Generate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Target className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">FDD · Functional Design Document</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Describes business problems, system actors, detailed screen paths, application workflows, and functional acceptance criteria.</p>
            </div>
            
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Hammer className="h-4 w-4" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">TDD · Technical Design Document</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Specifies component hierarchy, custom hooks, global &amp; local state strategy, backend service wrappers, and OGE validation hooks.</p>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <WorkflowIcon className="h-4 w-4" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">DB Design · Firebase RTDB Tree</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Defines the database schema tree, data structures for transaction entities, indexed query paths, and Firebase security rules.</p>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">UI Specs · Brand &amp; Screens</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Details color palette brand tokens, key user interface designs, dynamic status pills styling, and accessibility standards.</p>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <CheckCircle2 className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">Test Plan · Unit, Integration &amp; Smoke</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Contains unit test strategies, Firebase Emulator integration tests, role-based access control (RBAC) tests, and a manual smoke test checklist for deployment validation.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'next' && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-3">
            <Send className="h-4 w-4 text-indigo-400" /> What's Next
          </h2>
          <ol className="space-y-3 text-sm">
            <NextStep n={1} title="Complete the 5-day build" body="Work through the Day 1–5 checklist in your IDE. Commit per validated component (M5 discipline). Push end-of-day." />
            <NextStep n={2} title="Deploy to Firebase Hosting" body="Run firebase deploy --only hosting from your project root. Confirm your live URL returns 200." />
            <NextStep n={3} title="Polish the repository" body="README with project intent, screenshots, run instructions. DESIGN.md naming OGE + 5 design docs (already downloaded above)." />
            <li className="flex items-start gap-3">
              <div className="shrink-0 h-7 w-7 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold flex items-center justify-center">4</div>
              <div className="flex-1">
                <div className="font-extrabold text-[var(--text-primary)] text-sm mb-0.5">Submit your capstone</div>
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Provide GitHub URL, Firebase URL, README link, optional supporting docs and workflow diagram. We auto-assign a reviewer and email them your package.
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isCurrentCapstoneCertified ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[11px] font-extrabold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed & Certified (View-Only)
                    </div>
                  ) : (
                    <>
                      {!isPremium && (
                        <button
                          onClick={() => navigate(`/capstone/submit?id=${capstone.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-md text-[11px] font-extrabold shadow-sm transition-all cursor-pointer"
                        >
                          Open Submission Form →
                        </button>
                      )}

                      {isPremium && (
                        <button
                          onClick={() => setShowMeetingModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white rounded-md text-[11px] font-extrabold shadow-sm transition-all cursor-pointer animate-pulse"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Set up meeting with SME
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
            <NextStep n={5} title="Review & feedback" body="Two-tier review: deterministic auto-checks (instant) + Claude-Haiku rubric scoring + human reviewer final decision. You'll get a detailed report via email." />
            <NextStep n={6} title="Certification decision" body="≥85 Outstanding · ≥70 Pass · 50–69 Rework · <50 Rebuild. Pass = certificate unlocked. Rework = resubmit after fixes." />
          </ol>
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300 leading-relaxed">
            <strong className="text-indigo-400">Phase 3 coming soon:</strong> The submission form, supporting-doc uploads, EmailJS routing, and reviewer assignment ship next. Your locked capstone and checklist progress carry over — no rework needed.
          </div>
        </div>
      )}
      {showMeetingModal && capstone && (
        <MeetingRequestModal
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          currentUser={currentUser}
          capstone={capstone}
          existingRequest={meetingRequest}
          onSubmitted={(req) => setMeetingRequest(req)}
        />
      )}
    </div>
  );
};

// ─── WorkspaceAcknowledgementModal ───────────────────────────────────────────
const WorkspaceAcknowledgementModal: React.FC<{
  isOpen: boolean;
  onAcknowledge: () => void;
}> = ({ isOpen, onAcknowledge }) => {
  const [pledgeChecked, setPledgeChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl border border-indigo-500/30 rounded-2xl bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        
        {/* Punchline Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
            OrchestrAI Academy Lead Certification
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Don't outsource your learning.
          </h1>
        </div>

        {/* Philosophy Core */}
        <div className="space-y-4 text-xs leading-relaxed text-[var(--text-secondary)] text-left">
          <p>
            The whole objective of this <strong>OrchestrAI</strong> approach is to learn from your Twin (AI builder) and build in parallel. As the OrchestrAI Lead, you must actively evaluate, guide, and take full ownership and accountability of the application.
          </p>
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 font-sans">
            <strong>Warning:</strong> It is not about simply giving a prompt to your Twin and spending time on social media or other distractions. True engineering requires active co-creation, validation, and deep focus.
          </div>
          
          <p>
            You must brainstorm and align with the AI <strong>before</strong> building anything. Make sure you understand exactly what the AI built, why it built it that way, and how you can evaluate and repeat the OrchestrAI framework process.
          </p>
          
          {/* Key Tips */}
          <div className="border-t border-[var(--border-color)] pt-4 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Key Tips for Success:
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">💡</span>
                <span><strong>Challenge the Twin:</strong> Ask your Twin to explain its architectural decisions, security rules, and choice of hooks. Never copy-paste blindly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">📂</span>
                <span><strong>Commit per Validated Component:</strong> Keep commits clean and atomic. Test each component before staging or pushing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">🛡️</span>
                <span><strong>Enforce OGE:</strong> Verify that Observability (audit logs), Guardrails (validators), and Evaluation (tests) are actively implemented in every component.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">⚡</span>
                <span><strong>Local Emulators:</strong> Always test changes locally in the Firebase Emulator environment before deploying. You are the Lead Architect; you own the code.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Checkbox & Button */}
        <div className="border-t border-[var(--border-color)] pt-6 mt-6 text-left">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={pledgeChecked}
              onChange={(e) => setPledgeChecked(e.target.checked)}
              className="mt-0.5 h-4.5 w-4.5 rounded border-[var(--border-color)] text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
            />
            <span className="text-xs text-[var(--text-primary)] font-semibold select-none group-hover:text-indigo-400 transition-colors">
              I agree to take ownership of my learning, brainstorm actively with the AI, and follow the build discipline.
            </span>
          </label>

          <button
            onClick={onAcknowledge}
            disabled={!pledgeChecked}
            className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer text-center animate-in duration-200"
          >
            Acknowledge &amp; Proceed to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Subcomponents ──────────────────────────────────────────────────────────

const BriefTab: React.FC<{ cap: CapstoneItem }> = ({ cap }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 space-y-4">
      <PanelBox icon={<Target className="h-4 w-4" />} title="Business Brief">
        <p className="text-sm leading-relaxed">{cap.brief}</p>
      </PanelBox>
      <PanelBox icon={<WorkflowIcon className="h-4 w-4" />} title="Workflow States">
        <div className="flex flex-wrap items-center gap-2">
          {cap.workflow.map((w, i) => (
            <React.Fragment key={w}>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">{w}</span>
              {i < cap.workflow.length - 1 && <ChevronRight className="h-3 w-3 text-[var(--text-secondary)]" />}
            </React.Fragment>
          ))}
        </div>
      </PanelBox>
      <PanelBox icon={<Hammer className="h-4 w-4" />} title={`Trainer Extension — ${cap.trainerExtension}`}>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          The extension is what lifts your score from <span className="text-emerald-400 font-bold">Pass (≥70)</span> to <span className="text-emerald-400 font-bold">Outstanding (≥85)</span>. Build it after the 9 mandatory modules are stable.
        </p>
      </PanelBox>
    </div>
    <div className="space-y-4">
      <PanelBox icon={<Calendar className="h-4 w-4" />} title="5-Day Plan">
        <ul className="text-xs space-y-1.5">
          <li><strong>Day 1:</strong> {BUILD_PLAN.day1}</li>
          <li><strong>Day 2:</strong> {BUILD_PLAN.day2}</li>
          <li><strong>Day 3:</strong> {BUILD_PLAN.day3}</li>
          <li><strong>Day 4:</strong> {BUILD_PLAN.day4}</li>
          <li><strong>Day 5:</strong> {BUILD_PLAN.day5}</li>
        </ul>
      </PanelBox>
      <PanelBox icon={<FileText className="h-4 w-4" />} title="Quick Facts">
        <div className="text-xs space-y-1.5">
          <div><strong>Transaction:</strong> {cap.transactionEntity}</div>
          <div><strong>Actors:</strong> {cap.actors.join(', ')}</div>
          <div><strong>Masters:</strong> {cap.masters.join(', ')}</div>
        </div>
      </PanelBox>
    </div>
  </div>
);

const PanelBox: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
    <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
    </div>
    {children}
  </div>
);



const NextStep: React.FC<{ n: number; title: string; body: string; actionLabel?: string; onAction?: () => void }> = ({ n, title, body, actionLabel, onAction }) => (
  <li className="flex items-start gap-3">
    <div className="shrink-0 h-7 w-7 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold flex items-center justify-center">{n}</div>
    <div className="flex-1">
      <div className="font-extrabold text-[var(--text-primary)] text-sm mb-0.5">{title}</div>
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{body}</div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-md text-[11px] font-extrabold shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  </li>
);

const MeetingRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  capstone: CapstoneItem;
  existingRequest: any;
  onSubmitted: (req: any) => void;
}> = ({ isOpen, onClose, currentUser, capstone, existingRequest, onSubmitted }) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useApp();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      if (!db) return;
      const newRequest = {
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        capstoneId: capstone.id,
        capstoneTitle: capstone.title,
        requestedAt: Date.now(),
        status: 'PENDING',
        notes,
        meetingLink: '',
        scheduledAt: ''
      };
      await set(ref(db, `meetingRequests/${currentUser.uid}`), newRequest);
      onSubmitted(newRequest);
      addToast('Meeting request submitted successfully! Admin will schedule and update you.', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to submit request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
          <Calendar className="h-5 w-5 text-indigo-400" />
          SME Meeting Request (Premium Users)
        </h3>

        {existingRequest ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Meeting Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                  existingRequest.status === 'SCHEDULED' 
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                    : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500'
                }`}>
                  {existingRequest.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {existingRequest.status === 'SCHEDULED' 
                  ? `Your meeting has been scheduled! Join using the link below at the scheduled time.`
                  : `Your request is submitted. The Admin/SME will schedule a Google Meet/Teams call and paste the link here.`}
              </p>
              {existingRequest.scheduledAt && (
                <div className="text-xs text-[var(--text-primary)] font-bold">
                  Scheduled Time: {existingRequest.scheduledAt}
                </div>
              )}
              {existingRequest.meetingLink && (
                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                  <a 
                    href={existingRequest.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all"
                  >
                    Join Meeting Link
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-[var(--surface-sunken)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-sans text-left">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              As a Premium user, you can request a 1-on-1 virtual design review meeting with an SME to evaluate your codebase, architectures, and deployments.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Meeting Focus &amp; Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="form-input resize-none w-full border border-[var(--border-color)] bg-[var(--bg-card)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                placeholder="List topics or areas you would like the SME to review (e.g. database schema, auth logic, excel reports integration)..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-[var(--surface-sunken)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !notes.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Submitting…' : 'Request Meeting'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
