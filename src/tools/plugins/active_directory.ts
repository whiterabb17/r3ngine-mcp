import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import {
  formatSchema,
  queryString,
  registerGet,
  registerPost,
  registerPostPath,
} from '../common.js';

export const AD_PLUGIN_SLUG = 'active_directory';

/** Registered only when active_directory is installed and enabled. */
export const AD_PLUGIN_TOOL_NAMES = [
  'r3ngine_list_ad_assessments',
  'r3ngine_get_ad_assessment',
  'r3ngine_start_ad_assessment',
  'r3ngine_ingest_ad_data',
  'r3ngine_list_ad_findings',
  'r3ngine_get_ad_attack_paths',
  'r3ngine_get_ad_report',
] as const;

export function registerActiveDirectoryTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_ad_assessments',
    'List AD assessments',
    'List Active Directory assessments (requires active_directory plugin). '
      + 'Distinct from APME web-recon attack paths.',
    {
      target_domain: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/ad/assessments/${queryString(args)}`,
  );

  registerGet(
    server,
    client,
    'r3ngine_get_ad_assessment',
    'Get AD assessment',
    'Get AD assessment detail, progress, and summaries (requires active_directory plugin).',
    {
      assessment_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/ad/assessments/${args.assessment_id}/`,
  );

  registerPost(
    server,
    client,
    'r3ngine_start_ad_assessment',
    'Start AD assessment',
    'Create an AD assessment and optionally start ldapdomaindump/Certipy workflow phases. '
      + 'Does not run SharpHound/BloodHound collectors — use r3ngine_ingest_ad_data for BH JSON.',
    {
      target_domain: z.string().min(1),
      name: z.string().optional(),
      config: z.record(z.unknown()).optional(),
      auto_start: z.boolean().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/ad/assessments/start/',
    (args) => ({
      target_domain: args.target_domain,
      name: args.name,
      config: args.config,
      auto_start: args.auto_start ?? true,
    }),
  );

  registerPostPath(
    server,
    client,
    'r3ngine_ingest_ad_data',
    'Ingest AD / BloodHound data',
    'Ingest BloodHound/SharpHound JSON or LDAP export into an assessment (ingest only — '
      + 'does not run collectors). Prefer content_base64 for zip/json files, or content for JSON.',
    {
      assessment_id: z.number().int(),
      type: z.enum(['auto', 'bloodhound', 'bh', 'ldap', 'ldapdomaindump']).optional(),
      filename: z.string().optional(),
      content_base64: z.string().optional(),
      content: z.union([z.string(), z.record(z.unknown()), z.array(z.unknown())]).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/ad/assessments/${args.assessment_id}/ingest/`,
    (args) => ({
      type: args.type ?? 'auto',
      filename: args.filename,
      content_base64: args.content_base64,
      content: args.content,
    }),
  );

  registerGet(
    server,
    client,
    'r3ngine_list_ad_findings',
    'List AD findings',
    'List AD findings (and optionally trusts/exposures) for an assessment.',
    {
      assessment_id: z.number().int(),
      severity: z.string().optional(),
      include: z.string().optional(),
      response_format: formatSchema,
    },
    (args) => {
      const { assessment_id, ...rest } = args;
      return `/api/mcp/ad/assessments/${assessment_id}/findings/${queryString(rest)}`;
    },
  );

  registerGet(
    server,
    client,
    'r3ngine_get_ad_attack_paths',
    'Get AD attack paths',
    'Query AD graph attack paths (BloodHound-style categories). Not APME web paths. '
      + 'category: da_paths | kerberoastable | asreproastable | unconstrained_delegation | acl_abuse',
    {
      assessment_id: z.number().int(),
      category: z.enum([
        'da_paths',
        'kerberoastable',
        'asreproastable',
        'unconstrained_delegation',
        'acl_abuse',
      ]),
      response_format: formatSchema,
    },
    (args) =>
      `/api/mcp/ad/assessments/${args.assessment_id}/attack-paths/${queryString({
        category: args.category,
      })}`,
  );

  registerGet(
    server,
    client,
    'r3ngine_get_ad_report',
    'Get AD report',
    'Compile a comprehensive Active Directory assessment report (JSON) for agents.',
    {
      assessment_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/ad/assessments/${args.assessment_id}/report/`,
  );
}
