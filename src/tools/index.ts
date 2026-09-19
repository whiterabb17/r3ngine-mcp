import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { registerApmeTools } from './apme.js';
import { registerDispatchTools } from './dispatch.js';
import { registerFindingTools } from './findings.js';
import { registerOsintTools } from './osint.js';
import { registerProjectTools } from './projects.js';
import { registerScanTools } from './scans.js';
import { registerTargetTools } from './targets.js';

export const TOOL_NAMES = [
  'r3ngine_list_projects',
  'r3ngine_list_targets',
  'r3ngine_get_target',
  'r3ngine_list_scans',
  'r3ngine_get_scan',
  'r3ngine_get_scan_status',
  'r3ngine_list_subscans',
  'r3ngine_list_subdomains',
  'r3ngine_list_endpoints',
  'r3ngine_list_vulnerabilities',
  'r3ngine_list_exposures',
  'r3ngine_list_emails',
  'r3ngine_list_employees',
  'r3ngine_search',
  'r3ngine_get_dashboard',
  'r3ngine_get_attack_paths',
  'r3ngine_list_engines',
  'r3ngine_get_system_health',
  'r3ngine_start_scan',
  'r3ngine_pause_scan',
  'r3ngine_resume_scan',
  'r3ngine_stop_scan',
  'r3ngine_retry_task',
  'r3ngine_start_subscan',
  'r3ngine_start_email_discovery',
  'r3ngine_stop_email_discovery',
  'r3ngine_start_employee_intel',
  'r3ngine_stop_employee_intel',
  'r3ngine_trigger_apme',
  'r3ngine_recalculate_apme',
  'r3ngine_start_workflow',
] as const;

export function listToolNames(): string[] {
  return [...TOOL_NAMES];
}

export function registerTools(server: McpServer, client: RengineMcpClient) {
  registerProjectTools(server, client);
  registerTargetTools(server, client);
  registerScanTools(server, client);
  registerFindingTools(server, client);
  registerOsintTools(server, client);
  registerApmeTools(server, client);
  registerDispatchTools(server, client);
}
