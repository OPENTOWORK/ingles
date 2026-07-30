import webpush from 'web-push';

const PUSH_TABLE = 'staff_buzon_push_subscriptions';
const DEFAULT_SUBJECT = 'mailto:soporte@dralo.es';

function getVapidConfig() {
  const publicKey = String(process.env.WEB_PUSH_PUBLIC_KEY || '').trim();
  const privateKey = String(process.env.WEB_PUSH_PRIVATE_KEY || '').trim();
  const subject = String(process.env.WEB_PUSH_SUBJECT || DEFAULT_SUBJECT).trim();
  return {
    publicKey,
    privateKey,
    subject,
    configured: Boolean(publicKey && privateKey && subject),
  };
}

export function getWebPushPublicConfig() {
  const { publicKey, configured } = getVapidConfig();
  return { publicKey: configured ? publicKey : '', configured };
}

export function toWebPushSubscription(row) {
  return {
    endpoint: row.endpoint,
    expirationTime: row.expiration_time ?? null,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth_key,
    },
  };
}

export async function getBuzonPushRecipientIds(db, message) {
  if (message.group_id) {
    const { data, error } = await db
      .from('staff_buzon_grupo_miembros')
      .select('user_id')
      .eq('group_id', message.group_id)
      .neq('user_id', message.sender_id);
    if (error) throw error;
    return [...new Set((data || []).map((row) => row.user_id).filter(Boolean))];
  }

  return message.recipient_id && message.recipient_id !== message.sender_id
    ? [message.recipient_id]
    : [];
}

function notificationBody(message) {
  const text = String(message.body || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Te ha enviado un archivo.';
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

export async function sendBuzonMessagePushNotifications({
  db,
  message,
  senderName = 'Dralo',
  groupName = '',
}) {
  const vapid = getVapidConfig();
  if (!vapid.configured) {
    return { sent: 0, skipped: true, reason: 'web_push_not_configured' };
  }

  const recipientIds = await getBuzonPushRecipientIds(db, message);
  if (!recipientIds.length) return { sent: 0, skipped: true, reason: 'no_recipients' };

  const { data: rows, error } = await db
    .from(PUSH_TABLE)
    .select('id, endpoint, p256dh, auth_key, expiration_time')
    .in('user_id', recipientIds);
  if (error) throw error;
  if (!rows?.length) return { sent: 0, skipped: true, reason: 'no_subscriptions' };

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const title = message.group_id
    ? `${senderName} · ${groupName || 'Grupo de Dralo'}`
    : `Nuevo mensaje de ${senderName}`;
  const payload = JSON.stringify({
    title,
    body: notificationBody(message),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/buzon/',
    tag: message.group_id
      ? `buzon-group-${message.group_id}`
      : `buzon-direct-${message.sender_id}`,
    messageId: message.id,
  });

  const staleIds = [];
  let sent = 0;
  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(toWebPushSubscription(row), payload, {
          TTL: 60 * 60,
          urgency: 'high',
          topic: String(message.id || '').replace(/-/g, '').slice(0, 32) || undefined,
        });
        sent += 1;
      } catch (pushError) {
        if (pushError?.statusCode === 404 || pushError?.statusCode === 410) {
          staleIds.push(row.id);
          return;
        }
        console.error('[buzon/push] Could not deliver notification:', pushError);
      }
    }),
  );

  if (staleIds.length) {
    const { error: deleteError } = await db.from(PUSH_TABLE).delete().in('id', staleIds);
    if (deleteError) console.error('[buzon/push] Could not remove stale subscriptions:', deleteError);
  }

  return { sent, stale: staleIds.length };
}
