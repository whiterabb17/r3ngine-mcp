# Adversarial triage (security-auditor lens)

Use before enrich/validate writes. Interpretive only — no live exploitation.

## Threat questions (per finding)
1. **Deface / hijack / overclaim** — What would make this a false positive or severity inflation?
2. **Trust boundary** — Did evidence cross client → scanner → MCP → DB? Prefer primary MCP fields over narrative alone.
3. **IDOR / BAC** — For auth findings, is the claim about *authorization* or just missing auth UI? Prefer `auth_bypass` only with object/role evidence.
4. **Injection class** — Reflection ≠ RCE. Map to impact classes conservatively (`recon_only` / uncertain when unclear).
5. **SSRF / cloud metadata** — Flag class in enrichment rationale; **do not** propose network pivots. Benign proof → handoff `r3ngine-safe-poc` only if a catalog template fits (v1 has no SSRF template — skip PoC).
6. **Fail securely** — Empty or contradictory evidence → `uncertain` / `needs_review`, never silent `verified`.

## OWASP-oriented mapping (IDs / wording only)
- Prefer OWASP Top 10 / ASVS *category labels* in rationale when helpful.
- Never emit exploit steps, payloads, or tool runbooks.

## Data protection
- Do not paste secrets, session tokens, or full response bodies into notes.
- Cite vuln/scan/endpoint ids instead.
