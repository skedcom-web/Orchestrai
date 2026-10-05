# Module 7 — Practical Demo · Implementation Blueprint **v0.2 (LOCKED — ready to build)**

**Source of truth:** `OrchestrAI_Master_Capstone_Manual_v7.md` + `_v6.md` (capstone library)
**Capstone seed data:** [`Module7/capstones_seed.json`](./capstones_seed.json) — all 30 capstones structured
**Tech stack (locked):** React 19 + RR7 + TS 6 · Tailwind v4 · Firebase v12 (RTDB + **Storage**) · EmailJS · Vite 8 (Rolldown) · Lucide · **Anthropic SDK (`claude-haiku-4-5`) for Tier B scoring**
**Pedagogical contract (carried from M3–M6):** Orchestrate the AI. Don't outsource the learning. OGE remains the spine.

---

## 1 · What Module 7 *is*

NOT a slide deck. The **operational workflow** that takes a paid, M6-graduated learner from "I finished the 6 lessons" to "I have a graded certification with a real shipped app."

The platform owns 4 things:
1. **Capstone Library** (30 capstones, structured per [`capstones_seed.json`](./capstones_seed.json))
2. **Submission Pipeline** (form + URL validation + Firebase Storage uploads + EmailJS notification)
3. **Two-tier Review Engine** (deterministic auto-checks + Claude Haiku rubric scoring + reviewer-final decision)
4. **Feedback Loop** (auto-generated report email + Pass/Rework state machine + certificate unlock)

The learner owns everything between Capstone Selection and Submission. We provide the **T7 Master Prompt** as the kickstart artifact — same pattern as T1 / T2 from Module 3.

---

## 2 · The 6-stage flow → routes / components

| Stage | Route | Component | Persists |
|---|---|---|---|
| 1 · Capstone Selection | `/capstone` | `CapstoneLibrary` (30 cards, filter by domain/complexity) → `CapstoneDetail` → **"Lock this capstone"** | `capstoneSelections/{uid}` (RTDB) |
| 2 · Development | `/capstone/workspace` | `CapstoneWorkspace`: brief + T7 prompt copy-button + 5-day milestone checklist + downloadable design doc templates | `capstoneProgress/{uid}` (optional checklist state) |
| 3 · Deployment | `/capstone/deploy` | `DeploymentGuide` (manual + "verify URL reachable" button) | none |
| 4 · Submission | `/capstone/submit` | `SubmissionForm`: GitHub URL, Firebase URL, README URL, **supporting docs upload** (manual, test plan, design docs — Firebase Storage), workflow diagram URL | `submissions/{uid}_{capId}` (RTDB) + EmailJS template `submission_received` + assignment trigger |
| 5 · Review | `/admin/reviews` | `ReviewQueue` (assigned-to-me filter) → `ReviewDetail` (auto-score + Tier B suggestion + 9-category rubric scoring + final decision) | `reviews/{submissionId}` (RTDB) |
| 6 · Feedback → Pass/Rework | `/certification` (existing) | `ReviewReport` rendered + EmailJS template `decision_report` · cert unlock OR rework state flip | `submissions/{...}.status` |

---

## 3 · Firebase Realtime Database schema (additive — no breaking changes)

```
/capstones/                       ← seeded from capstones_seed.json (one-time admin button)
  CAP-01/ { ...all fields from seed }
  ...
  CAP-30/

/capstoneSelections/
  {uid}/ { capstoneId, selectedAt, status: 'in_progress' | 'submitted' | 'passed' | 'rework' }

/capstoneProgress/
  {uid}/ { milestone1Done, milestone2Done, ..., updatedAt }

/submissions/
  {uid}_{capstoneId}/ {
    githubUrl, firebaseUrl, readmeUrl, workflowDiagramUrl,
    supportingDocs: [{ name, storageUrl, uploadedAt }],
    submittedAt,
    status: 'pending_assignment' | 'assigned' | 'in_review' | 'decided',
    assignedReviewerUid, assignedAt
  }

/reviews/
  {submissionId}/ {
    autoChecks: {
      githubReachable, githubPublic, hasReadme, hasDesignDoc,
      firebaseReachable, commitCount, contributorMatches
    },
    autoScore: 0-100,
    tierBSuggestion: {
      perCategory: { authentication, dashboard, masterData, transactions, workflow, rbac, reports, deployment, documentation },
      rationale: { ...per category },
      generatedAt, model: 'claude-haiku-4-5'
    },
    manualScores: { ...same 9 keys, reviewer overrides },
    total, decision: 'outstanding' | 'pass' | 'rework' | 'rebuild',
    feedback: { strengths[], gaps[], reworkChecklist[] },
    reviewedBy, reviewedAt
  }

/reviewers/                       ← new node for multi-reviewer pool
  {reviewerUid}/ { name, email, domainsCovered[], activeAssignments, completedReviews }
```

