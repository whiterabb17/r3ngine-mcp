export type ResponseFormat = 'markdown' | 'json';

export function formatResult(data: unknown, responseFormat: ResponseFormat = 'markdown') {
  const jsonText = JSON.stringify(data, null, 2);
  const text = responseFormat === 'json' ? jsonText : toMarkdown(data);
  return {
    content: [{ type: 'text' as const, text }],
    structuredContent: typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : { data },
  };
}

function toMarkdown(data: unknown): string {
  if (data === null || data === undefined) return '_empty_';
  if (typeof data !== 'object') return String(data);
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.items)) {
    const rows = record.items as unknown[];
    if (rows.length === 0) return 'No items.';
    const keys = Object.keys((rows[0] as object) ?? {});
    const header = `| ${keys.join(' | ')} |`;
    const sep = `| ${keys.map(() => '---').join(' | ')} |`;
    const body = rows
      .map((row) => {
        const obj = row as Record<string, unknown>;
        return `| ${keys.map((key) => String(obj[key] ?? '')).join(' | ')} |`;
      })
      .join('\n');
    return `${header}\n${sep}\n${body}\n\nShowing ${record.count ?? rows.length} of ${record.total_count ?? rows.length}.`;
  }
  return jsonTextSafe(record);
}

function jsonTextSafe(data: unknown): string {
  return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
}
