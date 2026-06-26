import { normalizeRoleName } from '@/utils/authRoles';
import { STAFF_BUZON_ROLE_NAMES } from '@/utils/staffBuzon';
import { formatMeetingDate } from '@/lib/staffMeetingsConstants';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';

export const STAFF_MEETINGS_BUZON_GROUP_NAME = 'Reuniones del equipo';

const GROUPS_TABLE = 'staff_buzon_grupos';
const MEMBERS_TABLE = 'staff_buzon_grupo_miembros';
const MESSAGES_TABLE = 'staff_buzon_mensajes';

export async function loadStaffBuzonUserIds(db) {
  const { data: roles, error: rolesError } = await db
    .from('Usuarios_y_Perfil_roles')
    .select('id, nombre');

  if (rolesError) throw rolesError;

  const staffRoleIds = (roles || [])
    .filter((row) => STAFF_BUZON_ROLE_NAMES.has(normalizeRoleName(row.nombre)))
    .map((row) => row.id);

  if (!staffRoleIds.length) return [];

  const { data: users, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id')
    .in('rol_id', staffRoleIds)
    .or('activo.is.null,activo.eq.true');

  if (error) throw error;

  return [...new Set((users || []).map((row) => row.id))];
}

async function findMeetingsGroup(db) {
  const { data, error } = await db
    .from(GROUPS_TABLE)
    .select('id')
    .eq('name', STAFF_MEETINGS_BUZON_GROUP_NAME)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

export async function ensureStaffMeetingsBuzonGroup(db, creatorId) {
  const staffIds = await loadStaffBuzonUserIds(db);
  const memberIds = [...new Set([creatorId, ...staffIds].filter(Boolean))];

  let groupId = await findMeetingsGroup(db);

  if (!groupId) {
    const { data: group, error } = await db
      .from(GROUPS_TABLE)
      .insert({
        name: STAFF_MEETINGS_BUZON_GROUP_NAME,
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) throw error;
    groupId = group.id;
  }

  const { data: currentMembers, error: membersError } = await db
    .from(MEMBERS_TABLE)
    .select('user_id')
    .eq('group_id', groupId);

  if (membersError) throw membersError;

  const current = new Set((currentMembers || []).map((row) => row.user_id));
  const missing = memberIds.filter((userId) => !current.has(userId));

  if (missing.length) {
    const { error: insertError } = await db.from(MEMBERS_TABLE).insert(
      missing.map((user_id) => ({ group_id: groupId, user_id })),
    );
    if (insertError) throw insertError;
  }

  return groupId;
}

export function buildMeetingBuzonMessage(meeting, creatorName = '') {
  const title = meeting?.titulo || 'Reunión del equipo';
  const when = formatMeetingDate(meeting?.fecha, meeting?.hora);
  const depts = (meeting?.departamentos || []).join(', ');
  const puntos = (meeting?.puntos_dia || [])
    .map((item, index) => {
      const text = typeof item === 'string' ? item : item?.text;
      return text ? `${index + 1}. ${String(text).trim()}` : null;
    })
    .filter(Boolean)
    .join('\n');
  const convocante = String(creatorName || '').trim() || 'Un miembro del equipo';

  const lines = [
    '📅 Nueva reunión convocada',
    '',
    `Convoca: ${convocante}`,
    `Título: ${title}`,
    `Cuándo: ${when}`,
  ];

  if (depts) lines.push(`Departamentos: ${depts}`);
  if (puntos) lines.push('', 'Orden del día:', puntos);
  if (meeting?.notas) lines.push('', `Notas: ${meeting.notas}`);

  lines.push(
    '',
    '¿Te interesa unirte? Responde en este hilo para confirmar tu asistencia.',
    'Detalles en Buzón → Reuniones.',
  );

  return lines.join('\n');
}

export async function broadcastMeetingToStaffBuzon(db, { meeting, senderId, creatorName }) {
  if (!db || !senderId || !meeting) {
    return { sent: false, error: 'Datos insuficientes para anunciar la reunión.' };
  }

  try {
    const probe = await db.from(MESSAGES_TABLE).select('id').limit(1);
    if (isSchemaNotReadyError(probe.error)) {
      return { sent: false, skipped: true, error: 'Buzón no configurado.' };
    }

    const groupId = await ensureStaffMeetingsBuzonGroup(db, senderId);
    const body = buildMeetingBuzonMessage(meeting, creatorName);

    const { data, error } = await db
      .from(MESSAGES_TABLE)
      .insert({
        sender_id: senderId,
        group_id: groupId,
        recipient_id: null,
        body,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[broadcastMeetingToStaffBuzon]', error);
      return { sent: false, error: error.message };
    }

    return { sent: true, messageId: data?.id, groupId };
  } catch (err) {
    console.error('[broadcastMeetingToStaffBuzon]', err);
    return { sent: false, error: err.message || 'Error al anunciar en el buzón.' };
  }
}
