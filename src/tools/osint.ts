import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet } from './common.js';

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
}
