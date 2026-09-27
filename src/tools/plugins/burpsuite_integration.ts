import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import {
  formatSchema,
  queryString,
  registerGet,
  registerPost,
} from '../common.js';

export const BURP_PLUGIN_SLUG = 'burpsuite_integration';

export const BURP_PLUGIN_TOOL_NAMES = [
  'r3ngine_list_burp_issues',
  'r3ngine_get_burp_issue',
  'r3ngine_get_burp_metrics',
  'r3ngine_list_burp_sync_logs',
  'r3ngine_get_burp_health',
  'r3ngine_start_burp_sync',
] as const;

export function registerBurpsuiteIntegrationTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_burp_issues',
    'List Burp issues',
    'List imported Burp Suite issues. Requires burpsuite_integration plugin.',
    {
      unmatched: z.boolean().optional(),
      severity: z.number().int().min(0).max(4).optional(),
      q: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => {
      const params: Record<string, unknown> = { ...args };
      if (params.unmatched === true) params.unmatched = 'true';
      else delete params.unmatched;
      return `/api/mcp/burp/issues/${queryString(params)}`;
    },
  );
  registerGet(
    server,
    client,
    'r3ngine_get_burp_issue',
    'Get Burp issue',
    'Get one imported Burp issue by id.',
    { issue_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/burp/issues/${args.issue_id}/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_burp_metrics',
    'Get Burp metrics',
    'Aggregated severity/unmatched counts for imported Burp issues.',
    { response_format: formatSchema },
    () => '/api/mcp/burp/issues/metrics/',
  );
  registerGet(
    server,
    client,
    'r3ngine_list_burp_sync_logs',
    'List Burp sync logs',
    'List Burp import/push sync log entries.',
    {
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/burp/sync-logs/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_burp_health',
    'Get Burp health',
    'Live connectivity check against the configured Burp Suite REST API.',
    { response_format: formatSchema },
    () => '/api/mcp/burp/health/',
  );
  registerPost(
    server,
    client,
    'r3ngine_start_burp_sync',
    'Start Burp sync',
    'Start a Burp Suite import + correlate Temporal workflow.',
    {
      scan_history_id: z.number().int().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/burp/sync/import/',
    (args) => ({ scan_history_id: args.scan_history_id }),
  );
}
