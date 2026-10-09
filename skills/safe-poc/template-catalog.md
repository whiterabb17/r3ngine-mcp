# Template catalog (mirror of server)

| template_id | When to use | Required params |
|-------------|-------------|-----------------|
| `marker_reflect` | Reflected XSS / injection that echoes input | `param_name`; optional `marker`, `method` GET/POST |
| `calc_echo` | SSTI / expression injection | `param_name`; optional `probe_index` 0..n |
| `authz_status_delta` | IDOR / BAC / BOLA hints | `url_a`, `url_b`; optional `cookie_name`+`cookie_value` (same jar applied to **both** URLs) |
| `open_redirect_safe` | Open redirect | `param_name`; `redirect_target` host in `{example.com, www.example.com}` |
| `flag_canary_read` | flag.txt / operator canary file | `expected_marker`; path ends with `flag.txt` or in `allowed_paths` |

Server builds the probe. Agents never supply raw exploit strings beyond these knobs.
