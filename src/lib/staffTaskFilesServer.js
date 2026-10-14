import { randomUUID } from 'crypto';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { STAFF_TASK_FILES_BUCKET } from '@/lib/staffTaskFiles';

const FILES_TABLE = 'staff_tarea_archivos';

export function buildStaffTaskFilePath(userId, originalName = 'archivo') {
  const safe = String(originalName)
    .replace(/[^\w.\-()+]/g, '_')
    .slice(0, 80);
  return `${userId}/${randomUUID()}-${safe || 'archivo'}`;
}

export function mapStaffTaskFileRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    mime: row.mime || '',
    kind: row.kind || '',
    size_bytes: row.size_bytes || 0,
    created_at: row.created_at,
  };
}

export async function loadTaskFilesByTaskIds(db, taskIds = []) {
  const unique = [...new Set(taskIds.filter(Boolean))];
  if (!unique.length) return {};
  const { data, error } = await db
    .from(FILES_TABLE)
    .select('id, tarea_id, nombre, mime, kind, size_bytes, created_at')
    .in('tarea_id', unique)
    .order('created_at', { ascending: true });
  if (error) {
    if (isSchemaNotReadyError(error)) return {};
    throw error;
  }
  const byTask = {};
  for (const row of data || []) {
    if (!byTask[row.tarea_id]) byTask[row.tarea_id] = [];
    byTask[row.tarea_id].push(mapStaffTaskFileRow(row));
  }
  return byTask;
}

export async function copyTaskFiles(db, sourceTaskId, targetTaskId, userId) {
  const { data, error } = await db
    .from(FILES_TABLE)
    .select('nombre, mime, kind, storage_path, size_bytes')
    .eq('tarea_id', sourceTaskId);
  if (error) {
    if (isSchemaNotReadyError(error)) return;
    throw error;
  }
  if (!data?.length) return;
  const { error: insertError } = await db.from(FILES_TABLE).insert(
    data.map((file) => ({
      ...file,
      tarea_id: targetTaskId,
      created_by: userId,
    })),
  );
  if (insertError) throw insertError;
}

export async function deleteTaskFile(db, { taskId, fileId }) {
  const { data: file, error } = await db
    .from(FILES_TABLE)
    .select('id, storage_path')
    .eq('id', fileId)
    .eq('tarea_id', taskId)
    .maybeSingle();
  if (error) throw error;
  if (!file) return { ok: false, status: 404, error: 'Archivo no encontrado.' };

  const { error: deleteError } = await db.from(FILES_TABLE).delete().eq('id', file.id);
  if (deleteError) throw deleteError;

  const { count } = await db
    .from(FILES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('storage_path', file.storage_path);
  if (!count) {
    await db.storage.from(STAFF_TASK_FILES_BUCKET).remove([file.storage_path]);
  }
  return { ok: true };
}
