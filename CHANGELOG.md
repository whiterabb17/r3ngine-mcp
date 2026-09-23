# Changelog

## [Unreleased]

### Added

- `--update` on `scripts/install.mjs`: rebuild (`npm ci` + `tsc`) from existing `.env`, restart detached HTTP if it was running (or with `--detach` / `--restart`). From r3ngine, `node scripts/install-mcp.mjs --update` git-pulls the checkout and forwards `--update`.

## [1.0.2] - 2026-09-23

### Added

- Companion detail tools for drill-down after thin list/get:
  - `r3ngine_get_scan_detail` — finding rollups and tasks grouped by status (initiated / running / success / failed / aborted)
  - `r3ngine_get_target_detail`, `r3ngine_get_vulnerability_detail`, `r3ngine_get_subdomain_detail`, `r3ngine_get_endpoint_detail`, `r3ngine_get_exposure_detail`, `r3ngine_get_subscan_detail`
- Assessment playbook and AGENTS guidance to use `*_detail` when inspecting a live scan or finding

### Notes

- Requires matching r3ngine `/api/mcp/*/detail/` endpoints (r3ngine MCP Access detail tools).
- Thin `list_*` / `get_scan` / `get_target` unchanged.
