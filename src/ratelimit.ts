import { createHash } from 'node:crypto';

export type Clock = () => number;

function fingerprint(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function clientIp(req: {
  headers: Record<string, unknown>;
  socket?: { remoteAddress?: string };
}): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/** Limits failed / missing-auth MCP HTTP attempts per IP without calling Django. */
export class UnauthRateLimit {
  private ipHits = new Map<string, { count: number; resetAt: number }>();
  private badKeys = new Map<string, number>();

  constructor(
    readonly maxFails: number,
    readonly windowMs: number,
    private now: Clock = Date.now,
  ) {}

  isLimited(ip: string): boolean {
    const row = this.ipHits.get(ip);
    if (!row) return false;
    if (row.resetAt <= this.now()) {
      this.ipHits.delete(ip);
      return false;
    }
    return row.count >= this.maxFails;
  }

  retryAfterSeconds(ip: string): number {
    const row = this.ipHits.get(ip);
    if (!row || row.resetAt <= this.now()) return 1;
    return Math.max(1, Math.ceil((row.resetAt - this.now()) / 1000));
  }

  recordFailure(ip: string): void {
    const now = this.now();
    let row = this.ipHits.get(ip);
    if (!row || row.resetAt <= now) {
      row = { count: 0, resetAt: now + this.windowMs };
    }
    row.count += 1;
    this.ipHits.set(ip, row);
  }

  isKnownBadKey(secret: string): boolean {
    const key = fingerprint(secret);
    const expires = this.badKeys.get(key);
    if (expires === undefined) return false;
    if (expires <= this.now()) {
      this.badKeys.delete(key);
      return false;
    }
    return true;
  }

  rememberBadKey(secret: string): void {
    this.badKeys.set(fingerprint(secret), this.now() + this.windowMs);
  }
}
