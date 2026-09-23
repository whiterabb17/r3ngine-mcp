import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, queryString, registerGet } from './common.js';

export function registerFindingTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_subdomains',
    'List subdomains',
    'List subdomains for a scan. Read-only.',
    {
      scan_id: z.number().int(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/subdomains/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_subdomain_detail',
    'Get subdomain detail',
    'Subdomain with tech/IPs/WAF and recent vulns/endpoints. Use after thin list when you need relations. Read-only.',
    { subdomain_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/subdomains/${args.subdomain_id}/detail/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_endpoints',
    'List endpoints',
    'List endpoints for a scan. Read-only.',
    {
      scan_id: z.number().int(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/endpoints/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_endpoint_detail',
    'Get endpoint detail',
    'Endpoint with parameters and recent vulnerabilities. Use after thin list when you need relations. Read-only.',
    { endpoint_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/endpoints/${args.endpoint_id}/detail/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_vulnerabilities',
    'List vulnerabilities',
    'List vulnerabilities. Read-only. Omits raw request/response blobs.',
    {
      scan_id: z.number().int().optional(),
      target_id: z.number().int().optional(),
      severity: z.number().int().optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/vulnerabilities/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_vulnerability_detail',
    'Get vulnerability detail',
    'Vulnerability with description/impact/remediation, CVE/CWE/tags, and related ids. Omits raw request/response. Use after thin list when you need relations. Read-only.',
    { vulnerability_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/vulnerabilities/${args.vulnerability_id}/detail/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_exposures',
    'List exposures',
    'List exposures. Read-only.',
    {
      scan_id: z.number().int().optional(),
      target_id: z.number().int().optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/exposures/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_exposure_detail',
    'Get exposure detail',
    'Exposure with linked host/endpoint and related vulnerabilities. Use after thin list when you need relations. Read-only.',
    { exposure_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/exposures/${args.exposure_id}/detail/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_search',
    'Search',
    'Search targets, scans, and vulnerabilities. Read-only.',
    {
      query: z.string(),
      project_slug: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/search/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_dashboard',
    'Get dashboard',
    'Project KPIs only. Read-only.',
    { project_slug: z.string(), response_format: formatSchema },
    (args) => `/api/mcp/dashboard/${queryString({ project_slug: args.project_slug })}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_engines',
    'List engines',
    'List scan engines (names only). Read-only.',
    { response_format: formatSchema },
    () => '/api/mcp/engines/',
  );
  registerGet(
    server,
    client,
    'r3ngine_get_system_health',
    'Get system health',
    'Database/process health flags. Read-only.',
    { response_format: formatSchema },
    () => '/api/mcp/health/',
  );
}
