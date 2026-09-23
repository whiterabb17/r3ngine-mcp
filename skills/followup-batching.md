# Follow-up batching

1. Collect `suggested_followups` from hottest vulns/hosts/endpoints (cap 5 total).
2. Dedupe by (tool, asset_id). Prefer singular `run_tool` before subscan before full scan.
3. `r3ngine_propose_followups` with rationale.
4. Tell operator: edit → approve; abort while running; retry only on failed/aborted with yes.
5. Never auto-approve or auto-retry.
