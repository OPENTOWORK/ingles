import { NextResponse } from 'next/server';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { validateBuzonAttachmentFile } from '@/lib/staffBuzonAttachments';
import { STAFF_TASK_FILES_BUCKET, STAFF_TASK_FILES_MAX_COUNT } from '@/lib/staffTaskFiles';
import {
  buildStaffTaskFilePath,
  deleteTaskFile,
  mapStaffTaskFileRow,
} from '@/lib/staffTaskFilesServer';

export const dynamic = 'force-dynamic';

const FILES_TABLE = 'staff_tarea_archivos';
const TASKS_TABLE = 'staff_tareas';

async function taskExists(db, taskId) {
  const { data, error } = await db.from(TASKS_TABLE).select('id').eq('id', taskId).maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

export async function POST(req, { params }) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const taskId = String(params?.taskId || '').trim();
    if (!taskId || !(await taskExists(auth.db, taskId))) {
      return NextResponse.json({ error: 'Tarea no encontrada.' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body?.action !== 'delete') {
        return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
      }
      const result = await deleteTaskFile(auth.db, {
        taskId,
        fileId: String(body.id || '').trim(),
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json({ success: true });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo.' }, { status: 400 });
    }

    const validation = validateBuzonAttachmentFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { count } = await auth.db
      .from(FILES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('tarea_id', taskId);
    if ((count || 0) >= STAFF_TASK_FILES_MAX_COUNT) {
      return NextResponse.json(
        { error: `Una tarea puede tener hasta ${STAFF_TASK_FILES_MAX_COUNT} archivos.` },
        { status: 400 },
      );
    }

    const storagePath = buildStaffTaskFilePath(auth.user.id, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await auth.db.storage.from(STAFF_TASK_FILES_BUCKET).upload(
      storagePath,
      buffer,
      { upsert: false, contentType: file.type, cacheControl: '3600' },
    );
    if (uploadError) {
      console.error('[coordinator/tasks/files POST]', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'No se pudo subir el archivo.' },
        { status: 500 },
      );
    }

    const { data, error } = await auth.db
      .from(FILES_TABLE)
      .insert({
        tarea_id: taskId,
        nombre: file.name,
        mime: file.type,
        kind: validation.kind,
        storage_path: storagePath,
        size_bytes: file.size,
        created_by: auth.user.id,
      })
      .select('id, nombre, mime, kind, size_bytes, created_at')
      .single();

    if (error) {
      await auth.db.storage.from(STAFF_TASK_FILES_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: mapStaffTaskFileRow(data) });
  } catch (error) {
    console.error('[coordinator/tasks/files POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
