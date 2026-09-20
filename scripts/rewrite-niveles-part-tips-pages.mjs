import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src/app/niveles');
const skills = ['reading-and-use-of-english', 'writing', 'listening', 'speaking'];
const levels = ['a2', 'b1', 'b2', 'c1', 'c2'];

let count = 0;

for (const level of levels) {
  for (const skill of skills) {
    const skillDir = path.join(root, level, skill);
    if (!fs.existsSync(skillDir)) continue;

    for (const name of fs.readdirSync(skillDir)) {
      const match = /^part-(\d+)$/.exec(name);
      if (!match) continue;

      const pagePath = path.join(skillDir, name, 'page.js');
      if (!fs.existsSync(pagePath)) continue;

      const partNum = Number(match[1]);
      const content = `'use client';

import NivelesPartTipsRoute from '@/components/niveles/NivelesPartTipsRoute';

export default function PartTipsPage() {
  return (
    <NivelesPartTipsRoute
      levelSlug="${level}"
      skillFolder="${skill}"
      partNum={${partNum}}
    />
  );
}
`;

      fs.writeFileSync(pagePath, content, 'utf8');
      count += 1;
    }
  }
}

console.log(`Rewrote ${count} niveles part tip pages.`);
