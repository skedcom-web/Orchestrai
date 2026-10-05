# Database Design Document
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Audience**: Database Administrators, Backend Engineers, Integrators  

---

## 1. Data Technology Selection

The application uses **Firebase Realtime Database (RTDB)**. RTDB serves as a JSON data store, syncing database state with client listeners in real-time. This setup handles live updates for candidate tracking, cohort progress, and audit logs without requiring a dedicated backend server.

---

## 2. Realtime Database JSON Schema Schema

The database structure is organized into the following key root nodes:

### A. `/users`
Stores candidate profiles, system progress, quiz scores, and password parameters.
```json
{
  "users": {
    "user_uid_123": {
      "uid": "user_uid_123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "mobile": "+919876543210",
      "role": "USER",
      "accountStatus": "FREE_TIER",
      "quizPassed": true,
      "emailVerified": true,
      "mobileVerified": false,
      "passwordHash": "a1f9e2...",
      "passwordSalt": "7df3ka9c",
      "progress": {
        "slidesViewed": {
          "1": [1, 2, 3, 23],
          "2": [1, 2, 3]
        },
        "modulesCompleted": [1, 2],
        "quizScores": {
          "2": 100
        },
        "labsPassed": [1],
        "streakDays": 4,
        "lastActiveDate": "2026-07-02",
        "level": 2,
        "xp": 450,
        "badges": ["FIRST_STEP", "QUIZ_MASTER"]
      },
      "department": "Engineering",
      "organization": "OrchestrAI Academy"
    }
  }
}
```

### B. `/reviewers`
SME credentials used for Capstone evaluations.
```json
{
  "reviewers": {
    "reviewer_uid_456": {
      "uid": "reviewer_uid_456",
      "email": "sme@example.com",
      "name": "SME Evaluator",
      "role": "sme",
      "passwordHash": "f8a9e2...",
      "passwordSalt": "k2l981js",
      "mustChangePassword": false
    }
  }
}
```

### C. `/systemConfig`
Governs dynamic application boundaries.
```json
{
  "systemConfig": {
    "requireEmailVerification": true,
    "requirePhoneVerification": false,
    "freeModulesLimit": 2,
    "approvalMode": "MANUAL",
    "firebaseDatabaseUrl": "https://vthinkorchestrai-auth.firebaseio.com",
    "firebaseApiKey": "AIzaSy...",
    "firebaseAuthDomain": "vthinkorchestrai-auth.firebaseapp.com",
    "firebaseProjectId": "vthinkorchestrai-auth",
    "emailjsServiceId": "service_xyz",
    "emailjsTemplateId": "template_abc",
    "emailjsPublicKey": "pk_123"
  }
}
```

### D. `/feedback`
Holds candidate responses for modules and final certifications.
```json
{
  "feedback": {
    "module_feedback": {
      "user_uid_123": {
        "1": {
          "moduleId": 1,
          "userId": "user_uid_123",
          "userName": "Jane Doe",
          "userEmail": "jane@example.com",
          "rating": 5,
          "ratings": {
            "pace": 5,
            "clarity": 5,
            "labs": 4
          },
          "comments": "The OrchestrAI paradigm is mind-opening.",
          "timestamp": "2026-07-02T06:12:00Z",
          "organization": "OrchestrAI Academy",
          "department": "Engineering"
        }
      }
    }
  }
}
```

### E. `/capstone`
Manages project code submissions and SME evaluations.
```json
{
  "capstone": {
    "user_uid_123": {
      "submissionId": "user_uid_123",
      "userEmail": "jane@example.com",
      "userName": "Jane Doe",
      "repoUrl": "https://github.com/jane/orchestrai-poc",
      "demoUrl": "https://jane-poc.web.app",
      "notes": "Completed capstone demo implementation.",
      "timestamp": "2026-07-02T06:15:00Z",
      "status": "PENDING",
      "feedback": "",
      "gradedBy": ""
    }
  }
}
```

### F. `/audit_logs`
Tracks unhandled client exceptions and system events.
```json
{
  "audit_logs": {
    "log_id_789": {
      "id": "log_id_789",
      "timestamp": "2026-07-02T06:18:22Z",
      "type": "WINDOW_ERROR",
      "userEmail": "jane@example.com",
      "description": "Error: Cannot read properties of undefined (reading 'split') at Header.tsx:102:18"
    }
  }
}
```

---

## 3. Storage Optimization & Guardrails

*   **Payload Constraints**: A maximum payload limit of **8MB** is enforced in the Resource Vault client code (`Resources.tsx`) to prevent large binary files from bloating RTDB nodes.
*   **Indices**: Search filters in the Candidates dashboard sort entries by indexing users by email, optimizing query lookups.
*   **Draft Nodes**: Module feedback entries check the `isDraft` status, isolating partial responses from final analytics reports.

