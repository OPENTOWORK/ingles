const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const XLSX = require('xlsx');

const ROOT = process.cwd();
const TABLES_DUMP = path.join(
  'C:',
  'Users',
  'Usuario',
  '.cursor',
  'projects',
  'c-Users-Usuario-Webs-english-practice',
  'agent-tools',
  '31a0398e-a84a-4d7d-b985-837d21545bd1.txt'
);
const SUPABASE_CLIENT = path.join(ROOT, 'src', 'utils', 'supabaseClient.js');
const OUTPUT_FILE = path.join(ROOT, 'estado-cursor-supabase.xlsx');

function run(cmd) {
  try {
    return cp.execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').trim();
  } catch {
    return '';
  }
}

function walkJsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      out.push(...walkJsFiles(full));
    } else if (entry.isFile() && /\.(js|ts|tsx|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function parseFromUsage() {
  const srcDir = path.join(ROOT, 'src');
  const rows = [];
  const regex = /\.from\((['"])([^'"]+)\1\)/g;

  for (const file of walkJsFiles(srcDir)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      rows.push({
        file: rel,
        table_used_in_code: match[2],
      });
    }
  }
  return rows;
}

function parseTableMap() {
  const content = fs.readFileSync(SUPABASE_CLIENT, 'utf8');
  const mapMatch = content.match(/const TABLE_NAME_MAP = \{([\s\S]*?)\};/);
  if (!mapMatch) return [];
  const body = mapMatch[1];
  const lineRegex = /([A-Za-z0-9_]+)\s*:\s*'([^']+)'/g;
  const rows = [];
  let m;
  while ((m = lineRegex.exec(body)) !== null) {
    rows.push({ legacy_name: m[1], mapped_to_supabase: m[2] });
  }
  return rows;
}

function main() {
  const tablesJson = JSON.parse(fs.readFileSync(TABLES_DUMP, 'utf8'));
  const tables = tablesJson.tables || [];
  const now = new Date().toISOString();

  const gitBranch = run('git branch --show-current');
  const gitStatus = run('git status --short');
  const changedFiles = gitStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({ git_status_line: line }));

  const fromUsage = parseFromUsage();
  const tableMap = parseTableMap();
  const supabaseTableSet = new Set(tables.map((t) => t.name.split('.').pop()));

  const mappingCheck = tableMap.map((r) => ({
    ...r,
    exists_in_supabase_public: supabaseTableSet.has(r.mapped_to_supabase) ? 'yes' : 'no',
  }));

  const tableRows = tables.map((t) => ({
    table: t.name,
    rls_enabled: String(!!t.rls_enabled),
    rows: t.rows ?? '',
    comment: t.comment || '',
    columns_count: Array.isArray(t.columns) ? t.columns.length : 0,
    fk_count: Array.isArray(t.foreign_key_constraints) ? t.foreign_key_constraints.length : 0,
  }));

  const columnRows = [];
  const fkRows = [];
  for (const t of tables) {
    for (const c of t.columns || []) {
      columnRows.push({
        table: t.name,
        column: c.name,
        data_type: c.data_type || '',
        format: c.format || '',
        nullable: (c.options || []).includes('nullable') ? 'yes' : 'no',
        default_value: c.default_value || '',
        comment: c.comment || '',
      });
    }
    for (const fk of t.foreign_key_constraints || []) {
      fkRows.push({
        table: t.name,
        fk_name: fk.name || '',
        source: fk.source || '',
        target: fk.target || '',
      });
    }
  }

  const summary = [
    { key: 'generated_at', value: now },
    { key: 'repo_branch', value: gitBranch || 'unknown' },
    { key: 'supabase_project', value: 'ENGLISH' },
    { key: 'project_id', value: 'qnazrzvwvkwhkfbqsbmr' },
    { key: 'total_supabase_tables_public', value: String(tables.length) },
    { key: 'total_code_from_calls', value: String(fromUsage.length) },
    { key: 'total_mapping_entries', value: String(tableMap.length) },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Resumen');
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      {
        project_name: 'ENGLISH',
        project_id: 'qnazrzvwvkwhkfbqsbmr',
        status: 'ACTIVE_HEALTHY',
        region: 'eu-north-1',
        database_host: 'db.qnazrzvwvkwhkfbqsbmr.supabase.co',
        postgres_version: '17.4.1.075',
      },
    ]),
    'Supabase_Proyecto'
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tableRows), 'Supabase_Tablas');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(columnRows), 'Supabase_Columnas');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fkRows), 'Supabase_FKs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(changedFiles), 'Cursor_Git_Changes');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fromUsage), 'Cursor_From_Usage');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tableMap), 'Cursor_Table_Map');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mappingCheck), 'Map_vs_Supabase');

  XLSX.writeFile(wb, OUTPUT_FILE);
  console.log(OUTPUT_FILE);
}

main();
