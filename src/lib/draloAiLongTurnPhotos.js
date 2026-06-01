import { getDraloOpenAI, cambridgeChatCompletion } from '@/lib/draloAiEngine';

function parseJsonObject(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Invalid JSON from model');
  }
}

function getImageModel() {
  return (
    process.env.DRALO_OPENAI_IMAGE_MODEL?.trim() ||
    process.env.OPENAI_IMAGE_MODEL?.trim() ||
    'gpt-image-1'
  );
}

function isGptImageModel(model) {
  return /^gpt-image/i.test(String(model || ''));
}

function isDalle3Model(model) {
  return String(model || '').startsWith('dall-e-3');
}

function buildImagePrompt(sceneDescription) {
  return (
    `Photorealistic photograph for a Cambridge English B2 speaking exam (FCE Part 2). ` +
    `${sceneDescription}. Natural lighting, realistic everyday people, candid scene, ` +
    `sharp focus, no text overlays, no logos, no watermark.`
  );
}

/**
 * @param {string} [level]
 * @param {string} [excludeTheme]
 */
export async function generateLongTurnPhotoBrief(level = 'B2', excludeTheme = '') {
  const exclude = String(excludeTheme || '').trim();
  const { text } = await cambridgeChatCompletion({
    system: 'Design one fresh FCE Speaking Part 2 photograph pair. Return JSON only.',
    messages: [
      {
        role: 'user',
        content: `Create ONE fresh comparison topic for ${level} Speaking Part 2.
${exclude ? `Do NOT reuse or closely repeat the theme "${exclude}".` : ''}
Pick a new everyday topic (travel, hobbies, work, celebrations, pets, technology, etc.).
Return JSON only with keys:
- theme (short English label, 1–3 words)
- photoA (what Photo A shows — one clear scene)
- photoB (what Photo B shows — contrasting scene, same broad topic)
- comparePrompt (one sentence telling the candidate to compare both photos and give opinions)`,
      },
    ],
    temperature: 0.95,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const data = parseJsonObject(text);
  const theme = String(data.theme || 'Topic').trim();
  const photoA = String(data.photoA || 'People in an everyday situation').trim();
  const photoB = String(data.photoB || 'People in a different everyday situation').trim();
  const comparePrompt =
    String(data.comparePrompt || 'Compare the two photographs and say which you prefer and why.').trim();

  return { theme, photoA, photoB, comparePrompt };
}

async function imageItemToDataUrl(item) {
  if (item?.b64_json) {
    return `data:image/png;base64,${item.b64_json}`;
  }
  if (item?.url) {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error('Could not download generated image');
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buf.toString('base64')}`;
  }
  throw new Error('Image generation returned no data');
}

async function generateOneExamPhoto(client, model, sceneDescription) {
  const prompt = buildImagePrompt(sceneDescription);
  const gptImage = isGptImageModel(model);
  const dalle3 = isDalle3Model(model);

  /** @type {Record<string, unknown>} */
  const params = {
    model,
    prompt,
    n: 1,
    size: gptImage || dalle3 ? '1024x1024' : '512x512',
  };

  if (gptImage) {
    params.quality = 'medium';
    params.output_format = 'png';
  } else if (dalle3) {
    params.quality = 'standard';
    params.response_format = 'b64_json';
  } else {
    params.response_format = 'b64_json';
  }

  try {
    const response = await client.images.generate(params);
    return await imageItemToDataUrl(response.data?.[0]);
  } catch (err) {
    const param = err?.error?.param || err?.param;
    if (param !== 'response_format') throw err;
    const { response_format: _rf, ...withoutFormat } = params;
    const response = await client.images.generate(withoutFormat);
    return await imageItemToDataUrl(response.data?.[0]);
  }
}

/**
 * Tema nuevo + dos fotos generadas (no usa assets locales).
 * @param {{ level?: string, excludeTheme?: string }} [options]
 */
export async function generateLongTurnPhotoSet(options = {}) {
  const client = getDraloOpenAI();
  if (!client) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Image generation needs the same OpenAI key as DRALO AI.',
    );
  }

  const brief = await generateLongTurnPhotoBrief(
    options.level || 'B2',
    options.excludeTheme || '',
  );
  const model = getImageModel();

  const [urlA, urlB] = await Promise.all([
    generateOneExamPhoto(client, model, brief.photoA),
    generateOneExamPhoto(client, model, brief.photoB),
  ]);

  return {
    urls: [urlA, urlB],
    meta: brief,
  };
}
