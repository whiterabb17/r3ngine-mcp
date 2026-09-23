import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPost, registerPostPath } from './common.js';

const stepSchema = z.object({
  kind: z.enum(['run_tool', 'start_subscan', 'start_workflow', 'retry_task']),
  tool: z.string().optional(),
  asset_type: z.string().optional(),
  asset_id: z.number().int().optional(),
  url: z.string().optional(),
  scan_history_id: z.number().int().optional(),
  scan_id: z.number().int().optional(),
  subdomain_ids: z.array(z.number().int()).optional(),
  subdomain_id: z.number().int().optional(),
  tasks: z.array(z.string()).optional(),
  engine_id: z.number().int().optional(),
  workflow_slug: z.string().optional(),
  urls: z.array(z.string()).optional(),
  domain: z.string().optional(),
  target: z.string().optional(),
  target_type: z.string().optional(),
  task_id: z.number().int().optional(),
  rationale: z.string().optional(),
  continue_on_error: z.boolean().optional(),
});

export function registerFollowupTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_capabilities',
    'List capabilities',
    'Catalog of pipeline tasks, workflows, asset kinds, and risk classes agents may propose. Read-only.',
    { response_format: formatSchema },
    () => '/api/mcp/capabilities/',
  );
  registerGet(
    server,
    client,
    'r3ngine_get_engine_detail',
    'Get engine detail',
    'Engine YAML-derived enabled tasks (no secrets). Read-only.',
    { engine_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/engines/${args.engine_id}/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_followups',
    'List follow-up plans',
    'List follow-up plans for a project (optional status/scan filters). Read-only.',
    {
      project_slug: z.string().optional(),
      status: z.string().optional(),
      scan_id: z.number().int().optional(),
      assessment_id: z.number().int().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/followups/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_followup_plan',
    'Get follow-up plan',
    'Read plan status, steps, and results. Read-only.',
    { plan_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/followups/${args.plan_id}/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_followup_metrics',
    'Follow-up metrics',
    'Acceptance/completion/abort/retry aggregates. Read-only.',
    { response_format: formatSchema },
    () => '/api/mcp/followups/metrics/',
  );
  registerPost(
    server,
    client,
    'r3ngine_propose_followups',
    'Propose follow-up plan',
    'Submit a 1–5 step follow-up plan. Tell the operator they may edit then approve (abort/retry later). Do not chain dispatch without a new plan.',
    {
      project_slug: z.string(),
      scan_id: z.number().int().optional(),
      assessment_id: z.number().int().optional(),
      rationale: z.string().optional(),
      steps: z.array(stepSchema).min(1).max(5),
      response_format: formatSchema,
    },
    '/api/mcp/followups/propose/',
    (args) => ({
      project_slug: args.project_slug,
      scan_id: args.scan_id,
      assessment_id: args.assessment_id,
      rationale: args.rationale,
      steps: args.steps,
    }),
  );
  registerPostPath(
    server,
    client,
    'r3ngine_update_followups',
    'Update follow-up plan',
    'Operator-only: replace/reorder/add/remove steps while status is proposed (max 5).',
    {
      plan_id: z.number().int(),
      steps: z.array(stepSchema).min(1).max(5),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/followups/${args.plan_id}/update/`,
    (args) => ({ steps: args.steps, operator: true }),
  );
  registerPostPath(
    server,
    client,
    'r3ngine_approve_followups',
    'Approve follow-up plan',
    'Operator approves plan_id (optional final steps inline). Runs steps sequentially; stop on first failure unless continue_on_error.',
    {
      plan_id: z.number().int(),
      steps: z.array(stepSchema).min(1).max(5).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/followups/${args.plan_id}/approve/`,
    (args) => ({ steps: args.steps }),
  );
  registerPostPath(
    server,
    client,
    'r3ngine_abort_followups',
    'Abort follow-up plan',
    'Kill switch for approved/running plans. Cancels Temporal work; remaining steps skipped.',
    { plan_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/followups/${args.plan_id}/abort/`,
    () => ({}),
    true,
  );
  registerPostPath(
    server,
    client,
    'r3ngine_retry_followups',
    'Retry follow-up plan',
    'Operator-only retry for failed/aborted plans. Default: re-run failed/aborted/skipped steps. Not auto-triggered.',
    {
      plan_id: z.number().int(),
      step_ids: z.array(z.string()).optional(),
      include_succeeded: z.boolean().optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/followups/${args.plan_id}/retry/`,
    (args) => ({
      step_ids: args.step_ids,
      include_succeeded: args.include_succeeded,
    }),
  );
}
