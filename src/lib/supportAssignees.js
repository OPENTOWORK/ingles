import { getRoleIdsByNames } from '@/lib/coordinatorAccess';

/** Quien puede encargarse de un ticket y abrirlo en el panel de soporte. */
export const SUPPORT_ASSIGNEE_ROLES = [
  'soporte',
  'admin',
  'administrador',
  'support',
  'informatico',
  'it',
];

export async function listSupportAssignees(db) {
  const roleIds = await getRoleIdsByNames(db, SUPPORT_ASSIGNEE_ROLES);
  if (!roleIds.length) return [];

  const { data, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, activo')
    .in('rol_id', roleIds)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data || []).filter((person) => person.activo !== false);
}

export async function assertSupportAssignee(db, userId) {
  const id = String(userId || '').trim();
  if (!id) return { ok: false, error: 'Elige una persona.' };

  const assignees = await listSupportAssignees(db);
  const match = assignees.find((person) => person.id === id);
  if (!match) {
    return { ok: false, error: 'Esa persona no puede recibir tickets de soporte.' };
  }
  return { ok: true, assignee: match };
}

export async function attachAssigneeNames(db, tickets = []) {
  const ids = [...new Set(tickets.map((ticket) => ticket.asignado_a).filter(Boolean))];
  const byId = {};

  if (ids.length) {
    const { data, error } = await db
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre')
      .in('id', ids);
    if (error) throw error;
    for (const person of data || []) byId[person.id] = person;
  }

  return tickets.map((ticket) => {
    const person = ticket.asignado_a ? byId[ticket.asignado_a] : null;
    return {
      ...ticket,
      asignado_nombre: person?.nombre || null,
      asignado_email: person?.email || null,
    };
  });
}
