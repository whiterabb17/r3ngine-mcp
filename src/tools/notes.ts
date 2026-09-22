import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet, registerPatch, registerPost } from './common.js';

export function registerNoteTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_notes',
    'List notes',
    'List recon / scan notes. Filter by project, scan, target, or subdomain. Read-only.',
    {
      project: z.string().optional(),
      scan_id: z.number().int().optional(),
      target_id: z.number().int().optional(),
      subdomain_id: z.number().int().optional(),
      todo_id: z.number().int().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/notes/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_note',
    'Get note',
    'Get one recon note by id. Read-only.',
    { note_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/notes/${args.note_id}/`,
  );
  registerPost(
    server,
    client,
    'r3ngine_create_note',
    'Create note',
    'Create a recon note. Optional scan_id and/or subdomain_id. Not available to auditors.',
    {
      project: z.string(),
      title: z.string(),
      description: z.string().optional(),
      scan_id: z.number().int().optional(),
      subdomain_id: z.number().int().optional(),
      is_important: z.boolean().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/notes/',
    (args) => ({
      project: args.project,
      title: args.title,
      description: args.description,
      scan_id: args.scan_id,
      subdomain_id: args.subdomain_id,
      is_important: args.is_important,
    }),
  );
  registerPatch(
    server,
    client,
    'r3ngine_update_note',
    'Update note',
    'Update title, description, is_done, or is_important on a note. Does not re-link scan/subdomain. Not available to auditors. No delete.',
    {
      note_id: z.number().int(),
      title: z.string().optional(),
      description: z.string().optional(),
      is_done: z.boolean().optional(),
      is_important: z.boolean().optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/notes/${args.note_id}/`,
    (args) => ({
      title: args.title,
      description: args.description,
      is_done: args.is_done,
      is_important: args.is_important,
    }),
  );
}
