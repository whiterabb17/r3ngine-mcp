import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from './client.js';
import { mcpServerIcons } from './identity.js';
import { registerTools } from './tools/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createServer(client: RengineMcpClient): McpServer {
  const server = new McpServer({
    name: 'r3ngine',
    version: '1.0.0',
    websiteUrl: 'https://github.com/whiterabb17/r3ngine',
    icons: mcpServerIcons(ROOT),
  } as ConstructorParameters<typeof McpServer>[0]);
  registerTools(server, client);
  return server;
}
