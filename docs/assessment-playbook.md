# Assessment playbook

Plan, then execute. Use only the MCP tools for the current phase. Do not call the full catalog on every turn.

Tool names must match the sidecar catalog (`src/tools/index.ts`).

## 1. Orient

| Need | Tool |
|------|------|
| Projects | `r3ngine_list_projects` |
| Targets | `r3ngine_list_targets` (`project_slug`) |
| One target | `r3ngine_get_target`; drill-down: `r3ngine_get_target_detail` |
| Live / pending / recent | `r3ngine_get_scan_status` |
| Scan record | `r3ngine_get_scan`, `r3ngine_list_scans`; drill-down: `r3ngine_get_scan_detail` (task buckets + finding rollups + `suggested_followups`) |
| Child jobs | `r3ngine_list_subscans`; drill-down: `r3ngine_get_subscan_detail` |
| Notes | `r3ngine_list_notes`, `r3ngine_get_note` |
| Instance | `r3ngine_get_system_health` |
| Tool catalog | `r3ngine_list_capabilities` |
| Engine tasks | `r3ngine_get_engine_detail` / `r3ngine_list_engines` |

Confirm `project_slug`, `scan_id`, `target` / `domain_id` with the operator if missing.

`scan_status`: `1` running, `2` success. Treat other values as incomplete unless the API says otherwise.

## 2. Surface

| Need | Tool |
|------|------|
| Hosts | `r3ngine_list_subdomains`; drill-down: `r3ngine_get_subdomain_detail` |
| URLs | `r3ngine_list_endpoints`; drill-down: `r3ngine_get_endpoint_detail` |
| Exposed services | `r3ngine_list_exposures`; drill-down: `r3ngine_get_exposure_detail` |

Summarize counts and notable hosts. Prefer server `suggested_followups` on detail payloads. Do not paste unbounded JSON.

## 3. Findings

| Need | Tool |
|------|------|
| Vulns | `r3ngine_list_vulnerabilities`; drill-down: `r3ngine_get_vulnerability_detail` |
| Lookup | `r3ngine_search` |

Order by severity, then asset. Group noisy TLS/cipher families by host.

Each finding: title, severity, asset, scan id, evidence from MCP, impact, remediation.

**Coverage check (required after Findings):** call `r3ngine_get_scan_detail` and read `task_summary` / empty buckets. Empty success lists or failed tasks = gaps, not “clean.”

Persist durable analyst notes with `r3ngine_create_note` / `r3ngine_update_note` (pentester keys). Never delete notes via MCP.

## 4. Intel

Use when the engagement includes OSINT:

- `r3ngine_list_emails`
- `r3ngine_list_employees`
- `r3ngine_list_osint_staging` (pending staging for verification)

### OSINT staging verification

When Employee/name staging is noisy or volume is high:

1. Page staging; sample emails/employees for cross-check.
2. Detect Spiderfoot: if scan `tasks` / `tasks_planned` includes `spiderfoot_scan` (or Spiderfoot activities), set `spiderfoot_primary: true` in the handoff; else `false` (Spiderfoot skill is secondary).
3. Build a capped handoff package (`skills/osint/osint-handoff.md`) and **delegate to `r3ngine-osint`**.
4. Post results with `r3ngine_verify_osint_staging` (`keep`→true, `noise`→false).
5. Tell the operator: badges show in the OSINT Staging UI — **Add verified**, **Clear false positive**, **Clear all**. Do not promote/delete via MCP.

Do not put personal emails in the client exec summary unless they are in-scope findings.

## 5. Paths

After enough surface + vulns:

- `r3ngine_get_attack_paths`
- `r3ngine_get_dashboard` (`project_slug` required)

If APME is empty, say so and optionally propose `r3ngine_trigger_apme` / `r3ngine_recalculate_apme` (approval required).

## 6. Tactics (follow-up plans)

1. Prefer `suggested_followups` from detail tools; else map via `r3ngine_list_capabilities` / engine detail.
2. Build a **batch** of the hottest **1–5** steps (N=1 is valid). Ordered preference:
   - Singular tool (`run_tool`) on the hottest asset
   - Subscan (`start_subscan`) for multi-task host work
   - Full scan / coarse workflow only when coverage is thin
3. Call `r3ngine_propose_followups` with `project_slug`, optional `scan_id` / `assessment_id`, rationale, and steps.
4. Tell the operator they may **edit** (`r3ngine_update_followups`) then **approve** (`r3ngine_approve_followups`). Kill switch: `r3ngine_abort_followups`. Retry failed/aborted: `r3ngine_retry_followups` — **only after explicit yes**.
5. Poll `r3ngine_get_followup_plan` for status. Do not chain new dispatch without a new plan or an operator-issued retry.
6. Single-step shortcuts still allowed: `r3ngine_run_tool`, `r3ngine_start_subscan`, `r3ngine_retry_task`, `r3ngine_start_workflow`, pause/resume/stop — each still needs operator yes.
7. On `failed` / `aborted` plans: summarize succeeded vs failed steps; **propose** retry of remaining steps — do not call `retry_followups` without yes.
8. When a plan completes, aborts, or retries: update a `TodoNote` with evidence ids for successful steps and record abort/retry attempts.

Auditor keys: skip this phase. Notes create/update also require a pentester (or sys-admin) key.

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
- Cap 5 follow-ups per plan; reject mixed out-of-scope assets (server enforces).
