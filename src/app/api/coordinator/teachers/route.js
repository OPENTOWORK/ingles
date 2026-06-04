import { NextResponse } from 'next/server';
import {
  authenticateCoordinatorRequest,
  listTeachersWithStats,
  isSchemaNotReadyError,
} from '@/lib/coordinatorAccess';

export async function GET(req) {
  try {
    const auth = await authenticateCoordinatorRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { teachers, tablesReady } = await listTeachersWithStats(auth.db);
    const totalStudents = teachers.reduce((n, t) => n + (t.studentCount || 0), 0);

    return NextResponse.json({
      teachers,
      tablesReady,
      summary: {
        teacherCount: teachers.length,
        totalStudents,
        activeTeachers: teachers.filter((t) => t.activo !== false).length,
      },
    });
  } catch (err) {
    console.error('[coordinator/teachers GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 });
  }
}
