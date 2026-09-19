
<p align="center">
<a href="https://github.com/whiterabb17/r3ngine"><img src="https://raw.githubusercontent.com/whiterabb17/r3ngine/main/frontend/public/img/banner.png" height="400px" width="520px" alt=""/></a>
</p>

<p align="center">
  <h4 align="center"><strong>Phoenix: From the Ashes even Stronger</strong></h4>
  <h3 align="center">Official v3 MCP Server: Plug Any Agent Into Your r3ngine Instance</h3>
</p>

<p align="center">
<a href="https://github.com/whiterabb17/r3ngine-mcp/releases" target="_blank"><img src="https://img.shields.io/badge/version-v1.0.0-informational?&logo=none" alt="r3ngine MCP Version" /></a>&nbsp;<a href="https://github.com/whiterabb17/r3ngine/releases" target="_blank"><img src="https://img.shields.io/badge/compatible_with-r3ngine_v3.7.6+-warning?&logo=none" alt="Compatible r3ngine version" /></a><br/><a href="https://www.gnu.org/licenses/gpl-3.0" target="_blank"><img src="https://img.shields.io/badge/License-GPLv3-red.svg?&logo=none" alt="License" /></a>&nbsp;<a href="https://modelcontextprotocol.io" target="_blank"><img src="https://img.shields.io/badge/Protocol-MCP-blue.svg?&logo=none" alt="MCP" /></a>&nbsp;<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/Language-TypeScript-3178C6.svg?&logo=none" alt="TypeScript" /></a>
</p>

<h4>r3ngine MCP: Agent Access Without Giving Away the Keys to the Kingdom</h4>
<p>
  r3ngine-mcp is the official Model Context Protocol server for the <b>r3ngine 3.0 Phoenix Rebirth</b>. Cursor, Claude Desktop, VS Code, or any MCP-capable agent can list recon data and queue allowed scans using a hashed API key — without delete/edit tools, database URLs, or filesystem mounts. The process speaks MCP only and is an HTTP client of <code>/api/mcp/</code> on your instance.
</p>

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Table of Contents

