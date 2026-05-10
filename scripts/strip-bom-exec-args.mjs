import fs from "node:fs";

const base = "c:/Users/Usuario/Webs/english-practice/scripts/generated";
for (const n of [2, 3, 4, 5, 6, 7]) {
  const p = `${base}/exec_arg_${n}.json`;
  let t = fs.readFileSync(p, "utf8");
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  fs.writeFileSync(p, t, "utf8");
}
console.log("bom ok");
