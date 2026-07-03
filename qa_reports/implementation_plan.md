# Learner Feedback & Rating Workflow — Implementation Plan

## Overview
A full-stack feedback collection, analytics, and reporting system integrated into the OrchestrAI Certification Program. This covers 7-module-level feedback forms, a certification-level final survey, an analytics dashboard, an admin filter dashboard, and export (Excel/CSV/PDF).

---

## Architecture Decisions

> [!IMPORTANT]
> **Firebase Realtime Database** is the existing data store — all feedback is written there.
> **No backend server** — all logic runs in-browser using Firebase SDK + EmailJS.
> **Export** uses `xlsx` (for Excel/CSV) and `jspdf` + `jspdf-autotable` (for PDF) — both client-side.

---

## Database Schema

```
feedback/
  module_feedback/
    {uid}/
      {moduleId}/            ← one record per user per module
        rating: 1–5
        usefulness: string
        contentClarity: string
        learningOutcome: string
        likedMost: string
        improvements: string
        certBatch: string
        completedAt: number   (epoch ms)
        isAnonymous: boolean
        userId: string
        userName: string
        userEmail: string
        department?: string
        organization?: string

  cert_feedback/
    {uid}/                   ← one record per user
      overallRating: 1–5
      npsScore: 0–10
      mostValuableModule: string
      moduleNeedsImprovement: string
      confidenceImprovement: string
      advancedCertInterest: string
      biggestTakeaway: string
      testimonial?: string
      isAnonymous: boolean
      certBatch: string
      completedAt: number
      userId: string
      userName: string
      userEmail: string
      department?: string
      organization?: string
```

---

## New Files

### `src/pages/FeedbackForm.tsx` [NEW]
- Module feedback form (7 modules) — shown after each module completion
- Certification feedback form — shown after completing all 7 modules
- Auto-save to Firebase on every field change (debounced 800ms)
- Anonymous feedback toggle
- Star rating component with animation
- Progress indicator (which modules have been rated)
- Route: `/feedback`

### `src/pages/FeedbackAnalytics.tsx` [NEW]
- Analytics dashboard (admin-only view accessible via Admin panel tab)
- Cards: Avg Rating per Module, Overall Cert Rating, NPS Score, Completion Rate
- Charts: Module Satisfaction Ranking, Most Valuable Module bar, Lowest Rated Module
- Learner Confidence Improvement Score
- Word cloud-style Most Common Improvement Suggestions (text frequency)
- No external chart library — uses CSS-based bar charts (consistent with project style)

### `src/components/StarRating.tsx` [NEW]
- Reusable 1–5 animated star component
- Hover glow effect, filled/half/empty states
- Accessible with keyboard support

### `src/utils/feedbackExport.ts` [NEW]
- `exportToCSV(data)` — uses browser download with Blob
- `exportToExcel(data)` — uses `xlsx` library
- `exportToPDF(data)` — uses `jspdf` + `jspdf-autotable`

---

## Modified Files

### `src/App.tsx` [MODIFY]
- Add route `/feedback` → `<FeedbackForm />`

### `src/pages/Admin.tsx` [MODIFY]
- Add **"Feedback Analytics"** tab in the admin panel
- Embed `<FeedbackAnalytics />` component
- Admin tab shows filter controls (date range, module, learner, department, org)

### `src/pages/Modules.tsx` [MODIFY]
- After marking a module complete, prompt learner to submit module feedback
- Show a "Rate this Module" button/banner if feedback not yet given

### `src/context/AppContext.tsx` [MODIFY]
- Add `ModuleFeedback` and `CertFeedback` interfaces
- Export `MODULE_NAMES` constant for the 7 modules

---

## UI Requirements Addressed

| Requirement | Implementation |
|---|---|
| Mobile Responsive | Tailwind responsive classes throughout |
| Modern Card-Based Design | Uses existing `glass-card` design system |
| Progress Indicators | Module feedback status tracker (✓ rated / ○ pending) |
| Auto Save | Debounced `update()` call to Firebase on every state change |
| Anonymous Feedback | Toggle switch; if enabled, `userId`/`userName`/`email` stored as anonymous strings |

---

## Analytics Calculations

| Metric | Formula |
|---|---|
| **Average Rating per Module** | `sum(ratings) / count` for each moduleId |
| **NPS Score** | `(Promoters% - Detractors%)` where 9–10 = Promoter, 0–6 = Detractor |
| **Completion Rate** | `users who submitted cert feedback / total approved users` |
| **Learner Confidence Improvement** | `%` of users who chose Strongly Agree or Agree |
| **Most Common Improvements** | Client-side word frequency count of `improvements` textarea |

---

## Export Formats

| Format | Library | Notes |
|---|---|---|
| **CSV** | Native Blob/URL | No dependency needed |
| **Excel (.xlsx)** | `xlsx` (SheetJS) | `npm install xlsx` |
| **PDF** | `jspdf` + `jspdf-autotable` | `npm install jspdf jspdf-autotable` |

---

## Admin Filters

Available on the Feedback Analytics page:
- **Date Range** — `completedAt` timestamp range
- **Module** — filter module feedback by moduleId
- **Learner** — search by name or email
- **Department** — optional field on feedback form, filterable
- **Organization/College** — optional field, filterable

---

## Open Questions

> [!IMPORTANT]
> **When to trigger Module Feedback?**
> Option A: Show a modal immediately after marking a module as "Complete" (inline prompt).
> Option B: Show a dedicated `/feedback?module=N` page link from the Modules page.
> **Recommendation: Option A** (inline modal) for best conversion — least friction.

> [!IMPORTANT]
> **Certification Feedback Trigger?**
> After the user earns their certification (all 7 modules + capstone passed), show a mandatory feedback form before showing the certificate download page.
> Is this acceptable or should it be optional?

> [!NOTE]
> **Department/Organization fields** — are these pulled from the user's existing profile or collected fresh during the feedback form?

---

## Proposed Changes Summary

### [NEW] `src/pages/FeedbackForm.tsx`
### [NEW] `src/pages/FeedbackAnalytics.tsx`
### [NEW] `src/components/StarRating.tsx`
### [NEW] `src/utils/feedbackExport.ts`
### [MODIFY] `src/App.tsx` — add `/feedback` route
### [MODIFY] `src/pages/Admin.tsx` — add Feedback Analytics tab
### [MODIFY] `src/pages/Modules.tsx` — add "Rate Module" prompt after completion
### [MODIFY] `src/context/AppContext.tsx` — add feedback type definitions

---

## Verification Plan

### Automated Tests
- `npm run build` — zero TypeScript errors

### Manual Verification
1. Login as approved learner → Complete a module → Feedback modal appears
2. Fill all fields → Submit → Check Firebase `feedback/module_feedback/{uid}/{moduleId}`
3. Toggle Anonymous → Verify name/email replaced with `'Anonymous'`
4. Auto-save: partially fill form, refresh page → data persists
5. Admin → Feedback Analytics tab → All chart metrics load correctly
6. Admin → Export → Download Excel, CSV, PDF — verify contents
7. Admin filters: filter by module, date range, learner name
8. After completing all 7 modules → Certification feedback form appears
9. NPS score 0–10 slider → verify display and calculation
