# AI-driven OSINT correlation (curated)

Adapted from Anthropic-Cybersecurity-Skills `performing-ai-driven-osint-correlation`.
Use for **cross-checking** staging candidates against each other and against promoted emails/employees in the handoff.

## Correlation rules

- Same person signal: shared email local-part, identical normalized name, shared metadata keys
- Same org signal: target domain in email, org alias in content/metadata
- Conflict: high-confidence keep vs identical content already marked noise → prefer uncertain

## Output

Correlation only informs `keep` / `noise` / `uncertain` reasons. Do not invent links that are not in the handoff evidence.
