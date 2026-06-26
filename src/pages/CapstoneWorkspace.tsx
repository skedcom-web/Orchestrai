import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import {
  Award, ArrowLeft, Copy, Check, Download, ListChecks, FileText, Sparkles,
  Calendar, Target, BookOpen, Hammer, Send, ChevronRight, CheckCircle2, Workflow as WorkflowIcon
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

START BY PROPOSING THE 5 DESIGN DOCUMENTS for my review BEFORE any code generation begins:
1. FDD (Functional Design Document) — actors, screens, flows
2. TDD (Technical Design Document) — components, hooks, state, services
3. DB Design — RTDB tree structure with sample payloads
4. UI Specs — wireframes, brand tokens, key interactions
5. Test Plan — unit + integration + smoke tests per module

Wait for my approval on each design doc before moving to the next.
`;

const buildFDD = (cap: CapstoneItem) => `# FDD — Functional Design Document
## ${cap.id} · ${cap.title}

**Domain:** ${cap.domain}
**Author:** [Your name]
**Last updated:** ${new Date().toISOString().split('T')[0]}

---

## 1 · Business Problem
${cap.brief}

## 2 · Actors
${cap.actors.map(a => `- **${a}** — [responsibilities]`).join('\n')}

## 3 · Universal Roles (RBAC)
${UNIVERSAL_ROLES.map(r => `- **${r}** — [allowed actions]`).join('\n')}

## 4 · Screens (per v6 manual §6)
1. Login
2. Dashboard
3. Masters List (one per master entity)
4. Masters Create / Edit
5. Transactions List
6. Transaction Create / Edit
7. Transaction Detail (with status timeline + comments + attachments)
8. Reports
9. Users
10. Roles
11. Settings

## 5 · Workflow
${cap.workflow.map((w, i, arr) => `${i+1}. **${w}** ${i < arr.length - 1 ? `→ ${arr[i+1]}` : '(terminal)'}`).join('\n')}

## 6 · Functional Acceptance Criteria
- [ ] Each actor can perform their listed responsibilities and no others
- [ ] All workflow transitions are enforced server-side (no client-only checks)
- [ ] Trainer Extension implemented: **${cap.trainerExtension}**
- [ ] All 3 universal reports generated correctly: ${UNIVERSAL_REPORTS.join(', ')}
- [ ] Application deployed to Firebase Hosting with public URL

## 7 · Out of Scope (v1)
- [list anything explicitly deferred]
`;

const buildTDD = (cap: CapstoneItem) => `# TDD — Technical Design Document
## ${cap.id} · ${cap.title}

---

## 1 · Tech Stack
- React 19 + RR7 + TypeScript 6
- Tailwind v4 + Lucide
- Firebase v12 (Auth + RTDB + Storage + Hosting)
- Vite 8 (Rolldown)

## 2 · Component Tree
\`\`\`
App
├── AuthProvider
├── AppShell (Sidebar + Header)
│   ├── Dashboard
│   ├── Masters/
│   │   ${cap.masters.map(m => `├── ${m}List → ${m}Form`).join('\n│   │   ')}
│   ├── Transactions/
│   │   ├── ${cap.transactionEntity}List
│   │   ├── ${cap.transactionEntity}Form
│   │   └── ${cap.transactionEntity}Detail
│   ├── Reports/
│   │   ├── SummaryReport
│   │   ├── StatusReport
│   │   └── ActivityReport
│   └── Admin/ (Users · Roles · Settings)
\`\`\`

## 3 · Custom Hooks
- \`useAuth()\` — current user + role
- \`useRTDB<T>(path)\` — generic RTDB read/write with loading states
- \`useRBAC(action)\` — gate UI elements

## 4 · State Strategy
- React Context for current user + role
- Local component state for forms
- RTDB as system-of-record; no Redux

## 5 · Services
- \`authService\` — Firebase Auth wrappers
- \`storageService\` — attachments upload with type/size guards
- \`workflowService\` — status transition validation
- \`reportService\` — Excel + PDF generation

## 6 · OGE Hooks
- **Observability:** auditLogs/{uid}_{ts} on every write
- **Guardrails:** workflowService validates every status change
- **Evaluation:** smoke test script in /scripts runs against deployed URL
`;

const buildDBDesign = (cap: CapstoneItem) => `# DB Design — Firebase Realtime Database
## ${cap.id} · ${cap.title}

---

## RTDB Tree

\`\`\`
/users/
  {uid}/ { email, name, role, createdAt }

/roles/
  Admin/ { perms: [...] }
  Manager/ { perms: [...] }
  User/ { perms: [...] }

/masters/
${cap.masters.map(m => `  ${m.toLowerCase().replace(/\s+/g, '_')}/
    {id}/ { name, code, active, createdAt, createdBy }`).join('\n')}

/transactions/
  ${cap.transactionEntity.toLowerCase().replace(/\s+/g, '_')}/
    {id}/ {
      // master FKs:
${cap.masters.map(m => `      ${m.toLowerCase().replace(/\s+/g, '_')}Id,`).join('\n')}
      status,             // one of: ${cap.workflow.join(' | ')}
      assignedTo, createdBy, createdAt, updatedAt
    }

/comments/
  {transactionId}/
    {commentId}/ { text, author, createdAt }

/attachments/
  {transactionId}/
    {attachmentId}/ { fileName, storageUrl, size, mimeType, uploadedBy, uploadedAt }

/auditLogs/
  {entry-id}/ {
    actor, action, target, beforeStatus, afterStatus, timestamp
  }

/settings/
  appName, theme, contactEmail, ...
\`\`\`

## Indexed Queries
- \`/transactions/${cap.transactionEntity.toLowerCase().replace(/\s+/g, '_')}\` indexed on \`status\`, \`assignedTo\`, \`createdAt\`
- \`/auditLogs\` indexed on \`timestamp\` (descending)

## Security Rules (skeleton)
\`\`\`
{
  "rules": {
    "transactions": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() == 'Admin' || root.child('users').child(auth.uid).child('role').val() == 'Manager')"
    },
    "users": { "$uid": { ".write": "auth.uid == $uid" } }
  }
}
\`\`\`
`;

const buildUISpecs = (cap: CapstoneItem) => `# UI Specs
## ${cap.id} · ${cap.title}

---

## 1 · Brand Tokens
- Primary: indigo-500 (#6366f1)
- Accent: purple-600 (#9333ea)
- Surface: slate-50 (light) · slate-900 (dark)
- Radius: rounded-xl (12px) for cards, rounded-lg (8px) for inputs
- Font: Inter (UI), JetBrains Mono (code)

## 2 · Key Screens

### Login
- Centered card, logo top
- Email + Password fields
- "Sign In" CTA + "Forgot password" link

### Dashboard
- 4 KPI cards top: Total ${cap.transactionEntity}s · Pending · This Week · Closed
- Recent ${cap.transactionEntity}s table (10 rows, click → detail)
- Status distribution donut chart

### ${cap.transactionEntity} List
- Filters: status dropdown · date range · master filters (${cap.masters.join(', ')})
- Table with: id, key fields, status pill, assigned to, created at
- Pagination (50/page)
- "New ${cap.transactionEntity}" CTA top-right (Manager/Admin only)

### ${cap.transactionEntity} Detail
- Header: id + status pill + actions dropdown (transition status)
- Tabs: Details · Comments · Attachments · Audit
- Status timeline visualisation (${cap.workflow.length} states)

### Reports
- Tabs for each report type
- Date range + filter controls
- Export buttons: Excel · PDF
- Inline preview table

## 3 · Status Pills (color mapping)
${cap.workflow.map((w, i) => {
  const colors = ['amber', 'cyan', 'indigo', 'emerald', 'slate'];
  return `- ${w} → ${colors[i % colors.length]}`;
}).join('\n')}

## 4 · Accessibility
- All actions keyboard-reachable
- aria-labels on icon-only buttons
- Color contrast ≥ AA on body text
- Focus rings visible
`;

const buildTestPlan = (cap: CapstoneItem) => `# Test Plan
## ${cap.id} · ${cap.title}

---

## 1 · Test Strategy
- **Unit tests** — pure functions (workflow validator, report formatters)
- **Integration tests** — RTDB read/write paths via Firebase Emulator
- **Smoke tests** — end-to-end click-through on deployed URL

## 2 · Module Coverage Matrix

| Module | Unit | Integration | Smoke |
|---|---|---|---|
| Authentication       | ✓ | ✓ | ✓ |
| Dashboard            |   | ✓ | ✓ |
| Master Data          | ✓ | ✓ | ✓ |
| Transactions         | ✓ | ✓ | ✓ |
| **Workflow Engine**  | ✓ | ✓ | ✓ |
| Comments             |   | ✓ | ✓ |
| Attachments          | ✓ | ✓ | ✓ |
| Reports              | ✓ | ✓ |   |
| Administration / RBAC | ✓ | ✓ | ✓ |

## 3 · Workflow Transition Tests (highest-weight category — 20 pts)

For ${cap.transactionEntity}, test every valid + invalid transition:

${cap.workflow.map((from, i) => {
  const to = cap.workflow[i + 1];
  return to
    ? `- ✓ Valid: **${from} → ${to}**`
    : `- ✓ Terminal: **${from}** (cannot transition further)`;
}).join('\n')}
- ✗ Invalid: any non-adjacent transition (e.g. skip a state)
- ✗ Invalid: backwards transition (unless explicitly allowed)

## 4 · RBAC Tests
- User role: can create ${cap.transactionEntity}, cannot delete masters
- Manager role: can approve/transition, cannot manage users
- Admin role: full access

## 5 · Smoke Test Checklist (run after every deploy)
1. Sign in as Admin
2. Create one of each master
3. Create a ${cap.transactionEntity}
4. Walk it through all ${cap.workflow.length} workflow states
5. Add a comment + attach a file
6. Generate each of the 3 reports
7. Sign out, sign in as User, confirm RBAC blocks restricted actions

## 6 · Acceptance
All checks pass = ready to submit for OrchestrAI Lead Certification review.
`;

export const CapstoneWorkspace: React.FC = () => {
  const { currentUser, addToast } = useApp();
  const navigate = useNavigate();

  const [selection, setSelection] = useState<CapstoneSelection | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('brief');
  const [promptCopied, setPromptCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const totalTasks = BUILD_DAYS.reduce((sum, d) => sum + d.tasks.length, 0);
  const doneTasks = Object.values(checklist).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const toggleTask = async (key: string) => {
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

  const downloadMd = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                          onChange={() => toggleTask(key)}
                          className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
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
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-indigo-400" /> 5 Design Document Templates
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-5">
            Each template is pre-filled with your locked capstone's specifics (actors, masters, workflow). Download, complete, get them reviewed (by you or your Twin — your AI builder) BEFORE writing any code — exactly the discipline taught in Module 3.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DocCard
              icon={<Target className="h-4 w-4" />}
              title="FDD · Functional Design Document"
              subtitle="Actors · Screens · Workflow · Acceptance Criteria"
              onDownload={() => downloadMd(`${capstone.id}_FDD.md`, buildFDD(capstone))}
            />
            <DocCard
              icon={<Hammer className="h-4 w-4" />}
              title="TDD · Technical Design Document"
              subtitle="Components · Hooks · Services · OGE Hooks"
              onDownload={() => downloadMd(`${capstone.id}_TDD.md`, buildTDD(capstone))}
            />
            <DocCard
              icon={<WorkflowIcon className="h-4 w-4" />}
              title="DB Design · Firebase RTDB Tree"
              subtitle="Schema · Indexes · Security Rules"
              onDownload={() => downloadMd(`${capstone.id}_DB_Design.md`, buildDBDesign(capstone))}
            />
            <DocCard
              icon={<BookOpen className="h-4 w-4" />}
              title="UI Specs · Brand & Screens"
              subtitle="Tokens · Key Screens · Status Pills · Accessibility"
              onDownload={() => downloadMd(`${capstone.id}_UI_Specs.md`, buildUISpecs(capstone))}
            />
            <DocCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Test Plan · Unit · Integration · Smoke"
              subtitle={`Workflow tests for ${capstone.workflow.length} states · RBAC tests · Smoke checklist`}
              onDownload={() => downloadMd(`${capstone.id}_Test_Plan.md`, buildTestPlan(capstone))}
            />
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
            <NextStep n={4} title="Submit your capstone" body="Provide GitHub URL, Firebase URL, README link, optional supporting docs and workflow diagram. We auto-assign a reviewer and email them your package." actionLabel="Open Submission Form →" onAction={() => navigate('/capstone/submit')} />
            <NextStep n={5} title="Review & feedback" body="Two-tier review: deterministic auto-checks (instant) + Claude-Haiku rubric scoring + human reviewer final decision. You'll get a detailed report via email." />
            <NextStep n={6} title="Certification decision" body="≥85 Outstanding · ≥70 Pass · 50–69 Rework · <50 Rebuild. Pass = certificate unlocked. Rework = resubmit after fixes." />
          </ol>
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300 leading-relaxed">
            <strong className="text-indigo-400">Phase 3 coming soon:</strong> The submission form, supporting-doc uploads, EmailJS routing, and reviewer assignment ship next. Your locked capstone and checklist progress carry over — no rework needed.
          </div>
        </div>
      )}
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

const DocCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onDownload: () => void }> = ({ icon, title, subtitle, onDownload }) => (
  <button
    onClick={onDownload}
    className="text-left rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)]/40 p-4 hover:border-indigo-500/30 hover:bg-[var(--surface-sunken)]/60 transition-all group"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          {icon}
          <span className="text-xs font-extrabold text-[var(--text-primary)]">{title}</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{subtitle}</p>
      </div>
      <div className="text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors">
        <Download className="h-4 w-4" />
      </div>
    </div>
  </button>
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
