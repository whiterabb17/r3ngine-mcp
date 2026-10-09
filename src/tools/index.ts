import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { registerApmeTools } from './apme.js';
import { registerDispatchTools } from './dispatch.js';
import { registerFindingTools } from './findings.js';
import { registerFollowupTools } from './followups.js';
import { registerNoteTools } from './notes.js';
import { registerOsintTools } from './osint.js';
import {
  AD_PLUGIN_TOOL_NAMES,
  BURP_PLUGIN_TOOL_NAMES,
  COMPLIANCE_PLUGIN_TOOL_NAMES,
  CREDENTIAL_PLUGIN_TOOL_NAMES,
  PLUGIN_DISCOVERY_TOOL_NAMES,
  registerDiscoveryTools,
  registerEnabledPluginTools,
} from './plugins/index.js';
import { registerProjectTools } from './projects.js';
import { registerScanTools } from './scans.js';
import { registerTargetTools } from './targets.js';
import { registerValidationTools } from './validation.js';
import { registerSafePocTools } from './safe_poc.js';

/** Always-registered core + discovery tools (plugin tools are session-conditional). */
export const TOOL_NAMES = [
  'r3ngine_list_projects',
  'r3ngine_list_targets',
  'r3ngine_get_target',
  'r3ngine_get_target_detail',
  'r3ngine_list_scans',
  'r3ngine_get_scan',
  'r3ngine_get_scan_detail',
  'r3ngine_export_scan_for_ai',
  'r3ngine_get_scan_status',
  'r3ngine_list_subscans',
  'r3ngine_get_subscan_detail',
  'r3ngine_list_subdomains',
  'r3ngine_get_subdomain_detail',
  'r3ngine_list_endpoints',
  'r3ngine_get_endpoint_detail',
  'r3ngine_list_vulnerabilities',
  'r3ngine_get_vulnerability_detail',
  'r3ngine_analyze_vulnerability',
  'r3ngine_enrich_vulnerability',
  'r3ngine_validate_vulnerability',
  'r3ngine_list_exposures',
  'r3ngine_get_exposure_detail',
  'r3ngine_list_emails',
  'r3ngine_list_employees',
  'r3ngine_list_osint_staging',
  'r3ngine_verify_osint_staging',
  'r3ngine_list_notes',
  'r3ngine_get_note',
  'r3ngine_search',
  'r3ngine_get_dashboard',
  'r3ngine_get_attack_paths',
  'r3ngine_get_attack_path',
  'r3ngine_list_attack_path_proposals',
  'r3ngine_get_attack_path_proposal',
  'r3ngine_propose_attack_path',
  'r3ngine_update_attack_path_proposal',
  'r3ngine_approve_attack_path_proposal',
  'r3ngine_abort_attack_path_proposal',
  'r3ngine_enrich_attack_path',
  'r3ngine_list_safe_pocs',
  'r3ngine_get_safe_poc',
  'r3ngine_propose_safe_poc',
  'r3ngine_update_safe_poc',
  'r3ngine_approve_safe_poc',
  'r3ngine_abort_safe_poc',
  'r3ngine_run_safe_poc',
  'r3ngine_list_engines',
  'r3ngine_get_engine_detail',
  'r3ngine_list_capabilities',
  'r3ngine_get_system_health',
  'r3ngine_create_note',
  'r3ngine_update_note',
  'r3ngine_start_scan',
  'r3ngine_pause_scan',
  'r3ngine_resume_scan',
  'r3ngine_stop_scan',
  'r3ngine_retry_task',
  'r3ngine_start_subscan',
  'r3ngine_run_tool',
  'r3ngine_get_tool_args',
  'r3ngine_list_followups',
  'r3ngine_get_followup_plan',
  'r3ngine_get_followup_metrics',
  'r3ngine_propose_followups',
  'r3ngine_update_followups',
  'r3ngine_approve_followups',
  'r3ngine_abort_followups',
  'r3ngine_retry_followups',
  'r3ngine_start_email_discovery',
  'r3ngine_stop_email_discovery',
  'r3ngine_start_employee_intel',
  'r3ngine_stop_employee_intel',
  'r3ngine_trigger_apme',
  'r3ngine_recalculate_apme',
  'r3ngine_start_workflow',
  ...PLUGIN_DISCOVERY_TOOL_NAMES,
] as const;

/** Plugin tools that may be registered after session when the plugin is enabled. */
export const CONDITIONAL_PLUGIN_TOOL_NAMES = [
  ...AD_PLUGIN_TOOL_NAMES,
  ...CREDENTIAL_PLUGIN_TOOL_NAMES,
  ...COMPLIANCE_PLUGIN_TOOL_NAMES,
  ...BURP_PLUGIN_TOOL_NAMES,
] as const;

export function listToolNames(): string[] {
  return [...TOOL_NAMES];
}

export function listConditionalPluginToolNames(): string[] {
  return [...CONDITIONAL_PLUGIN_TOOL_NAMES];
}

export type RegisterToolsOptions = {
  /** When set, also register MCP tools for these enabled plugin slugs. */
  enabledPluginSlugs?: Iterable<string>;
};

export function registerTools(
  server: McpServer,
  client: RengineMcpClient,
  options: RegisterToolsOptions = {},
) {
  registerProjectTools(server, client);
  registerTargetTools(server, client);
  registerScanTools(server, client);
  registerFindingTools(server, client);
  registerValidationTools(server, client);
  registerSafePocTools(server, client);
  registerOsintTools(server, client);
  registerNoteTools(server, client);
  registerApmeTools(server, client);
  registerDispatchTools(server, client);
  registerFollowupTools(server, client);
  registerDiscoveryTools(server, client);
  if (options.enabledPluginSlugs) {
    registerEnabledPluginTools(server, client, options.enabledPluginSlugs);
  }
}

export {
  fetchEnabledPluginSlugs,
  registerEnabledPluginTools,
  registerPluginToolsAfterSession,
} from './plugins/index.js';
