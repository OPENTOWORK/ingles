import { formatMeetingDate, normalizeDepartamentos } from '@/lib/staffMeetingsConstants';

export const POLL_VOTE_VALUES = ['yes', 'maybe', 'no'];

export const POLL_VOTE_LABELS = {
  yes: 'Sí',
  maybe: 'Quizás',
  no: 'No',
};

export const EMPTY_POLL_FORM = {
  titulo: '',
  notas: '',
  departamentos: [],
  options: [{ fecha: '', hora: '' }],
};

/**
 * @param {unknown} raw
 * @returns {Array<{ fecha: string, hora: string, orden: number }>}
 */
export function normalizePollOptions(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => ({
      fecha: String(item?.fecha || '').trim(),
      hora: item?.hora ? String(item.hora).trim().slice(0, 5) : '',
      orden: typeof item?.orden === 'number' ? item.orden : index,
    }))
    .filter((item) => item.fecha);
}

/**
 * @param {object} body
 */
export function validatePollBody(body = {}) {
  const titulo = String(body.titulo || '').trim();
  if (!titulo) {
    return { ok: false, error: 'El título de la encuesta es obligatorio.' };
  }

  const departamentos = normalizeDepartamentos(body.departamentos);
  if (!departamentos.length) {
    return { ok: false, error: 'Selecciona al menos un departamento.' };
  }

  const options = normalizePollOptions(body.options);
  if (options.length < 2) {
    return { ok: false, error: 'Añade al menos dos fechas posibles.' };
  }

  return {
    ok: true,
    data: {
      titulo,
      notas: String(body.notas || '').trim() || null,
      departamentos,
      options,
    },
  };
}

/**
 * @param {Array<{ id: string, voto: string, user_id?: string }>} votes
 */
export function summarizeVotes(votes = []) {
  const summary = { yes: 0, maybe: 0, no: 0, total: 0 };
  for (const vote of votes) {
    if (vote.voto === 'yes') summary.yes += 1;
    else if (vote.voto === 'maybe') summary.maybe += 1;
    else if (vote.voto === 'no') summary.no += 1;
    summary.total += 1;
  }
  return summary;
}

/**
 * @param {Array<{ id: string, fecha: string, hora?: string, votes?: object }>} options
 */
export function pickBestPollOption(options = []) {
  if (!options.length) return null;

  const scored = options.map((option) => {
    const votes = option.votes || summarizeVotes(option.voteRows);
    const score = votes.yes * 2 + votes.maybe - votes.no;
    return { option, votes, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.votes.yes !== a.votes.yes) return b.votes.yes - a.votes.yes;
    if (b.votes.maybe !== a.votes.maybe) return b.votes.maybe - a.votes.maybe;
    return a.votes.no - b.votes.no;
  });

  return scored[0]?.option || null;
}

export function buildPollBuzonMessage(poll, creatorName = '') {
  const convocante = String(creatorName || '').trim() || 'Un miembro del equipo';
  const depts = (poll.departamentos || []).join(', ');
  const options = (poll.options || [])
    .map((option, index) => `${index + 1}. ${formatMeetingDate(option.fecha, option.hora)}`)
    .join('\n');

  const lines = [
    '📊 Nueva encuesta de fechas para reunión',
    '',
    `Convoca: ${convocante}`,
    `Título: ${poll.titulo}`,
  ];

  if (depts) lines.push(`Departamentos: ${depts}`);
  lines.push('', 'Fechas propuestas:', options);
  if (poll.notas) lines.push('', `Notas: ${poll.notas}`);
  lines.push(
    '',
    'Indica tu disponibilidad en Buzón → Reuniones → Encuestas de fecha.',
  );

  return lines.join('\n');
}
