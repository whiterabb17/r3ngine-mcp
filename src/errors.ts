export class McpHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'McpHttpError';
  }
}

export function mapHttpError(status: number, bodyText: string): McpHttpError {
  const lower = bodyText.toLowerCase();
  if (status === 401 && (lower.includes('session invalid') || lower.includes('session'))) {
    return new McpHttpError(
      'MCP session invalid or revoked. Reconnect or use a new session; the API key may still be valid.',
      401,
    );
  }
  if (status === 401) {
    return new McpHttpError(
      'API key invalid or revoked. Generate a new key in Settings → MCP Access.',
      401,
    );
  }
  if (status === 403) {
    return new McpHttpError(
      'This key’s user cannot perform that action. Auditors are read-only; dispatch needs a penetration-tester or sys-admin key.',
      403,
    );
  }
  if (status === 404) {
    return new McpHttpError('Not found. List resources first and pass a valid id.', 404);
  }
  if (status === 409) {
    return new McpHttpError(
      'Scan/job is not in a state that allows that lifecycle action. Check scan status.',
      409,
    );
  }
  if (status === 429) {
    return new McpHttpError('Rate limited. Retry later.', 429);
  }
  if (status >= 500) {
    return new McpHttpError(
      'r3ngine failed internally. Retry. If it persists, check instance health.',
      status,
    );
  }
  return new McpHttpError(bodyText || `HTTP ${status}`, status);
}

export function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: message }],
  };
}
