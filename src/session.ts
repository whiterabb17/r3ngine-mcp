import type { RengineMcpClient } from './client.js';
import { resolveAgentIdentity, type AgentIdentity } from './identity.js';

export function sessionPayload(
  info: { name: string; version: string; transport: 'stdio' | 'http' },
  identity: AgentIdentity,
) {
  return {
    transport: info.transport,
    client_name: info.name,
    client_version: info.version,
    agent_id: identity.agentId,
    provider: identity.provider,
    ide: identity.ide,
    device_id: identity.deviceId,
    os: identity.osName,
    hostname: identity.hostname,
    username: identity.username,
  };
}

export async function openSession(
  client: RengineMcpClient,
  info: { name: string; version: string; transport: 'stdio' | 'http' },
  identity: AgentIdentity = resolveAgentIdentity(),
): Promise<string> {
  const data = (await client.request('POST', '/api/mcp/sessions/', sessionPayload(info, identity))) as {
    session_id: string;
  };
  client.sessionId = data.session_id;
  return data.session_id;
}

export function startHeartbeat(client: RengineMcpClient, sessionId: string): NodeJS.Timeout {
  const timer = setInterval(() => {
    void client.request('POST', `/api/mcp/sessions/${sessionId}/heartbeat/`).catch((error: Error) => {
      if (String(error.message).toLowerCase().includes('session')) {
        clearInterval(timer);
      }
    });
  }, 30000);
  timer.unref?.();
  return timer;
}
