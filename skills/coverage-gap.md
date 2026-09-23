# Coverage gap analysis

After Findings, call `r3ngine_get_scan_detail`:
- `task_summary.failed` / `aborted` → candidates for `retry_task` steps
- Empty `success` with planned tasks unused → coverage thin; prefer subscan or full scan only if operator agrees
- Empty subdomain/endpoint lists → surface incomplete; do not claim secure

Empty result = gap, not clean bill of health.
