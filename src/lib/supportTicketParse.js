const MADRID_TZ = 'Europe/Madrid';

/**
 * Postgres `timestamp without time zone` en Supabase guarda UTC sin sufijo.
 * Sin esto, el navegador lo trata como hora local y la hora sale retrasada.
 */
export function parseDbTimestamp(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/[zZ]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(`${normalized}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTicketDateTime(value) {
  const d = parseDbTimestamp(value);
  if (!d) return '—';
  return d.toLocaleString('es-ES', {
    timeZone: MADRID_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Referencia corta legible para mostrar al usuario (p. ej. DR-A1B2C3D4). */
export function formatTicketNumber(ticketId) {  if (!ticketId) return '—';
  const segment = String(ticketId).split('-')[0]?.toUpperCase();
  return segment ? `DR-${segment}` : '—';
}

/** Extrae metadatos del ticket (descripcion o columnas dedicadas). */
export function parseTicketMeta(ticket) {
  const fromColumns = {
    name: ticket?.solicitante_nombre?.trim() || '',
    email: ticket?.solicitante_email?.trim().toLowerCase() || '',
  };
  if (fromColumns.email) return fromColumns;

  const desc = String(ticket?.descripcion || '');
  const nameMatch = desc.match(/^Nombre:\s*(.+)$/m);
  const emailMatch = desc.match(/^Email:\s*(.+)$/m);
  const body = desc
    .replace(/^Nombre:.*$/m, '')
    .replace(/^Email:.*$/m, '')
    .replace(/^Tipo de usuario:.*$/m, '')
    .trim();

  return {
    name: nameMatch?.[1]?.trim() || 'Usuario',
    email: emailMatch?.[1]?.trim().toLowerCase() || '',
    body,
  };
}

export function formatActiveDuration(createdAt, closedAt) {
  const start = parseDbTimestamp(createdAt);
  if (!start) return '—';
  const end = closedAt ? parseDbTimestamp(closedAt) : new Date();
  if (!end) return '—';
  const ms = Math.max(0, end - start);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 48) return `${Math.floor(h / 24)} d`;
  if (h >= 1) return `${h} h ${m} min`;
  return `${m} min`;
}
