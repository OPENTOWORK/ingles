/**
 * INSERT part 2 abiertas (word only); pregunta_id por examen ya resueltas en proyecto ENGLISH.
 * node scripts/_emit-part2-abiertas-inserts.mjs
 */
function esc(s) {
  return String(s).replace(/'/g, "''");
}

/** Examen orden por nombre ASC: 1→5 coincide con EJERCICIO 1→5 */
const PID_BY_EJ = {
  1: "c9092705-979f-409d-ab34-fb8e5ff15b97",
  2: "eb65a828-b62e-4e4f-911c-0403ca16a4df",
  3: "a14f5109-a581-41b1-ad7a-1ee8746a4e8b",
  4: "6e321bb4-e1f4-49be-87b0-de26974f8e67",
  5: "77946297-8bac-43c8-8d8e-88c962d6ef22",
};

const ANSWERS = {
  1: ["from", "on", "anything", "than", "among", "with", "further", "ahead"],
  2: ["for", "in", "for", "of", "from", "on", "with", "in"],
  3: ["from", "out", "by", "than", "as", "with", "from", "on"],
  4: ["for", "on", "with", "in", "on", "of", "of", "of"],
  5: ["from", "to", "on", "with", "to", "out", "on", "to"],
};

const lines = [];
lines.push(`INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES`);

const tuples = [];
for (let ej = 1; ej <= 5; ej++) {
  const pid = PID_BY_EJ[ej];
  for (const a of ANSWERS[ej]) {
    tuples.push(`('${pid}', '${esc(a)}')`);
  }
}

lines.push(tuples.join(",\n") + ";");

process.stdout.write(lines.join("\n"));
