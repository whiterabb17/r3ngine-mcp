import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RengineMcpClient } from '../../client.js';
import {
  formatSchema,
  queryString,
  registerGet,
  registerPost,
} from '../common.js';

export const CREDENTIAL_PLUGIN_SLUG = 'credential_intelligence';

export const CREDENTIAL_PLUGIN_TOOL_NAMES = [
  'r3ngine_list_credential_tasks',
  'r3ngine_get_credential_task',
  'r3ngine_start_credential_task',
  'r3ngine_list_discovered_credentials',
  'r3ngine_list_hash_cracking',
  'r3ngine_get_hash_cracking',
  'r3ngine_start_hash_cracking',
] as const;

export function registerCredentialIntelligenceTools(server: McpServer, client: RengineMcpClient) {
  registerGet(
    server,
    client,
    'r3ngine_list_credential_tasks',
    'List credential tasks',
    'List Credential Intelligence tasks (kerbrute/netexec/brutus). Requires credential_intelligence plugin.',
    {
      status: z.string().optional(),
      tool: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/credentials/tasks/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_credential_task',
    'Get credential task',
    'Get a credential task and redacted discovered credentials.',
    { task_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/credentials/tasks/${args.task_id}/`,
  );
  registerPost(
    server,
    client,
    'r3ngine_start_credential_task',
    'Start credential task',
    'Create and optionally execute a credential intelligence task (auth testing).',
    {
      name: z.string().min(1),
      tool: z.enum(['brutus', 'netexec', 'kerbrute', 'hashcat']),
      target: z.string().min(1),
      protocol: z.string().optional(),
      wordlist_user: z.string().optional(),
      wordlist_pass: z.string().optional(),
      threads: z.number().int().optional(),
      additional_flags: z.string().optional(),
      scan_id: z.number().int().optional(),
      domain_id: z.number().int().optional(),
      auto_start: z.boolean().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/credentials/tasks/start/',
    (args) => ({
      name: args.name,
      tool: args.tool,
      target: args.target,
      protocol: args.protocol,
      wordlist_user: args.wordlist_user,
      wordlist_pass: args.wordlist_pass,
      threads: args.threads,
      additional_flags: args.additional_flags,
      scan_id: args.scan_id,
      domain_id: args.domain_id,
      auto_start: args.auto_start ?? true,
    }),
  );
  registerGet(
    server,
    client,
    'r3ngine_list_discovered_credentials',
    'List discovered credentials',
    'List discovered credentials with secrets redacted (password/hash marked present only).',
    {
      task_id: z.number().int().optional(),
      service: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/credentials/discovered/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_list_hash_cracking',
    'List hash cracking tasks',
    'List hashcat cracking tasks (plaintext redacted).',
    {
      status: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().min(0).optional(),
      response_format: formatSchema,
    },
    (args) => `/api/mcp/credentials/cracking/${queryString(args)}`,
  );
  registerGet(
    server,
    client,
    'r3ngine_get_hash_cracking',
    'Get hash cracking task',
    'Get one hash cracking task with redacted cracked plaintext.',
    { task_id: z.number().int(), response_format: formatSchema },
    (args) => `/api/mcp/credentials/cracking/${args.task_id}/`,
  );
  registerPost(
    server,
    client,
    'r3ngine_start_hash_cracking',
    'Start hash cracking',
    'Create and optionally start a hashcat cracking task.',
    {
      name: z.string().min(1),
      hashes_txt: z.string().min(1),
      hash_type: z.number().int().optional(),
      attack_mode: z.number().int().optional(),
      wordlist: z.string().optional(),
      mask: z.string().optional(),
      custom_rules: z.string().optional(),
      workload_profile: z.number().int().optional(),
      force: z.boolean().optional(),
      auto_start: z.boolean().optional(),
      response_format: formatSchema,
    },
    '/api/mcp/credentials/cracking/start/',
    (args) => ({
      name: args.name,
      hashes_txt: args.hashes_txt,
      hash_type: args.hash_type,
      attack_mode: args.attack_mode,
      wordlist: args.wordlist,
      mask: args.mask,
      custom_rules: args.custom_rules,
      workload_profile: args.workload_profile,
      force: args.force,
      auto_start: args.auto_start ?? true,
    }),
  );
}