* [About r3ngine-mcp](#about-r3ngine-mcp)
* [Workflow](#workflow)
* [Features](#features)
* [Quick Installation](#quick-installation)
* [What Agents Cannot Do](#what-agents-cannot-do)
* [Contributing](#contributing)
* [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)
* [License](#license)

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## About r3ngine-mcp

r3ngine-mcp is a thin, allowlisted MCP sidecar. Identity, hashed keys, sessions, the request/response audit chain, and Settings → MCP Access live in r3ngine. This package never opens Postgres, Redis, Neo4j, or scan-result volumes.

🦾&nbsp;&nbsp; **Read-only recon** — projects, targets, scans, subdomains, endpoints, vulnerabilities, exposures, emails, employees, engines, dashboard KPIs, attack paths, and health.

🗃️&nbsp;&nbsp; **Safe dispatch** — start/pause/resume/stop scans, subscans, email discovery, employee intel, APME trigger/recalculate, and named workflows. Auditor keys stay read-only.

🔧&nbsp;&nbsp; **Both transports** — stdio for a local IDE (`npx r3ngine-mcp`) and Streamable HTTP behind nginx `/mcp` when Settings transport is `http` or `both`.

💎&nbsp;&nbsp; **Sessions + audit** — every MCP process opens a session, heartbeats every 30s, and every tool round-trip is stored redacted in r3ngine. Operators can revoke a session without rotating the key.

⚙️&nbsp;&nbsp; **Defense in depth** — missing tools in this catalog **and** missing routes under `/api/mcp/`. The HTTP client refuses `/keys`, `/audit`, and session revoke.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Workflow

```
Agent / IDE
  ├─ stdio:  npx r3ngine-mcp   ──HTTP──►  r3ngine /api/mcp/     (API key)
  └─ HTTP:   https://host/mcp  ──MCP───►  r3ngine-mcp sidecar
                                              └──HTTP──►  /api/mcp/  (same key)

nginx:  /        → django
        /ws/     → django
        /mcp     → r3ngine-mcp :3100
```

1. Sys-admin sets transport (stdio / HTTP / both) in **Settings → MCP Access**.
2. You generate a named key. The secret (`r3n_mcp_…`) is shown **once**.
3. Paste stdio env or the HTTP URL + Bearer header into the agent.
4. The MCP process opens a session, then calls only allowlisted `/api/mcp/` paths.
5. Connected agents and the full request/response chain appear in Settings. Revoke a session to kick an agent off without rotating the key.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Features

### 🛰️ Transports
*   **stdio**: runs on the agent machine. No sidecar required.
*   **Streamable HTTP**: Docker sidecar on the internal network; nginx `/mcp` is the public door.
*   **Fail closed**: if instance transport is `stdio` only, HTTP MCP returns 403.

### 🔑 Authentication
*   Per-user hashed keys (`SHA-256`, prefix `r3n_mcp_`).
*   Keys authenticate **only** on `/api/mcp/`. They cannot hit delete/edit APIs.
*   `X-MCP-Session-Id` required on data routes. Heartbeat every 30 seconds.
*   **Unauthorized HTTP is rate-limited in the sidecar** (10 failures / IP / minute) so missing or invalid keys never flood r3ngine. Repeat offenders get `429 Retry-After`. Invalid keys are remembered for the window and are not re-probed.

### 📚 Tool catalog
*   Read tools: `r3ngine_list_*`, `r3ngine_get_*`, `r3ngine_search`.
*   Dispatch tools: scan lifecycle, intel jobs, APME, named workflows.
*   Payloads omit API Vault secrets, `results_dir` paths, `curl_command`, and email passwords.

### 🛡️ Isolation
*   No Postgres, Redis, Neo4j, or scan-result volume credentials in this container.
*   Compile-time path allowlist. Client refuses `/api/mcp/audit/` and key/session revoke.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Quick Installation

### Prerequisites
*   A running [r3ngine](https://github.com/whiterabb17/r3ngine) instance
*   Node.js 20+ (for stdio / `npx`)
*   An MCP API key from **Settings → MCP Access**

### From r3ngine

In the r3ngine checkout:

```bash
node scripts/install-mcp.mjs --url https://your-r3ngine-host --key r3n_mcp_… --yes --write-cursor
```

That clones this repository into `r3ngine-mcp/` (if needed) and runs `scripts/install.mjs`: npm install, build, `.env`, a live `/api/mcp/` session check, and a smoke start.

HTTPS setup needs the TLS CA on this computer. Local checkouts use the full path to `secrets/certs/ca.crt`. Otherwise copy that file from the r3ngine host and pass the full path:

```bash
node scripts/install-mcp.mjs --url https://your-r3ngine-host --key r3n_mcp_… --yes --write-cursor --ca C:\full\path\to\ca.crt
```

The installer prints that path and writes it to `.env` and MCP client env so agents can find the cert.

### stdio (Cursor, Claude Desktop, VS Code)

Generate a key in Settings → MCP Access, then paste:

```json
{
  "mcpServers": {
    "r3ngine": {
      "command": "npx",
      "args": ["-y", "r3ngine-mcp"],
      "env": {
        "R3NGINE_URL": "https://your-r3ngine-host",
        "R3NGINE_MCP_API_KEY": "r3n_mcp_…shown-once…",
        "R3NGINE_CA_CERT": "C:\\full\\path\\to\\ca.crt",
        "NODE_EXTRA_CA_CERTS": "C:\\full\\path\\to\\ca.crt"
      }
    }
  }
}
```

Example files: [`config/cursor.mcp.json.example`](config/cursor.mcp.json.example), [`config/claude-desktop.json.example`](config/claude-desktop.json.example), [`config/vscode.mcp.json.example`](config/vscode.mcp.json.example).

The secret is shown once. If you lose it, regenerate the key. Prefix is public; the full secret is not stored.

### HTTP sidecar

When instance transport is `http` or `both`:

```
URL: https://<this-host>/mcp
Header: Authorization: Bearer <shown-once-secret>
```

The sidecar is wired from r3ngine Compose (`r3ngine-mcp` service, nginx `location /mcp`). Do not publish port 3100 to the host.

### Local development

```bash
git clone https://github.com/whiterabb17/r3ngine-mcp.git
cd r3ngine-mcp
npm run setup -- --url https://your-r3ngine-host --key r3n_mcp_… --yes
```

`npm run setup` runs `scripts/install.mjs` (install, build, `.env`, session probe, smoke start). Copy `.env.example` if you prefer to fill values first.

Required env: `R3NGINE_URL`, `R3NGINE_MCP_API_KEY`. HTTP mode additionally uses `MCP_TRANSPORT=http`, `MCP_BIND`, `MCP_PORT`. Optional: `MCP_UNAUTH_MAX` and `MCP_UNAUTH_WINDOW_MS` (unauthorized HTTP rate limit; default 10 failures per IP per minute).

Missing URL or key exits `1` on **stderr** (never stdout — that would break stdio MCP).

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## What Agents Cannot Do

Delete or update targets, subdomains, vulnerabilities, exposures, notes, users, engines, wordlists, plugins, or files. Config import/export. Arbitrary proxy to the rest of Django. Raw SQL. Shell.

Session list, audit read, session revoke, and key management are **not** MCP tools. They stay in the r3ngine UI (JWT/session).

If an agent asks anyway, the tool returns an error — not a protocol crash: *This operation is not available to MCP. Use the r3ngine UI.*

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## 🛠️ Technology Stack

*   **Protocol**: [Model Context Protocol](https://modelcontextprotocol.io) (`@modelcontextprotocol/sdk`)
*   **Runtime**: Node.js 20+ / TypeScript (strict, NodeNext)
*   **HTTP**: Express Streamable HTTP transport
*   **Validation**: Zod (`limit` max 100)
*   **Host**: r3ngine `/api/mcp/` allowlist, hashed keys, sessions, append-only audit

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Contributing

This repository lives next to [r3ngine](https://github.com/whiterabb17/r3ngine), [r3ngine-mobile](https://github.com/whiterabb17/r3ngine-mobile), and [r3ngine-plugins](https://github.com/whiterabb17/r3ngine-plugins).

How you can contribute:
  * Allowlist and tool-catalog hardening
  * Transport and error-mapping fixes
  * Documentation and client snippets
  * Evaluations against a documented fixture instance

To get started:
  1. Check the [r3ngine Contributing Guide](https://github.com/whiterabb17/r3ngine/blob/main/.github/CONTRIBUTING.md)
  2. Fork this repository and create your branch
  3. Run `npm test` and `npm run build`
  4. Submit a pull request

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Reporting Security Vulnerabilities

**Do not** disclose security vulnerabilities publicly on GitHub issues.

Report via the [r3ngine Security tab](https://github.com/whiterabb17/r3ngine/security). Include steps to reproduce, potential impact, and suggested mitigations if any.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## License

Distributed under the **GNU GPL v3 License**. See the core [LICENSE](../LICENSE) for more information.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

<p align="right"><i>Note: r3ngine-mcp is a companion to the r3ngine core and requires a running r3ngine instance to function.</i></p>
