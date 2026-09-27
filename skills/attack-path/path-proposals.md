# Path proposals (propose → approve)

All path-domain writes go through `AttackPathProposal`. Propose never mutates live `ImpactAssessment` rows.

## Operations

| `operation` | Effect on approve |
|-------------|-------------------|
| `enrich` | Merge `agent_path_review` (+ optional `potential_impact`) on existing path |
| `update` | Replace allowed chain narrative fields (`steps`, risk, score, summary); sets `source: agent` |
| `create` | New `ImpactAssessment` + `apme_path_id` (`APT-AGENT-…`). Link `vulnerability_id` only if no row exists for that vuln |
| `dismiss` | Set `dismissed` + `dismiss_reason` |
| `trigger_apme` | Queue LLM-assisted APME for `scan_id` |
| `recalculate_apme` | Queue algorithmic APME recalculation for `scan_id` |

## Propose body (essentials)

```json
{
  "project_slug": "acme",
  "scan_id": 42,
  "operation": "enrich",
  "target_path_id": "APT-abc123",
  "rationale": "Auth gate not evidenced",
  "agent_id": "r3ngine-attack-path",
  "payload": {
    "feasibility": "stretched",
    "confidence": 0.55,
    "blocked_reasons": ["auth gate unclear"],
    "missing_prereqs": ["valid session"],
    "impact_classes": ["data_leakage"],
    "rationale": "…"
  }
}
```

For `create` / `update`, `payload.chain` may include narrative `steps` (nodes/edges/actions as labels). Cap lists; no exploit fields.

## SAFE step schema

Each step may include: `from` / `to` (or `from_node` / `to_node` with `name`), `action` (short label), `confidence`, `status`, optional ATT&CK technique ids. Forbidden: `payload`, `exploit_*`, shell/msf/sqlmap/hydra keys or values that look like recipes.

## Operator gate

1. Agent: `r3ngine_propose_attack_path`
2. Optional: `r3ngine_update_attack_path_proposal` while `proposed` (operator edit locks agent overwrite)
3. Operator yes → `r3ngine_approve_attack_path_proposal` **or** `abort`
