# Security controls checklist (SAFE PoC)

Security-auditor inspired gates before `r3ngine_propose_safe_poc`.

## Propose-time adversarial checks
1. **SSRF / redirect abuse** — Never propose URLs that you expect to bounce to metadata (`169.254.169.254`), link-local, or out-of-scope hosts. Server re-validates each redirect hop; still fail closed in the proposal.
2. **DNS / private IP** — Prefer hostnames already on the vuln/scan asset list. Do not suggest raw RFC1918 literals.
3. **IDOR params** — For `authz_status_delta`, use object URLs already in finding evidence; never invent tenant ids from other projects.
4. **Secrets** — `cookie_value` is operator-supplied only; never invent cookies; never put cookies in TodoNotes or client text.
5. **Least privilege of proof** — Pick the *least* invasive catalog template that can prove the class (marker before calc; authz status before any write).
6. **Fail closed** — If no catalog template fits safely, **skip** with rationale. Do not stretch templates.

## After execute
- Treat digests/length buckets as evidence — not full bodies in client reports.
- PoC success is not `verified`; hand back to validator + operator `confirm_verified`.
