const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/perfil/page.js');
let s = fs.readFileSync(pagePath, 'utf8');

function parseSectionAttrs(raw) {
  let extraClass = '';
  let style = null;
  const classMatch = raw.match(/profile-section\s+([\w-]+)/);
  if (classMatch && classMatch[1] !== 'profile-section') {
    extraClass = classMatch[1];
  }
  const chartMatch = raw.match(/chart-section/);
  if (chartMatch) extraClass = extraClass ? `${extraClass} chart-section` : 'chart-section';
  const styleMatch = raw.match(/style=\{\{([\s\S]*?)\}\}\}/);
  if (styleMatch) {
    style = `{{ ${styleMatch[1].trim()} }}`;
  }
  return { extraClass, style };
}

function toCollapsible(match, attrs, title, desc, body, useSectionDescClass) {
  if (attrs.includes('profile-section--static')) return match;
  const { extraClass, style } = parseSectionAttrs(attrs);
  const descText = desc ? desc.trim().replace(/\s+/g, ' ') : '';
  const descAttr = descText ? ` description={${JSON.stringify(descText)}}` : '';
  const classAttr = extraClass ? ` className="${extraClass}"` : '';
  const styleAttr = style ? ` style={${style}}` : '';
  return `<ProfileCollapsibleSection title={${JSON.stringify(title.trim())}}${descAttr}${classAttr}${styleAttr}>
${body.trim()}
</ProfileCollapsibleSection>`;
}

let count = 0;

const reHead =
  /<section className="profile-section([^>]*?)>\s*<div className="section-head">\s*<h2>([^<]*)<\/h2>(?:\s*<p className="section-desc">\s*([\s\S]*?)<\/p>)?\s*<\/div>\s*([\s\S]*?)<\/section>/g;

s = s.replace(reHead, (match, attrs, title, desc, body) => {
  count += 1;
  return toCollapsible(match, attrs, title, desc, body);
});

const reHeader =
  /<section className="profile-section([^>]*?)>\s*<div className="section-header">\s*<h2>([^<]*)<\/h2>\s*<p>([^<]*)<\/p>\s*<\/div>\s*([\s\S]*?)<\/section>/g;

s = s.replace(reHeader, (match, attrs, title, desc, body) => {
  count += 1;
  return toCollapsible(match, attrs, title, desc, body);
});

fs.writeFileSync(pagePath, s);
console.log('wrapped', count, 'sections');
