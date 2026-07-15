import { resolveDefaultA2ExamPartPrompt } from '@/lib/levelsA2ExamGenerator';
import { resolveDefaultLevelExamPartPrompt } from '@/lib/levelsCambridgeExamGenerator';
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

function promptsMatchStored(defaults, system, user) {
  return (
    String(user || '').trim() === defaults.user.trim() &&
    String(system || '').trim() === defaults.system.trim()
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

  const system = String(row.system_prompt || '').trim() || defaults.system;
  const user = String(row.user_prompt).trim();

  return {
    system,
    user,
    defaultSystem: defaults.system,
    defaultUser: defaults.user,
    meta: defaults.meta,
    isCustom: !promptsMatchStored(defaults, system, user),
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
  if (!userPrompt) {
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
