/**
 * Upload pre-generated local images to Supabase and patch the September news article.
 *
 * Usage:
 *   node scripts/upload-dralo-news-images-from-files.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  BLOG_IMAGE_BUCKET,
  buildBlogImageStoragePath,
  getBlogImagePublicUrl,
} from '../src/lib/blogImageStorage.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.cursor',
  'projects',
  'c-Users-Usuario-Webs-english-practice',
  'assets',
);

const ARTICLE_ID = 'd21d64e5-d52d-40c0-9673-72f7b4a2e968';

const FILES = [
  {
    file: 'dralo-news-cover-v2.png',
    kind: 'cover',
    alt: 'Estudiante concentrada preparando un examen oficial de inglés en septiembre',
  },
  {
    file: 'dralo-news-inline-exam-prep-v2.png',
    kind: 'inline',
    alt: 'Material de preparación para exámenes oficiales de inglés: reading, writing, listening y speaking',
  },
  {
    file: 'dralo-news-inline-speaking-v2.png',
    kind: 'inline',
    alt: 'Estudiante practicando speaking y listening con auriculares antes del examen',
  },
];

function figureHtml(url, alt) {
  const safeAlt = String(alt || '').replace(/"/g, '');
  return `<figure><img src="${url}" alt="${safeAlt}" loading="lazy" /></figure>`;
}

function stripExistingFigures(html = '') {
  return String(html)
    .replace(/<figure>\s*<img\b[^>]*>\s*<\/figure>\s*(<div><br\s*\/?><\/div>)?/gi, '')
    .trim();
}

function injectInlineImages(content, inlineUrls) {
  let html = stripExistingFigures(content);
  const markers = [
    'Por eso, Dralo no pretende ser una academia de inglés tradicional',
    'Uno de los aspectos principales de Dralo será precisamente la práctica.',
    'En el caso del Reading, por ejemplo, no basta con entender un texto.',
  ];

  inlineUrls.forEach((item, index) => {
    const marker = markers[index];
    if (!marker || !html.includes(marker)) return;
    const snippet = `${figureHtml(item.url, item.alt)}<div><br /></div>`;
    html = html.replace(marker, `${snippet}${marker}`);
  });

  return html;
}

async function uploadFile(supabase, articleId, kind, filePath) {
  const buffer = readFileSync(filePath);
  const mimeType = 'image/png';
  const storagePath = buildBlogImageStoragePath(articleId, mimeType, kind);
  const { error } = await supabase.storage.from(BLOG_IMAGE_BUCKET).upload(storagePath, buffer, {
    upsert: true,
    contentType: mimeType,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message || 'Upload failed');
  return getBlogImagePublicUrl(supabase, storagePath);
}

async function main() {
  loadEnvLocal();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: article, error: fetchError } = await supabase
    .from('blog_articles')
    .select('id, content')
    .eq('id', ARTICLE_ID)
    .maybeSingle();

  if (fetchError || !article) {
    console.error('Article not found');
    process.exit(1);
  }

  let coverUrl = '';
  const inlineResults = [];

  for (const spec of FILES) {
    const filePath = path.join(ASSETS, spec.file);
    console.log(`Uploading ${spec.file}…`);
    const url = await uploadFile(supabase, ARTICLE_ID, spec.kind, filePath);
    console.log(`  → ${url}`);
    if (spec.kind === 'cover') coverUrl = url;
    else inlineResults.push({ url, alt: spec.alt });
  }

  const nextContent = injectInlineImages(article.content, inlineResults);

  const { error: updateError } = await supabase
    .from('blog_articles')
    .update({
      cover_image_url: coverUrl,
      content: nextContent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ARTICLE_ID);

  if (updateError) {
    console.error('Update failed:', updateError.message);
    process.exit(1);
  }

  console.log('\nDone.');
  console.log('Cover:', coverUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
