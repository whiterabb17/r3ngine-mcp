import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  isDenied,
  loadAllowlist,
  skillPresent,
} from '../scripts/sync-cyber-skills.mjs';
import { TOOL_NAMES } from '../src/tools/index.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(ROOT, '..');
const AGENTS_DIR = path.join(REPO_ROOT, '.cursor', 'agents');

function readAgent(name) {
  return fs.readFileSync(path.join(AGENTS_DIR, name), 'utf8');
}

test('allowlisted vendor skills are present after sync', () => {
  const allowlist = loadAllowlist();
  for (const skill of allowlist.skills) {
    assert.equal(skillPresent(skill.id), true, `missing vendor skill: ${skill.id}`);
    assert.equal(isDenied(skill.id, allowlist), null);
    const adapter = path.join(ROOT, 'skills', 'vendor', 'anthropic', skill.id, 'ADAPTER.md');
    assert.equal(fs.existsSync(adapter), true, `missing ADAPTER.md for ${skill.id}`);
  }
  assert.equal(fs.existsSync(path.join(ROOT, 'skills', 'vendor', 'anthropic', 'MANIFEST.json')), true);
});

test('denylist blocks offensive skill ids', () => {
  const allowlist = loadAllowlist();
  for (const id of [
    'attacking-active-directory',
    'exploiting-sql-injection-vulnerabilities',
    'phishing-campaign-lab',
    'payload-generator',
  ]) {
    assert.ok(isDenied(id, allowlist), id);
  }
});

test('SAFE validation tools are registered', () => {
  const required = [
    'r3ngine_analyze_vulnerability',
    'r3ngine_enrich_vulnerability',
    'r3ngine_validate_vulnerability',
    'r3ngine_enrich_attack_path',
  ];
  for (const name of required) {
    assert.ok(TOOL_NAMES.includes(name), name);
  }
});

test('agent prompts include skill bootstrap and hard stops', () => {
  const assessor = readAgent('r3ngine-assessor.md');
  const osint = readAgent('r3ngine-osint.md');
  const validator = readAgent('r3ngine-vuln-validator.md');

  for (const text of [assessor, osint, validator]) {
    assert.match(text, /Skill bootstrap/i);
    assert.match(text, /Self-critique/i);
    assert.match(text, /Success criteria/i);
    assert.match(text, /never.*~\/\.claude\/skills|Never `~\/\.claude\/skills`|never `~\/\.claude\/skills`/i);
  }

  assert.match(assessor, /r3ngine-vuln-validator/);
  assert.match(assessor, /r3ngine-osint/);
  assert.match(osint, /keep[\s\S]*noise[\s\S]*uncertain/i);
  assert.match(validator, /confirm_verified/);
  assert.match(validator, /0\.8/);
  assert.match(validator, /payload/i);
  assert.match(validator, /r3ngine_run_tool/);
  const safePoc = readAgent('r3ngine-safe-poc.md');
  assert.match(safePoc, /r3ngine_propose_safe_poc/);
  assert.match(safePoc, /template_id/);
  assert.match(assessor, /r3ngine-safe-poc/);
});

test('fixtures exist for assessor osint validator scenarios', () => {
  for (const file of [
    'assessor-scope.yaml',
    'osint-handoff.yaml',
    'validator-gates.yaml',
  ]) {
    const p = path.join(ROOT, 'evals', 'fixtures', file);
    assert.equal(fs.existsSync(p), true, p);
    const body = fs.readFileSync(p, 'utf8');
    assert.ok(body.includes('scenario:'));
  }
});

test('AGENTS.md documents portable skills sync', () => {
  const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
  assert.match(agents, /sync-cyber-skills/);
  assert.match(agents, /vendor\/anthropic/);
  assert.doesNotMatch(agents, /Co-Authored-By/);
});


test('safe-poc handoff and allowlist', () => {
  const handoff = fs.readFileSync(path.join(ROOT, 'skills/safe-poc/poc-handoff.md'), 'utf8');
  assert.ok(handoff.includes('suggested_template_id'));
  assert.ok(handoff.includes('vulnerability_id'));
  assert.ok(!/payload\s*:/.test(handoff) || handoff.includes('Never include freeform'));

  const allow = JSON.parse(fs.readFileSync(path.join(ROOT, 'skills/allowlist.json'), 'utf8'));
  for (const bad of ['exploiting-sql-injection', 'attacking-active-directory', 'sqlmap-runbook']) {
    const denied = (allow.denyNamePrefixes || []).some((p) => bad.startsWith(p))
      || (allow.denyNameSubstrings || []).some((p) => bad.includes(p));
    assert.ok(denied || !allow.skills.some((x) => x.id === bad), bad);
  }
  const ids = allow.skills.map((x) => x.id);
  assert.ok(ids.includes('testing-for-xss-vulnerabilities'));
  assert.ok(ids.includes('implementing-canary-tokens-for-network-intrusion'));
  const xss = allow.skills.find((x) => x.id === 'testing-for-xss-vulnerabilities');
  assert.ok(xss.agents.includes('r3ngine-safe-poc'));
});

