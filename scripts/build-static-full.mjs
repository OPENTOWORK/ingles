/**
 * Export estático completo: borra `.next` y `out` y lanza el build con NEXT_STATIC_EXPORT.
 * Así se evitan exports a medias (~pocas rutas) y errores de chunks tipo ./8948.js.
 *
 * Uso: para el `npm run dev` antes, luego `npm run build:static:full`
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const name of ['.next', 'out']) {
  const p = join(root, name);
  try {
    rmSync(p, { recursive: true, force: true });
    console.log(`build-static-full: removed ${name}/`);
  } catch (e) {
    console.warn(`build-static-full: could not remove ${name}:`, e?.message || e);
  }
}

// Windows: invoking `npm.cmd` without a shell can exit non‑zero without a usable `out/`.
// Using the shell keeps PATH / npm shim behavior consistent with a normal terminal.
const isWin = process.platform === 'win32';
const result = spawnSync(isWin ? 'npm run build' : 'npm', isWin ? [] : ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NEXT_STATIC_EXPORT: 'true' },
  shell: isWin,
});

process.exit(result.status === null ? 1 : result.status);
