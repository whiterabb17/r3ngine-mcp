# Path feasibility critique

Critique existing APME chains, then **propose** enrichment via `r3ngine_propose_attack_path` (`operation: enrich`). Do not call direct enrich tools.

Echo constraint concepts: auth gates, privilege requirements, technology prerequisites.

| Feasibility | Use when |
|-------------|----------|
| `plausible` | Steps match observed vulns/exposures; prereqs present or weak |
| `stretched` | Missing links or optimistic auth assumptions |
| `fantasy` | Requires capabilities not in evidence (invented creds, unreachable hosts) |

Fill `blocked_reasons`, `missing_prereqs`, `impact_classes`, `rationale` in the proposal payload. Queue APME only via proposal ops `trigger_apme` / `recalculate_apme` after operator approve.
