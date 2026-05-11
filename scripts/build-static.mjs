/**
 * Wrapper de build estático que neutraliza temporalmente las API routes
 * incompatibles con `output: 'export'` (force-dynamic o dinámicas con
 * `[param]` sin `generateStaticParams`).
 *
 * Estrategia:
 *   1) Lista todas las API routes y para las problemáticas renombra el
 *      archivo `route.ts|tsx|js|jsx` a `route.<ext>.static-disabled.bak`
 *      para que Next.js no las trate como rutas durante el export.
 *   2) Lanza `npm run build` con NEXT_STATIC_EXPORT=true.
 *   3) Restaura SIEMPRE los nombres originales (incluso si el build falla).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiRoot = join(root, 'src', 'app', 'api');
const BACKUP_SUFFIX = '.static-disabled.bak';

function listRouteFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      listRouteFiles(full, out);
    } else if (entry.isFile() && /^route\.(t|j)sx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const FORCE_DYNAMIC_RE = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]\s*;?/m;

function hasDynamicSegment(filePath) {
  return relative(apiRoot, filePath).split(/[\\/]/).some((seg) => /^\[.+\]$/.test(seg));
}

function shouldDisable(filePath) {
  if (hasDynamicSegment(filePath)) return true;
  try {
    return FORCE_DYNAMIC_RE.test(readFileSync(filePath, 'utf8'));
  } catch {
    return false;
  }
}

const targets = [];
if (existsSync(apiRoot) && statSync(apiRoot).isDirectory()) {
  for (const file of listRouteFiles(apiRoot)) {
    if (shouldDisable(file)) targets.push(file);
  }
}

const renamed = [];
if (targets.length === 0) {
  console.log('build-static: no API routes to neutralize.');
} else {
  console.log(`build-static: disabling ${targets.length} API route file(s) for static export.`);
  for (const file of targets) {
    const backup = file + BACKUP_SUFFIX;
    if (existsSync(backup)) {
      console.error(`build-static: backup already exists (${backup}). Aborting to avoid data loss.`);
      process.exit(1);
    }
    try {
      renameSync(file, backup);
      renamed.push({ file, backup });
    } catch (e) {
      console.error(`build-static: could not disable ${file}:`, e?.message || e);
      for (const r of renamed.reverse()) {
        try { renameSync(r.backup, r.file); } catch {}
      }
      process.exit(1);
    }
  }
}

const isWin = process.platform === 'win32';
const result = spawnSync(isWin ? 'npm run build' : 'npm', isWin ? [] : ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NEXT_STATIC_EXPORT: 'true' },
  shell: isWin,
});

let restoreErrors = 0;
for (const { file, backup } of renamed) {
  try {
    renameSync(backup, file);
  } catch (e) {
    restoreErrors += 1;
    console.error(`build-static: FAILED to restore ${file}:`, e?.message || e);
    console.error(`  manual fix → rename ${backup} back to ${file}`);
  }
}
if (renamed.length > 0 && restoreErrors === 0) {
  console.log('build-static: restored API route filenames.');
}

process.exit(result.status === null ? 1 : result.status);
