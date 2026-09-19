import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from './client.js';
import { registerTools } from './tools/index.js';

export function createServer(client: RengineMcpClient): McpServer {
  const server = new McpServer({ name: 'r3ngine', version: '1.0.0' });
  registerTools(server, client);
  return server;
}
