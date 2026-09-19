import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet } from './common.js';

export function registerTargetTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_targets',
    'List targets',
    'List r3ngine targets in a project. Read-only.',
    {
      project_slug: z.string().describe('Project slug'),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/targets/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_target',
    'Get target',
    'Get one target by id. Read-only.',
    { target_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/targets/${args.target_id}/`,
  );
}
