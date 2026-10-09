# Evidence criteria

## Success
- `matched: true` with template-specific signal (marker present, `49` present, status delta, safe Location host, expected_marker present).
- Confidence typically 0.75–0.9 on match; ~0.2 on miss.

## Storage
- Nest under `Vulnerability.agent_enrichment.poc` (last attempt summary).
- Attempt `result` holds digests / length buckets — not full PII bodies for authz.
- Cookie values are redacted in API serialization.
- Never write freeform content into `ValidationResult.payload`.

## Verified
PoC success is **not** automatic `verified`. Operator + `r3ngine_validate_vulnerability` with `confirm_verified=true` and confidence ≥ 0.8.
