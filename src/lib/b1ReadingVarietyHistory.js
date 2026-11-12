import { allocateExamVariety } from '@/lib/examVarietyAllocation';

/**
 * B1 development-only topic allocation. Reads actual persisted selections and
 * refuses to generate if history is inaccessible (no silent random fallback).
 * A full multi-dimensional Content Brief bank will replace these initial themes.
 */
export async function chooseB1ReadingVariety(adminDb, { examSlot, partNumber, themes }) {
  const { data, error } = await adminDb
    .from('exam_generation_variety_history')
    .select('exam_slot,part_number,topic_id,context_id,genre_id,title_pattern_family,created_at')
    .eq('level_slug', 'b1')
    .order('created_at', { ascending: true });
  if (error) throw new Error('B1 variety history unavailable: ' + error.message);
  const relevant = (data || []).filter((row) =>
    row.part_number === partNumber || row.exam_slot === examSlot);
  const history = relevant.map((row) => ({
    topicId: row.topic_id, contextId: row.context_id,
    genreId: row.genre_id, titlePatternFamily: row.title_pattern_family,
  }));
  const candidates = themes.map((theme, index) => ({
    topicId: 'theme-' + index, topic: theme,
  }));
  const existing = (data || []).find((row) => row.exam_slot === examSlot && row.part_number === partNumber);
  if (existing) {
    const match = candidates.find((candidate) => candidate.topicId === existing.topic_id);
    if (!match) throw new Error('Existing B1 topic allocation no longer exists in the topic bank.');
    return match;
  }
  const chosen = allocateExamVariety(candidates, history, { recentWindow: 11 });
  return chosen;
}

export async function recordB1ReadingVariety(adminDb, { examSlot, partNumber, chosen }) {
  const { error } = await adminDb.from('exam_generation_variety_history').upsert({
    level_slug: 'b1', exam_slot: examSlot, part_number: partNumber,
    topic_id: chosen.topicId, context_id: chosen.contextId || null,
    genre_id: chosen.genreId || null,
    title_pattern_family: chosen.titlePatternFamily || null,
  }, { onConflict: 'level_slug,exam_slot,part_number' });
  if (error) throw new Error('B1 variety history could not be saved: ' + error.message);
}
