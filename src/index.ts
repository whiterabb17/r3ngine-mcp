#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { RengineMcpClient } from './client.js';
import { McpHttpError } from './errors.js';
import { createServer } from './server.js';
import { openSession, startHeartbeat } from './session.js';
import { resolveAgentIdentity } from './identity.js';
import { UnauthRateLimit, clientIp } from './ratelimit.js';

const HTTP_DISABLED =
  'HTTP MCP is disabled. Enable HTTP or both in Settings → MCP Access, or use stdio.';
const UNAUTH_MESSAGE =
  'API key invalid or revoked. Generate a new key in Settings → MCP Access.';

function bearerFrom(req: express.Request): string | undefined {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return undefined;
  return header.slice(7).trim() || undefined;
}

function originAllowed(req: express.Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const hostname = new URL(origin).hostname;
    const hostHeader = String(req.headers.host || '').split(':')[0];
    return hostname === hostHeader;
  } catch {
    return false;
  }
}

function sendRateLimited(res: express.Response, retryAfter: number) {
  res.setHeader('Retry-After', String(retryAfter));
  res.status(429).json({ error: 'Rate limited. Retry later.' });
}

async function main() {
  const url = process.env.R3NGINE_URL;
  const apiKey = process.env.R3NGINE_MCP_API_KEY;
  const httpMode = process.env.MCP_TRANSPORT === 'http';

  if (!url || (!httpMode && !apiKey)) {
    console.error('Missing R3NGINE_URL or R3NGINE_MCP_API_KEY');
    process.exit(1);
  }

  if (!httpMode) {
    const client = new RengineMcpClient(url, apiKey as string);
    const identity = resolveAgentIdentity();
    const sessionId = await openSession(client, {
      name: 'r3ngine-mcp',
      version: '1.0.0',
      transport: 'stdio',
    }, identity);
    startHeartbeat(client, sessionId);
    const server = createServer(client);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return;
  }

  const limiter = new UnauthRateLimit(
    Number(process.env.MCP_UNAUTH_MAX || 10) || 10,
    Number(process.env.MCP_UNAUTH_WINDOW_MS || 60_000) || 60_000,
  );
  const clients = new Map<string, RengineMcpClient>();

  async function clientFor(secret: string): Promise<RengineMcpClient> {
    const existing = clients.get(secret);
    if (existing) return existing;
    const client = new RengineMcpClient(url as string, secret);
    const sessionId = await openSession(client, {
      name: 'r3ngine-mcp',
      version: '1.0.0',
      transport: 'http',
    }, resolveAgentIdentity(process.env, { provider: 'http-sidecar' }));
    startHeartbeat(client, sessionId);
    clients.set(secret, client);
    return client;
  }

  const bind = process.env.MCP_BIND || '0.0.0.0';
  const port = Number(process.env.MCP_PORT || 3100);
  const app = express();

  // Drop already-limited IPs before parsing JSON so floods never hit Django or the body parser.
  app.use((req, res, next) => {
    const ip = clientIp(req);
    if (limiter.isLimited(ip)) {
      sendRateLimited(res, limiter.retryAfterSeconds(ip));
      return;
    }
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  const rejectUnauthorized = (res: express.Response, ip: string) => {
    limiter.recordFailure(ip);
    if (limiter.isLimited(ip)) {
      sendRateLimited(res, limiter.retryAfterSeconds(ip));
      return;
    }
    res.status(401).json({ error: UNAUTH_MESSAGE });
  };

  const handle = async (req: express.Request, res: express.Response) => {
    const ip = clientIp(req);
    if (limiter.isLimited(ip)) {
      sendRateLimited(res, limiter.retryAfterSeconds(ip));
      return;
    }
    if (!originAllowed(req)) {
      limiter.recordFailure(ip);
      res.status(403).json({ error: 'Invalid Origin' });
      return;
    }
    const secret = bearerFrom(req);
    if (!secret || limiter.isKnownBadKey(secret)) {
      rejectUnauthorized(res, ip);
      return;
    }
    let client: RengineMcpClient;
    try {
      client = await clientFor(secret);
    } catch (error) {
      if (error instanceof McpHttpError && error.status === 401) {
        limiter.rememberBadKey(secret);
        rejectUnauthorized(res, ip);
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof McpHttpError ? error.status : 500;
      res.status(status).json({ error: message });
      return;
    }
    try {
      const settings = (await client.request('GET', '/api/mcp/settings/')) as {
        transport_mode?: string;
      };
      if (settings.transport_mode === 'stdio') {
        res.status(403).json({ error: HTTP_DISABLED });
        return;
      }
      const server = createServer(client);
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof McpHttpError ? error.status : 500;
      res.status(status).json({ error: message });
    }
  };

  app.all('/mcp', handle);
  app.use('/mcp', handle);
  app.listen(port, bind, () => {
    console.error(`r3ngine-mcp HTTP listening on ${bind}:${port}`);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
