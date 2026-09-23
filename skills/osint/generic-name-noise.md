# Generic-name noise triage

Goal: cut OSINT staging noise from ubiquitous personal names and role accounts.

## Likely noise (`agent_verified: false`)

- Single common given names or surname-only tokens with no org tie
- Role/mailbox patterns: `admin`, `info`, `support`, `sales`, `noreply`, `webmaster`
- Content that is clearly not a person (random tokens, ASN labels, template placeholders)
- Low confidence + source known for high false positives, and no corroborating email on the target domain
- Duplicate of a higher-confidence row already marked keep

## Likely keep (`agent_verified: true`)

- Email local-part or name that matches target domain / org aliases
- Appears in both staging and promoted emails/employees
- High confidence with metadata linking to the in-scope domain
- Distinctive name uncommon in general population + org context in metadata

## Uncertain (leave unset)

- Plausible name but no domain/org corroboration
- Medium confidence only

Never invent LinkedIn profiles or employment claims. Cite staging `id` in reasons.
