import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatEnvFile,
  maskKey,
  mergeMcpConfig,
  parseArgs,
  parseEnvFile,
  requireNodeVersion,
  validateKey,
  validateUrl,
  probeInstance,
} from './install.mjs';

test('parseArgs reads transport and refuses unknown flags', () => {
  const opts = parseArgs(['--url', 'https://x', '--transport', 'http', '--yes']);
  assert.equal(opts.transport, 'http');
  assert.equal(opts.yes, true);
  assert.throws(() => parseArgs(['--nope']), /Unknown argument/);
});

test('validateUrl and validateKey', () => {
  assert.equal(validateUrl('https://r3ngine.example/'), 'https://r3ngine.example');
  assert.throws(() => validateUrl('ftp://x'), /http/);
  assert.ok(validateKey('r3n_mcp_abcdefghijklmnop'));
  assert.throws(() => validateKey('sk-not-mcp'), /r3n_mcp_/);
});

test('parse and format env without dropping extra known keys', () => {
  const parsed = parseEnvFile('R3NGINE_URL=https://h\n# c\nMCP_PORT=3100\n');
  assert.equal(parsed.R3NGINE_URL, 'https://h');
  const text = formatEnvFile({
    R3NGINE_URL: 'https://h',
    R3NGINE_MCP_API_KEY: 'r3n_mcp_secret',
    MCP_TRANSPORT: 'stdio',
  });
  assert.match(text, /R3NGINE_MCP_API_KEY=r3n_mcp_secret/);
  assert.equal(maskKey('r3n_mcp_secretvalue'), 'r3n_mcp_secr…');
});

test('mergeMcpConfig keeps other servers', () => {
  const merged = mergeMcpConfig({ mcpServers: { other: { command: 'x' } } }, 'mcpServers', 'r3ngine', {
    command: 'node',
    args: ['dist/index.js'],
  });
  assert.equal(merged.mcpServers.other.command, 'x');
  assert.equal(merged.mcpServers.r3ngine.command, 'node');
});

test('requireNodeVersion', () => {
  requireNodeVersion('22.1.0', 20);
  assert.throws(() => requireNodeVersion('18.20.0', 20), /20\+/);
});

test('probeInstance opens a session then checks settings and health', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init?.method || 'GET' });
    if (url.endsWith('/sessions/') && init?.method === 'POST') {
      return { ok: true, status: 201, text: async () => '{"session_id":"abc"}' };
    }
    if (url.includes('/settings/')) {
      return { ok: true, status: 200, json: async () => ({ transport_mode: 'both' }) };
    }
    if (url.includes('/health/')) {
      return { ok: true, status: 200, json: async () => ({ database: { status: 'up' } }) };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };
  const result = await probeInstance({
    url: 'https://h',
    key: 'r3n_mcp_abcdefghijklmnop',
    transport: 'stdio',
    fetchImpl,
  });
  assert.equal(result.sessionId, 'abc');
  assert.equal(result.transportMode, 'both');
  assert.equal(calls[0].method, 'POST');
});
