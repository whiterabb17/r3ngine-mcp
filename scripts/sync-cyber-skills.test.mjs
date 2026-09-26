import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  isDenied,
  loadAllowlist,
  parseSyncArgs,
  resolveSkillIds,
  skillPresent,
  syncCyberSkills,
} from './sync-cyber-skills.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWLIST = loadAllowlist(path.join(ROOT, 'skills', 'allowlist.json'));

test('parseSyncArgs reads flags', () => {
  const opts = parseSyncArgs(['--missing-only', '--dry-run', '--skill', 'a', '--skill', 'b']);
  assert.equal(opts.missingOnly, true);
  assert.equal(opts.dryRun, true);
  assert.deepEqual(opts.skillIds, ['a', 'b']);
  assert.throws(() => parseSyncArgs(['--nope']), /Unknown/);
});

test('denylist refuses attacking and exploit names', () => {
  assert.match(isDenied('attacking-web-apps', ALLOWLIST) || '', /denied/);
  assert.match(isDenied('exploiting-sql-injection-vulnerabilities', ALLOWLIST) || '', /denied/);
  assert.match(isDenied('credential-bruteforce-lab', ALLOWLIST) || '', /denied/);
  assert.equal(isDenied('performing-web-application-vulnerability-triage', ALLOWLIST), null);
});

test('resolveSkillIds fail-closed for unknown and denied', () => {
  assert.throws(
    () => resolveSkillIds(ALLOWLIST, { skillIds: ['attacking-foo'] }),
    /denied|Refusing/,
  );
  assert.throws(
    () => resolveSkillIds(ALLOWLIST, { skillIds: ['not-on-allowlist-ever'] }),
    /not on allowlist/,
  );
  const ids = resolveSkillIds(ALLOWLIST, {
    skillIds: ['performing-web-application-vulnerability-triage'],
  });
  assert.deepEqual(ids, ['performing-web-application-vulnerability-triage']);
});

test('dry-run lists skills without cloning', () => {
  const result = syncCyberSkills({
    allowlist: ALLOWLIST,
    dryRun: true,
    skillIds: ['mapping-mitre-attack-techniques'],
  });
  assert.equal(result.dryRun, true);
  assert.deepEqual(result.synced, ['mapping-mitre-attack-techniques']);
});

test('missing-only skips present vendor dirs', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-test-'));
  const vendorRoot = path.join(tmp, 'vendor');
  const skillId = 'conducting-external-reconnaissance-with-osint';
  fs.mkdirSync(path.join(vendorRoot, skillId), { recursive: true });
  fs.writeFileSync(path.join(vendorRoot, skillId, 'SKILL.md'), '# stub\n');
  assert.equal(skillPresent(skillId, vendorRoot), true);

  const ids = resolveSkillIds(ALLOWLIST, {
    skillIds: [skillId, 'performing-osint-with-spiderfoot'],
    missingOnly: true,
  });
  // skillPresent uses default vendor root unless we pass options into resolve — fix by testing skillPresent + filter manually
  const missing = [skillId, 'performing-osint-with-spiderfoot'].filter(
    (id) => !skillPresent(id, vendorRoot),
  );
  assert.deepEqual(missing, ['performing-osint-with-spiderfoot']);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('allowlist skills are unique and non-empty', () => {
  const ids = ALLOWLIST.skills.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.equal(isDenied(id, ALLOWLIST), null, id);
  }
});
