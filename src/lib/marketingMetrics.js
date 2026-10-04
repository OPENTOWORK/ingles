/** Read every page, including when PostgREST applies a lower server-side row cap.
 * The caller must supply a stable order ending in a unique column.
 * Never return a partial result as a complete metric after a failed page.
 */
export async function readAllMarketingRows(queryFactory, pageSize = 500) {
  const rows = [];
  for (;;) {
    const { data, error } = await queryFactory().range(rows.length, rows.length + pageSize - 1);
    if (error) throw error;
    if (!data?.length) return rows;
    rows.push(...data);
  }
}

export async function readMarketingRowsByIds(ids, queryFactory) {
  const rows = [];
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  for (let index = 0; index < uniqueIds.length; index += 100) {
    rows.push(...await readAllMarketingRows(() => queryFactory(uniqueIds.slice(index, index + 100))));
  }
  return rows;
}

/** Non-referral does not establish an organic or direct acquisition source. */
export function buildAttributionSummary(users = [], invitations = []) {
  const referredIds = new Set(invitations.map((row) => row.invited_user_id).filter(Boolean));
  const referred = users.filter((user) => referredIds.has(user.id)).length;
  const unattributed = users.length - referred;
  return {
    referred,
    unattributed,
    total: users.length,
    referralRate: users.length ? Math.round(referred / users.length * 100) : 0,
    channels: [
      { canal: 'Referido (invitación)', leads: referred },
      { canal: 'Sin atribuir', leads: unattributed },
    ],
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
