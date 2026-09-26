# Validation write rules

1. Enrich first (`r3ngine_enrich_vulnerability`) with verdict + confidence + rationale.
2. Status via `r3ngine_validate_vulnerability`:
   - Agent-free: `needs_review`, `false_positive`, `new`
   - `verified` only if handoff/operator has `confirm_verified: true` **and** `validation_confidence >= 0.8`
3. Always set `validation_reason` when changing status.
4. Never store exploit content in enrichment or notes.
5. Empty evidence → do not verify.
