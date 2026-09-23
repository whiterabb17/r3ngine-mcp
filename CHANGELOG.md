# Changelog

## [Unreleased]

## [1.0.3] - 2026-09-23

### Added

- OSINT staging list + agent verify: `r3ngine_list_osint_staging`, `r3ngine_verify_osint_staging`
- `r3ngine-osint` sub-agent + curated `skills/osint/` (Spiderfoot skill primary only when scan includes Spiderfoot)
- Capability catalog and singular tool run: `r3ngine_list_capabilities`, `r3ngine_get_engine_detail`, `r3ngine_run_tool`
- Follow-up batch plans: `r3ngine_propose_followups`, `r3ngine_get_followup_plan`, `r3ngine_list_followups`, `r3ngine_update_followups`, `r3ngine_approve_followups`, `r3ngine_abort_followups`, `r3ngine_retry_followups`, `r3ngine_get_followup_metrics`
- Detail payloads include capped `suggested_followups`
- Assessor playbook/AGENTS batch-plan / OSINT handoff loop and curated interpret skills under `skills/`
- `--update` on `scripts/install.mjs`: rebuild (`npm ci` + `tsc`) from existing `.env`, restart detached HTTP if it was running (or with `--detach` / `--restart`). From r3ngine, `node scripts/install-mcp.mjs --update` git-pulls the checkout and forwards `--update`.

### Notes

- Requires matching r3ngine APIs: `/api/mcp/osint-staging/`, follow-ups, capabilities, tool run, and `OsintStaging.agent_verified`.

## [1.0.2] - 2026-09-23

### Added

- Companion detail tools for drill-down after thin list/get:
  - `r3ngine_get_scan_detail` — finding rollups and tasks grouped by status (initiated / running / success / failed / aborted)
  - `r3ngine_get_target_detail`, `r3ngine_get_vulnerability_detail`, `r3ngine_get_subdomain_detail`, `r3ngine_get_endpoint_detail`, `r3ngine_get_exposure_detail`, `r3ngine_get_subscan_detail`
- Assessment playbook and AGENTS guidance to use `*_detail` when inspecting a live scan or finding

### Notes

- Requires matching r3ngine `/api/mcp/*/detail/` endpoints (r3ngine MCP Access detail tools).
- Thin `list_*` / `get_scan` / `get_target` unchanged.
