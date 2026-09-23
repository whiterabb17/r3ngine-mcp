# Failed-plan retry

When plan status is `failed` or `aborted`:
1. List steps succeeded vs failed/skipped with errors
2. Propose retry of remaining/failed steps only
3. Wait for explicit operator yes before `r3ngine_retry_followups`
4. Do not set `include_succeeded` unless operator asks to re-run everything
