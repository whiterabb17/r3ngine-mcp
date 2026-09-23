# External reconnaissance with OSINT (curated)

Adapted from Anthropic-Cybersecurity-Skills `conducting-external-reconnaissance-with-osint`.
Authorized assessments only. No social-engineering or exploit steps.

## Scope for r3ngine-osint

Use this as the **default** external-OSINT verification lens when triaging staging rows:

1. Confirm the handoff target/domain is the only org in scope.
2. Prefer artifacts that bind to that domain (email domain, subdomain, org alias).
3. Treat uncorrelated people/emails as weak until corroborated.
4. Map sources (harvester, hunter, spiderfoot, crawled) to confidence — multi-source agreement strengthens `keep`.

## Do not

- Run live third-party OSINT tools from this skill text
- Expand to out-of-scope subsidiaries without operator yes
- Produce phishing or pretext guidance
