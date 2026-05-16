import { B2_EXAM_SLOT_MAX, sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { starsFromApprovedPartsCount } from '@/utils/levelsUoePartScoring';

function emptySlotProgress() {
  return { stars: 0, correct: 0, total: 0, approvedParts: 0, parts: {} };
}

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return msg.includes('schema cache') || msg.includes('could not find');
}

/**
 * Progreso Use of English por examen 1…5 desde filas de parte en levels_puntuaciones.
 */
export async function fetchUseOfEnglishPuntuacionesProgress(supabase, { userId, examenIdBySlot }) {
  const empty = () => ({
    bySlot: Object.fromEntries(
      Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => [i + 1, emptySlotProgress()]),
    ),
  });

  if (!userId) return empty();

  const examenIdToSlot = Object.entries(examenIdBySlot || {}).reduce((acc, [slot, id]) => {
    if (id) acc[id] = Number(slot);
    return acc;
  }, {});

  const examenIds = Object.values(examenIdBySlot || {}).filter(Boolean);
  if (!examenIds.length) return empty();

  let rows = null;
  let error = null;

  const fullQuery = await supabase
    .from('levels_puntuaciones')
    .select('examen_id, parte_numero, correctas, total_preguntas, aprobado, descripcion, created_at')
    .eq('uuid_usuario', userId)
    .in('examen_id', examenIds)
    .not('parte_numero', 'is', null)
    .order('created_at', { ascending: false });

  if (!fullQuery.error && fullQuery.data?.length) {
    rows = fullQuery.data;
  } else if (fullQuery.error && isSchemaCacheColumnError(fullQuery.error)) {
    const fallback = await supabase
      .from('levels_puntuaciones')
      .select('descripcion, created_at')
      .eq('uuid_usuario', userId)
      .order('created_at', { ascending: false });
    error = fallback.error;
    rows = (fallback.data || [])
      .map((row) => {
        const meta = parseUoePartDescripcion(row.descripcion);
        if (!meta || !examenIds.includes(meta.examenId)) return null;
        return {
          examen_id: meta.examenId,
          parte_numero: meta.parteNumero,
          correctas: meta.correctas,
          total_preguntas: meta.total,
          aprobado: meta.aprobado,
          created_at: row.created_at,
        };
      })
      .filter(Boolean);
  } else {
    error = fullQuery.error;
    rows = fullQuery.data;
  }

  if (error || !rows?.length) return empty();

  const latestBySlotPart = new Map();

  for (const row of rows) {
    let examenId = row.examen_id;
    let partNumber = Number(row.parte_numero);

    if (!examenId || !partNumber) {
      const meta = parseUoePartDescripcion(row.descripcion);
      if (!meta) continue;
      examenId = meta.examenId;
      partNumber = meta.parteNumero;
    }

    const slot = examenIdToSlot[examenId];
    if (!slot || partNumber < 1 || partNumber > 4) continue;
    const key = `${slot}:${partNumber}`;
    if (!latestBySlotPart.has(key)) latestBySlotPart.set(key, row);
  }

  const bySlot = Object.fromEntries(
    Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => [i + 1, emptySlotProgress()]),
  );

  for (const [key, row] of latestBySlotPart) {
    const slot = Number(key.split(':')[0]);
    const partNumber = Number(key.split(':')[1]);
    if (!bySlot[slot]) continue;

    const meta = parseUoePartDescripcion(row.descripcion);
    const correct = Number(row.correctas ?? meta?.correctas) || 0;
    const total = Number(row.total_preguntas ?? meta?.total) || 0;
    const passed = row.aprobado === true || meta?.aprobado === true;

    bySlot[slot].parts[partNumber] = { correct, total, passed };
    bySlot[slot].correct += correct;
    bySlot[slot].total += total;
    if (passed) bySlot[slot].approvedParts += 1;
  }

  for (let slot = 1; slot <= B2_EXAM_SLOT_MAX; slot += 1) {
    bySlot[slot].stars = starsFromApprovedPartsCount(bySlot[slot].approvedParts);
  }

  return { bySlot };
}

/** Mapa slot (1–5) → examen_id para un nivel B2. */
export async function resolveB2ExamenIdsBySlot(supabase, levelId) {
  const { data, error } = await supabase
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', levelId);

  if (error || !data?.length) return {};

  const ordered = sortLevelsExamenesRows(data);
  return ordered.reduce((acc, row, index) => {
    acc[index + 1] = row.id;
    return acc;
  }, {});
}
