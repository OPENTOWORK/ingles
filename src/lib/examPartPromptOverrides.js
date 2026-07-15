const TABLE = 'levels_exam_part_prompt_overrides';

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function fetchExamPartPromptOverride(adminDb, levelSlug, partNumber) {
  const slug = String(levelSlug || '').toLowerCase();
  const part = Number(partNumber);
  if (!slug || !Number.isFinite(part)) return null;

  const { data, error } = await adminDb
    .from(TABLE)
    .select('level_slug, part_number, system_prompt, user_prompt, updated_at, updated_by')
    .eq('level_slug', slug)
    .eq('part_number', part)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function saveExamPartPromptOverride(
  adminDb,
  { levelSlug, partNumber, systemPrompt, userPrompt, userId },
) {
  const slug = String(levelSlug || '').toLowerCase();
  const part = Number(partNumber);
  const row = {
    level_slug: slug,
    part_number: part,
    system_prompt: String(systemPrompt || '').trim(),
    user_prompt: String(userPrompt || '').trim(),
    updated_by: userId || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await adminDb.from(TABLE).upsert(row, {
    onConflict: 'level_slug,part_number',
  });
  if (error) throw new Error(error.message);
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function deleteExamPartPromptOverride(adminDb, levelSlug, partNumber) {
  const slug = String(levelSlug || '').toLowerCase();
  const part = Number(partNumber);
  const { error } = await adminDb
    .from(TABLE)
    .delete()
    .eq('level_slug', slug)
    .eq('part_number', part);

  if (error) throw new Error(error.message);
}
