# Feedback & Rating Workflow — Tasks

## Phase 1: Dependencies & Shared Types
- [x] User approved plan
- [x] Install xlsx, jspdf, jspdf-autotable
- [x] Add department/org to UserProfile in AppContext.tsx
- [x] Add ModuleFeedback + CertFeedback types (in FeedbackForm.tsx)
- [x] Add MODULE_NAMES constant (in FeedbackForm.tsx)

## Phase 2: New Files
- [x] src/components/StarRating.tsx
- [x] src/utils/feedbackExport.ts
- [x] src/pages/FeedbackForm.tsx (module + cert feedback forms)
- [x] src/pages/FeedbackAnalytics.tsx (admin analytics dashboard)

## Phase 3: Integrations
- [x] src/App.tsx — add /feedback route
- [x] src/pages/Modules.tsx — inline modal after module complete
- [x] src/pages/Certification.tsx — mandatory gate before cert download
- [x] src/pages/Admin.tsx — Feedback Analytics tab

## Phase 4: Build & Deploy
- [x] npm run build — ✅ 0 errors
- [x] firebase deploy --only hosting — ✅ Done
- [x] Verify on live URL — ✅ Build & Deploy successful
