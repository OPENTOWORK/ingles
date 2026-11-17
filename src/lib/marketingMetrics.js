/** Read every page, including when PostgREST applies a lower server-side row cap.
 * The caller must supply a stable order ending in a unique column.
 * Never return a partial result as a complete metric after a failed page.
 */
export async function readAllMarketingRows(queryFactory, pageSize = 500) {
  const rows = [];
  let previousFirst = '';
  for (let page = 0; page < 80; page += 1) {
    const { data, error } = await queryFactory().range(rows.length, rows.length + pageSize - 1);
    if (error) throw error;
    if (!data?.length) return rows;
    const first = JSON.stringify(data[0]);
    if (data.length === pageSize && first && first === previousFirst) {
      throw new Error('La lectura de visitas se repitió y se ha detenido.');
    }
    previousFirst = first;
    rows.push(...data);
  }
  throw new Error('Hay demasiadas visitas para leerlas de una vez.');
}

export async function readMarketingRowsByIds(ids, queryFactory) {
  const rows = [];
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  for (let index = 0; index < uniqueIds.length; index += 100) {
    rows.push(...await readAllMarketingRows(() => queryFactory(uniqueIds.slice(index, index + 100))));
  }
  return rows;
}

/** Invitation attribution takes priority; every account belongs to exactly one channel. */
export function buildAttributionSummary(users = [], invitations = [], sources = new Map()) {
  const referredIds = new Set(invitations.map((row) => row.invited_user_id).filter(Boolean));
  const counts = new Map([['Referido (invitación)', 0], ['Sin atribuir', 0]]);
  for (const user of users) {
    const channel = referredIds.has(user.id) ? 'Referido (invitación)' : sources.get(user.id) || 'Sin atribuir';
    counts.set(channel, (counts.get(channel) || 0) + 1);
  }
  const referred = counts.get('Referido (invitación)');
  const unattributed = counts.get('Sin atribuir');
  const attributed = users.length - unattributed;
  return {
    referred,
    unattributed,
    attributed,
    total: users.length,
    attributionRate: users.length ? Math.round(attributed / users.length * 100) : 0,
    referralRate: users.length ? Math.round(referred / users.length * 100) : 0,
    channels: [...counts].map(([canal, leads]) => ({ canal, leads })),
  };
}

/** This is elapsed calendar time, NOT engagement or session duration. */
export function visitorElapsedSeconds(firstSeen, lastSeen) {
  if (!firstSeen || !lastSeen) return null;
  const start = new Date(firstSeen).getTime();
  const end = new Date(lastSeen).getTime();
  return Number.isFinite(start) && Number.isFinite(end) && end >= start
    ? Math.round((end - start) / 1000)
    : null;
}

/**
 * `creado_en` is a timestamp without time zone that stores the UTC clock time.
 * A value without Z must be read as UTC. Reading it as local time shifts the
 * signup earlier and the visit no longer counts as a registration.
 */
export function parseStoredUtc(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const iso = hasZone ? raw : `${raw.replace(' ', 'T')}Z`;
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

/** The account was created on this visit, with two minutes of grace before the cookie. */
export function signedUpDuringVisit(accountCreatedAt, visitorCreatedAt) {
  const account = parseStoredUtc(accountCreatedAt);
  const visit = parseStoredUtc(visitorCreatedAt);
  if (!account || !visit) return false;
  return new Date(account).getTime() >= new Date(visit).getTime() - 2 * 60 * 1000;
}

/** One registration per person. Extra cookies of the same account do not add another signup. */
export function dedupeAccountVisitors(rows = []) {
  const seen = new Set();
  const kept = [];
  for (const row of rows) {
    if (row?.kind === 'account' && row.userId) {
      if (seen.has(row.userId)) continue;
      seen.add(row.userId);
    }
    kept.push(row);
  }
  return kept;
}

/** Classification belongs to the visitor's linked account, never a shared IP. */
export function summarizeClassifiedVisitors(classified = []) {
  const counts = { entered: 0, registered: 0, unregistered: 0, staff: 0 };
  const ipLog = classified.filter((row) => row.kind !== 'returning');
  let since = null;
  for (const row of ipLog) {
    if (row.kind === 'staff') {
      counts.staff += 1;
      continue;
    }
    counts.entered += 1;
    if (row.kind === 'account') counts.registered += 1;
    if (row.kind === 'anon') counts.unregistered += 1;
    const seen = row.seenAt ? new Date(row.seenAt).getTime() : NaN;
    if (Number.isFinite(seen) && (since === null || seen < new Date(since).getTime())) since = row.seenAt;
  }
  return { ...counts, since, ipLog };
}
