# Impact classes

Assign zero or more of:

| Class | Meaning (interpretive) |
|-------|------------------------|
| `remote_code_execution` | Unauthenticated or network-reachable code exec |
| `remote_access` | Interactive/remote control (shell, RDP-class access) |
| `privilege_escalation` | Gain higher privileges on same host/app |
| `data_leakage` | Confidential data read/exfil risk |
| `auth_bypass` | Skip or weaken authentication/authorization |
| `denial_of_service` | Availability impact |
| `lateral_movement` | Pivot to other hosts/trust domains |
| `recon_only` | Information disclosure without direct impact |

Prefer the narrowest set supported by MCP evidence. Ambiguous → include `recon_only` or leave empty and set verdict `uncertain`.
