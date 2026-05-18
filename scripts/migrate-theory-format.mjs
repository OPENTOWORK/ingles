/**
 * Applies Present Tenses layout conventions across all theory topic pages.
 * Run: node scripts/migrate-theory-format.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEORIA = path.join(__dirname, '..', 'src', 'app', 'teoria');

function migratePage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('translation=')) {
    content = content.replace(/\s*translation=\{[^}]*\}\s*\n/g, '\n');
    content = content.replace(/\s*translation="[^"]*"\s*\n/g, '\n');
    changed = true;
  }

  const styledWrapper =
    /const theoryContent = \(\s*<div\s+style=\{\{[\s\S]*?#fafbff[\s\S]*?\}\}\s*>\s*\n/;
  if (styledWrapper.test(content)) {
    content = content.replace(styledWrapper, 'const theoryContent = (\n    <>\n');
    content = content.replace(
      /\n    <\/motion.div>\s*\n  \);\s*\n\s*const exercises/,
      '\n    </>\n  );\n\n  const exercises',
    );
    content = content.replace(
      /\n    <\/div>\s*\n  \);\s*\n\s*const exercises/,
      '\n    </>\n  );\n\n  const exercises',
    );
    changed = true;
  } else if (/const theoryContent = \(\s*<div>\s*\n/.test(content)) {
    content = content.replace(/const theoryContent = \(\s*<div>\s*\n/, 'const theoryContent = (\n    <>\n');
    content = content.replace(
      /\n    <\/div>\s*\n  \);\s*\n\s*const exercises/,
      '\n    </>\n  );\n\n  const exercises',
    );
    changed = true;
  }

  if (
    content.includes('PresentTensesPracticeHub') &&
    !content.includes('enableInlinePractice={false}')
  ) {
    content = content.replace(
      /<TheoryLayout\s*\n/,
      '<TheoryLayout\n      enableInlinePractice={false}\n',
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
  return changed;
}

const dirs = fs.readdirSync(TEORIA, { withFileTypes: true }).filter((d) => d.isDirectory());
let count = 0;
for (const d of dirs) {
  const pagePath = path.join(TEORIA, d.name, 'page.js');
  if (!fs.existsSync(pagePath)) continue;
  if (migratePage(pagePath)) {
    count += 1;
    console.log('✓', d.name);
  }
}
console.log(`\nUpdated ${count} pages.`);
