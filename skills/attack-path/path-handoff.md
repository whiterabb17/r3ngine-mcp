# Attack-path handoff

Parent (`r3ngine-assessor`) builds this before calling `r3ngine-attack-path`.

## When to delegate

After Paths / dashboard review: hot or unrealistic APME chains, missing alternate business-impact narratives, or operator asks to update/dismiss/re-model paths.

## Package shape

```yaml
project_slug: acme
scan_id: 42
target_name: acme.example
path_ids: [APT-abc123, APT-def456]   # hottest first; max ~10
vulnerability_ids: [101]             # optional linked vulns for context
notes: "Chain assumes auth without session evidence"
suggested_ops: [enrich]              # optional hint: enrich|create|update|dismiss|trigger_apme|recalculate_apme
```

## After sub-agent returns

- Path agent leaves **proposals** (`status: proposed`). Summarize proposal ids for the operator.
- Do **not** call approve/abort unless the operator explicitly says yes.
- Do not treat path proposals as approve-followups.
