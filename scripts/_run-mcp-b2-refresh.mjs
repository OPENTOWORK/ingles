import fs from "fs";

const dir = new URL("./", import.meta.url);
const read = (name) =>
  fs.readFileSync(new URL(name, dir), "utf8").trim();

let updates = "";
for (let i = 1; i <= 5; i++) {
  updates += read(`_upd_${i}.sql`) + "\n";
}
const txUpdates = `begin;\n${updates}commit;\n`;
fs.writeFileSync(new URL("./_mcp_tx_updates.sql", dir), txUpdates, "utf8");
console.log("updates bytes", Buffer.byteLength(txUpdates, "utf8"));
