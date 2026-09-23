export const ALLOWED_PATHS: readonly string[] = [
  '/api/mcp/settings/',
  '/api/mcp/sessions/',
  '/api/mcp/projects/',
  '/api/mcp/targets/',
  '/api/mcp/scans/',
  '/api/mcp/scan-status/',
  '/api/mcp/subscans/',
  '/api/mcp/subdomains/',
  '/api/mcp/endpoints/',
  '/api/mcp/vulnerabilities/',
  '/api/mcp/exposures/',
  '/api/mcp/emails/',
  '/api/mcp/employees/',
  '/api/mcp/osint-staging/',
  '/api/mcp/search/',
  '/api/mcp/dashboard/',
  '/api/mcp/attack-paths/',
  '/api/mcp/engines/',
  '/api/mcp/capabilities/',
  '/api/mcp/health/',
  '/api/mcp/notes/',
  '/api/mcp/tasks/',
  '/api/mcp/tools/',
  '/api/mcp/followups/',
  '/api/mcp/email-discovery/',
  '/api/mcp/employee-intel/',
  '/api/mcp/apme/',
  '/api/mcp/workflows/',
];

export function assertAllowedPath(path: string): void {
  const pathOnly = path.split('?')[0];
  const blocked =
    pathOnly.includes('/audit') ||
    pathOnly.includes('/keys') ||
    pathOnly.includes('/agents/') ||
    (pathOnly.includes('/sessions/') && pathOnly.endsWith('/revoke/'));
  const ok = ALLOWED_PATHS.some((prefix) => pathOnly === prefix || pathOnly.startsWith(prefix));
  if (!ok || blocked) {
    throw new Error(`Refusing non-allowlisted MCP path: ${pathOnly}`);
  }
}
