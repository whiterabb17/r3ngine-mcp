import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet } from './common.js';

export function registerScanTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_scans',
    'List scans',
    'List scans in a project. Read-only.',
    {
      project_slug: z.string(),
      target_id: z.number().int().optional(),
      status: z.number().int().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/scans/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_scan',
    'Get scan',
    'Get one scan by id. Read-only.',
    { scan_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/scans/${args.scan_id}/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_scan_detail',
    'Get scan detail',
    'Scan with finding rollups and tasks grouped by status (initiated/running/success/failed/aborted). Use after thin get/list when you need relations or task buckets. Read-only.',
    { scan_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/scans/${args.scan_id}/detail/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_scan_status',
    'Get scan status',
    'Pending, running, and recently completed scans. Read-only.',
    { project_slug: z.string(), response_format: formatSchema },
    (args) => `/api/mcp/scan-status/${queryString({ project_slug: args.project_slug })}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_subscans',
    'List subscans',
    'List subscans for a scan. Read-only.',
    {
      scan_id: z.number().int(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/subscans/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_subscan_detail',
    'Get subscan detail',
    'Subscan with parent scan and status-bucketed activities. Use after thin list when you need relations or task buckets. Read-only.',
    { subscan_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/subscans/${args.subscan_id}/detail/`,
  );
}
