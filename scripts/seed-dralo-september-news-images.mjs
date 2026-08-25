/**
 * Generate cover + inline images for the Dralo September launch news article.
 *
 * Usage:
 *   node scripts/seed-dralo-september-news-images.mjs
 *   node scripts/seed-dralo-september-news-images.mjs --replace
 */
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  BLOG_IMAGE_BUCKET,
  buildBlogImageStoragePath,
  getBlogImagePublicUrl,
} from '../src/lib/blogImageStorage.js';

const ARTICLE_ID = 'd21d64e5-d52d-40c0-9673-72f7b4a2e968';
const ARTICLE_SLUG =
  'dralo-empieza-en-septiembre-una-nueva-forma-de-preparar-tus-examenes-oficiales-de-ingles';

/** Prefer gpt-image-1 (available on this project). */
const IMAGE_MODEL =
  process.env.DRALO_OPENAI_IMAGE_MODEL?.trim() ||
  process.env.OPENAI_IMAGE_MODEL?.trim() ||
  'gpt-image-1';

const IMAGE_SPECS = [
  {
    kind: 'cover',
    size: '1792x1024',
    alt: 'Estudiante concentrada preparando un examen oficial de inglés en septiembre',
    prompt:
      'Award-winning editorial photograph, shot on Canon EOS R5 with 35mm lens, f/2.8, shallow depth of field. ' +
      'A young woman in her early twenties studying English at a clean Scandinavian-style desk near a window. ' +
      'Golden-hour morning light, open notebook, laptop with blurred screen, wireless headphones around neck, ceramic mug. ' +
      'Mood: calm focus, new academic year, September back-to-school energy. ' +
      'Color grading: warm neutrals, soft cream walls, muted sage accents. ' +
      'Ultra photorealistic, natural skin texture, no AI artifacts, no text, no logos, no watermark, no collage.',
  },
  {
    kind: 'inline',
    size: '1792x1024',
    alt: 'Práctica de reading, writing, listening y speaking para exámenes oficiales de inglés',
    prompt:
      'Single cohesive premium stock photo, not a collage. Overhead flat-lay on a light oak desk: ' +
      'English exam preparation materials arranged with intentional negative space — open textbook, pen, ' +
      'headphones, smartphone playing audio, handwritten notes, highlighter. ' +
      'Soft diffused daylight from the left, crisp shadows, magazine-quality product photography. ' +
      'Palette: white, pale blue, warm wood. Photorealistic, sharp detail, no people, no text legible, no logos.',
  },
  {
    kind: 'inline',
    size: '1792x1024',
    alt: 'Estudiante practicando speaking y listening con auriculares antes del examen',
    prompt:
      'Cinematic lifestyle photograph, 50mm lens, natural window light. ' +
      'Young man practicing English speaking alone in a bright apartment corner: laptop on stand, ' +
      'microphone visible, confident posture, slight smile as if answering an oral exam question. ' +
      'Background softly blurred bookshelves and plant. Authentic European student home, not a corporate office. ' +
      'Photorealistic, editorial quality, warm and trustworthy tone. No text on screens, no logos, no watermark.',
  },
];

function isGptImageModel(model) {
  return /^gpt-image/i.test(String(model || ''));
}

function isDalle3Model(model) {
  return String(model || '').startsWith('dall-e-3');
}

async function imageItemToBuffer(item) {
  if (item?.b64_json) {
    return Buffer.from(item.b64_json, 'base64');
  }
  if (item?.url) {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error('Could not download generated image');
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error('Image generation returned no data');
}

async function generateImageBuffer(client, model, prompt, size) {
  const gptImage = isGptImageModel(model);
  const dalle3 = isDalle3Model(model);

  /** @type {Record<string, unknown>} */
  const params = {
    model,
    prompt,
    n: 1,
    size: size || (dalle3 ? '1792x1024' : '1024x1024'),
  };

  if (gptImage) {
    params.quality = 'high';
    params.output_format = 'png';
  } else if (dalle3) {
    params.quality = 'hd';
    params.response_format = 'b64_json';
  } else {
    params.response_format = 'b64_json';
  }

  try {
    const response = await client.images.generate(params);
    return await imageItemToBuffer(response.data?.[0]);
  } catch (err) {
    const param = err?.error?.param || err?.param;
    if (param !== 'response_format') throw err;
    const { response_format: _rf, ...withoutFormat } = params;
    const response = await client.images.generate(withoutFormat);
    return await imageItemToBuffer(response.data?.[0]);
  }
}

async function uploadToBlogStorage(supabase, articleId, kind, buffer) {
  const mimeType = 'image/png';
  const path = buildBlogImageStoragePath(articleId, mimeType, kind);
  const { error } = await supabase.storage.from(BLOG_IMAGE_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: mimeType,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message || 'Upload failed');
  return getBlogImagePublicUrl(supabase, path);
}

function figureHtml(url, alt) {
  const safeAlt = String(alt || '').replace(/"/g, '');
  return `<figure><img src="${url}" alt="${safeAlt}" loading="lazy" /></figure>`;
}

/** Remove previously injected blog figures so re-runs do not stack images. */
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

async function main() {
  const env = loadEnvLocal();
  const openaiKey = env.OPENAI_API_KEY?.trim();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY in .env.local');
    process.exit(1);
  }
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: article, error: fetchError } = await supabase
    .from('blog_articles')
    .select('id, slug, title, content, cover_image_url')
    .eq('id', ARTICLE_ID)
    .maybeSingle();

  if (fetchError || !article) {
    console.error('Article not found:', fetchError?.message || ARTICLE_ID);
    process.exit(1);
  }

  const model = IMAGE_MODEL;
  console.log(`Regenerating ${IMAGE_SPECS.length} images with ${model} (HD)…`);

  let coverUrl = '';
  const inlineResults = [];

  for (const spec of IMAGE_SPECS) {
    console.log(`→ ${spec.kind}: ${spec.alt.slice(0, 70)}…`);
    const buffer = await generateImageBuffer(openai, model, spec.prompt, spec.size);
    const url = await uploadToBlogStorage(supabase, ARTICLE_ID, spec.kind, buffer);
    console.log(`  uploaded: ${url}`);

    if (spec.kind === 'cover') {
      coverUrl = url;
    } else {
      inlineResults.push({ url, alt: spec.alt });
    }
  }

  const baseContent = stripExistingFigures(article.content);
  const nextContent = injectInlineImages(baseContent, inlineResults);

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

  console.log('\nDone — article updated with new images.');
  console.log('Cover:', coverUrl);
  console.log('Inline images:', inlineResults.map((i) => i.url).join('\n  '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
