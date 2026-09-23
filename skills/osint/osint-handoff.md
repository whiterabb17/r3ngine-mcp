# OSINT handoff package

Parent (`r3ngine-assessor`) builds this before calling `r3ngine-osint`.

## Detect Spiderfoot

From `r3ngine_get_scan` / `r3ngine_get_scan_detail`:
- `tasks_planned` or scan `tasks` contains `spiderfoot_scan` (or spiderfoot in activity names) → `spiderfoot_primary: true`
- Else → `spiderfoot_primary: false` (Spiderfoot skill is secondary only)

## Package shape

```yaml
project_slug: acme
scan_id: 42
target_name: acme.example
org_aliases: [Acme, Acme Corp]
spiderfoot_primary: false
candidates:   # max ~40–50
  - id: 101
    osint_type: Employee
    content: John Smith
    source: theHarvester
    confidence: 40
    metadata: {}
emails_sample: []      # optional cross-check
employees_sample: []
```

## After sub-agent returns

Call `r3ngine_verify_osint_staging` with:
- each `keep` id → `{ id, agent_verified: true }`
- each `noise` id → `{ id, agent_verified: false }`
- skip `uncertain`

Tell the operator: badges appear in OSINT Staging; use **Add verified** / **Clear false positive** / **Clear all**.
