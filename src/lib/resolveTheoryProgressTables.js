/** Resuelve el nombre de tabla de progreso exam theory en Supabase (prod vs script local). */
export const EXAM_THEORY_PROGRESS_TABLES = ['levels_teoria_progreso', 'levels_progreso'];

export const EXAM_THEORY_PUNTUACIONES_TABLES = [
  'levels_teoria_puntuaciones',
  'levels_puntuaciones',
];

export async function queryFirstAvailableTable(admin, tableNames, buildQuery) {
  let lastError = null;
  for (const table of tableNames) {
    const result = await buildQuery(table);
    if (!result.error) {
      return { table, ...result };
    }
    lastError = result.error;
    const msg = String(result.error.message || '').toLowerCase();
    if (msg.includes('does not exist') || msg.includes('schema cache')) {
      continue;
    }
    return { table, ...result };
  }
  return { table: tableNames[0], data: null, error: lastError };
}
