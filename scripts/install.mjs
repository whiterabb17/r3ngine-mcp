#!/usr/bin/env node
/**
 * Install, configure, and smoke-start r3ngine-mcp.
 *
 *   node scripts/install.mjs --url https://host --key r3n_mcp_… --yes
 *   npm run setup -- --transport http --detach
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = path.join(ROOT, '.env');
const DIST = path.join(ROOT, 'dist', 'index.js');
const PID_PATH = path.join(ROOT, '.r3ngine-mcp.pid');
const MIN_NODE = 20;
const KEY_PREFIX = 'r3n_mcp_';

export function parseArgs(argv) {
  const out = {
    url: undefined,
    key: undefined,
    transport: 'stdio',
    bind: '127.0.0.1',
    port: 3100,
    writeCursor: false,
    writeVscode: false,
    writeClaude: false,
    start: true,
    detach: false,
    skipBuild: false,
    yes: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`Missing value for ${arg}`);
      return argv[i];
    };
    switch (arg) {
      case '--url':
        out.url = next();
        break;
      case '--key':
        out.key = next();
        break;
      case '--transport':
        out.transport = next();
        break;
      case '--bind':
        out.bind = next();
        break;
      case '--port':
        out.port = Number(next());
        break;
      case '--write-cursor':
        out.writeCursor = true;
        break;
      case '--write-vscode':
        out.writeVscode = true;
        break;
      case '--write-claude':
        out.writeClaude = true;
        break;
      case '--no-start':
        out.start = false;
        break;
      case '--detach':
        out.detach = true;
        break;
      case '--skip-build':
        out.skipBuild = true;
        break;
      case '-y':
      case '--yes':
        out.yes = true;
        break;
      case '-h':
      case '--help':
        out.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!['stdio', 'http'].includes(out.transport)) {
    throw new Error('transport must be stdio or http');
  }
  if (!Number.isInteger(out.port) || out.port < 1 || out.port > 65535) {
    throw new Error('port must be an integer 1–65535');
  }
  return out;
}

export function parseEnvFile(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    values[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return values;
}

export function formatEnvFile(values) {
  const keys = [
    'R3NGINE_URL',
    'R3NGINE_MCP_API_KEY',
    'MCP_TRANSPORT',
    'MCP_BIND',
    'MCP_PORT',
    'MCP_UNAUTH_MAX',
    'MCP_UNAUTH_WINDOW_MS',
  ];
  const lines = ['# r3ngine-mcp — do not commit this file', ''];
  for (const key of keys) {
    if (values[key] !== undefined && values[key] !== '') {
      lines.push(`${key}=${values[key]}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('R3NGINE_URL must be a valid http(s) URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('R3NGINE_URL must start with http:// or https://');
  }
  return parsed.toString().replace(/\/$/, '');
}

export function validateKey(key) {
  if (!key.startsWith(KEY_PREFIX) || key.length < KEY_PREFIX.length + 16) {
    throw new Error('API key must be the shown-once secret starting with r3n_mcp_');
  }
  return key;
}

export function requireNodeVersion(version = process.versions.node, minimum = MIN_NODE) {
  const major = Number(String(version).split('.')[0]);
  if (!Number.isFinite(major) || major < minimum) {
    throw new Error(`Node.js ${minimum}+ is required (found ${version})`);
  }
}

export function mergeMcpConfig(existing, bucketKey, name, entry) {
  const root = existing && typeof existing === 'object' ? { ...existing } : {};
  const bucket = { ...(root[bucketKey] || {}) };
  bucket[name] = entry;
  return { ...root, [bucketKey]: bucket };
}

export function maskKey(key) {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 12)}…`;
}

function log(message) {
  process.stderr.write(`${message}\n`);
}

function npmCmd() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
  }
}

async function promptMissing(opts, fileEnv) {
  const url = opts.url || process.env.R3NGINE_URL || fileEnv.R3NGINE_URL;
  const key = opts.key || process.env.R3NGINE_MCP_API_KEY || fileEnv.R3NGINE_MCP_API_KEY;
  if (opts.yes) {
    return { url, key };
  }
  if (!process.stdin.isTTY) {
    return { url, key };
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  try {
    const nextUrl = url || (await rl.question('r3ngine URL (https://host): ')).trim();
    const nextKey = key || (await rl.question('MCP API key (r3n_mcp_… shown once): ')).trim();
    if (!opts.writeCursor && !opts.writeVscode && !opts.writeClaude) {
      const answer = (await rl.question('Write Cursor MCP config? [Y/n] ')).trim().toLowerCase();
      if (answer === '' || answer === 'y' || answer === 'yes') opts.writeCursor = true;
    }
    return { url: nextUrl, key: nextKey };
  } finally {
    rl.close();
  }
}

export async function probeInstance({ url, key, transport, fetchImpl = fetch }) {
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const sessionRes = await fetchImpl(`${url}/api/mcp/sessions/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      transport,
      client_name: 'r3ngine-mcp-install',
      client_version: '1.0.0',
    }),
    signal: AbortSignal.timeout(15000),
  });
  const sessionText = await sessionRes.text();
  if (!sessionRes.ok) {
    throw new Error(
      `Could not open an MCP session (${sessionRes.status}). Check the URL, key, and Settings → MCP Access.`,
    );
  }
  let session;
  try {
    session = JSON.parse(sessionText);
  } catch {
    throw new Error('Session response was not JSON');
  }
  const sessionId = session.session_id || session.id;
  if (!sessionId) throw new Error('Session response missing session_id');
  const authed = { ...headers, 'X-MCP-Session-Id': String(sessionId) };
  const settingsRes = await fetchImpl(`${url}/api/mcp/settings/`, {
    headers: authed,
    signal: AbortSignal.timeout(15000),
  });
  if (!settingsRes.ok) {
    throw new Error(`Settings check failed (${settingsRes.status})`);
  }
  const settings = await settingsRes.json();
  const healthRes = await fetchImpl(`${url}/api/mcp/health/`, {
    headers: authed,
    signal: AbortSignal.timeout(15000),
  });
  if (!healthRes.ok) {
    throw new Error(`Health check failed (${healthRes.status})`);
  }
  await fetchImpl(`${url}/api/mcp/sessions/${sessionId}/end/`, {
    method: 'POST',
    headers: authed,
    signal: AbortSignal.timeout(10000),
  }).catch(() => undefined);
  return { sessionId, transportMode: settings.transport_mode };
}

function waitForStart(child, transport, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`MCP server did not start within ${timeoutMs}ms\n${stderr}`));
    }, timeoutMs);
    const onErr = (chunk) => {
      stderr += String(chunk);
      if (transport === 'http' && /listening on/i.test(stderr)) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stderr?.on('data', onErr);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      if (code) {
        clearTimeout(timer);
        reject(new Error(`MCP server exited ${code}\n${stderr}`));
      }
    });
    if (transport === 'stdio') {
      setTimeout(() => {
        if (child.exitCode === null) {
          clearTimeout(timer);
          resolve();
        }
      }, 1500);
    }
  });
}

function spawnServer(env, inherit) {
  return spawn(process.execPath, [DIST], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    detached: false,
    windowsHide: true,
  });
}

function cursorConfigPath() {
  return path.join(os.homedir(), '.cursor', 'mcp.json');
}

function vscodeConfigPath() {
  const parent = path.resolve(ROOT, '..');
  const inParent = path.join(parent, '.vscode', 'mcp.json');
  if (fs.existsSync(path.join(parent, '.vscode')) || fs.existsSync(path.join(parent, 'web'))) {
    return inParent;
  }
  return path.join(ROOT, '.vscode', 'mcp.json');
}

function claudeConfigPath() {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  }
  return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
}

function writeJsonMerged(filePath, bucketKey) {
  let existing = {};
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const entry = {
    command: process.execPath,
    args: [DIST],
    env: {
      R3NGINE_URL: process.env.R3NGINE_URL,
      R3NGINE_MCP_API_KEY: process.env.R3NGINE_MCP_API_KEY,
    },
  };
  const merged = mergeMcpConfig(existing, bucketKey, 'r3ngine', entry);
  fs.writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`, { mode: 0o600 });
  log(`Wrote ${filePath}`);
}

function usage() {
  log(`Usage: node scripts/install.mjs [options]

  --url <url>              r3ngine instance (https://host)
  --key <secret>           shown-once MCP key (r3n_mcp_…)
  --transport stdio|http   default stdio
  --bind <addr>            HTTP bind (default 127.0.0.1)
  --port <n>               HTTP port (default 3100)
  --write-cursor           merge ~/.cursor/mcp.json
  --write-vscode           merge .vscode/mcp.json
  --write-claude           merge Claude Desktop config
  --no-start               configure only (no smoke start)
  --detach                 keep HTTP server running in the background
  --skip-build             skip npm install / tsc if dist/ exists
  --yes                    non-interactive; fail if URL/key missing
`);
}

export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  if (opts.help) {
    usage();
    return 0;
  }
  requireNodeVersion();
  log(`r3ngine-mcp setup  (Node ${process.versions.node}, ${ROOT})`);

  const fileEnv = fs.existsSync(ENV_PATH) ? parseEnvFile(fs.readFileSync(ENV_PATH, 'utf8')) : {};
  const prompted = await promptMissing(opts, fileEnv);
  if (!prompted.url) throw new Error('R3NGINE_URL is required (--url or .env)');
  const url = validateUrl(prompted.url);
  const needsKey = opts.transport === 'stdio' || Boolean(prompted.key);
  const key = needsKey ? validateKey(prompted.key || '') : undefined;

  if (!opts.skipBuild || !fs.existsSync(DIST)) {
    log('Installing npm dependencies…');
    const lock = path.join(ROOT, 'package-lock.json');
    run(npmCmd(), fs.existsSync(lock) ? ['ci'] : ['install']);
    log('Building TypeScript…');
    run(npmCmd(), ['run', 'build']);
  }
  if (!fs.existsSync(DIST)) {
    throw new Error('Build did not produce dist/index.js');
  }

  const envValues = {
    ...fileEnv,
    R3NGINE_URL: url,
    MCP_TRANSPORT: opts.transport,
    MCP_BIND: opts.bind,
    MCP_PORT: String(opts.port),
    MCP_UNAUTH_MAX: fileEnv.MCP_UNAUTH_MAX || '10',
    MCP_UNAUTH_WINDOW_MS: fileEnv.MCP_UNAUTH_WINDOW_MS || '60000',
  };
  if (key) envValues.R3NGINE_MCP_API_KEY = key;
  fs.writeFileSync(ENV_PATH, formatEnvFile(envValues), { mode: 0o600 });
  try {
    fs.chmodSync(ENV_PATH, 0o600);
  } catch {
    /* Windows may ignore mode */
  }
  log(`Wrote ${ENV_PATH} (key ${key ? maskKey(key) : 'omitted for HTTP sidecar'})`);

  process.env.R3NGINE_URL = url;
  if (key) process.env.R3NGINE_MCP_API_KEY = key;
  process.env.MCP_TRANSPORT = opts.transport;
  process.env.MCP_BIND = opts.bind;
  process.env.MCP_PORT = String(opts.port);

  if (key) {
    log('Checking r3ngine /api/mcp/ …');
    const probe = await probeInstance({ url, key, transport: opts.transport });
    log(`Instance OK (transport_mode=${probe.transportMode || 'unknown'})`);
    if (opts.transport === 'http' && probe.transportMode === 'stdio') {
      throw new Error('Instance transport is stdio-only. Enable HTTP or both in Settings → MCP Access.');
    }
  }

  if (opts.writeCursor) writeJsonMerged(cursorConfigPath(), 'mcpServers');
  if (opts.writeVscode) writeJsonMerged(vscodeConfigPath(), 'servers');
  if (opts.writeClaude) writeJsonMerged(claudeConfigPath(), 'mcpServers');

  if (!opts.start) {
    log('Configured. Start later with: npm start');
    return 0;
  }

  const childEnv = {
    R3NGINE_URL: url,
    MCP_TRANSPORT: opts.transport,
    MCP_BIND: opts.bind,
    MCP_PORT: String(opts.port),
  };
  if (key) childEnv.R3NGINE_MCP_API_KEY = key;

  log(`Starting MCP server (${opts.transport})…`);
  const smoke = spawnServer(childEnv, false);
  await waitForStart(smoke, opts.transport);
  smoke.kill();
  log('MCP server started correctly.');

  if (opts.transport === 'stdio') {
    log('stdio is owned by your IDE. Cursor/Claude/VS Code will launch r3ngine-mcp from the config.');
    return 0;
  }
  if (!opts.detach) {
    log('HTTP smoke-start succeeded. Re-run with --detach to keep it running, or: npm start');
    return 0;
  }

  const bg = spawn(process.execPath, [DIST], {
    cwd: ROOT,
    env: { ...process.env, ...childEnv },
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  fs.writeFileSync(PID_PATH, String(bg.pid));
  bg.unref();
  log(`HTTP server running (pid ${bg.pid}). Stop that process or delete ${PID_PATH}.`);
  return 0;
}

const invoked = Boolean(process.argv[1])
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) {
  main().then(
    (code) => process.exit(code ?? 0),
    (error) => {
      log(error instanceof Error ? error.message : String(error));
      process.exit(1);
    },
  );
}
