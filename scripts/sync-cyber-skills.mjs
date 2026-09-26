#!/usr/bin/env node
/**
 * Sync allowlisted Anthropic-Cybersecurity-Skills into skills/vendor/anthropic/.
 *
 *   node scripts/sync-cyber-skills.mjs
 *   node scripts/sync-cyber-skills.mjs --missing-only
 *   node scripts/sync-cyber-skills.mjs --skill <id> --dry-run
 *
 * Never depends on ~/.claude/skills. Fail closed: unknown / denylisted ids are refused.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWLIST_PATH = path.join(ROOT, 'skills', 'allowlist.json');
const VENDOR_ROOT = path.join(ROOT, 'skills', 'vendor', 'anthropic');
const MANIFEST_PATH = path.join(VENDOR_ROOT, 'MANIFEST.json');
const ADAPTER_BANNER = `# Adapter (r3ngine)

Interpretive use only for contracted assessments via r3ngine MCP.

- Do **not** craft or execute exploits, payloads, or offensive command recipes.
- Do **not** run third-party scanners or OSINT tools from this skill text.
- Evidence comes from r3ngine MCP / stored CVE metadata only.
- Prefer local curated playbooks under \`skills/\` and \`skills/vuln-validation/\` / \`skills/osint/\` when they conflict with upstream wording.
`;

export function loadAllowlist(filePath = ALLOWLIST_PATH) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(raw.skills) || raw.skills.length === 0) {
    throw new Error('allowlist.json must include a non-empty skills array');
  }
  return raw;
}

export function isDenied(skillId, allowlist) {
  const id = String(skillId || '').toLowerCase();
  for (const prefix of allowlist.denyNamePrefixes || []) {
    if (id.startsWith(String(prefix).toLowerCase())) return `denied prefix: ${prefix}`;
  }
  for (const part of allowlist.denyNameSubstrings || []) {
    if (id.includes(String(part).toLowerCase())) return `denied substring: ${part}`;
  }
  return null;
}

export function resolveSkillIds(allowlist, { skillIds = [], missingOnly = false } = {}) {
  const allowed = allowlist.skills.map((s) => s.id);
  const allowedSet = new Set(allowed);
  let requested = skillIds.length ? skillIds : allowed;

  for (const id of requested) {
    const denied = isDenied(id, allowlist);
    if (denied) {
      throw new Error(`Refusing skill "${id}" (${denied})`);
    }
    if (!allowedSet.has(id)) {
      throw new Error(`Refusing skill "${id}" (not on allowlist)`);
    }
  }

  if (missingOnly) {
    requested = requested.filter((id) => !skillPresent(id));
  }
  return requested;
}

export function skillPresent(skillId, vendorRoot = VENDOR_ROOT) {
  const dir = path.join(vendorRoot, skillId);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
  const entries = fs.readdirSync(dir).filter((n) => n !== 'ADAPTER.md');
  return entries.length > 0;
}

export function parseSyncArgs(argv) {
  const out = {
    missingOnly: false,
    dryRun: false,
    skillIds: [],
    help: false,
    skipGit: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--missing-only') out.missingOnly = true;
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--skip-git') out.skipGit = true;
    else if (arg === '--skill') {
      i += 1;
      if (i >= argv.length) throw new Error('Missing value for --skill');
      out.skillIds.push(argv[i]);
    } else if (arg === '-h' || arg === '--help') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function log(message) {
  process.stderr.write(`${message}\n`);
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout || result.status}`);
  }
  return (result.stdout || '').trim();
}

function writeAdapter(skillDir) {
  fs.writeFileSync(path.join(skillDir, 'ADAPTER.md'), `${ADAPTER_BANNER}\n`, 'utf8');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Sparse-fetch allowlisted skill dirs from upstream into vendor/.
 */
