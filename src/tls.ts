import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import tls from 'node:tls';
import { X509Certificate } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const CA_FILES = ['ca.crt', 'r3ngine_chain.pem', 'rengine_chain.pem'] as const;
const SERVER_CERT_FILES = ['r3ngine.pem', 'rengine.pem'] as const;

function moduleDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
}

export function findSecretsCertsDir(fromDir: string): string | undefined {
  let dir = path.resolve(fromDir);
  for (let i = 0; i < 6; i += 1) {
    const certs = path.join(dir, 'secrets', 'certs');
    if (CA_FILES.some((name) => fs.existsSync(path.join(certs, name)))
      || SERVER_CERT_FILES.some((name) => fs.existsSync(path.join(certs, name)))) {
      return certs;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function searchDirs(fromDir: string, env: NodeJS.ProcessEnv): string[] {
  const dirs: string[] = [];
  const push = (dir?: string) => {
    if (!dir) return;
    const resolved = path.resolve(dir);
    if (!dirs.includes(resolved)) dirs.push(resolved);
  };
  const ca = env.R3NGINE_CA_CERT || env.NODE_EXTRA_CA_CERTS;
  if (ca) push(path.dirname(path.resolve(ca)));
  push(fromDir);
  push(process.cwd());
  push(moduleDir());
  return dirs;
}

export function findCaCert(fromDir: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const explicit = env.R3NGINE_CA_CERT || env.NODE_EXTRA_CA_CERTS;
  if (explicit && fs.existsSync(explicit)) {
    return path.resolve(explicit);
  }
  for (const start of searchDirs(fromDir, env)) {
    const certsDir = findSecretsCertsDir(start);
    if (!certsDir) continue;
    for (const name of CA_FILES) {
      const candidate = path.join(certsDir, name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

export function findServerCert(fromDir: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  for (const start of searchDirs(fromDir, env)) {
    for (const name of SERVER_CERT_FILES) {
      const beside = path.join(start, name);
      if (fs.existsSync(beside)) return beside;
    }
    const certsDir = findSecretsCertsDir(start);
    if (!certsDir) continue;
    for (const name of SERVER_CERT_FILES) {
      const candidate = path.join(certsDir, name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

export function certDnsNames(pem: Buffer | string): string[] {
  const x509 = new X509Certificate(pem);
  const names: string[] = [];
  if (x509.subjectAltName) {
    for (const part of x509.subjectAltName.split(',')) {
      const value = part.trim();
      if (value.toUpperCase().startsWith('DNS:')) names.push(value.slice(4).trim());
    }
  }
  const cn = /(?:^|,\s*)CN=([^,]+)/.exec(x509.subject);
  const commonName = cn?.[1]?.trim();
  if (commonName && !names.includes(commonName)) names.push(commonName);
  return names;
}

/** When talking to loopback, verify the cert as DOMAIN_NAME from secrets/certs/*.pem. */
export function tlsServerNameForUrl(hostname: string, dnsNames: string[]): string | undefined {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (dnsNames.includes(host)) return undefined;
  if (isLoopbackHost(host) && dnsNames[0]) return dnsNames[0];
  return undefined;
}

export function resolveTlsContext(
  url: string,
  fromDir: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
): { ca?: Buffer; tlsServerName?: string } {
  const caPath = findCaCert(fromDir, env);
  const ca = caPath ? fs.readFileSync(caPath) : undefined;
  const hostname = new URL(url).hostname;
  const fromEnv = env.R3NGINE_TLS_SERVER_NAME?.trim();
  if (fromEnv && isLoopbackHost(hostname)) {
    return { ca, tlsServerName: fromEnv };
  }
  const serverPem = findServerCert(fromDir, env);
  const dnsNames = serverPem ? certDnsNames(fs.readFileSync(serverPem)) : [];
  return { ca, tlsServerName: tlsServerNameForUrl(hostname, dnsNames) };
}

export function expectedCaPath(mcpRoot: string, secretsDir?: string): string {
  if (secretsDir) return path.join(secretsDir, 'ca.crt');
  return path.resolve(mcpRoot, '..', 'secrets', 'certs', 'ca.crt');
}

export function suggestedCopyDest(mcpRoot: string): string {
  return path.join(mcpRoot, 'certs', 'ca.crt');
}

export function missingCaMessage(
  localSecrets: boolean | { localSecrets?: boolean; expectedPath?: string; copyDest?: string; flagExample?: string } = false,
): string {
  const opts = typeof localSecrets === 'boolean' ? { localSecrets } : localSecrets;
  const dest = opts.copyDest || opts.expectedPath || 'secrets/certs/ca.crt';
  if (opts.localSecrets) {
    return [
      'Local r3ngine checkout is missing the TLS CA.',
      `Create it with make certs (or make.bat certs). Full path agents need:`,
      `  ${opts.expectedPath || dest}`,
    ].join('\n');
  }
  return [
    'Copy secrets/certs/ca.crt from the r3ngine host onto this computer.',
    'Then pass the full path so agents know where the cert is, for example:',
    `  ${opts.flagExample || `--ca ${dest}`}`,
    `Suggested destination on this machine:`,
    `  ${dest}`,
  ].join('\n');
}

export function formatFetchError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  const bits = [error.message];
  if (cause?.code) bits.push(cause.code);
  if (cause?.message && cause.message !== error.message) bits.push(cause.message);
  return bits.join(': ');
}

type RequestInitLike = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  ca?: Buffer | string;
  tlsServerName?: string;
};

export function requestWithCa(
  url: string,
  init: RequestInitLike = {},
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<unknown> }> {
  const { method = 'GET', headers = {}, body, signal, ca, tlsServerName } = init;
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options: https.RequestOptions = { method, headers };
    if (isHttps && ca) {
      options.ca = ca;
      options.rejectUnauthorized = true;
    }
    if (isHttps && tlsServerName) {
      options.servername = tlsServerName;
      options.checkServerIdentity = (_host, peer) => tls.checkServerIdentity(tlsServerName, peer);
    }
    const req = lib.request(parsed, options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk as Buffer));
      res.on('end', () => {
        const buf = Buffer.concat(chunks).toString('utf8');
        const status = res.statusCode || 0;
        resolve({
          ok: status >= 200 && status < 300,
          status,
          text: async () => buf,
          json: async () => JSON.parse(buf),
        });
      });
    });
    req.on('error', reject);
    if (signal) {
      if (signal.aborted) {
        req.destroy();
        reject(signal.reason instanceof Error ? signal.reason : new Error('aborted'));
        return;
      }
      signal.addEventListener(
        'abort',
        () => {
          req.destroy();
          reject(signal.reason instanceof Error ? signal.reason : new Error('aborted'));
        },
        { once: true },
      );
    }
    if (body) req.write(body);
    req.end();
  });
}
