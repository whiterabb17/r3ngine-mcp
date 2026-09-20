import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export type AgentFacts = {
  provider: string;
  ide: string;
  deviceId: string;
  hostname: string;
  osName: string;
  username: string;
};

export type AgentIdentity = AgentFacts & {
  agentId: string;
};

function envLooksLikeCursor(env: NodeJS.ProcessEnv): boolean {
  if (Object.keys(env).some((key) => key.startsWith('CURSOR_'))) return true;
  const blob = `${env.VSCODE_IPC_HOOK || ''} ${env.VSCODE_IPC_HOOK_CLI || ''} ${env.VSCODE_CWD || ''} ${env.PATH || ''}`;
  return /cursor/i.test(blob);
}

export function detectProvider(env: NodeJS.ProcessEnv = process.env): string {
  if (env.R3NGINE_MCP_PROVIDER?.trim()) return env.R3NGINE_MCP_PROVIDER.trim().toLowerCase();
  if (envLooksLikeCursor(env)) return 'cursor';
  if (env.CLAUDE_CODE || env.CLAUDECODE || /claude/i.test(env.TERM_PROGRAM || '')) return 'claude';
  if (env.VSCODE_PID || env.VSCODE_IPC_HOOK || env.VSCODE_CWD) return 'vscode';
  if (env.TERM_PROGRAM?.trim()) return env.TERM_PROGRAM.trim().toLowerCase();
  return 'unknown';
}

export function detectIde(env: NodeJS.ProcessEnv = process.env, provider = detectProvider(env)): string {
  if (env.R3NGINE_MCP_IDE?.trim()) return env.R3NGINE_MCP_IDE.trim().toLowerCase();
  return provider;
}

export function readMachineId(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.R3NGINE_MCP_DEVICE_ID?.trim();
  if (explicit) return explicit;
  const files = ['/etc/machine-id', '/var/lib/dbus/machine-id'];
  for (const file of files) {
    try {
      const value = fs.readFileSync(file, 'utf8').trim();
      if (value) return value;
    } catch {
      /* missing */
    }
  }
  if (process.platform === 'win32') {
    try {
      const out = execFileSync('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 3000,
      });
      const match = /MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]+)/.exec(out);
      if (match?.[1]) return match[1];
    } catch {
      /* fall through */
    }
  }
  if (process.platform === 'darwin') {
    try {
      const out = execFileSync('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], {
        encoding: 'utf8',
        timeout: 3000,
      });
      const match = /"IOPlatformUUID"\s*=\s*"([^"]+)"/.exec(out);
      if (match?.[1]) return match[1];
    } catch {
      /* fall through */
    }
  }
  return '';
}

export function collectAgentFacts(
  env: NodeJS.ProcessEnv = process.env,
  overrides: Partial<AgentFacts> = {},
): AgentFacts {
  const provider = (overrides.provider || detectProvider(env)).toLowerCase();
  const ide = (overrides.ide || detectIde(env, provider)).toLowerCase();
  const hostname = overrides.hostname || os.hostname();
  const username = overrides.username || os.userInfo().username;
  const osName = overrides.osName || `${os.platform()}-${os.arch()}`;
  const deviceId = overrides.deviceId || readMachineId(env) || `fallback:${hostname}:${username}:${osName}`;
  return { provider, ide, deviceId, hostname, osName, username };
}

export function agentIdFromFacts(facts: AgentFacts): string {
  const canonical = [
    'r3ngine-mcp-agent-v1',
    facts.provider,
    facts.ide,
    facts.deviceId,
    facts.hostname,
    facts.osName,
    facts.username,
  ].join('\0');
  return createHash('sha256').update(canonical).digest('hex');
}

export function resolveAgentIdentity(
  env: NodeJS.ProcessEnv = process.env,
  overrides: Partial<AgentFacts> = {},
): AgentIdentity {
  const facts = collectAgentFacts(env, overrides);
  return { ...facts, agentId: agentIdFromFacts(facts) };
}

export function logoCandidates(fromDir: string): string[] {
  const start = path.resolve(fromDir);
  return [
    path.join(start, 'assets', 'logo.png'),
    path.join(start, '..', 'frontend', 'public', 'img', 'logo.png'),
    path.join(start, '..', '..', 'frontend', 'public', 'img', 'logo.png'),
    path.join(start, '..', 'web', 'static', 'img', 'r3ngine_logo.png'),
  ];
}

export function findLogoPng(fromDir: string): string | undefined {
  for (const candidate of logoCandidates(fromDir)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

const MAX_ICON_DATA_BYTES = 100_000;

type McpIcon = { src: string; mimeType: string; sizes: string[] };

const ICON_SPECS: { filename: string; sizes: string[] }[] = [
  { filename: 'icon-48.png', sizes: ['48x48'] },
  { filename: 'icon-192.png', sizes: ['192x192'] },
];

export function findNamedPng(fromDir: string, filename: string): string | undefined {
  const start = path.resolve(fromDir);
  const candidates = [
    path.join(start, 'assets', filename),
    path.join(start, '..', 'r3ngine-mcp', 'assets', filename),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export function mcpServerIcons(fromDir: string): McpIcon[] {
  const icons: McpIcon[] = [];
  const seen = new Set<string>();
  const add = (src: string, sizes: string[]) => {
    if (seen.has(src)) return;
    seen.add(src);
    icons.push({ src, mimeType: 'image/png', sizes });
  };

  for (const spec of ICON_SPECS) {
    const file = findNamedPng(fromDir, spec.filename);
    if (!file) continue;
    const buf = fs.readFileSync(file);
    if (buf.length <= MAX_ICON_DATA_BYTES) {
      add(`data:image/png;base64,${buf.toString('base64')}`, spec.sizes);
    }
    add(pathToFileURL(file).href, spec.sizes);
  }

  if (!icons.length) {
    const file = findLogoPng(fromDir);
    if (file) {
      const buf = fs.readFileSync(file);
      if (buf.length <= MAX_ICON_DATA_BYTES) {
        add(`data:image/png;base64,${buf.toString('base64')}`, ['512x512']);
      }
      add(pathToFileURL(file).href, ['512x512']);
    }
  }
  return icons;
}
