# SAFE PoC handoff package

Pass this JSON (or equivalent fields) when delegating to `r3ngine-safe-poc`.

```json
{
  "project_slug": "acme",
  "scan_id": 123,
  "vulnerability_id": 456,
  "suggested_template_id": "marker_reflect",
  "param_name": "q",
  "expected_marker": null,
  "http_url": "https://app.example.com/search",
  "rationale": "likely_tp XSS reflection; need benign marker proof",
  "confirm_verified": false
}
```

## Rules
- `suggested_template_id` must be a catalog id (or null if agent should choose).
- For `flag_canary_read`, operator/agent must supply `expected_marker`.
- Never include freeform `payload` / exploit bodies.
- PoC success does not auto-set `verified`.
