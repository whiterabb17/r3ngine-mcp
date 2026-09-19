import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPost } from './common.js';

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
  registerPost(
    server,
    client,
    'r3ngine_trigger_apme',
    'Trigger APME',
    'Queue LLM-assisted attack path modeling for a scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/apme/trigger/',
    (args) => ({ scan_id: args.scan_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_recalculate_apme',
    'Recalculate APME',
    'Queue algorithmic attack path recalculation for a scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/apme/recalculate/',
    (args) => ({ scan_id: args.scan_id }),
  );
}
