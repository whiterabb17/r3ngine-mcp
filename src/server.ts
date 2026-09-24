import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from './client.js';
import { mcpServerIcons } from './identity.js';
import { registerTools } from './tools/index.js';
import { PACKAGE_VERSION } from './version.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createServer(client: RengineMcpClient): McpServer {
  const server = new McpServer({
    name: 'r3ngine',
    version: PACKAGE_VERSION,
    websiteUrl: 'https://github.com/whiterabb17/r3ngine',
    icons: mcpServerIcons(ROOT),
  });
  registerTools(server, client);
  return server;
}
