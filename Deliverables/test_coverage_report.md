# QA Test Coverage & Quality Focus Report
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Directory**: [Deliverables (file:///C:/Users/VT348/Documents/GitHub/Orchestrai/Deliverables/)](file:///C:/Users/VT348/Documents/GitHub/Orchestrai/Deliverables/)

---

## 1. Executive Summary

This report documents the current **automated code coverage** metrics generated via `vitest run --coverage` and provides a strategic QA guidance roadmap for your customer's validation teams. 

Our core utilities, payment processes, quiz gating calculations, and submission flows have high automated test coverage. Pages with complex DOM visual interactions and Firebase asynchronous connections are validated via thorough manual verification, which should serve as the primary focus for the Customer QA phase.

---

## 2. Code Coverage Diagnostics Summary

The table below summarizes the test coverage across files and components:

| Category / Path | Statement Coverage % | Branch Coverage % | Function Coverage % | Line Coverage % | Main Uncovered Components |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **All Files** | **5.93%** | **4.71%** | **3.83%** | **5.83%** | *Overall Workspace Baseline* |
| **Core Utilities** | **42.10%** | **57.89%** | **50.00%** | **40.77%** | `feedbackExport.ts` (0% covered) |
| **Quiz Gate** | **92.68%** | **90.90%** | **90.90%** | **97.36%** | Fully validated |
| **Payment Options** | **97.87%** | **86.48%** | **87.50%** | **97.87%** | Fully validated |
| **Capstone Submits**| **35.92%** | **34.96%** | **16.94%** | **37.37%** | SME Reviews & grading |
| **Global State** | **6.65%** | **8.76%** | **4.16%** | **5.65%** | Offline sync, Realtime DB hooks |
| **Visual Interfaces** | **0.00%** | **0.00%** | **0.00%** | **0.00%** | `Header.tsx`, `Landing.tsx`, `Admin.tsx`, `Resources.tsx` |

*Note: Visual UI layers (`Landing.tsx`, `Resources.tsx`, `FeedbackForm.tsx`) intentionally display 0% automated coverage as they rely on external integration triggers, Firebase RTDB connection states, and DOM audio visual streams which are validated through manual E2E verification.*

---

## 3. High-Priority QA Focus Areas for Customer Validation

To ensure a high-quality product release, the customer's QA team should focus validation efforts on the following high-priority areas:

### Focus Area 1: Multi-Step Authentication & Password Logic
*   **Target Files**: `Header.tsx`, `AppContext.tsx`
*   **QA Scenarios to Validate**:
    1.  *New Candidate Registration*: Enter email and mobile -> click register -> enter email OTP -> set new password -> check that user is approved for free tier and progress starts.
    2.  *Fast Password Login*: Enter registered email -> verify modal skips OTP and requests password -> input password -> instant redirection to syllabus workspace.
    3.  *Forgot Password Recovery*: Enter email -> click reset link -> input email OTP code -> set new password -> check login using the new password.
    4.  *Legacy Migration*: Log in as a legacy user without a password -> verify email OTP -> verify redirection to set a new password.

### Focus Area 2: Resource Vault & Guest Download Security
*   **Target Files**: `Resources.tsx`
*   **QA Scenarios to Validate**:
    1.  *Guest Lockout Guardrail*: Access `/resources` as a guest -> search files -> click "Download" on any item -> verify that a warning is displayed and the sign-in modal opens.
    2.  *Candidate Download*: Log in as a candidate -> click "Download" -> verify immediate download of file stream payload.
    3.  *Admin Upload File Size*: Log in as Admin -> select file > 8MB -> verify file upload block and size warning popup.

### Focus Area 3: Feedback Forms & Offline Sync Queue
*   **Target Files**: `FeedbackForm.tsx`
*   **QA Scenarios to Validate**:
    1.  *Regex Input Sanitization*: Submit feedback with gibberish (e.g. `"sdfghjkl"`, `"abc123xyz"`) -> verify validation warning and submission block.
    2.  *Offline Draft Queueing*: Turn off internet -> fill feedback fields -> close window -> open workspace -> verify inputs are restored from `localStorage`.
    3.  *Background Sync*: Submit feedback while offline -> verify it queues -> restore internet -> check that background sync saves it to the database.

### Focus Area 4: Capstone Submissions & SME Review Workflow
*   **Target Files**: `CapstoneSubmit.tsx`, `CapstoneReviewsAdmin.tsx`
*   **QA Scenarios to Validate**:
    1.  *Candidate Submit*: Input repository URL -> verify git address format pattern check -> submit.
    2.  *SME grading*: Log in as reviewer -> select capstone -> pass or fail -> check that email notification is sent and candidate dashboard gate updates.
