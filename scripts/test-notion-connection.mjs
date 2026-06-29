import { readFileSync } from 'fs';

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const key = process.env.NOTION_API_KEY;
const dbId = process.env.NOTION_MEETINGS_DATABASE_ID;
const pageId = process.env.NOTION_MEETINGS_PAGE_ID;
const parentId = pageId || dbId || '3608519385d180ce8077ef1f55144e82';

async function notion(path) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Notion-Version': '2022-06-28',
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

if (!key) {
  console.error('NOTION_API_KEY missing');
  process.exit(1);
}

const db = await notion(`/databases/${dbId}`);
console.log(
  'Configured DB:',
  dbId,
  '->',
  db.status,
  db.data?.message || db.data?.title?.[0]?.plain_text || 'OK',
);

const page = await notion(`/pages/${parentId}`);
console.log(
  'English Department page:',
  page.status,
  page.data?.message || (page.data?.object === 'page' ? `page OK: ${page.data?.properties?.title?.title?.[0]?.plain_text || ''}` : JSON.stringify(page.data).slice(0, 120)),
);

const urlAsDb = await notion(`/databases/${parentId}`);
console.log(
  'URL ID as database:',
  urlAsDb.status,
  urlAsDb.data?.message || urlAsDb.data?.title?.[0]?.plain_text || 'OK',
);

if (page.status === 200 && page.data?.id) {
  const children = await notion(`/blocks/${parentId}/children?page_size=50`);
  const dbs = (children.data?.results || []).filter((b) => b.type === 'child_database');
  console.log(
    'Child databases on page:',
    dbs.length,
    dbs.map((b) => ({ id: b.id, title: b.child_database?.title })),
  );
}
