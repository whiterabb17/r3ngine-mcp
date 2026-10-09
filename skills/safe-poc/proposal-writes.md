# Proposal writes

## Propose
`r3ngine_propose_safe_poc`:
- `vulnerability_id` (required)
- `template_id` (catalog)
- `params` (typed; see template-catalog)
- `rationale`, optional `project_slug` / `scan_id` / `agent_id`

## Update
`r3ngine_update_safe_poc` while `proposed`. After operator edit, agents are locked out (`operator_edited`).

## Approve / abort
Operator explicit yes only:
- `r3ngine_approve_safe_poc` → Temporal `SafePocWorkflow`
- `r3ngine_abort_safe_poc` → cancel workflow when running

## Direct run
`r3ngine_run_safe_poc` → **410** with propose→approve message.
