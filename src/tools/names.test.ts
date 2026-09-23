import assert from 'node:assert/strict';
import { test } from 'node:test';
import { listToolNames } from './index.ts';

const expected = [
  'r3ngine_list_projects',
  'r3ngine_list_targets',
  'r3ngine_get_target',
  'r3ngine_get_target_detail',
  'r3ngine_list_scans',
  'r3ngine_get_scan',
  'r3ngine_get_scan_detail',
  'r3ngine_get_scan_status',
  'r3ngine_list_subscans',
  'r3ngine_get_subscan_detail',
  'r3ngine_list_subdomains',
  'r3ngine_get_subdomain_detail',
  'r3ngine_list_endpoints',
  'r3ngine_get_endpoint_detail',
  'r3ngine_list_vulnerabilities',
  'r3ngine_get_vulnerability_detail',
  'r3ngine_list_exposures',
  'r3ngine_get_exposure_detail',
  'r3ngine_list_emails',
  'r3ngine_list_employees',
  'r3ngine_list_notes',
  'r3ngine_get_note',
  'r3ngine_search',
  'r3ngine_get_dashboard',
  'r3ngine_get_attack_paths',
  'r3ngine_list_engines',
  'r3ngine_get_system_health',
  'r3ngine_create_note',
  'r3ngine_update_note',
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
];

test('registers every spec tool name and none that delete or touch files', () => {
  const names = listToolNames();
  assert.deepEqual([...names].sort(), [...expected].sort());
  for (const name of names) {
    assert.equal(/delete|import|file/i.test(name), false, name);
  }
});
