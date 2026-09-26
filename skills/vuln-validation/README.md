# SAFE vulnerability validation skills

Curated interpretive library for `r3ngine-vuln-validator`. **Allowlist only** — do not vendor the full Anthropic-Cybersecurity-Skills pack or any `attacking-*` / exploit / phishing / bruteforce / payload skill.

Portable paths: this folder + `skills/vendor/anthropic/` (synced by MCP install). Never `~/.claude/skills`. Refresh: `node scripts/sync-cyber-skills.mjs --missing-only`.

## Policy for pack updates

When reviewing upstream cybersecurity skill packs (via `skills/allowlist.json` + sync script):

| Include themes | Exclude themes |
|----------------|----------------|
| Vulnerability triage, FP patterns | Attacking / exploiting / weaponizing |
| CVSS / EPSS / KEV interpretation | Payload craft, shellcode, PoC recipes |
| MITRE ATT&CK *mapping* (IDs + client wording) | Phishing, social engineering playbooks |
| Impact analysis, threat modeling (interpretive) | Bruteforce, credential stuffing how-tos |
| Attack-path / attack-tree *modeling* critique | Live exploitation tooling (sqlmap, msf, hydra) |

Local complements stay in-repo. `pentest-commands` (if referenced): **impact-class inference only** — never emit runnable command lines in notes/reports.

## Skills in this folder

| Skill | File | Use when |
|-------|------|----------|
| Handoff contract | `vuln-handoff.md` | Assessor → validator package shape |
| Impact class mapping | `impact-classes.md` | Choosing `impact_classes` |
| CVE signal interpretation | `cve-signals.md` | KEV / EPSS / public-exploit *existence* |
| False-positive patterns | `false-positive-patterns.md` | Likely noise vs TP |
| ATT&CK mapping | `attck-mapping.md` | Optional technique IDs |
| Path feasibility | `path-feasibility.md` | Critiquing APME chains |
| Validation write rules | `validation-writes.md` | Status gates + confirm_verified |

## MCP tools (writes)

- `r3ngine_analyze_vulnerability` — packaged read context
- `r3ngine_enrich_vulnerability` — `agent_enrichment` JSON
- `r3ngine_validate_vulnerability` — status (+ verified gate)
- `r3ngine_enrich_attack_path` — nest `agent_path_review` on chain

Forbidden request keys (server-enforced): `payload`, `exploit_code`, `exploit_body`, `shellcode`, `metasploit`, `msfvenom`, `reverse_shell`, `bind_shell`, `weaponiz*`.
