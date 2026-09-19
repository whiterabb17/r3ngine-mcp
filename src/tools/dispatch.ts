import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../client.js';
import { formatSchema, registerPost } from './common.js';

export function registerDispatchTools(server: McpServer, client: RengineMcpClient) {
  registerPost(
    server,
    client,
    'r3ngine_start_scan',
    'Start scan',
    'Start a scan for one or more domains. Not available to auditors.',
    {
      domain_id: z.union([z.number().int(), z.array(z.number().int())]),
      engine_id: z.number().int(),
      response_format: formatSchema,
    },
    '/api/mcp/scans/start/',
    (args) => ({ domain_id: args.domain_id, engine_id: args.engine_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_pause_scan',
    'Pause scan',
    'Pause a running scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/scans/pause/',
    (args) => ({ scan_id: args.scan_id }),
    true,
  );
  registerPost(
    server,
    client,
    'r3ngine_resume_scan',
    'Resume scan',
    'Resume a paused scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/scans/resume/',
    (args) => ({ scan_id: args.scan_id }),
    true,
  );
  registerPost(
    server,
    client,
    'r3ngine_stop_scan',
    'Stop scan',
    'Stop a running scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/scans/stop/',
    (args) => ({ scan_id: args.scan_id }),
    true,
  );
  registerPost(
    server,
    client,
    'r3ngine_retry_task',
    'Retry task',
    'Retry a failed scan activity.',
    { task_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/tasks/retry/',
    (args) => ({ task_id: args.task_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_start_subscan',
    'Start subscan',
    'Start subscan tasks on subdomains.',
    {
      subdomain_ids: z.array(z.number().int()),
      tasks: z.array(z.string()),
      engine_id: z.number().int().optional(),
      selected_plugins: z.array(z.string()).optional(),
      worker_name: z.string().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/subscans/start/',
    (args) => ({
      subdomain_ids: args.subdomain_ids,
      tasks: args.tasks,
      engine_id: args.engine_id,
      selected_plugins: args.selected_plugins,
      worker_name: args.worker_name,
    }),
  );
  registerPost(
    server,
    client,
    'r3ngine_start_email_discovery',
    'Start email discovery',
    'Queue email discovery for a scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/email-discovery/start/',
    (args) => ({ scan_id: args.scan_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_stop_email_discovery',
    'Stop email discovery',
    'Stop an email discovery job.',
    { job_id: z.string(), response_format: formatSchema },
    '/api/mcp/email-discovery/stop/',
    (args) => ({ job_id: args.job_id }),
    true,
  );
  registerPost(
    server,
    client,
    'r3ngine_start_employee_intel',
    'Start employee intel',
    'Queue employee intelligence for a scan.',
    { scan_id: z.number().int(), response_format: formatSchema },
    '/api/mcp/employee-intel/start/',
    (args) => ({ scan_id: args.scan_id }),
  );
  registerPost(
    server,
    client,
    'r3ngine_stop_employee_intel',
    'Stop employee intel',
    'Stop an employee intelligence job.',
    { job_id: z.string(), response_format: formatSchema },
    '/api/mcp/employee-intel/stop/',
    (args) => ({ job_id: args.job_id }),
    true,
  );
  registerPost(
    server,
    client,
    'r3ngine_start_workflow',
    'Start workflow',
    'Start a named standalone workflow.',
    {
      workflow_slug: z.string(),
      target: z.string().optional(),
      target_type: z.string().optional(),
      urls: z.union([z.string(), z.array(z.string())]).optional(),
      cidr: z.string().optional(),
      domain: z.string().optional(),
      yaml_configuration: z.record(z.unknown()).optional(),
      scan_history_id: z.number().int().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/workflows/start/',
    (args) => args,
  );
}
