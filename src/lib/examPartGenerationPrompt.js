import { resolveDefaultA2ExamPartPrompt } from '@/lib/levelsA2ExamGenerator';
import { resolveDefaultLevelExamPartPrompt } from '@/lib/levelsCambridgeExamGenerator';
import {
  expandExamPartPromptTemplate,
  ensureExamPartJsonSchemaFooter,
} from '@/lib/draloAiExamPrompts';
import { getExamDirections } from '@/lib/draloAiExamPartSpecs';
import { getA2PartDef } from '@/lib/draloAiA2ExamPrompts';
import { getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import {
  fetchExamPartPromptOverride,
  saveExamPartPromptOverride,
} from '@/lib/examPartPromptOverrides';

export function resolveDefaultExamPartGenerationPrompt({
  levelSlug,
  partNumber,
  examSlot = 1,
  topic,
  varietySeed,
}) {
  const slug = String(levelSlug || 'b2').toLowerCase();
  if (slug === 'a2') {
    return resolveDefaultA2ExamPartPrompt({ partNumber, examSlot, topic, varietySeed });
  }
  return resolveDefaultLevelExamPartPrompt({
    levelSlug: slug,
    partNumber,
    examSlot,
    topic,
    varietySeed,
  });
}

/** Convierte HTML del editor de prompts a texto plano para la IA. */
export function promptHtmlToPlainText(value = '') {
  const raw = String(value || '');
  if (!raw.trim()) return '';
  if (!/<[a-z][\s\S]*>/i.test(raw)) return raw;

  return raw
    .replace(/\r\n/g, '\n')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*p\s*>/gi, '\n')
    .replace(/<\/\s*div\s*>/gi, '\n')
    .replace(/<\/\s*li\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Ignora tema/seed embebidos: cambian en cada GET (Date.now) y no indican edición real. */
function stripVarietyNoise(text) {
  return promptHtmlToPlainText(text)
    .replace(/Topic\/theme:[^\n.]*(?:\.[^\n]*)?/gi, '')
    .replace(/Variety seed:\s*\d+\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function promptsMatchStored(defaults, system, user) {
  return (
    stripVarietyNoise(user) === stripVarietyNoise(defaults.user) &&
    stripVarietyNoise(system) === stripVarietyNoise(defaults.system)
  );
}

function buildPromptResponse(defaults, row) {
  const system = String(row?.system_prompt || '').trim() || defaults.system;
  const user = String(row?.user_prompt || '').trim() || defaults.user;
  const isCustom = !promptsMatchStored(defaults, system, user);

  return {
    partTitle: defaults.meta.partTitle,
    partNumber: defaults.meta.partNumber,
    levelSlug: defaults.meta.levelSlug,
    examSlot: defaults.meta.examSlot,
    topic: defaults.meta.topic,
    varietySeed: defaults.meta.varietySeed,
    system,
    user,
    defaultSystem: defaults.system,
    defaultUser: defaults.user,
    isCustom,
    isStored: Boolean(row),
    updatedAt: row?.updated_at || null,
  };
}

/**
 * Garantiza que cada parte tenga su prompt en Supabase (copia del código si aún no existe).
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function ensureExamPartPromptStored(adminDb, options, userId = null) {
  const defaults = resolveDefaultExamPartGenerationPrompt(options);
  const existing = await fetchExamPartPromptOverride(
    adminDb,
    defaults.meta.levelSlug,
    defaults.meta.partNumber,
  );
  if (existing?.user_prompt?.trim()) return existing;

  await saveExamPartPromptOverride(adminDb, {
    levelSlug: defaults.meta.levelSlug,
    partNumber: defaults.meta.partNumber,
    systemPrompt: defaults.system,
    userPrompt: defaults.user,
    userId,
  });

  return fetchExamPartPromptOverride(
    adminDb,
    defaults.meta.levelSlug,
    defaults.meta.partNumber,
  );
}

/**
 * Si el prompt guardado trae Topic/theme + Variety seed, sustituye esa línea
 * por la variedad pedida en esta generación (sin perder el resto del prompt).
 */
function applyFreshVariety(userPrompt, topic, varietySeed) {
  const raw = String(userPrompt || '');
  if (!raw.trim()) return raw;
  if (topic == null && varietySeed == null) return raw;

  const theme = topic || 'general everyday life';
  const seed = varietySeed ?? Date.now();
  const varietyLine = `Topic/theme: ${theme}. Variety seed: ${seed}. Create completely NEW content.`;

  if (/Topic\/theme:/i.test(raw)) {
    return raw.replace(
      /Topic\/theme:[^\n]*Variety seed:[^\n]*/i,
      varietyLine,
    );
  }
  return raw;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient | null | undefined} adminDb
 */
export async function resolveEffectiveExamPartGenerationPrompt(adminDb, options) {
  const defaults = resolveDefaultExamPartGenerationPrompt(options);

  if (!adminDb) {
    return {
      system: defaults.system,
      user: defaults.user,
      defaultSystem: defaults.system,
      defaultUser: defaults.user,
      meta: defaults.meta,
      isCustom: false,
      updatedAt: null,
    };
  }

  const row = await fetchExamPartPromptOverride(
    adminDb,
    defaults.meta.levelSlug,
    defaults.meta.partNumber,
  );

  if (!row?.user_prompt?.trim()) {
    return {
      system: defaults.system,
      user: defaults.user,
      defaultSystem: defaults.system,
      defaultUser: defaults.user,
      meta: defaults.meta,
      isCustom: false,
      updatedAt: null,
    };
  }

  const system = promptHtmlToPlainText(
    String(row.system_prompt || '').trim() || defaults.system,
  );
  const userPlain = promptHtmlToPlainText(String(row.user_prompt).trim());
  const slug = defaults.meta.levelSlug;
  const partNumber = defaults.meta.partNumber;
  const partDef =
    slug === 'a2' ? getA2PartDef(partNumber) : getLevelExamPartDef(slug, partNumber);
  const directions = partDef
    ? getExamDirections(partDef.mode, partDef.activity)
    : '';
  const expanded = expandExamPartPromptTemplate(userPlain, {
    topic: options?.topic ?? defaults.meta.topic,
    varietySeed: options?.varietySeed ?? defaults.meta.varietySeed,
    directions,
  });
  const withSchema = ensureExamPartJsonSchemaFooter(expanded, defaults.user);
  const user = applyFreshVariety(
    withSchema,
    options?.topic ?? defaults.meta.topic,
    options?.varietySeed ?? defaults.meta.varietySeed,
  );

  return {
    system,
    user,
    defaultSystem: defaults.system,
    defaultUser: defaults.user,
    meta: defaults.meta,
    isCustom: !promptsMatchStored(defaults, system, String(row.user_prompt).trim()),
    updatedAt: row.updated_at || null,
  };
}

export async function getExamPartPromptForAdmin(adminDb, options, userId = null) {
  const defaults = resolveDefaultExamPartGenerationPrompt(options);
  const row = await ensureExamPartPromptStored(adminDb, options, userId);
  return buildPromptResponse(defaults, row);
}

export async function saveExamPartPromptForAdmin(adminDb, payload, userId) {
  const defaults = resolveDefaultExamPartGenerationPrompt(payload);
  const userPrompt = String(payload.userPrompt ?? '').trim();
  if (!promptHtmlToPlainText(userPrompt)) {
    throw new Error('El prompt de usuario no puede estar vacío. Usa «Empezar en blanco» y escribe uno nuevo.');
  }

  const systemPrompt = String(payload.systemPrompt || '').trim() || defaults.system;

  await saveExamPartPromptOverride(adminDb, {
    levelSlug: defaults.meta.levelSlug,
    partNumber: defaults.meta.partNumber,
    systemPrompt,
    userPrompt,
    userId,
  });

  const row = await fetchExamPartPromptOverride(
    adminDb,
    defaults.meta.levelSlug,
    defaults.meta.partNumber,
  );
  return buildPromptResponse(defaults, row);
}

/** Restaura en Supabase el prompt actual del código fuente. */
export async function resetExamPartPromptForAdmin(adminDb, options, userId = null) {
  const defaults = resolveDefaultExamPartGenerationPrompt(options);

  await saveExamPartPromptOverride(adminDb, {
    levelSlug: defaults.meta.levelSlug,
    partNumber: defaults.meta.partNumber,
    systemPrompt: defaults.system,
    userPrompt: defaults.user,
    userId,
  });

  const row = await fetchExamPartPromptOverride(
    adminDb,
    defaults.meta.levelSlug,
    defaults.meta.partNumber,
  );
  return buildPromptResponse(defaults, row);
}
