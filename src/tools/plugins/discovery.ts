import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import { formatSchema, registerGet } from '../common.js';

/** Always-on discovery tools (no plugin required). */
export const PLUGIN_DISCOVERY_TOOL_NAMES = [
  'r3ngine_list_plugins',
  'r3ngine_get_plugin',
] as const;

export function registerPluginDiscoveryTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_plugins',
    'List plugins',
    'List installed and enabled platform plugins with their declared MCP tool names. '
      + 'Plugin-specific tools are only usable when listed here.',
    { response_format: formatSchema },
    () => '/api/mcp/plugins/',
  );
  registerGet(
    server,
    client,
    'r3ngine_get_plugin',
    'Get plugin',
    'Get one enabled plugin by slug, including mcp_tools from its manifest.',
    {
      slug: z.string().min(1),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/plugins/${encodeURIComponent(String(args.slug))}/`,
  );
}
