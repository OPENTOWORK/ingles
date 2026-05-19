import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const folder = path.join(__dirname, '..', 'politicas RPD');
const outDir = path.join(__dirname, '..', 'src', 'data', 'legal');

fs.mkdirSync(outDir, { recursive: true });

for (const fname of fs.readdirSync(folder).filter((f) => f.endsWith('.docx'))) {
  const src = path.join(folder, fname);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dralo-docx-'));
  const zipPath = path.join(tmp, 'doc.zip');
  fs.copyFileSync(src, zipPath);
  execSync(
    `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/'/g, "''")}', '${tmp.replace(/'/g, "''")}')"`,
    { stdio: 'pipe' },
  );
  const xml = fs.readFileSync(path.join(tmp, 'word', 'document.xml'), 'utf8');
  const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
  let text = texts.join('');
  text = text.replace(/\s+/g, ' ').trim();

  const slug = fname
    .replace(/\.docx$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const outPath = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(
    outPath,
    JSON.stringify({ source: fname, title: fname.replace(/\.docx$/i, ''), content: text }, null, 2),
    'utf8',
  );
  console.log('Wrote', outPath, 'chars', text.length);
}
