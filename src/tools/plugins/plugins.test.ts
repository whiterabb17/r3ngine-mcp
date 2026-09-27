import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AD_PLUGIN_SLUG,
  AD_PLUGIN_TOOL_NAMES,
  enabledSlugsFromPayload,
  registerEnabledPluginTools,
} from './index.ts';

test('enabledSlugsFromPayload extracts slugs', () => {
  const slugs = enabledSlugsFromPayload({
    results: [{ slug: 'active_directory' }, { slug: 'other' }, {}],
  });
  assert.equal(slugs.has('active_directory'), true);
  assert.equal(slugs.has('other'), true);
  assert.equal(slugs.has('missing'), false);
});

test('registerEnabledPluginTools skips when AD not enabled', () => {
  const registeredNames: string[] = [];
  const server = {
    registerTool: (name: string) => {
      registeredNames.push(name);
    },
  };
  const client = {} as never;
  const out = registerEnabledPluginTools(server as never, client, ['credential_intelligence']);
  assert.deepEqual(out, []);
  assert.equal(registeredNames.length, 0);
});

test('registerEnabledPluginTools registers AD tools when slug enabled', () => {
  const registeredNames: string[] = [];
  const server = {
    registerTool: (name: string) => {
      registeredNames.push(name);
    },
  };
  const client = {} as never;
  const out = registerEnabledPluginTools(server as never, client, [AD_PLUGIN_SLUG]);
  assert.deepEqual([...out].sort(), [...AD_PLUGIN_TOOL_NAMES].sort());
  for (const name of AD_PLUGIN_TOOL_NAMES) {
    assert.equal(registeredNames.includes(name), true, name);
  }
});
