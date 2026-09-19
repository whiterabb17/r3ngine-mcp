import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertAllowedPath } from './allowlist.ts';

test('allows targets and session open', () => {
  assert.doesNotThrow(() => assertAllowedPath('/api/mcp/targets/'));
  assert.doesNotThrow(() => assertAllowedPath('/api/mcp/sessions/'));
  assert.doesNotThrow(() => assertAllowedPath('/api/mcp/sessions/abc/heartbeat/'));
});

test('refuses audit, keys, and session revoke', () => {
  assert.throws(() => assertAllowedPath('/api/mcp/audit/'), /Refusing non-allowlisted/);
  assert.throws(() => assertAllowedPath('/api/mcp/keys/'), /Refusing non-allowlisted/);
  assert.throws(() => assertAllowedPath('/api/mcp/sessions/abc/revoke/'), /Refusing non-allowlisted/);
});
