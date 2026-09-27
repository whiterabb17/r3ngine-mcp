import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AD_PLUGIN_SLUG,
  AD_PLUGIN_TOOL_NAMES,
  BURP_PLUGIN_SLUG,
  BURP_PLUGIN_TOOL_NAMES,
  COMPLIANCE_PLUGIN_SLUG,
  COMPLIANCE_PLUGIN_TOOL_NAMES,
  CREDENTIAL_PLUGIN_SLUG,
  CREDENTIAL_PLUGIN_TOOL_NAMES,
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

test('registerEnabledPluginTools skips when no matching plugins enabled', () => {
  const registeredNames: string[] = [];
  const server = {
    registerTool: (name: string) => {
      registeredNames.push(name);
    },
  };
  const client = {} as never;
  const out = registerEnabledPluginTools(server as never, client, ['email_security']);
  assert.deepEqual(out, []);
  assert.equal(registeredNames.length, 0);
});

test('registerEnabledPluginTools registers tools for each enabled plugin', () => {
  const registeredNames: string[] = [];
  const server = {
    registerTool: (name: string) => {
      registeredNames.push(name);
    },
  };
  const client = {} as never;
  const out = registerEnabledPluginTools(server as never, client, [
    AD_PLUGIN_SLUG,
    CREDENTIAL_PLUGIN_SLUG,
    COMPLIANCE_PLUGIN_SLUG,
    BURP_PLUGIN_SLUG,
  ]);
  const expected = [
    ...AD_PLUGIN_TOOL_NAMES,
    ...CREDENTIAL_PLUGIN_TOOL_NAMES,
    ...COMPLIANCE_PLUGIN_TOOL_NAMES,
    ...BURP_PLUGIN_TOOL_NAMES,
  ];
  assert.deepEqual([...out].sort(), [...expected].sort());
  for (const name of expected) {
    assert.equal(registeredNames.includes(name), true, name);
  }
});
