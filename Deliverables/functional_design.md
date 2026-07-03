# Functional Design Document (FDD)
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Audience**: Clients, Business Analysts, Product Owners  

---

## 1. Document Overview & Product Vision

The **OrchestrAI Certification Academy** is a world-class training and certification platform designed to educate, test, and certify software professionals in the **OrchestrAI Lead** paradigm. 

The primary business goal is to enable learners to transition from manual code-writing developers to **architects of intent** (Human Orchestrators) who command AI engines to build production-grade systems. The platform itself serves as the ultimate proof-of-concept, demonstrating how a premium application can be built in days utilizing these exact principles.

---

## 2. User Roles & Personas

The system supports four distinct user roles, each with specialized permissions and interface states:

1.  **Guest / Visitor**:
    *   *Definition*: Unauthenticated users visiting the platform.
    *   *Permissions*: Can access the Landing page, read the Syllabus roadmap, and view/interact with Modules 1 & 2 slides and labs.
    *   *Gating*: Blocked from Modules 3–7. Attempting to download files from the Resource Vault triggers the authentication dialog.
2.  **Enrolled Candidate**:
    *   *Definition*: Registered candidates completing their training.
    *   *Permissions*: Can complete all modules (if paid/approved), take the knowledge check quiz, submit Capstone projects, and download vault materials.
3.  **SME / Reviewer**:
    *   *Definition*: Subject Matter Experts responsible for candidate evaluation.
    *   *Permissions*: Accesses a restricted SME Review panel to review Capstone project submissions, assign grades, and submit feedback.
4.  **System Administrator (Admin)**:
    *   *Definition*: Platform managers with global access.
    *   *Permissions*: Manage gating settings, review cohort registrations, toggle verification rules, check error logs, upload files to the Resource Vault, and wipe/reset databases.

---

## 3. Curriculum & Interactive Training Deck

The academy syllabus is structured as a 7-module interactive learning journey:

```
[Module 1 & 2: Free Tier] ──> [Quiz Gate: 80% score] ──> [Payment/Approval Gate] ──> [Modules 3-6] ──> [Module 7: Capstone Workspace] ──> [Certification]
```

### Module Flow & Narrations:
*   **Module 1 (Paradigm Shift)**: Slide decks covering the mindset shift, comparing the 7-day OrchestrAI benchmark against traditional multi-week timelines. Text slides and audio voiceovers are aligned.
*   **Module 2 (Six Core Principles)**: Focuses on prompt engineering, constraints, guardrails, and quality by design.
*   **Modules 3 & 4 (Architecture & APIs)**: Paid modules covering backend design. Slides and audio reference safe guest credentials (`Guest01` / `Guest@123`) to model secure practices.
*   **Modules 5 & 6 (Testing & Deliverables)**: Interactive slides teaching candidates how to package code deliverables. Includes the capstone bridge directing learners to the Module 7 workspace instead of immediate certificate downloads.
*   **Module 7 (Capstone Project)**: A dedicated workspace where candidates submit their final project code repositories for review by the SME team.

---

## 4. Access Gating & Authentication Gates

To progress beyond Module 2, candidates must pass through two sequential gates:

### Gate A: The Knowledge Challenge (Quiz)
*   Candidates must complete a 6-question multiple-choice assessment testing core concepts.
*   A minimum score of **80%** (5 out of 6 correct) is required.
*   *Failure*: The candidate receives study guide tips referencing specific slides and can retry immediately.
*   *Success*: The gate is unlocked in the user's profile database node.

### Gate B: The Payment / Registration Gate
*   Candidates must clear the certification fee.
*   *Manual Mode*: Candidates submit registration details. Admin reviews and approves them in the Admin approvals queue.
*   *Automated Mode*: Approved automatically upon simulated payment completion.

---

## 5. Feedback Collection Engine & Offline Sync

Every module concludes with a mandatory feedback popup modal. The feedback collector enforces the following properties:

1.  **Required Inputs**: Ratings across multiple dimensions (instruction clarity, lab engagement, etc.) and written comments.
2.  **Profile Pre-filling**: Authenticated candidates have their Department and Organization pre-filled.
3.  **Structured Data Validation**: Text inputs are parsed by regex pattern checks. Consonant-cluster gibberish, profanity, or nonsense strings are flagged with inline warnings, disabling the submit action.
4.  **Offline Draft Synchronization**:
    *   Unsubmitted feedback state auto-saves locally after 800ms of typing.
    *   If connectivity is interrupted, the feedback draft remains cached in the browser's storage.
    *   Once connection is restored, background re-sync event listeners automatically flush drafts and completed forms to the database.

---

## 6. Reference Vault & Resource Center

A resource center (`/resources`) houses documentation, templates, and spreadsheets:
*   **Administrators**: Can upload documents (restricted to **8MB** to optimize database storage) with titles and descriptions.
*   **Authenticated Candidates**: Can download any reference asset.
*   **Guests**: Blocked from downloading. Clicking the download trigger raises an overlay prompt requesting them to log in or register.
