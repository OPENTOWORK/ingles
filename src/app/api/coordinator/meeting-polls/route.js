import { NextResponse } from 'next/server';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { authenticateStaffMeetingsRequest } from '@/lib/staffBuzonAccess';
import {
  broadcastMeetingToStaffBuzon,
  broadcastPollToStaffBuzon,
} from '@/lib/staffBuzonMeetingsBroadcast';
import {
  normalizeDepartamentos,
  normalizePuntosDia,
} from '@/lib/staffMeetingsConstants';
import {
  pickBestPollOption,
  POLL_VOTE_VALUES,
  summarizeVotes,
  validatePollBody,
} from '@/lib/staffMeetingPolls';
import { loadProfilesByIds } from '@/lib/staffTasksServer';
import { syncMeetingToNotion } from '@/lib/notionMeetings';

const POLLS_TABLE = 'staff_reuniones_encuestas';
const OPTIONS_TABLE = 'staff_reuniones_encuesta_opciones';
const VOTES_TABLE = 'staff_reuniones_encuesta_votos';
const MEETINGS_TABLE = 'staff_reuniones';

function mapOptionRow(row, voteRows = []) {
  const votes = summarizeVotes(voteRows);
  return {
    id: row.id,
    encuesta_id: row.encuesta_id,
    fecha: row.fecha,
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    orden: row.orden ?? 0,
    votes,
    voteRows: voteRows.map((vote) => ({
      user_id: vote.user_id,
      voto: vote.voto,
    })),
  };
}

function mapPollRow(pollRow, options = [], myVotes = {}) {
  return {
    id: pollRow.id,
    titulo: pollRow.titulo || '',
    notas: pollRow.notas || '',
    departamentos: normalizeDepartamentos(pollRow.departamentos),
    status: pollRow.status || 'open',
    meeting_id: pollRow.meeting_id || null,
    created_by: pollRow.created_by,
    created_at: pollRow.created_at,
    updated_at: pollRow.updated_at,
    options,
    myVotes,
  };
}

async function loadPollBundle(db, pollId, userId) {
  const { data: pollRow, error: pollError } = await db
    .from(POLLS_TABLE)
    .select('*')
    .eq('id', pollId)
    .maybeSingle();

  if (pollError) throw pollError;
  if (!pollRow) return null;

  const { data: optionRows, error: optionsError } = await db
    .from(OPTIONS_TABLE)
    .select('*')
    .eq('encuesta_id', pollId)
    .order('orden', { ascending: true });

  if (optionsError) throw optionsError;

  const optionIds = (optionRows || []).map((row) => row.id);
  let voteRows = [];
  if (optionIds.length) {
    const { data, error } = await db.from(VOTES_TABLE).select('*').in('opcion_id', optionIds);
    if (error) throw error;
    voteRows = data || [];
  }

  const votesByOption = new Map();
  for (const vote of voteRows) {
    const list = votesByOption.get(vote.opcion_id) || [];
    list.push(vote);
    votesByOption.set(vote.opcion_id, list);
  }

  const myVotes = {};
  for (const vote of voteRows) {
    if (vote.user_id === userId) {
      myVotes[vote.opcion_id] = vote.voto;
    }
  }

  const options = (optionRows || []).map((row) =>
    mapOptionRow(row, votesByOption.get(row.id) || []),
  );

  return mapPollRow(pollRow, options, myVotes);
}

async function loadAllPolls(db, userId) {
  const { data: pollRows, error } = await db
    .from(POLLS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!pollRows?.length) return [];

  const pollIds = pollRows.map((row) => row.id);
  const { data: optionRows, error: optionsError } = await db
    .from(OPTIONS_TABLE)
    .select('*')
    .in('encuesta_id', pollIds)
    .order('orden', { ascending: true });

  if (optionsError) throw optionsError;

  const optionIds = (optionRows || []).map((row) => row.id);
  let voteRows = [];
  if (optionIds.length) {
    const { data, error: votesError } = await db.from(VOTES_TABLE).select('*').in('opcion_id', optionIds);
    if (votesError) throw votesError;
    voteRows = data || [];
  }

  const optionsByPoll = new Map();
  for (const row of optionRows || []) {
    const list = optionsByPoll.get(row.encuesta_id) || [];
    list.push(row);
    optionsByPoll.set(row.encuesta_id, list);
  }

  const votesByOption = new Map();
  for (const vote of voteRows) {
    const list = votesByOption.get(vote.opcion_id) || [];
    list.push(vote);
    votesByOption.set(vote.opcion_id, list);
  }

  return pollRows.map((pollRow) => {
    const pollOptions = (optionsByPoll.get(pollRow.id) || []).map((row) =>
      mapOptionRow(row, votesByOption.get(row.id) || []),
    );
    const myVotes = {};
    for (const option of pollOptions) {
      const mine = (votesByOption.get(option.id) || []).find((vote) => vote.user_id === userId);
      if (mine) myVotes[option.id] = mine.voto;
    }
    return mapPollRow(pollRow, pollOptions, myVotes);
  });
}

