# OSINT with Spiderfoot (curated)

Adapted from Anthropic-Cybersecurity-Skills `performing-osint-with-spiderfoot`.
Maps to r3ngine’s `spiderfoot_scan` pipeline — do not run Spiderfoot CLI from the agent.

## Priority gate

- If handoff `spiderfoot_primary` is **true** (scan tasks include Spiderfoot): treat Spiderfoot-sourced staging rows as first-class; weigh `sf_type` / spiderfoot metadata when deciding keep vs noise.
- If `spiderfoot_primary` is **false**: this skill is **secondary** only — do not overweight Spiderfoot-shaped assumptions; prefer generic-name + correlation skills.

## Verification notes

- Spiderfoot often emits high-volume entities; apply generic-name noise rules aggressively.
- Prefer keep when Spiderfoot event types clearly bind to the in-scope domain.
- Secondary mode: mention Spiderfoot only when a row’s `source` explicitly indicates it.
