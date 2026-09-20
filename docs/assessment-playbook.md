# Assessment playbook

Plan, then execute. Use only the MCP tools for the current phase. Do not call the full catalog on every turn.

Tool names must match the sidecar catalog (`src/tools/index.ts`).

## 1. Orient

| Need | Tool |
|------|------|
| Projects | `r3ngine_list_projects` |
| Targets | `r3ngine_list_targets` (`project_slug`) |
| One target | `r3ngine_get_target` |
| Live / pending / recent | `r3ngine_get_scan_status` |
| Scan record | `r3ngine_get_scan`, `r3ngine_list_scans` |
| Child jobs | `r3ngine_list_subscans` |
| Instance | `r3ngine_get_system_health` |

Confirm `project_slug`, `scan_id`, `target` / `domain_id` with the operator if missing.

`scan_status`: `1` running, `2` success. Treat other values as incomplete unless the API says otherwise.

## 2. Surface

| Need | Tool |
|------|------|
| Hosts | `r3ngine_list_subdomains` |
| URLs | `r3ngine_list_endpoints` |
| Exposed services | `r3ngine_list_exposures` |

Summarize counts and notable hosts. Do not paste unbounded JSON.

## 3. Findings

| Need | Tool |
|------|------|
| Vulns | `r3ngine_list_vulnerabilities` |
| Lookup | `r3ngine_search` |

Order by severity, then asset. Group noisy TLS/cipher families by host.

Each finding: title, severity, asset, scan id, evidence from MCP, impact, remediation.

## 4. Intel

Use when the engagement includes OSINT:

- `r3ngine_list_emails`
- `r3ngine_list_employees`

Do not put personal emails in the client exec summary unless they are in-scope findings.

## 5. Paths

After enough surface + vulns:

- `r3ngine_get_attack_paths`
- `r3ngine_get_dashboard` (`project_slug` required)

If APME is empty, say so and optionally propose `r3ngine_trigger_apme` / `r3ngine_recalculate_apme` (approval required).

## 6. Tactics (further the scan)

1. `r3ngine_list_engines` for names/ids.
2. Propose **one** action: tool, ids, why, expected evidence.
3. Wait for explicit yes.
4. Then one of: `r3ngine_start_scan`, `r3ngine_start_subscan`, `r3ngine_pause_scan`, `r3ngine_resume_scan`, `r3ngine_stop_scan`, `r3ngine_retry_task`, `r3ngine_start_email_discovery`, `r3ngine_stop_email_discovery`, `r3ngine_start_employee_intel`, `r3ngine_stop_employee_intel`, `r3ngine_trigger_apme`, `r3ngine_recalculate_apme`, `r3ngine_start_workflow`.
5. Re-orient. Do not chain dispatch without a new approval.

Auditor keys: skip this phase.

## 7. Client pack

Markdown in chat. Not the in-app PDF (`generate_report_task` is not an MCP tool).

```markdown
# Security assessment — {target}
## Engagement
## Executive summary
## Scope and method
## Attack surface
## Findings
## Attack paths
## Coverage gaps and recommended follow-up
## Appendix — scan and tool ids
```

## Edges

- Truncated page: request the next `offset`. Never invent remaining rows.
- MCP error: show the error; retry once; stop if it persists.
- Out-of-scope name in results: record and ignore.
- No exploits, payloads, or step-by-step attack reproduction in client text.
