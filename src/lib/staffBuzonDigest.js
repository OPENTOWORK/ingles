import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';
import { getMessagePreview } from '@/lib/staffBuzonAttachments';
import { loadStaffBuzonUserIds } from '@/lib/staffBuzonMeetingsBroadcast';
import { getDisplayName } from '@/utils/staffBuzon';

const MESSAGE_SELECT =
  'id, sender_id, recipient_id, group_id, body, created_at, read_at, attachment_kind, attachment_name';
const DIGEST_TABLE = 'staff_buzon_digest_envios';
const MAX_PREVIEW_LEN = 140;
const MAX_CONVERSATIONS = 12;

function truncateText(value, max = MAX_PREVIEW_LEN) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function getMadridCalendarDate(referenceDate = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(referenceDate);
}

function getTimezoneOffsetMinutes(timeZone, date) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const filled = {};
  for (const part of parts) {
    if (part.type !== 'literal') filled[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(filled.year),
    Number(filled.month) - 1,
    Number(filled.day),
    Number(filled.hour),
    Number(filled.minute),
    Number(filled.second),
  );
  return (asUtc - date.getTime()) / 60000;
}

export function getMadridDayRangeUtc(referenceDate = new Date()) {
  const dateKey = getMadridCalendarDate(referenceDate);
  const [year, month, day] = dateKey.split('-').map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMin = getTimezoneOffsetMinutes('Europe/Madrid', guess);
  const start = new Date(guess.getTime() - offsetMin * 60000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { dateKey, start: start.toISOString(), end: end.toISOString() };
}

function formatDigestDateLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildBuzonUrl() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  return `${base.replace(/\/$/, '')}/buzon/`;
}

