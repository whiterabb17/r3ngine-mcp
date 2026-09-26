import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatResult } from '../format.js';
import { formatSchema, queryString, registerGet, safeCall } from './common.js';

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
  server.registerTool(
    'r3ngine_export_scan_for_ai',
    {
      title: 'Export scan for AI',
      description:
        'Full Analyst Assist assessment export for one scan (same data as the scan-detail Export for AI ZIP): '
        + 'prioritized markdown overview, triage prompt, structured bundle (findings, assets, timeline, OSINT), and manifest. '
        + 'Prefer this for complete scan analysis instead of paging many list/detail tools. Read-only.',
      inputSchema: {
        scan_id: z.number().int(),
        preset: z.enum(['analyst_assist']).optional(),
        include_raw_outputs: z.boolean().optional(),
        include_timeline: z.boolean().optional(),
        include_sidecars: z.boolean().optional(),
        include_files: z.boolean().optional(),
        response_format: formatSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args) =>
      safeCall(async () => {
        const {
          scan_id,
          response_format,
          ...opts
        } = args as {
          scan_id: number;
          response_format?: 'markdown' | 'json';
          preset?: string;
          include_raw_outputs?: boolean;
          include_timeline?: boolean;
          include_sidecars?: boolean;
          include_files?: boolean;
        };
        const data = await client.request(
          'GET',
          `/api/mcp/scans/${scan_id}/export-ai/${queryString(opts)}`,
        ) as Record<string, unknown>;
        if (response_format === 'json') {
          return formatResult(data, 'json');
        }
        const markdown = typeof data.markdown === 'string' ? data.markdown : null;
        const prompt = typeof data.prompt === 'string' ? data.prompt : '';
        if (markdown) {
          const text = prompt
            ? `${markdown}\n\n---\n\n## Suggested triage prompt\n\n${prompt}`
            : markdown;
          return {
            content: [{ type: 'text' as const, text }],
            structuredContent: data,
          };
        }
        return formatResult(data, 'markdown');
      }),
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
