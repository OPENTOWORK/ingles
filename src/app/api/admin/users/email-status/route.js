import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

const PER_PAGE = 200;
const MAX_PAGES = 20;

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const emailConfirmedByUser = {};
    let page = 1;

    while (page <= MAX_PAGES) {
      const { data, error } = await auth.db.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const users = data?.users || [];
      for (const user of users) {
        if (!user?.id) continue;
        emailConfirmedByUser[user.id] = Boolean(user.email_confirmed_at);
      }

      if (users.length < PER_PAGE) break;
      page += 1;
    }

    return NextResponse.json({ emailConfirmedByUser });
  } catch (err) {
    console.error('[admin/users/email-status GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
