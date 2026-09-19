import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  formatEnvFile,
  maskKey,
  mergeMcpConfig,
  nodeBin,
  usesCmdShell,
  parseArgs,
  parseEnvFile,
  requireNodeVersion,
  stopMcpServer,
  setupAgentIdentity,
  validateKey,
  validateUrl,
  probeInstance,
  findCaCert,
  findSecretsCertsDir,
  missingCaMessage,
  formatAgentCertInstructions,
  suggestedCopyDest,
  expectedCaPath,
  requireCaFile,
} from './install.mjs';

test('parseArgs reads transport and refuses unknown flags', () => {
  const opts = parseArgs(['--url', 'https://x', '--transport', 'http', '--yes']);
  assert.equal(opts.transport, 'http');
  assert.equal(opts.yes, true);
  assert.equal(parseArgs(['--stop']).stop, true);
  assert.equal(parseArgs(['--restart']).restart, true);
  assert.throws(() => parseArgs(['--stop', '--restart']), /not both/);
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

test('nodeBin uses NODE from env instead of an absolute path', () => {
  assert.equal(nodeBin({}), 'node');
  assert.equal(nodeBin({ NODE: 'node' }), 'node');
  assert.equal(usesCmdShell('C:\\Program Files\\nodejs\\node.exe', 'win32'), false);
  assert.equal(usesCmdShell('npm.cmd', 'win32'), true);
});

test('findCaCert reads secrets/certs/ca.crt from the r3ngine checkout', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r3n-install-ca-'));
  const certs = path.join(root, 'secrets', 'certs');
  fs.mkdirSync(certs, { recursive: true });
  const ca = path.join(certs, 'ca.crt');
  fs.writeFileSync(ca, 'ca');
  const mcp = path.join(root, 'r3ngine-mcp');
  fs.mkdirSync(mcp);
  assert.equal(findSecretsCertsDir(mcp), certs);
  assert.equal(findCaCert(mcp, {}), ca);
  assert.match(missingCaMessage(false), /Copy secrets\/certs\/ca.crt/);
});

test('missing CA instructions include a full path for agents', () => {
  const dest = 'D:\\certs\\ca.crt';
  const text = missingCaMessage({
    localSecrets: false,
    expectedPath: dest,
    copyDest: dest,
  });
  assert.match(text, /Copy secrets\/certs\/ca.crt/);
  assert.match(text, /--ca D:\\certs\\ca.crt/);
  assert.match(text, /D:\\certs\\ca.crt/);
});

test('formatAgentCertInstructions prints the full CA path for MCP env', () => {
  const ca = path.join(os.tmpdir(), 'r3n-agent-ca.crt');
  fs.writeFileSync(ca, 'ca');
  const text = formatAgentCertInstructions(ca, 'r3ngine.example.com');
  assert.match(text, new RegExp(ca.replace(/\\/g, '\\\\')));
  assert.match(text, /NODE_EXTRA_CA_CERTS=/);
  assert.match(text, /R3NGINE_TLS_SERVER_NAME=r3ngine.example.com/);
  assert.equal(requireCaFile(ca), path.resolve(ca));
  assert.match(suggestedCopyDest('/mcp'), /certs[\\/]ca\.crt/);
  assert.match(expectedCaPath('/mcp', '/r3n/secrets/certs'), /ca\.crt/);
});

test('setupAgentIdentity is a 64-char fingerprint', () => {
  const id = setupAgentIdentity();
  assert.equal(id.provider, 'r3ngine-mcp-setup');
  assert.equal(id.agentId.length, 64);
});

test('stopMcpServer is a no-op without a pid file', () => {
  const result = stopMcpServer(path.join(os.tmpdir(), 'missing-r3ngine-mcp.pid'));
  assert.equal(result.stopped, false);
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
