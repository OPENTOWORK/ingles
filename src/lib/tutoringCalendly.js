const CALENDLY_HOSTS = ['calendly.com', 'www.calendly.com'];

export function normalizeCalendlyUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';

  try {
    const withProtocol = value.startsWith('http') ? value : `https://${value}`;
    const url = new URL(withProtocol);
    if (!CALENDLY_HOSTS.includes(url.hostname.toLowerCase())) {
      return null;
    }
    url.protocol = 'https:';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function isValidCalendlyUrl(raw) {
  return Boolean(normalizeCalendlyUrl(raw));
}

export function teacherHasOnlineOffer(profile) {
  return Boolean(
    profile?.ofrece_online !== false &&
      profile?.calendly_url &&
      String(profile.calendly_url).trim(),
  );
}

export function teacherHasInPersonOffer(profile) {
  if (profile?.ofrece_presencial !== true) return false;
  const hasCalendly =
    profile?.calendly_url_presencial && String(profile.calendly_url_presencial).trim();
  const hasInfo = profile?.info_presencial && String(profile.info_presencial).trim();
  return Boolean(hasCalendly || hasInfo);
}

export function teacherIsBookable(profile) {
  return Boolean(profile?.activo !== false && (teacherHasOnlineOffer(profile) || teacherHasInPersonOffer(profile)));
}

export function parseTutorProfilePayload(body = {}) {
  const ofreceOnline = body.ofrece_online !== false;
  const ofrecePresencial = body.ofrece_presencial === true;
  const presentacion = String(body.presentacion || '').trim().slice(0, 600);
  const activo = body.activo !== false;
  const infoPresencial = String(body.info_presencial || '').trim().slice(0, 800);

  const calendlyUrl = ofreceOnline ? normalizeCalendlyUrl(body.calendly_url) : '';
  const calendlyUrlPresencial = ofrecePresencial
    ? normalizeCalendlyUrl(body.calendly_url_presencial)
    : '';

  if (!ofreceOnline && !ofrecePresencial) {
    return { error: 'Activa al menos una modalidad: online o presencial.' };
  }

  if (ofreceOnline && !calendlyUrl) {
    return {
      error: 'Para clases online introduce un enlace válido de Calendly (https://calendly.com/…).',
    };
  }

  if (ofrecePresencial && !calendlyUrlPresencial && !infoPresencial) {
    return {
      error:
        'Para clases presenciales indica un Calendly de reserva o información de ciudad/zona y contacto.',
    };
  }

  if (ofrecePresencial && body.calendly_url_presencial && !calendlyUrlPresencial) {
    return { error: 'El enlace de Calendly presencial no es válido.' };
  }

  return {
    row: {
      ofrece_online: ofreceOnline,
      ofrece_presencial: ofrecePresencial,
      calendly_url: ofreceOnline ? calendlyUrl : null,
      calendly_url_presencial: ofrecePresencial && calendlyUrlPresencial ? calendlyUrlPresencial : null,
      info_presencial: ofrecePresencial && infoPresencial ? infoPresencial : null,
      presentacion: presentacion || null,
      activo,
    },
  };
}

const PROFILE_SELECT =
  'profesor_id, calendly_url, presentacion, activo, ofrece_online, ofrece_presencial, calendly_url_presencial, info_presencial, actualizado_en';

export const TUTOR_PROFILE_COLUMNS = PROFILE_SELECT;

export function mapTeacherForStudent(profile, meta, isAssigned) {
  return {
    id: profile.profesor_id,
    name: meta.nombre || meta.email?.split('@')[0] || 'Profesor',
    email: meta.email,
    presentation: profile.presentacion || '',
    isAssigned,
    updatedAt: profile.actualizado_en,
    offersOnline: teacherHasOnlineOffer(profile),
    offersInPerson: teacherHasInPersonOffer(profile),
    calendlyUrl: teacherHasOnlineOffer(profile) ? profile.calendly_url : null,
    calendlyUrlInPerson: profile.calendly_url_presencial || null,
    inPersonInfo: profile.info_presencial || '',
  };
}
