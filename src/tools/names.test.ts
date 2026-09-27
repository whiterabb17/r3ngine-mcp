import assert from 'node:assert/strict';
import { test } from 'node:test';
import { listConditionalPluginToolNames, listToolNames } from './index.ts';
import {
  AD_PLUGIN_TOOL_NAMES,
  BURP_PLUGIN_TOOL_NAMES,
  COMPLIANCE_PLUGIN_TOOL_NAMES,
  CREDENTIAL_PLUGIN_TOOL_NAMES,
  PLUGIN_DISCOVERY_TOOL_NAMES,
} from './plugins/index.ts';

const expected = [
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
];

test('registers every core/discovery tool name and none that delete or touch files', () => {
  const names = listToolNames();
  assert.deepEqual([...names].sort(), [...expected].sort());
  for (const name of names) {
    assert.equal(/delete|import|file/i.test(name), false, name);
  }
});

test('plugin discovery tools are always listed', () => {
  const names = new Set(listToolNames());
  for (const name of PLUGIN_DISCOVERY_TOOL_NAMES) {
    assert.equal(names.has(name), true, name);
  }
});

test('AD plugin tools are conditional (not in always-on TOOL_NAMES)', () => {
  const always = new Set(listToolNames());
  const conditional = listConditionalPluginToolNames();
  const expectedConditional = [
    ...AD_PLUGIN_TOOL_NAMES,
    ...CREDENTIAL_PLUGIN_TOOL_NAMES,
    ...COMPLIANCE_PLUGIN_TOOL_NAMES,
    ...BURP_PLUGIN_TOOL_NAMES,
  ];
  assert.deepEqual([...conditional].sort(), [...expectedConditional].sort());
  for (const name of expectedConditional) {
    assert.equal(always.has(name), false, `${name} should not be always-on`);
  }
});
