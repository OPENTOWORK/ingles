/**
 * Duplica entradas locales (1, 2, …) con claves globales del paper (partMin, partMin+1, …).
 */
export function extendPartInfoWithGlobalKeys(localEntries, partMin) {
  const result = { ...localEntries };
  for (const [localKey, data] of Object.entries(localEntries)) {
    const local = Number(localKey);
    if (!Number.isFinite(local) || local < 1) continue;
    const global = partMin + local - 1;
    const gKey = String(global);
    if (gKey === localKey || result[gKey]) continue;
    result[gKey] = {
      ...data,
      title: String(data.title || '').replace(/^Part\s+\d+/i, `Part ${global}`),
    };
  }
  return result;
}
