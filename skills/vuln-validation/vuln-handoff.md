# Vuln validator handoff

Parent (`r3ngine-assessor`) builds this before calling `r3ngine-vuln-validator`.

## When to delegate

After Findings (and optionally Paths): hot critical/high vulns, noisy clusters needing FP triage, or APME paths that look unrealistic.

## Package shape

```yaml
project_slug: acme
scan_id: 42
target_name: acme.example
vulnerability_ids: [101, 102]   # hottest first; max ~10
path_ids: [apme-uuid-or-impact-id]  # optional
notes: "Cluster of SQLi templates on api.*"
confirm_verified: false          # operator must flip true for verified writes
```

## After sub-agent returns

- Enrichment and validation are already written via MCP when the validator succeeds.
- Summarize verdicts + impact classes for the operator.
- Do not auto-approve follow-ups from enrichment alone.
