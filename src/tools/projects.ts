import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet } from './common.js';

export function registerProjectTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_projects',
    'List projects',
    'List r3ngine projects. Read-only.',
    { response_format: formatSchema },
    () => '/api/mcp/projects/',
  );
}
