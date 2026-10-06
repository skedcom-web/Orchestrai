/**
 * Shared TypeScript interfaces — ported from functions/src/index.ts.
 *
 * RTDB schema note: every field added after the original port is OPTIONAL and
 * additive. Records written by older versions of this service stay valid, and
 * the Admin UI ignores fields it does not know about.
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

/**
 * Outcome of a single outbound fetch.
 *  - ok / not_found / empty_repo are DEFINITIVE answers about the repository.
 *  - everything else means "we could not find out" and must never be read as
 *    "the repository is empty".
 */
export type FetchKind =
  | 'ok'
  | 'not_found'
  | 'empty_repo'
  | 'rate_limited'
  | 'bad_credentials'
  | 'forbidden'
  | 'timeout'
  | 'network'
  | 'http_error';

/** Why GitHub evidence could (not) be gathered. Stored at autoChecks.githubCheck. */
export interface GithubCheck {
  /** Outcome of the repository listing call — the authoritative signal. */
  status: FetchKind;
  httpStatus: number | null;
  /** True when GitHub evidence is trustworthy enough to score on. */
  evidenceAvailable: boolean;
  /** Human-readable explanation, safe to show to an admin. */
  message: string;
  rateLimitRemaining: number | null;
  /** Epoch ms when the anonymous/authenticated quota resets. */
  rateLimitResetAt: number | null;
  tokenConfigured: boolean;
  /** GitHub rejected the configured token (401) and we fell back to anonymous. */
  tokenRejected: boolean;
}

/** Summary of what the model was actually shown. Stored at tierBSuggestion.evidence. */
export interface EvidenceSummary {
  listing: 'complete' | 'partial' | 'verified_empty' | 'unavailable' | 'not_found';
  filesListed: number;
  readme: 'ok' | 'missing' | 'unavailable';
  packageJson: 'ok' | 'missing' | 'unavailable';
  sourceFilesSampled: number;
  sourceCharsSampled: number;
  liveUrl: string;
  /** Overall trust in the evidence behind the scores. */
  confidence: 'high' | 'medium' | 'low';
  gaps: string[];
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
  evidence?: EvidenceSummary;
  promptChars?: number;
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
  githubCheck?: GithubCheck;
  /** 'hosting' = a real site, 'console' = a Firebase console link, 'other' = non-Firebase host. */
  firebaseUrlKind?: 'hosting' | 'console' | 'other' | 'invalid';
  liveUrlNote?: string;
}
