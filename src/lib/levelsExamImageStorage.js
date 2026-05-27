import { getDraloOpenAI } from '@/lib/draloAiEngine';
import { getSupabaseUrl } from '@/lib/supabaseEnv';
import { asGeneratedArray } from '@/lib/draloAiA2ExamPrompts';

const BUCKET = 'Levels_Images';

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

function buildA2KeyImagePrompt(sceneDescription) {
  return (
    `Simple black-and-white line drawing for a Cambridge A2 Key English exam. ` +
    `${sceneDescription}. Clean exam-style illustration, no text, no watermark, ` +
    `no colour, clear outlines, white background, suitable for teenagers.`
  );
}

const A2_P1_STIMULUS_STYLES = {
  classified_ad:
    'Newspaper-style FOR SALE classified advertisement in a rectangular box, simple bicycle icon, phone number line, black and white line art.',
  text_message:
    'Smartphone screen with one SMS chat bubble on white background, realistic phone outline, black and white exam illustration.',
  shop_sign:
    'Shop window sign or door poster with bold shop name and offer text, black and white line drawing.',
  public_sign:
    'Outdoor sign mounted on a brick wall, bold title and smaller lines of information, black and white Cambridge exam style.',
  email_note:
    'Short informal email on paper or screen with From/To lines and message body, black and white line art.',
};

/** Reading Part 1: notice / SMS / sign with readable English text in the graphic. */
function buildA2ReadingStimulusPrompt({ stimulusType, message, imageScene }) {
  const text = String(message || '')
    .replace(/\n/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
  const kind = stimulusType || 'notice';
  const style = A2_P1_STIMULUS_STYLES[kind] || A2_P1_STIMULUS_STYLES.classified_ad;
  return (
    `Cambridge A2 Key (KET) Reading Part 1 examination material, professional print quality, black and white only. ` +
    `${style} ` +
    `Layout must match official Cambridge sample tests. ` +
    `All of this English text must appear clearly and legibly in the image (exact wording): "${text}". ` +
    `${imageScene || ''} ` +
    `High contrast, clean margins, no watermark, no colour, no extra decorative text.`
  );
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

async function generateImageBuffer(client, model, sceneDescription) {
  const prompt = buildA2KeyImagePrompt(sceneDescription);
  const gptImage = isGptImageModel(model);
  const dalle3 = isDalle3Model(model);

  /** @type {Record<string, unknown>} */
  const params = {
    model,
    prompt,
    n: 1,
    size: gptImage || dalle3 ? '1536x1024' : '512x512',
  };

  if (gptImage) {
    params.quality = 'high';
    params.output_format = 'png';
  } else if (dalle3) {
    params.quality = 'standard';
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

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function uploadExamImage(adminDb, { path, imageBuffer, contentType = 'image/png' }) {
  const { error } = await adminDb.storage.from(BUCKET).upload(path, imageBuffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Image storage upload failed: ${error.message}`);

  const base = getSupabaseUrl()?.replace(/\/$/, '');
  const encoded = path.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

export function partNeedsGeneratedImages(partNumber) {
  return [1, 7, 8, 14].includes(Number(partNumber));
}

/**
 * Genera imágenes con OpenAI y devuelve el payload enriquecido con imageUrl.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function attachGeneratedImages(adminDb, {
  generated,
  partNumber,
  examSlot,
  levelLabel = 'A2',
}) {
  const client = getDraloOpenAI();
  if (!client) {
    console.warn('[levelsExamImage] OPENAI_API_KEY missing — skipping images');
    return generated;
  }

  const model = getImageModel();
  const n = Number(partNumber);
  const out = { ...generated };
  const slot = examSlot ?? 1;

  async function uploadScene(scene, fileSuffix) {
    const sceneText = String(scene || '').trim();
    if (!sceneText) return null;
    try {
      const buf = await generateImageBuffer(client, model, sceneText);
      const fileName = `Parte ${n} - ${levelLabel} - ${slot} - ${fileSuffix}.png`;
      return await uploadExamImage(adminDb, { path: fileName, imageBuffer: buf });
    } catch (err) {
      console.warn('[levelsExamImage] Failed', fileSuffix, err?.message || err);
      return null;
    }
  }

  if (n === 1) {
    const questions = asGeneratedArray(generated.questions);
    const enrichedQs = [];
    for (const q of questions) {
      const num = q.number ?? enrichedQs.length + 1;
      const scene =
        q.imageScene ||
        `${q.stimulusType || 'notice'}: ${String(q.message || '').slice(0, 120)}`;
      const prompt = buildA2ReadingStimulusPrompt({
        stimulusType: q.stimulusType,
        message: q.message,
        imageScene: scene,
      });
      let imageUrl = q.imageUrl || null;
      try {
        const buf = await generateImageBuffer(client, model, prompt);
        const fileName = `Parte ${n} - ${levelLabel} - ${slot} - q${num}.png`;
        imageUrl = await uploadExamImage(adminDb, { path: fileName, imageBuffer: buf });
      } catch (err) {
        console.warn('[levelsExamImage] Part 1 q', num, err?.message || err);
      }
      enrichedQs.push({ ...q, imageUrl: imageUrl || q.imageUrl });
    }
    out.questions = enrichedQs;
  }

  if (n === 7) {
    const prompts = asGeneratedArray(generated.picturePrompts);
    if (prompts.length) {
      const enriched = [];
      for (let i = 0; i < prompts.length; i += 1) {
        const p = prompts[i];
        const scene =
          typeof p === 'string' ? p : p.scene || p.description || p.caption || `Picture ${i + 1}`;
        const url = await uploadScene(scene, `story-${i + 1}`);
        enriched.push(
          typeof p === 'string'
            ? { label: `Picture ${i + 1}`, scene: p, imageUrl: url }
            : { ...p, imageUrl: url || p.imageUrl },
        );
      }
      out.picturePrompts = enriched;
    }
  }

  if (n === 8) {
    const questions = asGeneratedArray(generated.questions);
    const enrichedQs = [];
    for (const q of questions) {
      const num = q.number ?? enrichedQs.length + 1;
      const imageOptions = asGeneratedArray(q.imageOptions);
      if (!imageOptions.length) {
        enrichedQs.push(q);
        continue;
      }
      const opts = [];
      for (const opt of imageOptions) {
        const letter = String(opt.letter || opt.id || '').toUpperCase().charAt(0);
        const scene = opt.scene || opt.description || opt.text || '';
        const url = await uploadScene(scene, `q${num}-${letter}`);
        opts.push({ ...opt, letter, imageUrl: url || opt.imageUrl });
      }
      enrichedQs.push({ ...q, imageOptions: opts });
    }
    out.questions = enrichedQs;
  }

  if (n === 14) {
    const prompts = asGeneratedArray(generated.picturePrompts);
    if (prompts.length) {
      const enriched = [];
      for (let i = 0; i < prompts.length; i += 1) {
        const p = prompts[i];
        const scene =
          typeof p === 'string' ? p : p.scene || p.description || p.caption || `Photo ${i + 1}`;
        const url = await uploadScene(scene, `speaking-${i + 1}`);
        enriched.push(
          typeof p === 'string'
            ? { label: `Picture ${i + 1}`, scene: p, imageUrl: url }
            : { ...p, imageUrl: url || p.imageUrl },
        );
      }
      out.picturePrompts = enriched;
    }
  }

  return out;
}
