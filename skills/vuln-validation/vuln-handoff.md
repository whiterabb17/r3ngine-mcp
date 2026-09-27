# Vuln validator handoff

Parent (`r3ngine-assessor`) builds this before calling `r3ngine-vuln-validator`.

## When to delegate

After Findings: hot critical/high vulns or noisy clusters needing FP triage. For APME path feasibility/create/update, use `skills/attack-path/path-handoff.md` → `r3ngine-attack-path` instead.

## Package shape

```yaml
project_slug: acme
scan_id: 42
target_name: acme.example
vulnerability_ids: [101, 102]   # hottest first; max ~10
notes: "Cluster of SQLi templates on api.*"
confirm_verified: false          # operator must flip true for verified writes
```

## After sub-agent returns

- Enrichment and validation are already written via MCP when the validator succeeds.
- Summarize verdicts + impact classes for the operator.
- Do not auto-approve follow-ups from enrichment alone.
- Path work → attack-path agent proposals, not this handoff.
