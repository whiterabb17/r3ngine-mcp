import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPost } from './common.js';

export function registerOsintTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_emails',
    'List emails',
    'List emails for a scan. Passwords are never returned. Read-only.',
    {
      scan_id: z.number().int(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/emails/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_employees',
    'List employees',
    'List employees for a scan. Read-only.',
    {
      scan_id: z.number().int(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/employees/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_osint_staging',
    'List OSINT staging',
    'List OSINT staging rows for a scan (default status=pending). Use to build an OSINT verify handoff package. Read-only.',
    {
      scan_id: z.number().int(),
      status: z.enum(['pending', 'validated', 'ignored', 'all']).optional(),
      osint_type: z.string().optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/osint-staging/${queryString(args)}`,
  );
  registerPost(
    server,
    client,
    'r3ngine_verify_osint_staging',
    'Verify OSINT staging',
    'Post agent triage: set agent_verified true (keep) or false (noise/FP) on staging ids for a scan. Does not promote or delete. Operator uses UI Add verified / Clear false positive after.',
    {
      scan_id: z.number().int(),
      updates: z
        .array(
          z.object({
            id: z.number().int(),
            agent_verified: z.boolean(),
          }),
        )
        .min(1)
        .max(100),
      response_format: formatSchema,
    },
    '/api/mcp/osint-staging/verify/',
    (args) => ({ scan_id: args.scan_id, updates: args.updates }),
  );
}
