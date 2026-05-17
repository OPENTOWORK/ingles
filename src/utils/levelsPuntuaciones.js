import { supabase } from '@/utils/supabaseClient';
import { isB2PartPassed } from '@/utils/levelsB2PartScoring';

const META_PREFIX = 'uoe_meta:';

/** @param {{ parteNumero: number, examenId: string, correctas: number, total: number, aprobado: boolean }} meta */
export function buildUoePartDescripcion(meta) {
  const label = `Parte ${meta.parteNumero} · ${meta.correctas}/${meta.total} · ${meta.aprobado ? 'aprobado' : 'no aprobado'}`;
  return `${META_PREFIX}${JSON.stringify({
    v: 1,
    examen_id: meta.examenId,
    parte_numero: meta.parteNumero,
    correctas: meta.correctas,
    total_preguntas: meta.total,
    aprobado: meta.aprobado,
  })}|${label}`;
}

/** @param {string | null | undefined} descripcion */
export function parseUoePartDescripcion(descripcion) {
  const raw = String(descripcion || '');
  if (!raw.startsWith(META_PREFIX)) return null;
  const jsonPart = raw.slice(META_PREFIX.length).split('|')[0];
  try {
    const data = JSON.parse(jsonPart);
    if (!data?.examen_id || !data?.parte_numero) return null;
    return {
      examenId: data.examen_id,
      parteNumero: Number(data.parte_numero),
      correctas: Number(data.correctas) || 0,
      total: Number(data.total_preguntas) || 0,
      aprobado: data.aprobado === true,
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
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    return { error: new Error('Inicia sesión para guardar tu puntuación.') };
  }

  try {
    const res = await fetch('/api/levels/upsert-part-puntuacion', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preguntaId,
        examenId,
        parteNumero,
        correctas,
        totalPreguntas,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: new Error(payload?.error || `Error al guardar (${res.status})`) };
    }
    return { error: null };
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

async function findExistingPartRow(userId, examenId, parteNumero) {
  let { data: row, error } = await supabase
    .from('levels_puntuaciones')
    .select('id')
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId)
    .eq('parte_numero', parteNumero)
    .maybeSingle();

  if (!error && row?.id) return { id: row.id, error: null };

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
    return meta?.examenId === examenId && Number(meta.parteNumero) === Number(parteNumero);
  });

  return { id: match?.id ?? null, error: null };
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
}) {
  if (!userId || !preguntaId || !examenId || !parteNumero) {
    return { error: new Error('Faltan datos para guardar la puntuación de la parte.') };
  }

  const correct = Math.max(0, Number(correctas) || 0);
  const total = Math.max(1, Number(totalPreguntas) || 1);
  const aprobado = isB2PartPassed(correct, parteNumero);
  const puntuacion = aprobado ? 100 : Math.round((100 * correct) / total);
  const descripcion = buildUoePartDescripcion({
    examenId,
    parteNumero,
    correctas: correct,
    total,
    aprobado,
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
  };

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
    );
    if (findErr) return { error: findErr };

    const tryClientWrite = async () => {
      if (existingId) {
        let { error: upErr } = await supabase
          .from('levels_puntuaciones')
          .update(fullRow)
          .eq('id', existingId);

        if (upErr && isSchemaCacheColumnError(upErr)) {
          ({ error: upErr } = await supabase
            .from('levels_puntuaciones')
            .update(minimalRow)
            .eq('id', existingId));
        }
        return upErr ?? null;
      }

      let { error: insErr } = await supabase.from('levels_puntuaciones').insert(fullRow);

      if (insErr && isSchemaCacheColumnError(insErr)) {
        ({ error: insErr } = await supabase.from('levels_puntuaciones').insert(minimalRow));
      }

      return insErr ?? null;
    };

    const clientErr = await tryClientWrite();
    if (!clientErr) return { error: null };

    return upsertPartPuntuacionViaApi({
      preguntaId,
      examenId,
      parteNumero,
      correctas: correct,
      totalPreguntas: total,
    });
  } catch (e) {
    return { error: e };
  }
}
