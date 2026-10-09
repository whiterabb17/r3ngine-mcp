# Denylist (never propose)

## Hosts
- localhost / `.localhost`
- Link-local / metadata (`169.254.169.254`, GCP/Azure metadata hosts)
- Private / reserved IPs (literal or resolved)

## Paths (substring)
- `.env`, `etc/passwd`, `etc/shadow`, `proc/self`, `windows/system32`
- Destructive admin wipe / delete account paths

## Methods
- v1 templates: GET or POST-form only (no DELETE/PUT/PATCH)

## Other
- `file://`, credentialed URLs (`user:pass@`)
- Arbitrary open-redirect targets outside `example.com` / `www.example.com`
