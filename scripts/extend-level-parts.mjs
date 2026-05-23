import fs from 'fs';

const partInfoUpdates = [
  ['src/data/part-info/b1-listening.js', 9],
  ['src/data/part-info/b1-writing.js', 7],
  ['src/data/part-info/b1-speaking.js', 13],
  ['src/data/part-info/c1-listening.js', 11],
  ['src/data/part-info/c1-writing.js', 9],
  ['src/data/part-info/c1-speaking.js', 15],
  ['src/data/part-info/c2-listening.js', 10],
  ['src/data/part-info/c2-writing.js', 8],
  ['src/data/part-info/c2-speaking.js', 14],
];

for (const [file, partMin] of partInfoUpdates) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('extendPartInfoWithGlobalKeys')) {
    console.log('skip', file);
    continue;
  }
  s = s.replace(
    /^export const partInfo = /m,
    "import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';\n\nconst localPartInfo = ",
  );
  s = s.replace(
    /\};\s*$/m,
    `};\n\nexport const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, ${partMin});\n`,
  );
  fs.writeFileSync(file, s);
  console.log('ok', file);
}

const exUpdates = [
  ['src/data/exercises/b1-listening.js', 9, 4],
  ['src/data/exercises/b1-writing.js', 7, 2],
  ['src/data/exercises/b1-speaking.js', 13, 4],
  ['src/data/exercises/b2-writing.js', 8, 2],
  ['src/data/exercises/b2-speaking.js', 14, 4],
  ['src/data/exercises/c1-listening.js', 11, 4],
  ['src/data/exercises/c1-writing.js', 9, 2],
  ['src/data/exercises/c1-speaking.js', 15, 4],
  ['src/data/exercises/c2-listening.js', 10, 4],
  ['src/data/exercises/c2-writing.js', 8, 2],
  ['src/data/exercises/c2-speaking.js', 14, 4],
];

for (const [file, partMin, count] of exUpdates) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('extendExercisesConfigWithGlobalKeys')) {
    console.log('skip ex', file);
    continue;
  }
  const lines = [];
  for (let i = 1; i <= count; i += 1) lines.push(`  "part-${i}": 12,`);
  const block = `const baseExercisesConfig = {\n${lines.join('\n')}\n};`;
  s = s.replace(/export const exercisesConfig = \{[\s\S]*?\};/m, block);
  if (!s.startsWith('import')) {
    s = `import { extendExercisesConfigWithGlobalKeys } from '@/data/exercises/extendExercisesConfig';\n\n${s}`;
  }
  s = s.replace(
    block,
    `${block}\n\nexport const exercisesConfig = extendExercisesConfigWithGlobalKeys(baseExercisesConfig, ${partMin});`,
  );
  fs.writeFileSync(file, s);
  console.log('ok ex', file);
}
