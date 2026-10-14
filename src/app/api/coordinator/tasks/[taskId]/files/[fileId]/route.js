import { NextResponse } from 'next/server';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { STAFF_TASK_FILES_BUCKET } from '@/lib/staffTaskFiles';

export const dynamic = 'force-dynamic';

const FILES_TABLE = 'staff_tarea_archivos';

export async function GET(req, { params }) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const taskId = String(params?.taskId || '').trim();
    const fileId = String(params?.fileId || '').trim();
    const { data: file, error } = await auth.db
      .from(FILES_TABLE)
      .select('id, nombre, mime, storage_path')
      .eq('id', fileId)
      .eq('tarea_id', taskId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!file) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 });

    const { data, error: downloadError } = await auth.db.storage
      .from(STAFF_TASK_FILES_BUCKET)
      .download(file.storage_path);
    if (downloadError || !data) {
      return NextResponse.json(
        { error: downloadError?.message || 'No se pudo descargar el archivo.' },
        { status: 500 },
      );
    }

    const filename = String(file.nombre || 'archivo').replace(/["\r\n]/g, '');
    const bytes = Buffer.from(await data.arrayBuffer());
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': file.mime || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('[coordinator/tasks/files GET]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
