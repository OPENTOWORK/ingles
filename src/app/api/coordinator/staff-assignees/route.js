import { NextResponse } from 'next/server';
import { listStaffAssignees } from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { assignees } = await listStaffAssignees(auth.db);
    return NextResponse.json({ assignees });
  } catch (err) {
    console.error('[coordinator/staff-assignees GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
