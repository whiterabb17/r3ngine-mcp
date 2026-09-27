import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPost, registerPostPath } from './common.js';

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

const pathFeasibilitySchema = z.enum(['plausible', 'stretched', 'fantasy']);

const operationSchema = z.enum([
  'enrich',
  'create',
  'update',
  'dismiss',
  'trigger_apme',
  'recalculate_apme',
]);

const proposalPayloadSchema = z
  .object({
    feasibility: pathFeasibilitySchema.optional(),
    confidence: z.number().min(0).max(1).optional(),
    blocked_reasons: z.array(z.string()).optional(),
    missing_prereqs: z.array(z.string()).optional(),
    impact_classes: z.array(impactClassSchema).optional(),
    rationale: z.string().max(4000).optional(),
    potential_impact: z.string().max(8000).optional(),
    dismiss_reason: z.string().max(4000).optional(),
    reason: z.string().max(4000).optional(),
    vulnerability_id: z.number().int().optional(),
    subdomain_id: z.number().int().optional(),
    remediation_priority: z.number().int().optional(),
    chain: z
      .object({
        risk: z.string().optional(),
        score: z.number().optional(),
        summary: z.string().optional(),
        steps: z.array(z.record(z.unknown())).optional(),
      })
      .optional(),
  })
  .passthrough();

export function registerApmeTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_get_attack_paths',
    'Get attack paths',
    'List APME attack paths. Read-only.',
    {
      scan_id: z.number().int().optional(),
      project_slug: z.string().optional(),
      target_id: z.number().int().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-paths/${queryString(args)}`,
  );

  registerGet(
    server,
    client,
    'r3ngine_get_attack_path',
    'Get attack path detail',
    'Full APME path chain, agent_path_review, and linked vulnerability summary. Read-only.',
    {
      path_id: z.string().min(1),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-paths/${encodeURIComponent(String(args.path_id))}/`,
  );

  registerGet(
    server,
    client,
    'r3ngine_list_attack_path_proposals',
    'List attack-path proposals',
    'List propose→approve attack-path proposals. Read-only.',
    {
      project_slug: z.string().optional(),
      scan_id: z.number().int().optional(),
      status: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-path-proposals/${queryString(args)}`,
  );

  registerGet(
    server,
    client,
    'r3ngine_get_attack_path_proposal',
    'Get attack-path proposal',
    'Read one attack-path proposal (status, payload, result). Read-only.',
    {
      proposal_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-path-proposals/${args.proposal_id}/`,
  );

  registerPost(
    server,
    client,
    'r3ngine_propose_attack_path',
    'Propose attack-path change',
    'Submit enrich/create/update/dismiss/trigger_apme/recalculate_apme proposal. Does not mutate live paths until operator approve.',
    {
      project_slug: z.string(),
      operation: operationSchema,
      scan_id: z.number().int().optional(),
      target_path_id: z.string().optional(),
      path_id: z.string().optional(),
      impact_assessment_id: z.number().int().optional(),
      rationale: z.string().optional(),
      agent_id: z.string().max(128).optional(),
      payload: proposalPayloadSchema.optional(),
      response_format: formatSchema,
    },
    '/api/mcp/attack-path-proposals/propose/',
    (args) => ({
      project_slug: args.project_slug,
      operation: args.operation,
      scan_id: args.scan_id,
      target_path_id: args.target_path_id ?? args.path_id,
      impact_assessment_id: args.impact_assessment_id,
      rationale: args.rationale,
      agent_id: args.agent_id,
      payload: args.payload ?? {},
    }),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_update_attack_path_proposal',
    'Update attack-path proposal',
    'Edit payload/rationale while status is proposed. Operator edits lock agent overwrite.',
    {
      proposal_id: z.number().int(),
      payload: proposalPayloadSchema.optional(),
      rationale: z.string().optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-path-proposals/${args.proposal_id}/update/`,
    (args) => ({
      payload: args.payload,
      rationale: args.rationale,
      operator: true,
    }),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_approve_attack_path_proposal',
    'Approve attack-path proposal',
    'OPERATOR ONLY after explicit yes. Applies enrich/create/update/dismiss or queues APME. Agents must not call without operator approval.',
    {
      proposal_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-path-proposals/${args.proposal_id}/approve/`,
    () => ({}),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_abort_attack_path_proposal',
    'Abort attack-path proposal',
    'OPERATOR ONLY after explicit yes. Aborts a proposed/approved proposal without applying.',
    {
      proposal_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/attack-path-proposals/${args.proposal_id}/abort/`,
    () => ({}),
    true,
  );

  // Deprecated direct writes — host returns 410; kept so agents see the redirect hint.
  registerPost(
    server,
    client,
    'r3ngine_trigger_apme',
    'Trigger APME (deprecated)',
    'DEPRECATED: returns 410. Propose operation trigger_apme via r3ngine_propose_attack_path; operator must approve.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/apme/trigger/',
    (args) => ({ scan_id: args.scan_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_recalculate_apme',
    'Recalculate APME (deprecated)',
    'DEPRECATED: returns 410. Propose operation recalculate_apme via r3ngine_propose_attack_path; operator must approve.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/apme/recalculate/',
    (args) => ({ scan_id: args.scan_id }),
  );
}
