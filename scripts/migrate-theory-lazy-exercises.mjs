/**
 * Pasa ejercicios como factory (getExercises) para carga diferida en TheoryLayout.
 * Run: node scripts/migrate-theory-lazy-exercises.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const TEORIA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'teoria');

function migrate(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const buildMatch = content.match(/const exercises = (\w+)\(\);/);
  if (buildMatch) {
    const fn = buildMatch[1];
    content = content.replace(/const exercises = \w+\(\);\s*\n/, '');
    content = content.replace(/exercises=\{exercises\}/, `getExercises={${fn}}`);
    changed = true;
  }

  if (changed) fs.writeFileSync(filePath, content);
  return changed;
}

let n = 0;
for (const dir of fs.readdirSync(TEORIA)) {
  const page = path.join(TEORIA, dir, 'page.js');
  if (fs.existsSync(page) && migrate(page)) {
    n += 1;
    console.log('✓', dir);
  }
}
console.log(`Updated ${n} pages.`);
