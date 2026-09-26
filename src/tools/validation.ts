import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, registerGet, registerPatch } from './common.js';

const impactClassSchema = z.enum([
  'remote_code_execution',
  'remote_access',
  'privilege_escalation',
  'data_leakage',
  'auth_bypass',
  'denial_of_service',
  'lateral_movement',
  'recon_only',
]);

const validationVerdictSchema = z.enum(['likely_tp', 'likely_fp', 'uncertain']);
const pathFeasibilitySchema = z.enum(['plausible', 'stretched', 'fantasy']);
const validationStatusSchema = z.enum([
  'new',
  'verified',
  'needs_review',
  'false_positive',
  'accepted_risk',
  'resolved',
]);

/**
 * SAFE interpret/enrich tools only. Never accept exploit payloads or recipes.
 */
export function registerValidationTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_analyze_vulnerability',
    'Analyze vulnerability (SAFE context)',
    'Packaged SAFE analysis context: vulnerability detail, CVE signals (KEV/EPSS/public-exploit existence metadata only), related findings, linked attack paths. Interpret/enrich only — no exploitation. Read-only.',
    {
      vulnerability_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/vulnerabilities/${args.vulnerability_id}/analyze/`,
  );

  registerPatch(
    server,
    client,
    'r3ngine_enrich_vulnerability',
    'Enrich vulnerability (SAFE)',
    'Write SAFE agent enrichment (impact_classes, validation_verdict, confidence, rationale, ATT&CK ids, related ids). Rejects exploit/payload fields. Not available to auditors.',
    {
      vulnerability_id: z.number().int(),
      impact_classes: z.array(impactClassSchema).optional(),
      validation_verdict: validationVerdictSchema.optional(),
      confidence: z.number().min(0).max(1).optional(),
      rationale: z.string().max(4000).optional(),
      related_vuln_ids: z.array(z.number().int()).optional(),
      cve_signals: z.union([z.record(z.unknown()), z.array(z.unknown())]).optional(),
      attck_techniques: z.array(z.string()).optional(),
      agent_id: z.string().max(128).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/vulnerabilities/${args.vulnerability_id}/enrich/`,
    (args) => ({
      impact_classes: args.impact_classes,
      validation_verdict: args.validation_verdict,
      confidence: args.confidence,
      rationale: args.rationale,
      related_vuln_ids: args.related_vuln_ids,
      cve_signals: args.cve_signals,
      attck_techniques: args.attck_techniques,
      agent_id: args.agent_id,
    }),
  );

  registerPatch(
    server,
    client,
    'r3ngine_validate_vulnerability',
    'Validate vulnerability status (SAFE)',
    'Set validation_status + reason + confidence. `verified` requires confirm_verified=true and confidence >= 0.8. Prefer needs_review / false_positive for agent triage. Not available to auditors.',
    {
      vulnerability_id: z.number().int(),
      validation_status: validationStatusSchema,
      validation_reason: z.string().max(4000).optional(),
      validation_confidence: z.number().min(0).max(1).optional(),
      confidence: z.number().min(0).max(1).optional(),
      confirm_verified: z.boolean().optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/vulnerabilities/${args.vulnerability_id}/validation/`,
    (args) => ({
      validation_status: args.validation_status,
      validation_reason: args.validation_reason,
      validation_confidence: args.validation_confidence ?? args.confidence,
      confirm_verified: args.confirm_verified,
    }),
  );

  registerPatch(
    server,
    client,
    'r3ngine_enrich_attack_path',
    'Enrich attack path (SAFE)',
    'Annotate an APME path with feasibility (plausible/stretched/fantasy), confidence, blocked_reasons, missing_prereqs, impact_classes, rationale. Locate by apme_path_id or ImpactAssessment id. Not available to auditors.',
    {
      path_id: z.string().min(1),
      feasibility: pathFeasibilitySchema.optional(),
      confidence: z.number().min(0).max(1).optional(),
      blocked_reasons: z.array(z.string()).optional(),
      missing_prereqs: z.array(z.string()).optional(),
      impact_classes: z.array(impactClassSchema).optional(),
      rationale: z.string().max(4000).optional(),
      potential_impact: z.string().max(8000).optional(),
      agent_id: z.string().max(128).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-paths/${encodeURIComponent(String(args.path_id))}/enrich/`,
    (args) => ({
      feasibility: args.feasibility,
      confidence: args.confidence,
      blocked_reasons: args.blocked_reasons,
      missing_prereqs: args.missing_prereqs,
      impact_classes: args.impact_classes,
      rationale: args.rationale,
      potential_impact: args.potential_impact,
      agent_id: args.agent_id,
    }),
  );
}
