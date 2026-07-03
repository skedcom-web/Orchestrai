# Test Plan
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Audience**: QA Engineers, Release Managers, Product Owners  

---

## 1. Objectives & Scope

The objective of this Test Plan is to verify that all gating logic, payment structures, interactive slide narration features, feedback loops, and administrative consoles in the OrchestrAI Academy function as expected.

### In-Scope:
1.  **Authentication & Verification Gates**: Email OTP code verification, phone SMS OTP, set password encryption (SHA-256), direct password login, and reset password dispatch loops.
2.  **Access Gating Matrix**: Dynamic content locking based on candidate progress and payment statuses.
3.  **Quiz Challenge Engine**: Scoring algorithms, retry behaviors, and study guide redirects.
4.  **Feedback Sync Mechanisms**: Local auto-saving, regex checks on department/organization strings, and offline background re-sync.
5.  **Resource Vault**: Base64 file uploads, search filtering, and guest download gates.
6.  **Admin Console**: Tab configurations, database maintenance checks, log exports, and reviewers grading.

### Out-of-Scope:
*   Third-party EmailJS SMTP relays (mocked during testing).
*   Live Razorpay payment gateways (simulated during checkout validations).

---

## 2. Test Approach & Methodology

We employ a three-tier testing approach:

```
[Unit Testing (Vitest)] ──> [Integration Testing] ──> [Manual End-to-End Testing]
```

1.  **Unit Testing (Vitest)**: Functional logic (e.g. state management hooks, score calculations, and validation formatting) is verified in automated unit test specs.
2.  **Integration Testing**: Simulates state transitions like checking if answering Capstone review questions updates the database correctly.
3.  **Manual End-to-End Testing**: Validates UI elements (e.g. viewport fitting, audio voiceover narration synchronization, navigation redirections) on target browsers (Chrome, Firefox, Safari, Edge).

---

## 3. Test Cases & Execution Matrix

All **61 automated test cases** are verified to compile and run green. The detailed scenario list is structured below by test suite:

### Suite 1: `TrainingPresenter.logic.test.ts` (13 cases)
*   `[PASS]` prefers customSlides when provided and non-empty
*   `[PASS]` falls back to the generated slides when customSlides is empty
*   `[PASS]` generates a fallback deck with a hero + summary slide for unknown module ids
*   `[PASS]` uses the known module name for modules 3-7
*   `[PASS]` returns an empty array when the slide has no question data
*   `[PASS]` passes through a well-formed questions array unchanged
*   `[PASS]` wraps a single legacy question/options/answer shape into a one-item array
*   `[PASS]` ignores a questions array whose first element is not an object (legacy string array)
*   `[PASS]` returns primitives unchanged
*   `[PASS]` picks the requested tone key out of a tone-keyed object
*   `[PASS]` falls back to formal, then genz, then conversational when the requested tone is missing
*   `[PASS]` recurses into plain nested objects, resolving tone per leaf
*   `[PASS]` recurses into arrays of tone-keyed objects

### Suite 2: `AppContext.test.ts` (18 cases)
*   `[PASS]` starts at level 1 with 0 xp
*   `[PASS]` computes level from the `sqrt(xp/100)+1` curve
*   `[PASS]` reports `xpToNext` that reaches exactly 0 right at the level boundary
*   `[PASS]` never reports `progressPct` above 100
*   `[PASS]` handles negative xp without throwing or going to a negative level
*   `[PASS]` returns no badges for a fresh progress object
*   `[PASS]` returns empty array for null/undefined progress
*   `[PASS]` awards `first-steps` once any slide has been viewed
*   `[PASS]` awards `quiz-master` only at >= 80%, not below
*   `[PASS]` awards `guardian` once a lab is passed
*   `[PASS]` awards `module-1` and `foundation` correctly based on `modulesCompleted`
*   `[PASS]` awards streak badges at the 3 and 7 day thresholds
*   `[PASS]` awards `level-5` only once level reaches 5
*   `[PASS]` is idempotent - calling twice on the same progress yields the same result
*   `[PASS]` backfills all defaults when given undefined
*   `[PASS]` preserves provided fields while filling in the rest
*   `[PASS]` drops malformed (non-array) entries from `slidesViewed`
*   `[PASS]` does not mutate the input object

### Suite 3: `CapstoneSubmit.test.tsx` (5 cases)
*   `[PASS]` prompts to sign in when there is no current user
*   `[PASS]` shows "no capstone locked" when the learner has not selected one
*   `[PASS]` renders the submission form once a capstone selection exists in `localStorage`
*   `[PASS]` rejects a non-github.com URL with a validation error and does not submit
*   `[PASS]` blocks submission entirely when no cloud database is configured

### Suite 4: `Payment.test.tsx` (8 cases)
*   `[PASS]` blocks access when there is no current user
*   `[PASS]` gates the user out until the quiz is passed
*   `[PASS]` opens the mock Razorpay modal on checkout click
*   `[PASS]` on payment failure, shows an error toast and never calls `updateUserProfile`
*   `[PASS]` AUTOMATED mode approves the user immediately and sends the approval email to the learner
*   `[PASS]` MANUAL mode sets `PENDING_APPROVAL` and notifies the admin, not the learner
*   `[PASS]` falls back to a simulated/mocked notification when EmailJS keys are missing
*   `[PASS]` logs a Failed notification and shows an error toast when EmailJS rejects

### Suite 5: `Quiz.test.tsx` (6 cases)
*   `[PASS]` shows an access-denied message when no user is logged in
*   `[PASS]` disables Submit until every question has an answer selected
*   `[PASS]` passes at >= 80% (5/6 correct), calls `recordQuizScore` and marks `quizPassed`
*   `[PASS]` fails below 80%, shows retry + study guide, and does not mark `quizPassed`
*   `[PASS]` Try Again resets answers and returns to the question view
*   `[PASS]` locks answer selection after submission

### Suite 6: `leadReadiness.test.ts` (11 cases)
*   `[PASS]` returns a zero score with no breakdown when progress is missing
*   `[PASS]` caps the quiz component at 30 even with quiz scores above 100
*   `[PASS]` caps total score at 100 for a maxed-out learner
*   `[PASS]` marks standout only when score >= 70 AND (a 90+ quiz score OR a passed lab)
*   `[PASS]` gives partial application credit for `hasSubmission` without any labs passed
*   `[PASS]` buckets scores into the right color tier
*   `[PASS]` treats the tier boundaries as inclusive on the lower bound
*   `[PASS]` returns a distinct class for every known tag
*   `[PASS]` falls back to a default class for unknown/undefined tags
*   `[PASS]` does nothing when rows is empty (no Blob/anchor created)
*   `[PASS]` escapes commas, quotes, and newlines per RFC 4180

---

## 4. Environment & Browser Support

The application is validated to operate correctly across major modern browser configurations:

*   **Google Chrome** (v110+)
*   **Mozilla Firefox** (v108+)
*   **Apple Safari** (v16+)
*   **Microsoft Edge** (v110+)
*   **Mobile Viewports**: Optimized for touch inputs and responsive layout scaling on iOS and Android devices.
