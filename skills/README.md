# Interpret skills (r3ngine-local)

Curated playbooks for the assessor. Not the full external cybersecurity-skills catalog.
No exploit PoC skills. Use with MCP evidence only.

| Skill | File | Use when |
|-------|------|----------|
| Web vuln narrative | `web-vuln-narrative.md` | Writing client-facing web finding text |
| API finding narrative | `api-finding-narrative.md` | API/authz/schema findings |
| Coverage gap analysis | `coverage-gap.md` | After scan_detail buckets |
| Follow-up batching | `followup-batching.md` | Building propose_followups plans |
| ATT&CK client wording | `attack-client-wording.md` | Mapping tactics for executives |
| Severity triage | `severity-triage.md` | Ordering vulns for the session |
| TLS noise grouping | `tls-noise.md` | Collapsing cipher/TLS families |
| Subdomain prioritization | `subdomain-priority.md` | Picking hosts for follow-ups |
| Endpoint prioritization | `endpoint-priority.md` | Picking URLs for singular tools |
| Note hygiene | `note-hygiene.md` | TodoNote updates after plans |
| Exec summary | `exec-summary.md` | Client pack executive section |
| Remediation tone | `remediation-tone.md` | Actionable, non-alarmist fixes |
| Scope discipline | `scope-discipline.md` | Out-of-scope handling |
| Failed-plan retry | `failed-plan-retry.md` | Summarizing abort/fail for operators |
| Evidence citation | `evidence-citation.md` | Citing scan/asset/tool ids |

## OSINT verify (`skills/osint/`)

Used by `r3ngine-osint` (and the assessor when packaging handoffs):

| Skill | File | Notes |
|-------|------|-------|
| Handoff contract | `osint/osint-handoff.md` | Package shape + MCP verify post-back |
| Generic-name noise | `osint/generic-name-noise.md` | Primary noise filter |
| External OSINT recon | `osint/conducting-external-reconnaissance-with-osint.md` | Curated Anthropic adapt |
| OSINT correlation | `osint/performing-ai-driven-osint-correlation.md` | Curated Anthropic adapt |
| Spiderfoot | `osint/performing-osint-with-spiderfoot.md` | Primary only if scan has Spiderfoot tasks |
