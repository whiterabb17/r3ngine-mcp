# Changelog

## [1.3.0] - 2026-09-26

### Added

- SAFE vulnerability validation tools: `r3ngine_analyze_vulnerability`, `r3ngine_enrich_vulnerability`, `r3ngine_validate_vulnerability`, `r3ngine_enrich_attack_path`
- `r3ngine-vuln-validator` agent + curated `skills/vuln-validation/` (interpret/enrich only; no exploit craft)
- Portable allowlisted Anthropic cyber skills sync (`scripts/sync-cyber-skills.mjs`, `skills/allowlist.json`, `skills/vendor/anthropic/`)
- Install/update and Docker build run skill sync so operators do not need `~/.claude/skills`
- Specialist agent hardening (skill bootstrap, self-critique, success criteria, lessons) + evals contracts

### Notes

- Requires r3ngine `/api/mcp/vulnerabilities/<id>/analyze|enrich|validation/` and `/api/mcp/attack-paths/<path_id>/enrich/`
- `verified` writes require `confirm_verified=true` and confidence ≥ 0.8
- Enrichment rejects forbidden keys (`payload`, `exploit_code`, etc.)
- On-demand skills: `npm run sync-skills:missing` or `node scripts/sync-cyber-skills.mjs --missing-only`
- Denylist refuses attacking/exploiting/phishing/bruteforce/payload-style skill ids

## [1.2.0] - 2026-09-26

### Added

- `r3ngine_export_scan_for_ai` — full Analyst Assist assessment export for one scan (same payload as the UI Export for AI ZIP): markdown overview, triage prompt, structured bundle, and manifest in one call. Prefer for complete scan analysis.

### Notes

- Requires r3ngine `/api/mcp/scans/<id>/export-ai/`.

## [1.1.0] - 2026-09-24

### Added

- OSINT staging list + agent verify: `r3ngine_list_osint_staging`, `r3ngine_verify_osint_staging`
- `r3ngine-osint` sub-agent + curated `skills/osint/` (Spiderfoot skill primary only when scan includes Spiderfoot)
- Capability catalog and singular tool run: `r3ngine_list_capabilities`, `r3ngine_get_engine_detail`, `r3ngine_run_tool`
- `r3ngine_get_tool_args` + optional `tool_args` on `r3ngine_run_tool` (host-local help cache; call get_tool_args before configuring flags)
- Follow-up batch plans: `r3ngine_propose_followups`, `r3ngine_get_followup_plan`, `r3ngine_list_followups`, `r3ngine_update_followups`, `r3ngine_approve_followups`, `r3ngine_abort_followups`, `r3ngine_retry_followups`, `r3ngine_get_followup_metrics`
- Detail payloads include capped `suggested_followups`
- Assessor playbook/AGENTS batch-plan / OSINT handoff loop and curated interpret skills under `skills/`
- `--update` on `scripts/install.mjs`: rebuild (`npm ci` + `tsc`) from existing `.env`, restart detached HTTP if it was running (or with `--detach` / `--restart`). From r3ngine, `node scripts/install-mcp.mjs --update` git-pulls the checkout and forwards `--update`.

### Changed

- Package `name` / `version` for MCP sessions and `McpServer` metadata are generated from `package.json` at build time (`scripts/sync-version.mjs` → `src/version.ts`).

### Fixed

- Connect stdio before opening a Django MCP session so Cursor `initialize` / `tools/list` is not blocked on TLS or `/api/mcp/sessions/`.
- Stringify `tool` when building the `get_tool_args` URL path.

### Notes

- Requires matching r3ngine APIs: `/api/mcp/osint-staging/`, follow-ups, capabilities, tool run / tool args, and `OsintStaging.agent_verified`.
- Singular runs on r3ngine use `single_tool_*` timeline activity names and host-scoped targets so they do not claim or finalize pipeline scan tasks.
- Arg schemas are host-local (installed binary help cache); do not assume flag parity across deployments — always call `r3ngine_get_tool_args` first.

## [1.0.3] - 2026-09-23

### Added

- Notes tools: `r3ngine_list_notes`, `r3ngine_get_note`, `r3ngine_create_note`, `r3ngine_update_note` (no delete via MCP)
- Note hygiene guidance in assessor playbook / `skills/note-hygiene.md`

### Notes

- Requires matching r3ngine `/api/mcp/notes/` endpoints. List/get for any MCP key; create/update for pentester/sys-admin keys (`TodoNote`). Delete remains UI-only.

## [1.0.2] - 2026-09-23

### Added

- Companion detail tools for drill-down after thin list/get:
  - `r3ngine_get_scan_detail` — finding rollups and tasks grouped by status (initiated / running / success / failed / aborted)
  - `r3ngine_get_target_detail`, `r3ngine_get_vulnerability_detail`, `r3ngine_get_subdomain_detail`, `r3ngine_get_endpoint_detail`, `r3ngine_get_exposure_detail`, `r3ngine_get_subscan_detail`
- Assessment playbook and AGENTS guidance to use `*_detail` when inspecting a live scan or finding

### Notes

- Requires matching r3ngine `/api/mcp/*/detail/` endpoints (r3ngine MCP Access detail tools).
- Thin `list_*` / `get_scan` / `get_target` unchanged.
