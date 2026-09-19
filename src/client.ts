import { assertAllowedPath } from './allowlist.js';
import { mapHttpError } from './errors.js';

export class RengineMcpClient {
  constructor(
    private url: string,
    private apiKey: string,
    public sessionId?: string,
  ) {}

  async request(method: string, path: string, body?: unknown): Promise<unknown> {
    assertAllowedPath(path);
    const timeoutMs = /\/(start|stop|pause|resume|retry|trigger|recalculate)\b/.test(path)
      ? 60000
      : 30000;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
    };
    if (this.sessionId) {
      headers['X-MCP-Session-Id'] = this.sessionId;
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.url.replace(/\/$/, '')}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    if (!response.ok) {
      throw mapHttpError(response.status, text);
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
