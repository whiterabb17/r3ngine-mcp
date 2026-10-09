import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPost, registerPostPath } from './common.js';

const templateIdSchema = z.enum([
  'marker_reflect',
  'calc_echo',
  'authz_status_delta',
  'open_redirect_safe',
  'flag_canary_read',
]);

const paramsSchema = z
  .object({
    param_name: z.string().max(64).optional(),
    marker: z.string().max(128).optional(),
    expected_marker: z.string().max(128).optional(),
    method: z.enum(['GET', 'POST']).optional(),
    base_url: z.string().url().optional(),
    probe_index: z.number().int().min(0).max(10).optional(),
    url_a: z.string().url().optional(),
    url_b: z.string().url().optional(),
    cookie_name: z.string().max(64).optional(),
    cookie_value: z.string().max(4096).optional(),
    redirect_target: z.string().url().optional(),
    allowed_paths: z.array(z.string().max(200)).max(10).optional(),
  })
  .strict()
  .optional();

/**
 * SAFE PoC tools — catalog templates only; approve is operator-gated.
 */
export function registerSafePocTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_safe_pocs',
    'List SAFE PoC attempts',
    'List SAFE PoC attempts (optional project/scan/vuln/status filters). Read-only.',
    {
      project_slug: z.string().optional(),
      status: z.string().optional(),
      scan_id: z.number().int().optional(),
      vulnerability_id: z.number().int().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/safe-poc/${queryString(args)}`,
  );

  registerGet(
    server,
    client,
    'r3ngine_get_safe_poc',
    'Get SAFE PoC attempt',
    'Read SAFE PoC attempt status, params (cookie redacted), and result. Read-only.',
    { attempt_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/safe-poc/${args.attempt_id}/`,
  );

  registerPost(
    server,
    client,
    'r3ngine_propose_safe_poc',
    'Propose SAFE PoC',
    'Propose an allowlisted catalog PoC (marker/calc/authz/redirect/flag-canary). Does not send HTTP until operator approves. Never include freeform payloads.',
    {
      vulnerability_id: z.number().int(),
      template_id: templateIdSchema,
      params: paramsSchema,
      rationale: z.string().max(4000).optional(),
      project_slug: z.string().optional(),
      scan_id: z.number().int().optional(),
      agent_id: z.string().max(128).optional(),
      response_format: formatSchema,
    },
    '/api/mcp/safe-poc/propose/',
    (args) => ({
      vulnerability_id: args.vulnerability_id,
      template_id: args.template_id,
      params: args.params,
      rationale: args.rationale,
      project_slug: args.project_slug,
      scan_id: args.scan_id,
      agent_id: args.agent_id,
    }),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_update_safe_poc',
    'Update SAFE PoC',
    'Edit a proposed SAFE PoC attempt (operator edit locks agents out).',
    {
      attempt_id: z.number().int(),
      template_id: templateIdSchema.optional(),
      params: paramsSchema,
      rationale: z.string().max(4000).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/safe-poc/${args.attempt_id}/update/`,
    (args) => ({
      template_id: args.template_id,
      params: args.params,
      rationale: args.rationale,
    }),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_approve_safe_poc',
    'Approve SAFE PoC',
    'Operator-only: approve a proposed SAFE PoC and start Temporal execution. Agents must not call without explicit operator yes.',
    { attempt_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/safe-poc/${args.attempt_id}/approve/`,
    () => ({}),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_abort_safe_poc',
    'Abort SAFE PoC',
    'Operator-only: abort a proposed/running SAFE PoC. Agents must not call without explicit operator yes.',
    { attempt_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/safe-poc/${args.attempt_id}/abort/`,
    () => ({}),
  );

  registerPost(
    server,
    client,
    'r3ngine_run_safe_poc',
    'Run SAFE PoC (deprecated)',
    'DEPRECATED: returns 410. Use r3ngine_propose_safe_poc then operator r3ngine_approve_safe_poc.',
    {
      vulnerability_id: z.number().int().optional(),
      template_id: templateIdSchema.optional(),
      response_format: formatSchema,
    },
    '/api/mcp/safe-poc/run/',
    (args) => ({
      vulnerability_id: args.vulnerability_id,
      template_id: args.template_id,
    }),
  );
}
