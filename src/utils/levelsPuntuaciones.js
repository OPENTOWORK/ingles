import { supabase } from '@/utils/supabaseClient';
import {
  getB2PartScoringV2,
  isB2PartPassed,
  isB2PartPassedByPoints,
} from '@/utils/levelsB2PartScoring';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';

const META_PREFIX = 'uoe_meta:';

/** @param {{ parteNumero: number, examenId: string, correctas: number, total: number, aprobado: boolean, scoreSource?: string, scoringVersion?: number, puntosObtenidos?: number, puntosMaximos?: number }} meta */
export function buildUoePartDescripcion(meta) {
  const scoringVersion = Number(meta.scoringVersion) || 1;
  const isV2 = scoringVersion === 2;
  const displayCorrect = isV2 ? meta.puntosObtenidos ?? meta.correctas : meta.correctas;
  const displayTotal = isV2 ? meta.puntosMaximos ?? meta.total : meta.total;
  const label = `Part ${meta.parteNumero} · ${displayCorrect}/${displayTotal} · ${meta.aprobado ? 'passed' : 'not passed'}`;
  const payload = {
    v: 1,
    examen_id: meta.examenId,
    parte_numero: meta.parteNumero,
    correctas: meta.correctas,
    total_preguntas: meta.total,
    aprobado: meta.aprobado,
    score_source: meta.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  };
  if (isV2) {
    payload.scoring_version = 2;
    payload.puntos_obtenidos = meta.puntosObtenidos ?? meta.correctas;
    payload.puntos_maximos = meta.puntosMaximos ?? meta.total;
  }
  return `${META_PREFIX}${JSON.stringify(payload)}|${label}`;
}

/** @param {string | null | undefined} descripcion */
export function parseUoePartDescripcion(descripcion) {
  const raw = String(descripcion || '');
  if (!raw.startsWith(META_PREFIX)) return null;
  const jsonPart = raw.slice(META_PREFIX.length).split('|')[0];
  try {
    const data = JSON.parse(jsonPart);
    if (!data?.examen_id || !data?.parte_numero) return null;
    const scoringVersion = Number(data.scoring_version) || 1;
    return {
      examenId: data.examen_id,
      parteNumero: Number(data.parte_numero),
      correctas: Number(data.correctas) || 0,
      total: Number(data.total_preguntas) || 0,
      aprobado: data.aprobado === true,
      scoreSource: data.score_source || LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
      scoringVersion,
      puntosObtenidos: Number(data.puntos_obtenidos) || 0,
      puntosMaximos: Number(data.puntos_maximos) || 0,
    };
  } catch {
    return null;
  }
}

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('could not find') ||
    msg.includes('does not exist') ||
    code === 'PGRST204' ||
    code === '42703'
  );
}

async function upsertPartPuntuacionViaApi({
  preguntaId,
  examenId,
  parteNumero,
  correctas,
  totalPreguntas,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  scoringVersion = 1,
  puntosObtenidos,
  puntosMaximos,
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    return { error: new Error('Inicia sesión para guardar tu puntuación.') };
  }

  try {
    const body = {
      preguntaId,
      examenId,
      parteNumero,
      correctas,
      totalPreguntas,
      scoreSource,
      scoringVersion,
    };
    if (scoringVersion === 2) {
      body.puntosObtenidos = puntosObtenidos;
      body.puntosMaximos = puntosMaximos;
    }

    const res = await fetch('/api/levels/upsert-part-puntuacion', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: new Error(payload?.error || `Error al guardar (${res.status})`), id: null };
    }
    return { error: null, id: payload?.puntuacionesId ?? null };
  } catch (e) {
    return { error: e };
  }
}

/**
 * Inserta puntuación por ítem (legacy / otras secciones levels).
 */
export async function insertLevelsPuntuacion({
  userId,
  preguntaId,
  puntuacion,
  descripcion = '',
}) {
  if (!userId || !preguntaId) return { error: null };

  const score = Number(puntuacion);
  const normalized = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  const desc = String(descripcion || '').trim().slice(0, 2000) || null;

  try {
    const { error } = await supabase.from('levels_puntuaciones').insert({
      id_pregunta: preguntaId,
      uuid_usuario: userId,
      puntuacion: normalized,
      descripcion: desc,
    });
    return { error: error ?? null };
  } catch (e) {
    return { error: e };
  }
}

async function findExistingPartRow(userId, examenId, parteNumero, scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE) {
  let { data: row, error } = await supabase
    .from('levels_puntuaciones')
    .select('id, descripcion, score_source')
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId)
    .eq('parte_numero', parteNumero)
    .eq('score_source', scoreSource)
    .maybeSingle();

  if (!error && row?.id) {
    return { id: row.id, error: null };
  }

  if (error && !isSchemaCacheColumnError(error)) {
    return { id: null, error };
  }

  let { data: rows, error: listErr } = await supabase
    .from('levels_puntuaciones')
    .select('id, descripcion')
    .eq('uuid_usuario', userId);

  if (listErr) return { id: null, error: listErr };

  const match = (rows || []).find((r) => {
    const meta = parseUoePartDescripcion(r.descripcion);
    if (!meta) return false;
    const rowSource = meta.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    return (
      meta.examenId === examenId &&
      Number(meta.parteNumero) === Number(parteNumero) &&
      rowSource === scoreSource
    );
  });

  return { id: match?.id ?? null, error: null };
}

