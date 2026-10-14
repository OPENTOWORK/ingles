export const STAFF_TASK_FILES_BUCKET = 'staff-task-files';
export const STAFF_TASK_FILES_MAX_COUNT = 10;

export function formatTaskFileCount(count) {
  const total = Number(count) || 0;
  if (total <= 0) return '';
  return total === 1 ? '1 archivo' : `${total} archivos`;
}

export function formatTaskFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
