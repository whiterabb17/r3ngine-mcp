import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatResult } from '../format.js';
import { McpHttpError, toolError } from '../errors.js';

export const formatSchema = z.enum(['markdown', 'json']).optional();

export function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'response_format') continue;
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export async function safeCall(
  fn: () => Promise<{ content: { type: 'text'; text: string }[]; structuredContent?: Record<string, unknown> }>,
) {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof McpHttpError || error instanceof Error ? error.message : String(error);
    return toolError(message);
  }
}

export function registerGet(
  server: McpServer,
  client: RengineMcpClient,
  name: string,
  title: string,
  description: string,
  inputSchema: Record<string, z.ZodTypeAny>,
  path: (args: Record<string, unknown>) => string,
) {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args) =>
      safeCall(async () => {
        const data = await client.request('GET', path(args as Record<string, unknown>));
        return formatResult(data, (args as { response_format?: 'markdown' | 'json' }).response_format ?? 'markdown');
      }),
  );
}

export function registerPost(
  server: McpServer,
  client: RengineMcpClient,
  name: string,
  title: string,
  description: string,
  inputSchema: Record<string, z.ZodTypeAny>,
  path: string,
  body: (args: Record<string, unknown>) => unknown,
  idempotent = false,
) {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: idempotent,
        openWorldHint: true,
      },
    },
    async (args) =>
      safeCall(async () => {
        const data = await client.request('POST', path, body(args as Record<string, unknown>));
        return formatResult(data, (args as { response_format?: 'markdown' | 'json' }).response_format ?? 'markdown');
      }),
  );
}
