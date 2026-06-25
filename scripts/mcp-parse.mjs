export function unescapeSql(value) {
  return String(value)
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');
}

export function parseMcpToolExport(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.result) && parsed.result[0]?.sql) {
      return unescapeSql(parsed.result[0].sql);
    }
    if (typeof parsed?.result === 'string') {
      const marker = '[{"sql":"';
      const start = parsed.result.indexOf(marker);
      if (start >= 0) return parseMcpSqlPayload(parsed.result.slice(start));
    }
  } catch {
    /* fall through */
  }

  const marker = '[{"sql":"';
  const start = raw.indexOf(marker);
  if (start < 0) throw new Error('No se encontró export sql en archivo MCP');
  return parseMcpSqlPayload(raw.slice(start));
}

function parseMcpSqlPayload(payload) {
  const marker = '[{"sql":"';
  let i = marker.length;
  let out = '';
  while (i < payload.length) {
    const ch = payload[i];
    if (ch === '\\') {
      const next = payload[i + 1];
      if (next === 'n') {
        out += '\n';
        i += 2;
        continue;
      }
      if (next === 'r') {
        out += '\r';
        i += 2;
        continue;
      }
      if (next === 't') {
        out += '\t';
        i += 2;
        continue;
      }
      if (next === '"') {
        out += '"';
        i += 2;
        continue;
      }
      if (next === '\\') {
        out += '\\';
        i += 2;
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i += 1;
  }
  return out.trim();
}