function resolvePartScoreFields({
  parteNumero,
  correctas,
  totalPreguntas,
  scoringVersion = 1,
  puntosObtenidos,
  puntosMaximos,
}) {
  const version = Number(scoringVersion) || 1;
  const correct = Math.max(0, Number(correctas) || 0);
  const total = Math.max(1, Number(totalPreguntas) || 1);

  if (version === 2) {
    const puntos = Math.max(0, Number(puntosObtenidos) || 0);
    const maxPuntos = Math.max(1, Number(puntosMaximos) || getB2PartScoringV2(parteNumero)?.maxPoints || 1);
    const aprobado = isB2PartPassedByPoints(puntos, parteNumero);
    const puntuacion = aprobado ? 100 : Math.round((100 * puntos) / maxPuntos);
    return { correct, total, puntos, maxPuntos, aprobado, puntuacion, scoringVersion: 2 };
  }

  const aprobado = isB2PartPassed(correct, parteNumero);
  const puntuacion = aprobado ? 100 : Math.round((100 * correct) / total);
  return { correct, total, puntos: null, maxPuntos: null, aprobado, puntuacion, scoringVersion: 1 };
}

/**
 * Una fila por parte de examen (Use of English).
 */
export async function upsertLevelsPartPuntuacion({
  userId,
  preguntaId,
  examenId,
  parteNumero,
  correctas,
  totalPreguntas,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  scoringVersion = 1,
  puntosObtenidos,
  puntosMaximos,
}) {
  if (!userId || !preguntaId || !examenId || !parteNumero) {
    return { error: new Error('Faltan datos para guardar la puntuación de la parte.'), id: null };
  }

  const {
    correct,
    total,
    puntos,
    maxPuntos,
    aprobado,
    puntuacion,
    scoringVersion: resolvedVersion,
  } = resolvePartScoreFields({
    parteNumero,
    correctas,
    totalPreguntas,
    scoringVersion,
    puntosObtenidos,
    puntosMaximos,
  });

  const descripcion = buildUoePartDescripcion({
    examenId,
    parteNumero,
    correctas: correct,
    total,
    aprobado,
    scoreSource,
    scoringVersion: resolvedVersion,
    puntosObtenidos: puntos ?? undefined,
    puntosMaximos: maxPuntos ?? undefined,
  });

  const fullRow = {
    id_pregunta: preguntaId,
    uuid_usuario: userId,
    examen_id: examenId,
    parte_numero: parteNumero,
    correctas: correct,
    total_preguntas: total,
    aprobado,
    puntuacion,
    descripcion,
    score_source: scoreSource,
    scoring_version: resolvedVersion,
  };
  if (resolvedVersion === 2) {
    fullRow.puntos_obtenidos = puntos;
    fullRow.puntos_maximos = maxPuntos;
  }

  const minimalRow = {
    id_pregunta: preguntaId,
    uuid_usuario: userId,
    puntuacion,
    descripcion,
  };

  try {
    const { id: existingId, error: findErr } = await findExistingPartRow(
      userId,
      examenId,
      parteNumero,
      scoreSource,
    );
    if (findErr) return { error: findErr, id: null };

    const tryClientWrite = async () => {
      const attemptWrite = async (payload, existing) => {
        if (existing) {
          const { error } = await supabase.from('levels_puntuaciones').update(payload).eq('id', existing);
          return { error: error ?? null, id: existing };
        }
        const { data, error } = await supabase
          .from('levels_puntuaciones')
          .insert(payload)
          .select('id')
          .single();
        return { error: error ?? null, id: data?.id ?? null };
      };

      if (existingId) {
        let { error: upErr, id } = await attemptWrite(fullRow, existingId);
        if (upErr && isSchemaCacheColumnError(upErr) && fullRow.score_source != null) {
          const { score_source, ...withoutSource } = fullRow;
          ({ error: upErr, id } = await attemptWrite(withoutSource, existingId));
        }
        if (upErr && isSchemaCacheColumnError(upErr)) {
          ({ error: upErr, id } = await attemptWrite(minimalRow, existingId));
        }
        return { error: upErr ?? null, id: id ?? existingId };
      }

      let { error: insErr, id } = await attemptWrite(fullRow, null);
      if (insErr && isSchemaCacheColumnError(insErr) && fullRow.score_source != null) {
        const { score_source, ...withoutSource } = fullRow;
        ({ error: insErr, id } = await attemptWrite(withoutSource, null));
      }
      if (insErr && isSchemaCacheColumnError(insErr)) {
        ({ error: insErr, id } = await attemptWrite(minimalRow, null));
      }

      return { error: insErr ?? null, id };
    };

    const { error: clientErr, id: clientId } = await tryClientWrite();
    if (!clientErr) return { error: null, id: clientId, descripcion };

    const apiRes = await upsertPartPuntuacionViaApi({
      preguntaId,
      examenId,
      parteNumero,
      correctas: correct,
      totalPreguntas: total,
      scoreSource,
      scoringVersion: resolvedVersion,
      puntosObtenidos: puntos ?? undefined,
      puntosMaximos: maxPuntos ?? undefined,
    });
    return { ...apiRes, descripcion };
  } catch (e) {
    return { error: e, id: null };
  }
}
