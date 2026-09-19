import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UnauthRateLimit, clientIp } from './ratelimit.ts';

test('limits an IP after max unauthorized failures in the window', () => {
  let now = 1_000;
  const limiter = new UnauthRateLimit(3, 60_000, () => now);
  assert.equal(limiter.isLimited('1.1.1.1'), false);
  limiter.recordFailure('1.1.1.1');
  limiter.recordFailure('1.1.1.1');
  assert.equal(limiter.isLimited('1.1.1.1'), false);
  limiter.recordFailure('1.1.1.1');
  assert.equal(limiter.isLimited('1.1.1.1'), true);
  assert.equal(limiter.isLimited('2.2.2.2'), false);
  now += 60_001;
  assert.equal(limiter.isLimited('1.1.1.1'), false);
});

test('remembers a bad key without storing the secret', () => {
  let now = 5_000;
  const limiter = new UnauthRateLimit(10, 60_000, () => now);
  assert.equal(limiter.isKnownBadKey('r3n_mcp_nope'), false);
  limiter.rememberBadKey('r3n_mcp_nope');
  assert.equal(limiter.isKnownBadKey('r3n_mcp_nope'), true);
  assert.equal(limiter.isKnownBadKey('r3n_mcp_other'), false);
  now += 60_001;
  assert.equal(limiter.isKnownBadKey('r3n_mcp_nope'), false);
});

test('reads client IP from X-Forwarded-For', () => {
  assert.equal(
    clientIp({ headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }, socket: { remoteAddress: '10.0.0.1' } }),
    '203.0.113.9',
  );
});
