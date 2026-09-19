import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatResult } from './format.ts';

test('json format returns stringify', () => {
  const result = formatResult({ ok: 1 }, 'json');
  assert.equal(result.content[0].text, '{\n  "ok": 1\n}');
});

test('markdown lists items as a table', () => {
  const result = formatResult({
    items: [{ id: 1, name: 'a' }],
    count: 1,
    total_count: 1,
  }, 'markdown');
  assert.match(result.content[0].text, /\| id \| name \|/);
  assert.match(result.content[0].text, /\| 1 \| a \|/);
});
