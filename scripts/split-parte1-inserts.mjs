import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "generated");
const a = fs.readFileSync(path.join(dir, "part1_exec_a.sql"), "utf8").replace(/;+$/, "").trim();
const b = fs.readFileSync(path.join(dir, "part1_exec_b.sql"), "utf8").replace(/;+$/, "").trim();

const i1 = a.indexOf("-- EJERCICIO 1");
const i2 = a.indexOf("-- EJERCICIO 2");
const exam1 = a.slice(i1, i2).trim();
const exam2 = a.slice(i2).trim();

const i4 = b.indexOf("-- EJERCICIO 4");
const i5 = b.indexOf("-- EJERCICIO 5");
const exam3 = b.slice(0, i4).trim();
const exam4 = b.slice(i4, i5).trim();
const exam5 = b.slice(i5).trim();

const files = [
  ["part1_inserts_exam1.sql", exam1],
  ["part1_inserts_exam2.sql", exam2],
  ["part1_inserts_exam3.sql", exam3],
  ["part1_inserts_exam4.sql", exam4],
  ["part1_inserts_exam5.sql", exam5],
];

for (const [name, content] of files) {
  fs.writeFileSync(path.join(dir, name), content + ";", "utf8");
  console.log(name, content.length + 1);
}
