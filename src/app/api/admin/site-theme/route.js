import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { applyAuditedOrgSettings, assertAuditTransactionReady } from '@/lib/adminChangeLog';
import { SITE_THEME_SETTING_KEY, isSiteThemeId, resolveSiteTheme } from '@/lib/siteTheme';

/** Solo administradores. El cambio queda en config_log_cambios con su autor. */
export async function PUT(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const theme = String(body?.theme || '').trim().toLowerCase();
    if (!isSiteThemeId(theme)) {
      return NextResponse.json({ error: 'Tema no válido.' }, { status: 400 });
    }

    await assertAuditTransactionReady(auth.db, auth.user.id);
    await applyAuditedOrgSettings(auth.db, auth.user.id, { [SITE_THEME_SETTING_KEY]: theme });
    return NextResponse.json({ ok: true, ...resolveSiteTheme(theme) });
  } catch (error) {
    console.error('[admin/site-theme PUT]', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo cambiar el tema.' },
      { status: error?.status || 500 },
    );
  }
}
