import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { journeyTrail, summarizeLandingPass } from '@/lib/visitorJourney';
import { landingLabelFromPath } from '@/lib/trafficSource';
import { isStudentRole } from '@/utils/authRoles';

export const dynamic = 'force-dynamic';

function isLocalAdminIp(ip) {
  const value = String(ip || '').trim().toLowerCase().replace(/^::ffff:/, '');
  return value === '::1' || value === '127.0.0.1' || value === 'localhost';
}

async function loadPages(db, visitorIds) {
  const rows = [];
  const chunkSize = 100;
  for (let index = 0; index < visitorIds.length; index += chunkSize) {
    const chunk = visitorIds.slice(index, index + chunkSize);
    let from = 0;
    for (;;) {
      const { data, error } = await db
        .from('marketing_visitor_pages')
        .select('visitor_id, path, page_title, visited_at')
        .in('visitor_id', chunk)
        .order('visited_at', { ascending: true })
        .range(from, from + 999);
      if (error) {
        if (isSchemaNotReadyError(error)) return rows;
        throw error;
      }
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
      from += 1000;
    }
  }
  return rows;
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: visitors, error } = await auth.db
      .from('marketing_visitors')
      .select('visitor_id, user_id, last_ip, first_landing_page')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;

    const landingVisits = (visitors || []).filter(
      (row) => landingLabelFromPath(row.first_landing_page) === 'Landing B2' && !isLocalAdminIp(row.last_ip),
    );
    const userIds = [...new Set(landingVisits.map((row) => row.user_id).filter(Boolean))];
    const staffIds = new Set();
    if (userIds.length) {
      const { data: people, error: peopleError } = await auth.db
        .from('Usuarios_y_Perfil_users')
        .select('id, rol_id')
        .in('id', userIds);
      if (peopleError) throw peopleError;
      const roleIds = [...new Set((people || []).map((row) => row.rol_id).filter(Boolean))];
      const roleNameById = new Map();
      if (roleIds.length) {
        const { data: roles, error: roleError } = await auth.db
          .from('Usuarios_y_Perfil_roles')
          .select('id, nombre')
          .in('id', roleIds);
        if (roleError) throw roleError;
        for (const role of roles || []) roleNameById.set(String(role.id), role.nombre || '');
      }
      for (const person of people || []) {
        const roleName = roleNameById.get(String(person.rol_id)) || '';
        if (roleName && !isStudentRole(roleName)) staffIds.add(person.id);
      }
    }

    const audience = landingVisits.filter((row) => !staffIds.has(row.user_id));
    const pages = await loadPages(auth.db, audience.map((row) => row.visitor_id));
    const pagesByVisitor = new Map();
    for (const row of pages) {
      const list = pagesByVisitor.get(row.visitor_id) || [];
      list.push(row);
      pagesByVisitor.set(row.visitor_id, list);
    }

    const summary = summarizeLandingPass(
      audience.map((row) => ({
        landing: row.first_landing_page,
        stops: journeyTrail(pagesByVisitor.get(row.visitor_id) || [], row.first_landing_page),
      })),
    );

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[admin/visitors/landing-pass]', err);
    return NextResponse.json({ error: 'No se pudo leer el paso de la landing.' }, { status: 500 });
  }
}
