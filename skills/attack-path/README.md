# Attack-path skills (`skills/attack-path/`)

Used by **`r3ngine-attack-path`** (assessor packages handoffs).

| Skill | File | Notes |
|-------|------|-------|
| Policy / tools | `README.md` | This file |
| Handoff contract | `path-handoff.md` | Assessor → path agent |
| Propose → approve | `path-proposals.md` | Payload ops + SAFE step schema |
| Feasibility | `path-feasibility.md` | plausible / stretched / fantasy |
| Attack trees | `attack-tree-modeling.md` | AND/OR structure only — no exploit leaves |

## MCP tools

| Task | Tool |
|------|------|
| List paths | `r3ngine_get_attack_paths` |
| Path detail | `r3ngine_get_attack_path` |
| Propose mutation | `r3ngine_propose_attack_path` |
| List / get proposals | `r3ngine_list_attack_path_proposals` / `r3ngine_get_attack_path_proposal` |
| Edit while proposed | `r3ngine_update_attack_path_proposal` |
| Apply | `r3ngine_approve_attack_path_proposal` — **operator yes only** |
| Abort | `r3ngine_abort_attack_path_proposal` — **operator yes only** |

**Blocked for agents:** direct `r3ngine_enrich_attack_path`, `r3ngine_trigger_apme`, `r3ngine_recalculate_apme`. Use proposal operations instead.

## Policy

- Evidence from MCP only; cite scan / asset / path ids.
- Narrative steps and ATT&CK technique IDs only — no payloads, shells, or exploit recipes.
- No live DB mutation until operator `approve`.
- Vendor Anthropic skills are interpretive (`ADAPTER.md`); never require XM Cyber / live Threat Dragon.
