# Adapter note (SAFE PoC)

Synced Anthropic skills under `skills/vendor/anthropic/` are **interpretive only** for r3ngine SAFE PoC.

- Do **not** run skill Workflow command blocks, Burp/ZAP recipes, or freeform probes.
- Map the finding class to a catalog `template_id` (`marker_reflect`, `calc_echo`, `authz_status_delta`, `open_redirect_safe`, `flag_canary_read`).
- Execution happens only after `r3ngine_approve_safe_poc`.
- Prefer this folder’s catalog/denylist over upstream wording when they conflict.
