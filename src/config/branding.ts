/**
 * Centralized Branding Configuration for OrchestrAI Academy
 * Single source of truth for all platform branding, founder information,
 * certificates, footers, headers, and admin console titles.
 */

export const BRANDING = {
  platformName: "OrchestrAI Academy",
  shortName: "OrchestrAI",
  adminTitle: "OrchestrAI Academy Admin",
  founderName: "Sithanandham Radhakrishnan",
  founderTitle: "Creator, OrchestrAI",
  founderRole: "AI Delivery & Governance Practitioner",
  founderLeadership: "Program & Portfolio Leader",
  founderExperience: "24+ Years Experience",
  footerTagline: "Created using the OrchestrAI Delivery Framework (ODF)",
  poweredBy: "Powered by OrchestrAI",
  certificationAuthority: "OrchestrAI Academy",
  supportName: "OrchestrAI Academy Support",
  contactEmail: "support@orchestrai.academy",
  alumniEmail: "alumni@orchestrai.academy",
  infoEmail: "info@orchestrai.academy"
} as const;

export type BrandingConfig = typeof BRANDING;
