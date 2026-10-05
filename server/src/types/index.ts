/**
 * Shared TypeScript interfaces — ported verbatim from functions/src/index.ts.
 */

/** A single submission stored at /submissions/{uid}/{capstoneId} in RTDB. */
export interface SubmissionRecord {
  learnerName?: string;
  capstoneId: string;
  capstoneTitle: string;
  capstoneDomain: string;
  githubUrl: string;
  firebaseUrl: string;
  readmeUrl: string;
  workflowDiagramUrl?: string;
  supportingDocs?: Array<{ name: string; storageUrl: string }>;
}

/** Written to /reviews/{submissionId}/tierBSuggestion in RTDB. */
export interface TierBSuggestion {
  perCategory: Record<string, number>;
  rationale: Record<string, string>;
  overallObservations: string;
  total: number;
  model: string;
  generatedAt: number;
  autoChecks: AutoChecks;
  tokensUsed: unknown | null;
}

/** Written to /reviews/{submissionId}/autoChecks in RTDB. */
export interface AutoChecks {
  githubReachable: boolean;
  githubPublic: boolean;
  hasReadme: boolean;
  hasDesignDoc: boolean;
  hasPackageJson: boolean;
  fileCount: number;
  firebaseReachable: boolean;
  checkedAt: number;
}
