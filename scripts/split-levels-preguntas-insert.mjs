import fs from "fs";

const s = fs.readFileSync("c:/Users/Usuario/Downloads/levels_preguntas_rows.sql", "utf8");
const idx = s.indexOf("VALUES");
if (idx === -1) throw new Error("VALUES not found");
const body = s.slice(idx + 6).trim();
// Between rows: ), ('  (next row starts with quoted uuid)
const tuples = body.split(/\),\s*\(\'/);
console.log("tuple count", tuples.length);
// Fix: first tuple lost leading (' ; last has trailing ');
tuples[0] = tuples[0].replace(/^\s*\(/, "(");
const last = tuples.length - 1;
tuples[last] = tuples[last].replace(/\);\s*$/, ")");
console.log("first start", tuples[0].slice(0, 60));
console.log("last end", tuples[last].slice(-40));
