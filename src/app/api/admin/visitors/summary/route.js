import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import {
  readAllMarketingRows,
  readMarketingRowsByIds,
  visitorElapsedSeconds,
  summarizeClassifiedVisitors,
  parseStoredUtc,
  signedUpDuringVisit,
  dedupeAccountVisitors,
} from '@/lib/marketingMetrics';
import { isStudentRole } from '@/utils/authRoles';
import { landingLabelFromPath, trafficSourceLabel } from '@/lib/trafficSource';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;
    const visitors = await readAllMarketingRows(() => db.from('marketing_visitors')
      .select('visitor_id, user_id, created_at, last_ip, last_seen_at, first_source, first_landing_page, first_referrer')
      .order('created_at', { ascending: false }).order('visitor_id'));

    const userIds = [...new Set(visitors.map((row) => row.user_id).filter(Boolean))];
    const roleByUser = new Map();
    const createdAtByUser = new Map();
    const emailByUser = new Map();

    if (userIds.length) {
      const profiles = await readMarketingRowsByIds(userIds, (ids) => db
        .from('Usuarios_y_Perfil_users').select('id, rol_id, email, creado_en')
        .in('id', ids).order('id'));

      const roleIds = [...new Set((profiles || []).map((row) => row.rol_id).filter(Boolean))];
      const roleNameById = new Map();
      if (roleIds.length) {
        const { data: roles, error: roleError } = await db
          .from('Usuarios_y_Perfil_roles')
          .select('id, nombre')
          .in('id', roleIds);
        if (roleError) throw roleError;
        for (const role of roles || []) roleNameById.set(String(role.id), role.nombre || '');
      }

      const roleByUserLocal = new Map(
        (profiles || []).map((row) => [row.id, roleNameById.get(String(row.rol_id)) || '']),
      );
      const createdAtLocal = new Map(
        (profiles || []).map((row) => [row.id, row.creado_en || null]),
      );
      const emailLocal = new Map((profiles || []).map((row) => [row.id, row.email || '']));
      for (const [userId, roleName] of roleByUserLocal) roleByUser.set(userId, roleName);
      for (const [userId, createdAt] of createdAtLocal) createdAtByUser.set(userId, createdAt);
      for (const [userId, email] of emailLocal) emailByUser.set(userId, email);
    }

    const classified = (visitors || []).map((visitor) => {
      const userId = visitor.user_id;
      const roleName = userId ? roleByUser.get(userId) || '' : '';
      const ip = visitor.last_ip || null;
      const accountCreatedAt = userId ? createdAtByUser.get(userId) : null;
      const signedUpOnThisVisit = signedUpDuringVisit(accountCreatedAt, visitor.created_at);
      const signupAt = signedUpOnThisVisit ? parseStoredUtc(accountCreatedAt) : null;
      const staffByRole = Boolean(roleName && !isStudentRole(roleName));
      const kind = staffByRole
        ? 'staff'
        : signedUpOnThisVisit
          ? 'account'
          : userId
            ? 'returning'
            : 'anon';
      const lastSeen = visitor.last_seen_at || visitor.created_at;
      const elapsedSeconds = visitorElapsedSeconds(visitor.created_at, lastSeen);
      return {
        visitorId: visitor.visitor_id,
        userId: userId || null,
        ip,
        seenAt: signupAt || visitor.created_at,
        lastSeen,
        seconds: null, // Active duration is not measured by this dataset.
        elapsedSeconds,
        kind,
        email: userId ? emailByUser.get(userId) || '' : '',
        source: visitor.first_source
          ? trafficSourceLabel(visitor.first_source, { referrerHost: visitor.first_referrer })
          : '',
        landing: visitor.first_landing_page
          ? landingLabelFromPath(visitor.first_landing_page)
          : '',
        stops: [],
      };
    });

    return NextResponse.json(summarizeClassifiedVisitors(dedupeAccountVisitors(classified)));
  } catch (err) {
    console.error('[admin/visitors/summary]', err);
    return NextResponse.json({ error: 'No se pudo cargar las visitas.' }, { status: 500 });
  }
}
