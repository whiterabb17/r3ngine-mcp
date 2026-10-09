# SAFE PoC skills

Curated library for `r3ngine-safe-poc`. **Catalog execution only** — agents propose `template_id` + typed params; the server builds and runs probes after operator approve.

Portable paths: this folder + `skills/vendor/anthropic/` (synced by MCP install). Never `~/.claude/skills`. Refresh: `node scripts/sync-cyber-skills.mjs --missing-only`.

## Policy

| Include | Exclude |
|---------|---------|
| Marker / calc / authz-status / safe-redirect / flag-canary templates | Freeform payloads, exploit recipes |
| Interpretive vendor testing/triage/canary skills (ADAPTER.md) | `attacking-*`, `exploiting-*`, WAF bypass, SSRF exploitation |
| Propose → operator approve → Temporal execute | Direct run, `run_tool` exploiters, auto-`verified` |

Vendor skills are **interpretive**: map findings to catalog `template_id` values. Do **not** run upstream Workflow command blocks.

## Skills in this folder

| Skill | File | Use when |
|-------|------|----------|
| Handoff contract | `poc-handoff.md` | Assessor/validator → safe-poc package |
| Template catalog | `template-catalog.md` | Choosing `template_id` |
| Evidence criteria | `evidence-criteria.md` | Success / redaction rules |
| Denylist | `denylist.md` | Paths/hosts never proposed |
| Proposal writes | `proposal-writes.md` | MCP tool contracts + approve gate |
| Vendor adapter note | `ADAPTER.md` | How to treat synced Anthropic skills |

## MCP tools

- `r3ngine_propose_safe_poc` / `r3ngine_update_safe_poc` / `r3ngine_list_safe_pocs` / `r3ngine_get_safe_poc`
- `r3ngine_approve_safe_poc` / `r3ngine_abort_safe_poc` — **operator only** (explicit yes)
- `r3ngine_run_safe_poc` — always **410**; use propose→approve

Forbidden request keys: `payload`, `exploit_code`, `exploit_body`, `shellcode`, `metasploit`, `msfvenom`, `reverse_shell`, `bind_shell`, `weaponiz*`.
| Security controls | `security-controls.md` | SSRF/scope/secrets propose-time gates |

