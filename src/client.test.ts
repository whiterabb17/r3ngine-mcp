import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RengineMcpClient } from './client.ts';

test('client refuses audit path before fetch', async () => {
  const client = new RengineMcpClient('http://example.invalid', 'r3n_mcp_test');
  await assert.rejects(
    () => client.request('GET', '/api/mcp/audit/'),
    /Refusing non-allowlisted/,
  );
});
