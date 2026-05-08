/**
 * One-off: reads JSON { project_id, query } and invokes Supabase MCP execute_sql.
 * Run from repo root: node scripts/_run-supabase-execute.mjs scripts/_payload_tx1_line.json
 * Requires Cursor to expose MCP to subprocess (not available) — placeholder only.
 */
import fs from 'fs';
const path = process.argv[2];
if (!path) {
  console.error('usage: node scripts/_run-supabase-execute.mjs <payload.json>');
  process.exit(1);
}
const { project_id, query } = JSON.parse(fs.readFileSync(path, 'utf8'));
if (!project_id || !query) {
  console.error('invalid payload');
  process.exit(1);
}
console.log('payload ok', project_id, 'query bytes', Buffer.byteLength(query, 'utf8'));