Reuses existing AppContext / RTDB project. **+ Firebase Storage** added for supporting docs upload.

---

## 4 · Scoring rubric (v7 — the authoritative one)

```ts
const RUBRIC = {
  authentication: 10, dashboard: 10, masterData: 10,
  transactions: 15, workflow: 20, rbac: 15,
  reports: 10, deployment: 5, documentation: 5
}; // = 100  ✅

function decide(total: number) {
  if (total >= 85) return 'outstanding';
  if (total >= 70) return 'pass';
  if (total >= 50) return 'rework';
  return 'rebuild';
}
```

**Note:** v6 had a different (older) rubric — v7 wins per the user's explicit "single source of truth" statement. Workflow = 20 pts remains highest weight; reviewer UI surfaces workflow evidence first.

---

## 5 · Two-tier Review Engine — **both tiers shipping**

### Tier A — Deterministic (free, runs on submission)
- `fetch(githubUrl)` → 200 + github.com/* pattern
- GitHub API → repo public, default branch, commit count, README exists, optional DESIGN.md
- `fetch(firebaseUrl)` → 200 + `text/html`
- Output: `autoChecks{}` + baseline auto-score for Deployment (5) + Documentation (5) categories — pre-screens junk submissions before a human looks.

### Tier B — Claude Haiku rubric scoring (paid, runs on submission completion)
- Model: `claude-haiku-4-5` (cheapest reasoning model, perfect cost/quality fit for rubric scoring)
- Input: README text + `git ls-tree` (top-level file listing) + key file excerpts fetched via GitHub raw URLs (capped at ~50K tokens)
- Prompt: full v7 rubric + capstone acceptance criteria + ask for per-category score (0–max) with 1-sentence rationale per category
- Output: `tierBSuggestion{}` block written to `reviews/{id}` — appears as **suggested scores** in `ReviewDetail` that the assigned reviewer reviews/overrides

**Why both:** Tier A is the gatekeeper (catches incomplete submissions instantly, costs nothing). Tier B is the productivity multiplier (cuts reviewer time from ~30 min to ~10 min per submission by pre-filling the rubric with rationale). Reviewer always has final authority.

### Where the Anthropic key lives
Tier B requires server-side execution (don't ship `ANTHROPIC_API_KEY` to the browser). Options:
- **Recommended:** Firebase Cloud Function `scoreSubmissionTierB(submissionId)` — triggered on submission write. Key lives in Firebase functions config.
- Alternative: a tiny Node Express endpoint somewhere you already host.

---

## 6 · EmailJS templates needed (3)

| Template ID | Trigger | To | From | Variables |
|---|---|---|---|---|
| `submission_received_learner` | On submit | learner email | vthinkorchestrai@gmail.com | learnerName, capstoneTitle, submittedAt, githubUrl, firebaseUrl |
| `review_assignment_reviewer` | On assignment | assigned reviewer email | vthinkorchestrai@gmail.com | reviewerName, learnerName, capstoneTitle, submissionId, reviewLink, autoScore |
| `decision_report_learner` | On reviewer decision | learner email | vthinkorchestrai@gmail.com | learnerName, capstoneTitle, decision (outstanding/pass/rework/rebuild), total, perCategoryScores, strengths, gaps, reworkChecklist, certificateLink |

All three follow the existing `@emailjs/browser` integration pattern already in the codebase — just three new template IDs to create in the EmailJS dashboard.

---

## 7 · Multi-reviewer assignment

**Pool model:** Admin maintains a list of reviewers in `/reviewers` (name, email, domains they cover).

**Assignment algorithm (simple, ship this):** Round-robin per domain. On submission, pick the reviewer with `domainsCovered.includes(submission.capstone.domain)` and lowest `activeAssignments` count. Increment their counter; decrement on review completion.

**Reviewer UX:**
- `/admin/reviews` shows two tabs: **My Queue** (assigned to me, default) and **All Pending** (full unassigned/assigned list for visibility)
- Reviewer can reassign to another pool member (e.g. domain mismatch, conflict of interest)
- `ReviewDetail` shows: submission package + auto-checks + Tier B pre-fill + manual override fields per category + decision dropdown + free-form feedback

Solo-reviewer (just you) works fine on day 1 — assignment algorithm just always picks you. Adding more reviewers later = inserting rows into `/reviewers`. No code change needed.

---

## 8 · The T7 Master Prompt (new artifact — joins T1, T2)

The reusable prompt the learner copies into Claude/Copilot on Day 1 of their capstone. Rendered into `CapstoneWorkspace` with `{...}` slots filled from their locked capstone (and a "Copy T7 Prompt" button beside it).

```
You are my Twin (AI builder) — my AI co-engineer and the other half of every OrchestrAI engagement. I am the OrchestrAI Lead. You build. I orchestrate. Neither half ships without the other.

Engagement: I am building {capstone.title} as my OrchestrAI Lead Certification capstone.
Domain: {capstone.domain}
Brief: {capstone.brief}
Actors: {capstone.actors}
Masters: {capstone.masters}
Transaction Entity: {capstone.transactionEntity}
Workflow states: {capstone.workflow}
Required extension feature: {capstone.trainerExtension}

The mandate (verbatim from Module 3):
Quality is not a service. It is a mandate.
Every component must pass through OGE — Observability, Guardrails, Evaluation.

Tech stack (non-negotiable):
React 19 + React Router 7 + TypeScript 6
Tailwind v4 + Lucide
Firebase v12: Authentication, Realtime Database, Storage, Hosting
EmailJS for transactional emails (if needed)
Vite 8 with Rolldown bundler

Universal application architecture (from v6 manual §2):
9 mandatory modules: Authentication, Dashboard, Master Data, Transactions,
Workflow Engine, Comments, Attachments, Reports, Administration
3 mandatory roles: Admin, Manager, User
3 mandatory reports: Summary, Status, Activity

Build plan (5 days):
Day 1: Authentication, Layout, Routing
Day 2: Dashboard, Master Data
Day 3: Transactions
Day 4: Workflow, Comments, Attachments
Day 5: Reports, RBAC, Deployment, Documentation

Build discipline:
- I install all dependencies myself (you instruct, I execute)
- I commit per validated component (never squash, never bulk)
- I push to my GitHub repository at end of day
- You produce code in 8-component intent format: outcome, actor, validation,
  security, stack, acceptance, edge cases, data model

I will be graded against this rubric (out of 100):
Authentication 10 · Dashboard 10 · Master Data 10 · Transactions 15
Workflow 20 (highest — orchestration discipline shows here)
RBAC 15 · Reports 10 · Deployment 5 · Documentation 5

Decision thresholds: ≥85 Outstanding · ≥70 Pass · 50–69 Rework · <50 Rebuild

Mandatory submission package:
GitHub repo URL · Firebase live URL · README · Supporting docs · Workflow diagram

Start by proposing the 5 design documents (FDD, TDD, DB Design, UI Specs, Test Plan)
for my review before any code generation begins.
```

---

## 9 · Implementation phases (smallest-shippable-slice first)

| Phase | Ships | Effort | Unblocks |
|---|---|---|---|
| **P1** | Seed `/capstones` to RTDB · `CapstoneLibrary` browse · `CapstoneDetail` · "Lock" button | S (~2h) | Learners can browse & lock |
| **P2** | `CapstoneWorkspace` (brief + T7 prompt + checklist + design doc templates) | S (~2h) | Learners can start building |
| **P3** | `SubmissionForm` + Firebase Storage upload + RTDB write + EmailJS `submission_received` + round-robin assignment + EmailJS `review_assignment` | M (~4h) | Submissions flow in, reviewers notified |
| **P4** | Admin `ReviewQueue` + `ReviewDetail` + 9-category rubric + Decision Engine + EmailJS `decision_report` + certificate unlock + rework loop | M (~5h) | Full review cycle works end-to-end |
| **P5** | Auto-review Tier A (deterministic checks) runs on submission, writes to `reviews/{id}.autoChecks` | S (~2h) | Pre-screens junk, populates auto-score |
| **P6** | Auto-review Tier B (Firebase Function + Claude Haiku rubric scoring), writes to `reviews/{id}.tierBSuggestion` | M (~4h) | Reviewer time per submission drops ~3× |

Each phase ships → deploys → validates. P1+P2 alone = a usable "browse and start" experience, even with submission still unwired.

---

## 10 · Locked decisions (from user, this round)

| Question | Answer | Implication |
|---|---|---|
| Capstone definitions | v6.0 manual seeded into [`capstones_seed.json`](./capstones_seed.json) (30 capstones) | Ready — admin "Seed Capstones" button writes to RTDB |
| Reviewer email | `vthinkorchestrai@gmail.com` | EmailJS templates use this as `from` |
| Tier B (Claude scoring) | **Ship it** ("whatever is better") | Firebase Function + Anthropic SDK + `claude-haiku-4-5` |
| Payment gating | Already handled after M2 | M7 inherits — no new gating logic |
| Storage | No screenshots. Supporting docs upload (manual, test plan, design docs) | Firebase Storage added; `supportingDocs[]` field in submission |
| Reviewer pool | Multi-reviewer with assignment | `/reviewers` node + round-robin-by-domain assignment + reassign capability |

---

## 11 · What this blueprint deliberately does NOT include

- A code generator. We build component-by-component, committing per validation (eating our own dog food on M5's git discipline).
- A grading-by-AI-only path. Tier B is *suggestions*; the human reviewer's overrides are the system of record.
- A Module 8. v7 manual stops at certification — no further curriculum.

---

## Status

**Blueprint v0.2 — LOCKED. Ready to build.**

Approve and I'll lift **Phase 1** (seed + library + selection + lock) immediately — that's the smallest end-to-end slice and should ship + deploy in one focused session.

