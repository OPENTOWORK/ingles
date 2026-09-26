import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isStudentRole } from '@/utils/authRoles';
import {
  labelFromAcquisitionProfile,
  landingLabelFromAcquisitionProfile,
  landingLabelFromPath,
  trafficSourceLabel,
} from '@/lib/trafficSource';

function isLocalAdminIp(ip) {
  const value = String(ip || '')
    .trim()
    .toLowerCase()
    .replace(/^::ffff:/, '');
  return value === '::1' || value === '127.0.0.1' || value === 'localhost';
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;
    const [
      { data: linked, error: linkedError },
      { data: hits, error: hitsError },
      { data: visitors, error: visitorsError },
    ] = await Promise.all([
      db.from('marketing_visitors').select('visitor_id, user_id').not('user_id', 'is', null),
      db
        .from('marketing_visitor_hits')
        .select('ip_address, created_at, visitor_id')
        .order('created_at', { ascending: false })
        .limit(500),
      db
        .from('marketing_visitors')
        .select('visitor_id, user_id, created_at, last_ip, last_seen_at, first_source, first_landing_page, first_referrer')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    if (linkedError) throw linkedError;
    if (hitsError) throw hitsError;
    if (visitorsError) throw visitorsError;

    const visitorIds = [...new Set((visitors || []).map((row) => row.visitor_id).filter(Boolean))];
    let acquisitions = [];
    if (visitorIds.length) {
      const { data: acquisitionRows, error: acquisitionError } = await db
        .from('marketing_acquisition_profiles')
        .select(
          'visitor_id, first_source, first_medium, first_campaign, first_content, first_landing_page, first_utm_source, first_utm_medium, first_utm_campaign, first_gclid',
        )
        .in('visitor_id', visitorIds);
      if (acquisitionError) {
        console.error('[admin/visitors/summary] acquisition', acquisitionError);
      } else {
        acquisitions = acquisitionRows || [];
      }
    }

    const acquisitionByVisitor = new Map(
      acquisitions.map((row) => [row.visitor_id, row]),
    );

    const userIds = [...new Set((linked || []).map((row) => row.user_id).filter(Boolean))];
    const roleByUser = new Map();
    const createdAtByUser = new Map();
    const emailByUser = new Map();

    if (userIds.length) {
      const { data: profiles, error: profileError } = await db
        .from('Usuarios_y_Perfil_users')
        .select('id, rol_id, email, creado_en')
        .in('id', userIds);
      if (profileError) throw profileError;

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

      await Promise.all(
        userIds.map(async (userId) => {
          if (createdAtByUser.get(userId) && emailByUser.get(userId)) return;
          const { data } = await db.auth.admin.getUserById(userId);
          const account = data?.user;
          if (!account) return;
          if (!createdAtByUser.get(userId) && account.created_at) {
            createdAtByUser.set(userId, account.created_at);
          }
          if (!emailByUser.get(userId) && account.email) emailByUser.set(userId, account.email);
        }),
      );
    }

    const latestIp = new Map();
    const lastSeenByVisitor = new Map();
    for (const visitor of visitors || []) {
      if (visitor.last_ip) latestIp.set(visitor.visitor_id, visitor.last_ip);
      if (visitor.last_seen_at) lastSeenByVisitor.set(visitor.visitor_id, visitor.last_seen_at);
    }
    for (const hit of hits || []) {
      if (!latestIp.has(hit.visitor_id)) latestIp.set(hit.visitor_id, hit.ip_address);
      const prev = lastSeenByVisitor.get(hit.visitor_id);
      if (!prev || new Date(hit.created_at) > new Date(prev)) {
        lastSeenByVisitor.set(hit.visitor_id, hit.created_at);
      }
    }

    const classified = (visitors || []).map((visitor) => {
      const userId = visitor.user_id;
      const roleName = userId ? roleByUser.get(userId) || '' : '';
      const ip = latestIp.get(visitor.visitor_id) || visitor.last_ip || null;
      const accountCreatedAt = userId ? createdAtByUser.get(userId) : null;
      const signedUpOnThisVisit =
        accountCreatedAt &&
        new Date(accountCreatedAt).getTime() >= new Date(visitor.created_at).getTime() - 2 * 60 * 1000;
      const staffByRole = Boolean(roleName && !isStudentRole(roleName));
      const kind = staffByRole || isLocalAdminIp(ip)
        ? 'staff'
        : signedUpOnThisVisit
          ? 'account'
          : userId
            ? 'returning'
            : 'anon';
      const lastSeen = lastSeenByVisitor.get(visitor.visitor_id) || visitor.last_seen_at || visitor.created_at;
      const seconds = Math.max(
        0,
        Math.round((new Date(lastSeen).getTime() - new Date(visitor.created_at).getTime()) / 1000),
      );
      return {
        ip,
        seenAt: visitor.created_at,
        lastSeen,
        seconds,
        kind,
        email: userId ? emailByUser.get(userId) || '' : '',
        source: visitor.first_source
          ? trafficSourceLabel(visitor.first_source, { referrerHost: visitor.first_referrer })
          : labelFromAcquisitionProfile(acquisitionByVisitor.get(visitor.visitor_id)),
        landing: visitor.first_landing_page
          ? landingLabelFromPath(visitor.first_landing_page)
          : landingLabelFromAcquisitionProfile(acquisitionByVisitor.get(visitor.visitor_id)),
      };
    });

    const blockedIps = new Set(
      classified
        .filter((row) => (row.kind === 'staff' || row.kind === 'returning') && row.ip)
        .map((row) => row.ip),
    );

    const withoutAccountRows = { entered: 0, unregistered: 0, registered: 0, staff: 0 };
    const ipLog = classified
      .map((row) => {
        const kind =
          row.kind === 'anon' && row.ip && blockedIps.has(row.ip) ? 'staff' : row.kind;
        if (kind === 'returning') return null;
        if (kind === 'staff') {
          withoutAccountRows.staff += 1;
          return { ...row, kind };
        }
        withoutAccountRows.entered += 1;
        if (kind === 'account') withoutAccountRows.registered += 1;
        if (kind === 'anon') withoutAccountRows.unregistered += 1;
        return { ...row, kind };
      })
      .filter(Boolean);

    const firstPublic = ipLog.find((row) => row.kind === 'anon' || row.kind === 'account');

    return NextResponse.json({
      entered: withoutAccountRows.entered,
      registered: withoutAccountRows.registered,
      unregistered: withoutAccountRows.unregistered,
      staff: withoutAccountRows.staff,
      since: firstPublic?.seenAt || null,
      ipLog,
    });
  } catch (err) {
    console.error('[admin/visitors/summary]', err);
    return NextResponse.json({ error: 'No se pudo cargar las visitas.' }, { status: 500 });
  }
}
