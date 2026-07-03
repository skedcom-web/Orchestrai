# Technical Design Document (TDD)
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Audience**: Developers, Tech Leads, System Architects  

---

## 1. Architecture Overview

The system is built as a highly responsive single page application (SPA) with a serverless backend. The architectural blocks are:

```
[Candidate Client (React SPA)] ──(HTTPS/WSS)──> [Firebase Realtime Database]
                                └──(REST API)──> [EmailJS API Gateway]
```

### Key Technical Specs:
*   **Frontend Library**: React 19 (Functional Components, Hooks, Context API)
*   **Build Tool**: Vite 8 (Hot Module Replacement, Rolldown bundler)
*   **Language**: TypeScript (Strict checks enabled)
*   **Styling**: Vanilla CSS with design variables and Tailwind CSS compilation
*   **Database**: Firebase Realtime Database (RTDB)
*   **Authentication & Verification**: Firebase client SDK & custom EmailJS integrations

---

## 2. Client-Side State & Context Management

Global state is centralized in a single provider node: `AppProvider` in [AppContext.tsx](file:///C:/Users/VT348/Documents/GitHub/Orchestrai/src/context/AppContext.tsx).

### Global Context API Scope:
*   `currentUser`: Keeps active user credentials, progress tracker objects, and verification metadata. Syncs immediately with local storage.
*   `usersList`: A real-time synchronized list of registered profiles fetched from Firebase.
*   `notificationLogs` & `auditLogs`: Read-write lists recording system logs and exceptions.
*   `systemConfig`: Global configuration flags:
    ```typescript
    export interface SystemConfig {
      requireEmailVerification: boolean;
      requirePhoneVerification: boolean;
      freeModulesLimit: number;
      approvalMode: 'AUTOMATED' | 'MANUAL';
      firebaseDatabaseUrl?: string;
      firebaseApiKey?: string;
      // ...
    }
    ```

---

## 3. Security, Cryptography & Authentication

The authentication system employs a layered security model:

### A. Password Encryption & Hashing
To prevent storing plaintext credentials, password validation uses client-side SHA-256 hashing.
*   *Algorithm*:
    ```typescript
    const hashPassword = async (password: string, salt: string): Promise<string> => {
      const enc = new TextEncoder().encode(`${salt}::${password}`);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    };
    ```
*   A random 9-character alphanumeric salt is generated for each user profile. The combination is hashed on the client and stored under `users/{uid}/passwordHash`.

### B. Custom Event Authentication Triggers
To gate actions like vault file downloads for guest users, pages dispatch a custom window-level event:
```typescript
window.dispatchEvent(new CustomEvent('orchestrai_trigger_login'));
```
The [Header.tsx](file:///C:/Users/VT348/Documents/GitHub/Orchestrai/src/components/Header.tsx) component listens to this trigger, sliding the authentication overlay open dynamically.

---

## 4. Performance & Dynamic Imports (Code Splitting)

To prevent initial loading lag, the application splits heavy utilities out of the main bundle. Modules like `jsPDF` (PDF generation) and `xlsx` (Excel sheets parser) are lazily loaded on-demand.

### Implementation:
```typescript
const handleExcelExport = async () => {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  // ... export actions
};
```
*   *Benefit*: Decreases the entry bundle size by **~820 KB**, optimizing page loads on slower networks.

---

## 5. Offline Draft Synchronization Engine

Feedback forms in [FeedbackForm.tsx](file:///C:/Users/VT348/Documents/GitHub/Orchestrai/src/pages/FeedbackForm.tsx) utilize a robust offline synchronization engine:

1.  **Draft Debounce**: Edits trigger a 800ms debounced auto-save writing to the local `/drafts` cache node.
2.  **Connectivity Listeners**:
    ```typescript
    window.addEventListener('online', syncOfflineSubmissions);
    ```
3.  **Synchronization Queue**: If the candidate completes a module offline, the response payload is queued in `localStorage`. Once connection is restored, the queue is processed sequentially, sending the submissions back to the database.
