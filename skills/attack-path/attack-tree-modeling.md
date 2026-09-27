# Attack-tree modeling (SAFE)

Structural attack trees for APME / client narratives. **Modeling only** — no exploit leaf recipes.

## When

- Decompose a goal (e.g. “data exfil from api.*”) into AND/OR branches
- Spot choke points and mitigations for operator review
- Author an alternate narrated chain for `create` / `update` proposals

## Method

1. Root = attacker goal in scope (asset + impact class).
2. Children = sub-goals; mark **AND** (all required) vs **OR** (any sufficient).
3. Leaves annotate: relative cost, skill, time, detectability — not how-to.
4. Map mitigations / blocked_reasons per branch from MCP evidence.
5. Promote the hottest path into a proposal (`enrich` or `create`/`update`) — never auto-apply.

## Do not

- Include payloads, shell commands, tool flags, or Metasploit/sqlmap/hydra steps
- Invent hosts or credentials outside MCP evidence
- Sync offensive global skills (`active-directory-attacks`, `red-team-tactics`, etc.)
