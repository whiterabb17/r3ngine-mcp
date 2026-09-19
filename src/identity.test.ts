import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { agentIdFromFacts, collectAgentFacts, detectProvider, findLogoPng, mcpServerIcons } from './identity.ts';

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('detectProvider prefers Cursor over VS Code env', () => {
  assert.equal(detectProvider({ CURSOR_TRACE_ID: '1', VSCODE_PID: '2' }), 'cursor');
  assert.equal(detectProvider({ VSCODE_PID: '2' }), 'vscode');
  assert.equal(detectProvider({ CLAUDE_CODE: '1' }), 'claude');
  assert.equal(detectProvider({ R3NGINE_MCP_PROVIDER: 'Cursor' }), 'cursor');
});

test('agent id is stable for the same provider and device facts', () => {
  const facts = collectAgentFacts(
    {},
    {
      provider: 'cursor',
      ide: 'cursor',
      deviceId: 'machine-guid',
      hostname: 'dev-box',
      osName: 'win32-x64',
      username: 'lizelle',
    },
  );
  const first = agentIdFromFacts(facts);
  const second = agentIdFromFacts({ ...facts });
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.notEqual(
    agentIdFromFacts({ ...facts, provider: 'claude' }),
    first,
  );
});

test('mcp server icon uses frontend/public/img/logo.png or assets/logo.png', () => {
  const fromMcp = findLogoPng(mcpRoot);
  assert.ok(fromMcp);
  assert.match(fromMcp.replace(/\\/g, '/'), /logo\.png$/);
  const icons = mcpServerIcons(mcpRoot);
  assert.equal(icons[0]?.mimeType, 'image/png');
  assert.match(icons[0]?.src || '', /^data:image\/png;base64,/);
});
