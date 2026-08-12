import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    let rel = specifier.slice(2);
    if (!/\.(js|mjs|cjs|json|ts|tsx)$/i.test(rel)) {
      const base = path.join(root, 'src', rel);
      if (fs.existsSync(`${base}.ts`)) rel += '.ts';
      else if (fs.existsSync(`${base}.tsx`)) rel += '.tsx';
      else rel += '.js';
    }
    const target = pathToFileURL(path.join(root, 'src', rel)).href;
    return nextResolve(target, context);
  }

  if (
    specifier.startsWith('.') &&
    !/\.(js|mjs|cjs|json|ts|tsx)$/i.test(specifier) &&
    context.parentURL
  ) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const base = path.resolve(parentDir, specifier);
    if (fs.existsSync(`${base}.ts`)) {
      return nextResolve(pathToFileURL(`${base}.ts`).href, context);
    }
    if (fs.existsSync(`${base}.tsx`)) {
      return nextResolve(pathToFileURL(`${base}.tsx`).href, context);
    }
  }

  return nextResolve(specifier, context);
}
