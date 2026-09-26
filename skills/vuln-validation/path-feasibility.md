# Path feasibility critique

Annotate existing APME chains via `r3ngine_enrich_attack_path`. Echo constraint concepts: auth gates, privilege requirements, technology prerequisites.

| Feasibility | Use when |
|-------------|----------|
| `plausible` | Steps match observed vulns/exposures; prereqs present or weak |
| `stretched` | Missing links or optimistic auth assumptions |
| `fantasy` | Requires capabilities not in evidence (invented creds, unreachable hosts) |

Fill `blocked_reasons`, `missing_prereqs`, `impact_classes`, `rationale`. Do not silently call `r3ngine_recalculate_apme`.
