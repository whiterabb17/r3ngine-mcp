import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import {
  AD_PLUGIN_SLUG,
  AD_PLUGIN_TOOL_NAMES,
  registerActiveDirectoryTools,
} from './active_directory.js';
import {
  BURP_PLUGIN_SLUG,
  BURP_PLUGIN_TOOL_NAMES,
  registerBurpsuiteIntegrationTools,
} from './burpsuite_integration.js';
import {
  COMPLIANCE_PLUGIN_SLUG,
  COMPLIANCE_PLUGIN_TOOL_NAMES,
  registerComplianceAssessmentTools,
} from './compliance_assessment.js';
import {
  CREDENTIAL_PLUGIN_SLUG,
  CREDENTIAL_PLUGIN_TOOL_NAMES,
  registerCredentialIntelligenceTools,
} from './credential_intelligence.js';
import { PLUGIN_DISCOVERY_TOOL_NAMES, registerPluginDiscoveryTools } from './discovery.js';

export {
  AD_PLUGIN_SLUG,
  AD_PLUGIN_TOOL_NAMES,
  BURP_PLUGIN_SLUG,
  BURP_PLUGIN_TOOL_NAMES,
  COMPLIANCE_PLUGIN_SLUG,
  COMPLIANCE_PLUGIN_TOOL_NAMES,
  CREDENTIAL_PLUGIN_SLUG,
  CREDENTIAL_PLUGIN_TOOL_NAMES,
  PLUGIN_DISCOVERY_TOOL_NAMES,
};

const PLUGIN_TOOL_NAMES: Record<string, readonly string[]> = {
  [AD_PLUGIN_SLUG]: AD_PLUGIN_TOOL_NAMES,
  [CREDENTIAL_PLUGIN_SLUG]: CREDENTIAL_PLUGIN_TOOL_NAMES,
  [COMPLIANCE_PLUGIN_SLUG]: COMPLIANCE_PLUGIN_TOOL_NAMES,
  [BURP_PLUGIN_SLUG]: BURP_PLUGIN_TOOL_NAMES,
};

/** Map plugin slug → register function for conditional MCP tools. */
const PLUGIN_REGISTRARS: Record<string, (server: McpServer, client: RengineMcpClient) => void> = {
  [AD_PLUGIN_SLUG]: registerActiveDirectoryTools,
  [CREDENTIAL_PLUGIN_SLUG]: registerCredentialIntelligenceTools,
  [COMPLIANCE_PLUGIN_SLUG]: registerComplianceAssessmentTools,
  [BURP_PLUGIN_SLUG]: registerBurpsuiteIntegrationTools,
};

export type PluginListPayload = {
  results?: Array<{ slug?: string; mcp_tools?: string[] }>;
};

export function enabledSlugsFromPayload(data: PluginListPayload | null | undefined): Set<string> {
  const slugs = new Set<string>();
  for (const row of data?.results || []) {
    if (row?.slug) slugs.add(String(row.slug));
  }
  return slugs;
}

export function registerDiscoveryTools(server: McpServer, client: RengineMcpClient) {
  registerPluginDiscoveryTools(server, client);
}

/**
 * Register MCP tools for each enabled plugin slug that has a registrar.
 * Safe to call once after session open (stdio) or before createServer (http).
 */
export function registerEnabledPluginTools(
  server: McpServer,
  client: RengineMcpClient,
  enabledSlugs: Iterable<string>,
): string[] {
  const registered: string[] = [];
  const seen = new Set(enabledSlugs);
  for (const [slug, register] of Object.entries(PLUGIN_REGISTRARS)) {
    if (!seen.has(slug)) continue;
    register(server, client);
    registered.push(...(PLUGIN_TOOL_NAMES[slug] || []));
  }
  return registered;
}

export async function fetchEnabledPluginSlugs(client: RengineMcpClient): Promise<Set<string>> {
  try {
    const data = (await client.request('GET', '/api/mcp/plugins/')) as PluginListPayload;
    return enabledSlugsFromPayload(data);
  } catch {
    return new Set();
  }
}

export async function registerPluginToolsAfterSession(
  server: McpServer,
  client: RengineMcpClient,
): Promise<string[]> {
  const slugs = await fetchEnabledPluginSlugs(client);
  return registerEnabledPluginTools(server, client, slugs);
}
