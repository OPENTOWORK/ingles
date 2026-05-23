import fs from 'fs';
import path from 'path';

const levels = ['a2', 'b1', 'b2', 'c1', 'c2'];
const skills = [
  { folder: 'listening', data: 'listening' },
  { folder: 'speaking', data: 'speaking' },
  { folder: 'writing', data: 'writing' },
  { folder: 'reading-and-use-of-english', data: 'reading-and-use-of-english' },
];

const template = (slug, skillFolder, dataName) => `'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/${slug}-${dataName}';
import { partInfo } from '@/data/part-info/${slug}-${dataName}';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="${slug}"
      skillFolder="${skillFolder}"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
`;

const root = 'src/app/niveles';

for (const slug of levels) {
  for (const { folder, data } of skills) {
    const pagePath = path.join(root, slug, folder, '[part]', 'page.js');
    if (!fs.existsSync(pagePath)) {
      console.log('missing', pagePath);
      continue;
    }
    fs.writeFileSync(pagePath, template(slug, folder, data));
    console.log('patched', pagePath);
  }
}
