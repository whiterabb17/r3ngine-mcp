# Interpret skills (r3ngine-local)

Curated playbooks for specialist agents. Portable with the MCP checkout/image — **not** the full external cybersecurity-skills catalog and **not** `~/.claude/skills`.

## Install / refresh (operators)

```bash
# During MCP setup/update (automatic)
node scripts/install-mcp.mjs --update
# or, inside r3ngine-mcp:
node scripts/install.mjs --update

# On-demand / missing only
npm run sync-skills:missing
# Full allowlist refresh
npm run sync-skills
```

Allowlist: [`allowlist.json`](allowlist.json). Vendor tree: `vendor/anthropic/` (+ `MANIFEST.json`). Denylist blocks `attacking-*`, `exploiting-*`, phishing/bruteforce/payload-style names.

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

## SAFE vuln validation (`skills/vuln-validation/`)

Used by `r3ngine-vuln-validator` (and the assessor when packaging handoffs):

| Skill | File | Notes |
|-------|------|-------|
| Allowlist / policy | `vuln-validation/README.md` | Gated themes; exclude attacking-* |
| Handoff contract | `vuln-validation/vuln-handoff.md` | Assessor → validator package |
| Impact classes | `vuln-validation/impact-classes.md` | Enrichment taxonomy |
| CVE signals | `vuln-validation/cve-signals.md` | KEV/EPSS/existence only |
| FP patterns | `vuln-validation/false-positive-patterns.md` | Noise triage |
| ATT&CK mapping | `vuln-validation/attck-mapping.md` | Technique IDs |
| Path feasibility | `vuln-validation/path-feasibility.md` | APME critique |
| Validation writes | `vuln-validation/validation-writes.md` | verified gate |

## OSINT verify (`skills/osint/`)

Used by `r3ngine-osint` (and the assessor when packaging handoffs):

| Skill | File | Notes |
|-------|------|-------|
| Handoff contract | `osint/osint-handoff.md` | Package shape + MCP verify post-back |
| Generic-name noise | `osint/generic-name-noise.md` | Primary noise filter |
| External OSINT recon | `osint/conducting-external-reconnaissance-with-osint.md` | Curated Anthropic adapt |
| OSINT correlation | `osint/performing-ai-driven-osint-correlation.md` | Curated Anthropic adapt |
| Spiderfoot | `osint/performing-osint-with-spiderfoot.md` | Primary only if scan has Spiderfoot tasks |

## Vendor Anthropic subset (`skills/vendor/anthropic/`)

Synced from [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) per `allowlist.json`. Each skill includes `ADAPTER.md` (interpretive only). Prefer local curated files when wording conflicts.

## Lessons

`_lessons/` — optional session bullets from agents; human review before promoting into curated playbooks.
