import fs from "fs";
import https from "https";

const PROJECT = "qnazrzvwvkwhkfbqsbmr";
const envPath = new URL("../.env.local", import.meta.url);

function loadToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN)
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  if (!fs.existsSync(envPath)) return "";
  const raw = fs.readFileSync(envPath, "utf8");
  const m = raw.match(/^\s*SUPABASE_ACCESS_TOKEN\s*=\s*(.+)\s*$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function postJson(body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${PROJECT}/database/query`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${body.token}`,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300)
            resolve({ ok: true, data });
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify({ query: body.query }));
    req.end();
  });
}

const token = loadToken();
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN (env or .env.local).");
  process.exit(2);
}

const dir = new URL("./", import.meta.url);
const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith("_exec_") && f.endsWith(".json"))
  .sort();

for (const name of files) {
  const j = JSON.parse(fs.readFileSync(new URL(name, dir), "utf8"));
  await postJson({ token, query: j.query });
  console.log("OK", name);
}
