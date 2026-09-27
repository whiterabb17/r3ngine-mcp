import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import {
  formatSchema,
  queryString,
  registerGet,
  registerPostPath,
} from '../common.js';

export const COMPLIANCE_PLUGIN_SLUG = 'compliance_assessment';

export const COMPLIANCE_PLUGIN_TOOL_NAMES = [
  'r3ngine_list_compliance_assessments',
  'r3ngine_get_compliance_assessment',
  'r3ngine_list_compliance_controls',
  'r3ngine_get_compliance_report',
  'r3ngine_enrich_compliance_control',
] as const;

export function registerComplianceAssessmentTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_compliance_assessments',
    'List compliance assessments',
    'List compliance assessments (PCI/HIPAA/NIST/etc). Requires compliance_assessment plugin.',
    {
      scan_id: z.number().int().optional(),
      framework: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/compliance/assessments/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_compliance_assessment',
    'Get compliance assessment',
    'Get one compliance assessment including control results.',
    { assessment_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/compliance/assessments/${args.assessment_id}/`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_compliance_controls',
    'List compliance controls',
    'List control results for an assessment (filter by result).',
    {
      assessment_id: z.number().int(),
      result: z.string().optional(),
      limit: z.number().int().min(1).max(500).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => {
      const { assessment_id, ...rest } = args;
      return `/api/mcp/compliance/controls/${queryString({ assessment_id, ...rest })}`;
    },
  );
  registerGet(
    server,
    client,
    'r3ngine_get_compliance_report',
    'Get compliance report',
    'Return compliance attestation JSON when available (HTML/PDF stay in UI).',
    { assessment_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/compliance/assessments/${args.assessment_id}/report/`,
  );
  registerPostPath(
    server,
    client,
    'r3ngine_enrich_compliance_control',
    'Enrich compliance control',
    'Generate AI remediation for a failed/partial control result.',
    {
      control_id: z.number().int(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/compliance/controls/${args.control_id}/enrich/`,
    () => ({}),
  );
}