export function syncCyberSkills(options = {}) {
  const allowlist = options.allowlist || loadAllowlist(options.allowlistPath || ALLOWLIST_PATH);
  const vendorRoot = options.vendorRoot || VENDOR_ROOT;
  const dryRun = Boolean(options.dryRun);
  const skipGit = Boolean(options.skipGit);
  const ids = resolveSkillIds(allowlist, {
    skillIds: options.skillIds || [],
    missingOnly: Boolean(options.missingOnly),
  });

  if (ids.length === 0) {
    return {
      synced: [],
      skipped: allowlist.skills.map((s) => s.id).filter((id) => skillPresent(id, vendorRoot)),
      missing: [],
      dryRun,
      commit: null,
    };
  }

  if (dryRun) {
    return {
      synced: ids,
      skipped: [],
      missing: ids.filter((id) => !skillPresent(id, vendorRoot)),
      dryRun: true,
      commit: null,
    };
  }

  if (skipGit) {
    throw new Error('Cannot sync without git (pass real sync without --skip-git)');
  }

  const repo = process.env.R3NGINE_CYBER_SKILLS_REPO || allowlist.upstream?.repo;
  const ref = process.env.R3NGINE_CYBER_SKILLS_REF || allowlist.upstream?.ref || 'main';
  const prefix = allowlist.upstream?.skillsPrefix || 'skills';
  if (!repo) throw new Error('upstream.repo missing from allowlist');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r3ngine-cyber-skills-'));
  let commit = null;
  try {
    log(`Cloning allowlisted cyber skills from ${repo} (${ref})…`);
    runGit(
      ['clone', '--depth', '1', '--filter=blob:none', '--sparse', '--branch', ref, repo, tmp],
      ROOT,
    );
    const sparsePaths = ids.map((id) => `${prefix}/${id}`);
    runGit(['sparse-checkout', 'set', ...sparsePaths], tmp);
    commit = runGit(['rev-parse', 'HEAD'], tmp);

    fs.mkdirSync(vendorRoot, { recursive: true });
    const synced = [];
    for (const id of ids) {
      const src = path.join(tmp, prefix, id);
      if (!fs.existsSync(src)) {
        throw new Error(`Upstream missing skill directory: ${prefix}/${id}`);
      }
      const dest = path.join(vendorRoot, id);
      removeDir(dest);
      copyDir(src, dest);
      writeAdapter(dest);
      synced.push(id);
      log(`  synced ${id}`);
    }

    const manifest = {
      upstream_repo: repo,
      upstream_ref: ref,
      commit,
      synced_at: new Date().toISOString(),
      skills: synced,
      allowlist_count: allowlist.skills.length,
    };
    fs.writeFileSync(MANIFEST_PATH.replace(VENDOR_ROOT, vendorRoot), `${JSON.stringify(manifest, null, 2)}\n`);
    return { synced, skipped: [], missing: [], dryRun: false, commit };
  } finally {
    removeDir(tmp);
  }
}

/** Soft wrapper for install: sync missing/full; warn on failure if vendor already usable. */
export function syncCyberSkillsForInstall({ missingOnly = false } = {}) {
  try {
    const result = syncCyberSkills({ missingOnly });
    log(
      `Cyber skills sync complete (${result.synced.length} synced, commit ${result.commit || 'n/a'}).`,
    );
    return result;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const allowlist = loadAllowlist();
    const present = allowlist.skills.filter((s) => skillPresent(s.id)).map((s) => s.id);
    const missing = allowlist.skills.filter((s) => !skillPresent(s.id)).map((s) => s.id);
    if (missing.length === 0) {
      log(`Cyber skills sync skipped (vendor complete). Last error: ${detail}`);
      return { synced: [], skipped: present, missing: [], dryRun: false, commit: null, warning: detail };
    }
    log(`WARNING: cyber skills sync failed (${detail}). Missing: ${missing.join(', ')}`);
    log('Re-run: node scripts/sync-cyber-skills.mjs  (or --missing-only)');
    return { synced: [], skipped: present, missing, dryRun: false, commit: null, warning: detail };
  }
}

function usage() {
  log(`Usage: node scripts/sync-cyber-skills.mjs [options]

  --missing-only   Only fetch allowlisted skills not present under skills/vendor/anthropic/
  --skill <id>     Sync one allowlisted skill (repeatable)
  --dry-run        Print what would sync; do not clone
  --help           Show help

Env:
  R3NGINE_CYBER_SKILLS_REPO   Override upstream git URL
  R3NGINE_CYBER_SKILLS_REF    Override git ref (default main)
`);
}

export async function main(argv = process.argv.slice(2)) {
  const opts = parseSyncArgs(argv);
  if (opts.help) {
    usage();
    return 0;
  }
  const result = syncCyberSkills({
    missingOnly: opts.missingOnly,
    dryRun: opts.dryRun,
    skillIds: opts.skillIds,
    skipGit: opts.skipGit,
  });
  if (opts.dryRun) {
    log(`Dry run — would sync: ${result.synced.join(', ') || '(none)'}`);
    return 0;
  }
  log(`Done. Synced ${result.synced.length} skill(s).`);
  return 0;
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().then(
    (code) => process.exit(code ?? 0),
    (error) => {
      process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
      process.exit(1);
    },
  );
}
