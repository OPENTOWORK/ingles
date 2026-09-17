/**
 * Envía un correo de prueba con todas las tareas asignadas a un usuario.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/send-staff-tasks-test.mjs erik.tm91@gmail.com
 */
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';

const PROFILES_TABLE = 'Usuarios_y_Perfil_users';
const TASKS_TABLE = 'staff_tareas';

const TASK_ESTADO_LABELS = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  completada: 'Completada',
  cancelada: 'Cancelada',
  bloqueada: 'Bloqueada',
};

const TASK_PRIORIDAD_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

function buildTasksPanelUrl() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  return `${base.replace(/\/$/, '')}/tareas/`;
}

function formatStaffDateTimeLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTaskBlock(task, index) {
  const lines = [
    `${index}. ${task.titulo || 'Sin título'}`,
    `   Estado: ${TASK_ESTADO_LABELS[task.estado] || task.estado || '—'}`,
    `   Prioridad: ${TASK_PRIORIDAD_LABELS[task.prioridad] || task.prioridad || '—'}`,
  ];

  if (task.fase_nombre) lines.push(`   Fase: ${task.fase_nombre}`);
  if (task.subfase_nombre) lines.push(`   Subfase: ${task.subfase_nombre}`);
  if (task.fecha_limite) {
    lines.push(`   Fecha límite: ${formatStaffDateTimeLabel(task.fecha_limite)}`);
  }
  if (task.descripcion?.trim()) {
    lines.push(`   Descripción: ${task.descripcion.trim().replace(/\s+/g, ' ')}`);
  }

  return lines.join('\n');
}

async function sendStaffTasksTestEmail(adminClient, email) {
  const to = String(email || '').trim().toLowerCase();
  if (!to) return { ok: false, error: 'Falta el email del destinatario.' };

  const { data: profile, error: profileError } = await adminClient
    .from(PROFILES_TABLE)
    .select('id, email, nombre')
    .eq('email', to)
    .maybeSingle();

  if (profileError) return { ok: false, error: profileError.message };
  if (!profile?.id) return { ok: false, error: `No hay usuario con email ${to}.` };

  const { data: tasks, error: tasksError } = await adminClient
    .from(TASKS_TABLE)
    .select(
      'id, titulo, descripcion, estado, prioridad, fecha_limite, staff_fases ( nombre ), staff_subfases ( nombre )',
    )
    .eq('asignado_id', profile.id)
    .order('created_at', { ascending: false });

  if (tasksError) return { ok: false, error: tasksError.message };

  const normalized = (tasks || []).map((task) => ({
    id: task.id,
    titulo: task.titulo,
    descripcion: task.descripcion,
    estado: task.estado,
    prioridad: task.prioridad,
    fecha_limite: task.fecha_limite,
    fase_nombre: task.staff_fases?.nombre || '',
    subfase_nombre: task.staff_subfases?.nombre || '',
  }));

  const tasksUrl = buildTasksPanelUrl();
  const nombre = profile.nombre || to.split('@')[0];
  const subject = `[Prueba] Tus tareas en Dralo (${normalized.length})`;

  const bodyLines = [
    `Hola ${nombre},`,
    '',
    'Este es un correo de prueba con todas las tareas que tienes asignadas en el panel de tareas:',
    '',
  ];

  if (!normalized.length) {
    bodyLines.push('(No tienes tareas asignadas en este momento.)');
  } else {
    bodyLines.push(
      ...normalized.map((task, index) => formatTaskBlock(task, index + 1)),
      '',
    );
  }

  bodyLines.push(
    `Panel de tareas: ${tasksUrl}`,
    '',
    'Si no ves este correo en la bandeja de entrada, revisa spam o promociones.',
    '',
    '— Equipo Dralo',
  );

  const text = bodyLines.join('\n');
  const { html } = buildBrandedEmailFromPlainText(text, {
    preheader: subject,
    headline: subject,
    ctaLabel: 'Ver tareas',
    ctaUrl: tasksUrl,
  });

  const result = await deliverTransactionalEmail({ to, subject, text, html });

  return {
    ok: Boolean(result.ok),
    to,
    taskCount: normalized.length,
    tasks: normalized.map((t) => ({ id: t.id, titulo: t.titulo, estado: t.estado })),
    channel: result.channel || null,
    error: result.ok ? null : result.error || 'Error al enviar',
  };
}

const url = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();

if (!serviceKey) {
  console.error('Falta la service role key de Supabase.');
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2] || 'erik.tm91@gmail.com';
const result = await sendStaffTasksTestEmail(adminClient, email);

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
