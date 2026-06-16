import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

function parseOpenApiTables(openApi) {
  const tables = new Map();

  const paths = openApi?.paths || {};
  for (const pathKey of Object.keys(paths)) {
    const match = pathKey.match(/^\/([^/]+)$/);
    if (!match) continue;
    const name = match[1];
    if (name.startsWith('rpc/')) continue;
    tables.set(name, { schema: 'public', name, columnCount: null });
  }

  const definitions = openApi?.definitions || openApi?.components?.schemas || {};
  for (const [name, def] of Object.entries(definitions)) {
    if (!tables.has(name)) {
      tables.set(name, { schema: 'public', name, columnCount: null });
    }
    const props = def?.properties || {};
    const count = Object.keys(props).length;
    if (count > 0) {
      tables.get(name).columnCount = count;
    }
  }

  return [...tables.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchOpenApiTables(supabaseUrl, apiKey) {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/openapi+json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAPI ${res.status}: ${text.slice(0, 200)}`);
  }

  const openApi = await res.json();
  return parseOpenApiTables(openApi);
}

async function fetchRowCount(db, tableName) {
  const { count, error } = await db.from(tableName).select('*', { count: 'exact', head: true });
  if (error) return { ok: false, rowCount: null, error: error.message };
  return { ok: true, rowCount: count ?? 0, error: null };
}

/**
 * Lista tablas expuestas en PostgREST (schema public) vía OpenAPI + conteos opcionales.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {{ includeCounts?: boolean }} [options]
 */
export async function listSupabaseTables(db, { includeCounts = true } = {}) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const apiKey = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !apiKey) {
    throw new Error('Supabase URL o clave API no configuradas.');
  }

  const tables = await fetchOpenApiTables(supabaseUrl, apiKey);

  if (!includeCounts) {
    return { tables, source: 'openapi' };
  }

  const chunkSize = 8;
  const withCounts = [];

  for (let i = 0; i < tables.length; i += chunkSize) {
    const chunk = tables.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async (table) => {
        const probe = await fetchRowCount(db, table.name);
        return {
          ...table,
          rowCount: probe.rowCount,
          accessible: probe.ok,
          probeError: probe.error,
        };
      }),
    );
    withCounts.push(...results);
  }

  return { tables: withCounts, source: 'openapi' };
}
