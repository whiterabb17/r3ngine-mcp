import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { findCaCert, findSecretsCertsDir, isLoopbackHost, missingCaMessage, resolveTlsContext, tlsServerNameForUrl } from './tls.ts';

test('isLoopbackHost', () => {
  assert.equal(isLoopbackHost('127.0.0.1'), true);
  assert.equal(isLoopbackHost('localhost'), true);
  assert.equal(isLoopbackHost('r3ngine.example.com'), false);
});

test('findCaCert uses secrets/certs/ca.crt under the r3ngine checkout', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r3n-certs-'));
  const certs = path.join(root, 'secrets', 'certs');
  fs.mkdirSync(certs, { recursive: true });
  const ca = path.join(certs, 'ca.crt');
  fs.writeFileSync(ca, '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n');
  const nested = path.join(root, 'r3ngine-mcp');
  fs.mkdirSync(nested);
  assert.equal(findSecretsCertsDir(nested), certs);
  assert.equal(findCaCert(nested, {}), ca);
  assert.match(missingCaMessage(false), /Copy secrets\/certs\/ca.crt/);
});

test('tlsServerNameForUrl uses cert DNS when the URL is loopback', () => {
  assert.equal(tlsServerNameForUrl('127.0.0.1', ['r3ngine.example.com']), 'r3ngine.example.com');
  assert.equal(tlsServerNameForUrl('r3ngine.example.com', ['r3ngine.example.com']), undefined);
  assert.equal(tlsServerNameForUrl('other.example', ['r3ngine.example.com']), undefined);
});

test('findCaCert prefers R3NGINE_CA_CERT from env', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r3n-ca-env-'));
  const custom = path.join(root, 'copied-ca.crt');
  fs.writeFileSync(custom, 'ca');
  assert.equal(findCaCert(root, { R3NGINE_CA_CERT: custom }), custom);
});

test('resolveTlsContext uses R3NGINE_TLS_SERVER_NAME on loopback', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r3n-tls-env-'));
  const ca = path.join(root, 'ca.crt');
  fs.writeFileSync(ca, '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n');
  const ctx = resolveTlsContext('https://127.0.0.1', root, {
    R3NGINE_CA_CERT: ca,
    R3NGINE_TLS_SERVER_NAME: 'r3ngine.example.com',
  });
  assert.equal(ctx.tlsServerName, 'r3ngine.example.com');
});