async function loadStaffProfiles(db, userIds) {
  if (!userIds.length) return new Map();

  const { data, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre')
    .in('id', userIds);

  if (error) throw error;

  const map = new Map();
  for (const row of data || []) {
    map.set(row.id, row);
  }
  return map;
}

async function loadGroupNames(db, groupIds) {
  if (!groupIds.length) return new Map();

  const { data, error } = await db
    .from('staff_buzon_grupos')
    .select('id, name')
    .in('id', groupIds);

  if (error) throw error;

  const map = new Map();
  for (const row of data || []) {
    map.set(row.id, row.name || 'Grupo');
  }
  return map;
}

async function loadGroupMemberships(db) {
  const { data, error } = await db.from('staff_buzon_grupo_miembros').select('group_id, user_id');
  if (error) throw error;

  const membersByGroup = new Map();
  const groupsByUser = new Map();

  for (const row of data || []) {
    if (!membersByGroup.has(row.group_id)) membersByGroup.set(row.group_id, new Set());
    membersByGroup.get(row.group_id).add(row.user_id);

    if (!groupsByUser.has(row.user_id)) groupsByUser.set(row.user_id, new Set());
    groupsByUser.get(row.user_id).add(row.group_id);
  }

  return { membersByGroup, groupsByUser };
}

async function loadMessagesInWindow(db, startIso, endIso) {
  const { data, error } = await db
    .from('staff_buzon_mensajes')
    .select(MESSAGE_SELECT)
    .gte('created_at', startIso)
    .lte('created_at', endIso)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function loadAlreadySentUserIds(db, digestDate) {
  const { data, error } = await db
    .from(DIGEST_TABLE)
    .select('user_id')
    .eq('digest_date', digestDate);

  if (error) {
    if (error.code === '42P01') return new Set();
    throw error;
  }

  return new Set((data || []).map((row) => row.user_id));
}

function buildConversationEntry({ key, title, messages, unreadCount = 0 }) {
  const lastMessage = messages[messages.length - 1];
  return {
    key,
    title,
    count: messages.length,
    unreadCount,
    preview: truncateText(getMessagePreview(lastMessage)),
    lastAt: lastMessage?.created_at || null,
  };
}

export function buildUserDigestSummary({
  userId,
  messages,
  profiles,
  groupNames,
  groupsByUser,
}) {
  const directByPartner = new Map();
  const groupById = new Map();
  let unreadDirectTotal = 0;

  for (const message of messages) {
    if (message.group_id) {
      const memberGroups = groupsByUser.get(userId);
      if (!memberGroups?.has(message.group_id)) continue;

      if (!groupById.has(message.group_id)) groupById.set(message.group_id, []);
      groupById.get(message.group_id).push(message);
      continue;
    }

    const partnerId =
      message.sender_id === userId
        ? message.recipient_id
        : message.recipient_id === userId
          ? message.sender_id
          : null;
    if (!partnerId) continue;

    if (!directByPartner.has(partnerId)) directByPartner.set(partnerId, []);
    directByPartner.get(partnerId).push(message);

    if (message.recipient_id === userId && message.sender_id !== userId && !message.read_at) {
      unreadDirectTotal += 1;
    }
  }

  const directConversations = [...directByPartner.entries()]
    .map(([partnerId, partnerMessages]) => {
      const profile = profiles.get(partnerId);
      const unreadCount = partnerMessages.filter((item) => !item.read_at).length;
      return buildConversationEntry({
        key: `dm:${partnerId}`,
        title: getDisplayName(profile || { id: partnerId }),
        messages: partnerMessages,
        unreadCount,
      });
    })
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  const groupConversations = [...groupById.entries()]
    .map(([groupId, groupMessages]) =>
      buildConversationEntry({
        key: `group:${groupId}`,
        title: groupNames.get(groupId) || 'Grupo',
        messages: groupMessages,
      }),
    )
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  const totalCount =
    directConversations.reduce((sum, item) => sum + item.count, 0) +
    groupConversations.reduce((sum, item) => sum + item.count, 0);

  if (!totalCount) return null;

  return {
    totalCount,
    unreadDirectTotal,
    directConversations: directConversations.slice(0, MAX_CONVERSATIONS),
    groupConversations: groupConversations.slice(0, MAX_CONVERSATIONS),
    hiddenDirectCount: Math.max(0, directConversations.length - MAX_CONVERSATIONS),
    hiddenGroupCount: Math.max(0, groupConversations.length - MAX_CONVERSATIONS),
  };
}

export function buildDigestEmail({ userName, digestDateKey, summary }) {
  const dateLabel = formatDigestDateLabel(digestDateKey);
  const buzonUrl = buildBuzonUrl();
  const greetingName = String(userName || '').trim() || 'equipo';

  const lines = [
    `Hola ${greetingName},`,
    '',
    `Este es tu resumen del Buzón de ${dateLabel}:`,
    '',
  ];

  if (summary.directConversations.length) {
    lines.push(`MENSAJES DIRECTOS (${summary.directConversations.reduce((s, c) => s + c.count, 0)})`);
    for (const conversation of summary.directConversations) {
      const unread =
        conversation.unreadCount > 0
          ? ` · ${conversation.unreadCount} sin leer`
          : '';
      lines.push(`• ${conversation.title} — ${conversation.count} mensaje${conversation.count === 1 ? '' : 's'}${unread}`);
      lines.push(`  «${conversation.preview}»`);
    }
    if (summary.hiddenDirectCount) {
      lines.push(`• … y ${summary.hiddenDirectCount} conversación${summary.hiddenDirectCount === 1 ? '' : 'es'} más`);
    }
    lines.push('');
  }

  if (summary.groupConversations.length) {
    lines.push(`GRUPOS (${summary.groupConversations.reduce((s, c) => s + c.count, 0)})`);
    for (const conversation of summary.groupConversations) {
      lines.push(`• ${conversation.title} — ${conversation.count} mensaje${conversation.count === 1 ? '' : 's'}`);
      lines.push(`  «${conversation.preview}»`);
    }
    if (summary.hiddenGroupCount) {
      lines.push(`• … y ${summary.hiddenGroupCount} grupo${summary.hiddenGroupCount === 1 ? '' : 's'} más`);
    }
    lines.push('');
  }

  const unreadLine =
    summary.unreadDirectTotal > 0
      ? `${summary.unreadDirectTotal} sin leer en mensajes directos. `
      : '';

  lines.push(
    `Total del día: ${summary.totalCount} mensaje${summary.totalCount === 1 ? '' : 's'}. ${unreadLine}`.trim(),
    '',
    `Abrir el Buzón: ${buzonUrl}`,
    '',
    'Recibirás este resumen automáticamente al final de cada día en el que haya actividad en tus chats y grupos.',
    '',
    '— Dralo English · Mensajería interna',
  );

  const text = lines.join('\n');
  const subject = `Resumen del Buzón — ${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)}`;

  const { html } = buildBrandedEmailFromPlainText(text, {
    preheader: `${summary.totalCount} mensaje${summary.totalCount === 1 ? '' : 's'} en el Buzón hoy`,
    ctaLabel: 'Abrir el Buzón',
  });

  return { subject, text, html };
}

async function recordDigestSent(db, userId, digestDate, messageCount) {
  const { error } = await db.from(DIGEST_TABLE).upsert(
    {
      user_id: userId,
      digest_date: digestDate,
      message_count: messageCount,
      sent_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,digest_date' },
  );

  if (error) throw error;
}

/**
 * Envía un único correo diario por usuario con el resumen del Buzón.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ digestDate?: string, dryRun?: boolean, force?: boolean, userId?: string }} [options]
 */
export async function processStaffBuzonDigests(adminClient, options = {}) {
  const referenceDate = options.digestDate
    ? new Date(`${options.digestDate}T12:00:00.000Z`)
    : new Date();
  const { dateKey, start, end } = getMadridDayRangeUtc(referenceDate);
  const digestDate = options.digestDate || dateKey;

  const staffIds = await loadStaffBuzonUserIds(adminClient);
  if (!staffIds.length) {
    return { digestDate, sent: 0, skipped: 0, errors: [], message: 'Sin usuarios de staff.' };
  }

  const targetIds = options.userId
    ? staffIds.filter((id) => id === options.userId)
    : staffIds;

  const alreadySent = options.force
    ? new Set()
    : await loadAlreadySentUserIds(adminClient, digestDate);

  const [messages, profiles, memberships] = await Promise.all([
    loadMessagesInWindow(adminClient, start, end),
    loadStaffProfiles(adminClient, staffIds),
    loadGroupMemberships(adminClient),
  ]);

  const groupIds = [...new Set(messages.map((row) => row.group_id).filter(Boolean))];
  const groupNames = await loadGroupNames(adminClient, groupIds);

  const results = [];
  let sent = 0;
  let skipped = 0;

  for (const userId of targetIds) {
    if (alreadySent.has(userId)) {
      skipped += 1;
      results.push({ userId, skipped: true, reason: 'already_sent' });
      continue;
    }

    const profile = profiles.get(userId);
    const email = String(profile?.email || '').trim().toLowerCase();
    if (!email) {
      skipped += 1;
      results.push({ userId, skipped: true, reason: 'no_email' });
      continue;
    }

    const summary = buildUserDigestSummary({
      userId,
      messages,
      profiles,
      groupNames,
      groupsByUser: memberships.groupsByUser,
    });

    if (!summary) {
      skipped += 1;
      results.push({ userId, skipped: true, reason: 'no_activity' });
      continue;
    }

    const mail = buildDigestEmail({
      userName: profile?.nombre || profile?.email,
      digestDateKey: digestDate,
      summary,
    });

    if (options.dryRun) {
      results.push({ userId, email, dryRun: true, subject: mail.subject, total: summary.totalCount });
      continue;
    }

    const delivery = await deliverTransactionalEmail({
      to: email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    if (!delivery.ok) {
      results.push({ userId, email, sent: false, error: delivery.error });
      continue;
    }

    await recordDigestSent(adminClient, userId, digestDate, summary.totalCount);
    sent += 1;
    results.push({
      userId,
      email,
      sent: true,
      channel: delivery.channel,
      total: summary.totalCount,
    });
  }

  return {
    digestDate,
    window: { start, end },
    sent,
    skipped,
    dryRun: Boolean(options.dryRun),
    results,
  };
}
