# False-positive patterns

Likely noise when MCP evidence shows:

- Informational TLS/cipher/banner findings without exploitability context
- Template matches with empty extracted results and no corroborating neighbors
- Severity inflated vs CVSS/vector inconsistency without host confirmation
- Duplicate group_key clusters already marked accepted_risk elsewhere on same asset

Prefer `validation_verdict: likely_fp` + status `false_positive` or `needs_review` with a short rationale citing ids. When unsure → `uncertain` / `needs_review`.
