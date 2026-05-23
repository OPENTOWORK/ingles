/**
 * Añade claves part-{global} copiando part-{local} para la numeración global del paper.
 */
export function extendExercisesConfigWithGlobalKeys(config, partMin) {
  const result = { ...config };
  for (const key of Object.keys(config)) {
    const m = key.match(/^part-(\d+)$/);
    if (!m) continue;
    const local = Number(m[1]);
    const global = partMin + local - 1;
    const globalKey = `part-${global}`;
    if (globalKey !== key && result[globalKey] == null) {
      result[globalKey] = config[key];
    }
  }
  return result;
}