export async function GET(req) {
  try {
    const auth = await authenticateStaffMeetingsRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const probe = await auth.db.from(POLLS_TABLE).select('id').limit(1);
    if (probe.error && isSchemaNotReadyError(probe.error)) {
      return NextResponse.json({
        polls: [],
        tablesReady: false,
        schemaHint: 'Ejecuta scripts/staff_reuniones_encuestas.sql en Supabase y recarga la página.',
      });
    }
    if (probe.error) {
      console.error('[coordinator/meeting-polls GET] probe', probe.error);
      return NextResponse.json({ error: probe.error.message }, { status: 500 });
    }

    const polls = await loadAllPolls(auth.db, auth.user.id);
    return NextResponse.json({ polls, tablesReady: true });
  } catch (err) {
    console.error('[coordinator/meeting-polls GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateStaffMeetingsRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'create').trim();

    if (action === 'create') {
      const validated = validatePollBody(body);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      const now = new Date().toISOString();
      const { data: pollRow, error: pollError } = await auth.db
        .from(POLLS_TABLE)
        .insert({
          titulo: validated.data.titulo,
          notas: validated.data.notas,
          departamentos: validated.data.departamentos,
          status: 'open',
          created_by: auth.user.id,
          updated_at: now,
        })
        .select()
        .single();

      if (pollError) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(pollError)
              ? 'Ejecuta scripts/staff_reuniones_encuestas.sql en Supabase.'
              : pollError.message,
          },
          { status: isSchemaNotReadyError(pollError) ? 503 : 500 },
        );
      }

      const { error: optionsError } = await auth.db.from(OPTIONS_TABLE).insert(
        validated.data.options.map((option, index) => ({
          encuesta_id: pollRow.id,
          fecha: option.fecha,
          hora: option.hora || null,
          orden: index,
        })),
      );

      if (optionsError) {
        await auth.db.from(POLLS_TABLE).delete().eq('id', pollRow.id);
        return NextResponse.json({ error: optionsError.message }, { status: 500 });
      }

      const poll = await loadPollBundle(auth.db, pollRow.id, auth.user.id);
      const profiles = await loadProfilesByIds(auth.db, [auth.user.id]);
      const creatorName = profiles[auth.user.id]?.nombre || auth.user.email || '';
      const buzon = await broadcastPollToStaffBuzon(auth.db, {
        poll,
        senderId: auth.user.id,
        creatorName,
      });

      return NextResponse.json({
        success: true,
        poll,
        buzonNotified: Boolean(buzon.sent),
        buzonError: buzon.sent ? null : buzon.error || null,
      });
    }

    const pollId = String(body?.id || body?.pollId || '').trim();
    if (!pollId) {
      return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });
    }

    if (action === 'delete') {
      const { error } = await auth.db.from(POLLS_TABLE).delete().eq('id', pollId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'vote') {
      const optionId = String(body?.optionId || '').trim();
      const voto = String(body?.vote || body?.voto || '').trim();
      if (!optionId) {
        return NextResponse.json({ error: 'optionId obligatorio.' }, { status: 400 });
      }
      if (!POLL_VOTE_VALUES.includes(voto)) {
        return NextResponse.json({ error: 'Voto no válido.' }, { status: 400 });
      }

      const { data: pollRow } = await auth.db
        .from(POLLS_TABLE)
        .select('status')
        .eq('id', pollId)
        .maybeSingle();

      if (!pollRow) return NextResponse.json({ error: 'Encuesta no encontrada.' }, { status: 404 });
      if (pollRow.status !== 'open') {
        return NextResponse.json({ error: 'La encuesta está cerrada.' }, { status: 400 });
      }

      const { data: optionRow } = await auth.db
        .from(OPTIONS_TABLE)
        .select('id')
        .eq('id', optionId)
        .eq('encuesta_id', pollId)
        .maybeSingle();

      if (!optionRow) {
        return NextResponse.json({ error: 'Opción no encontrada.' }, { status: 404 });
      }

      const now = new Date().toISOString();
      const { error } = await auth.db.from(VOTES_TABLE).upsert(
        {
          opcion_id: optionId,
          user_id: auth.user.id,
          voto,
          updated_at: now,
        },
        { onConflict: 'opcion_id,user_id' },
      );

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const poll = await loadPollBundle(auth.db, pollId, auth.user.id);
      return NextResponse.json({ success: true, poll });
    }

    if (action === 'close') {
      const { error } = await auth.db
        .from(POLLS_TABLE)
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', pollId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const poll = await loadPollBundle(auth.db, pollId, auth.user.id);
      return NextResponse.json({ success: true, poll });
    }

    if (action === 'confirm') {
      const poll = await loadPollBundle(auth.db, pollId, auth.user.id);
      if (!poll) return NextResponse.json({ error: 'Encuesta no encontrada.' }, { status: 404 });
      if (poll.meeting_id) {
        return NextResponse.json({ error: 'Esta encuesta ya generó una reunión.' }, { status: 400 });
      }

      const optionId = String(body?.optionId || '').trim();
      const selectedOption =
        poll.options.find((option) => option.id === optionId) || pickBestPollOption(poll.options);

      if (!selectedOption) {
        return NextResponse.json({ error: 'No hay fechas en la encuesta.' }, { status: 400 });
      }

      const puntos_dia = normalizePuntosDia(body.puntos_dia);
      if (!puntos_dia.length) {
        return NextResponse.json(
          { error: 'Añade al menos un punto del día para crear la reunión.' },
          { status: 400 },
        );
      }

      const meetingTitle = String(body.titulo || poll.titulo || '').trim() || poll.titulo;
      const now = new Date().toISOString();

      const { data: meetingRow, error: meetingError } = await auth.db
        .from(MEETINGS_TABLE)
        .insert({
          titulo: meetingTitle,
          fecha: selectedOption.fecha,
          hora: selectedOption.hora || null,
          departamentos: poll.departamentos,
          puntos_dia,
          notas: poll.notas || null,
          created_by: auth.user.id,
          updated_at: now,
        })
        .select()
        .single();

      if (meetingError) {
        return NextResponse.json({ error: meetingError.message }, { status: 500 });
      }

      await auth.db
        .from(POLLS_TABLE)
        .update({
          status: 'closed',
          meeting_id: meetingRow.id,
          updated_at: now,
        })
        .eq('id', pollId);

      const profiles = await loadProfilesByIds(auth.db, [auth.user.id]);
      const creatorName = profiles[auth.user.id]?.nombre || auth.user.email || '';

      const meeting = {
        id: meetingRow.id,
        titulo: meetingRow.titulo || '',
        fecha: meetingRow.fecha,
        hora: meetingRow.hora ? String(meetingRow.hora).slice(0, 5) : '',
        departamentos: poll.departamentos,
        puntos_dia,
        notas: meetingRow.notas || '',
        notion_page_id: null,
      };

      const buzon = await broadcastMeetingToStaffBuzon(auth.db, {
        meeting,
        senderId: auth.user.id,
        creatorName,
      });

      let notionSync = null;
      try {
        notionSync = await syncMeetingToNotion(meeting);
        if (notionSync?.pageId) {
          await auth.db
            .from(MEETINGS_TABLE)
            .update({ notion_page_id: notionSync.pageId, updated_at: now })
            .eq('id', meeting.id);
        }
      } catch (notionErr) {
        notionSync = { error: notionErr?.message || 'Error al sincronizar con Notion.' };
      }

      const updatedPoll = await loadPollBundle(auth.db, pollId, auth.user.id);
      return NextResponse.json({
        success: true,
        poll: updatedPoll,
        meeting,
        buzonNotified: Boolean(buzon.sent),
        buzonError: buzon.sent ? null : buzon.error || null,
        notionSync,
      });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/meeting-polls POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
