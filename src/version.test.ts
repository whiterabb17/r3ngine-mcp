import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { PACKAGE_NAME, PACKAGE_VERSION } from './version.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

test('PACKAGE_VERSION matches package.json', () => {
  assert.equal(PACKAGE_NAME, pkg.name);
  assert.equal(PACKAGE_VERSION, pkg.version);
});
