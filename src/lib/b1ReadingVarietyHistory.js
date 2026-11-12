import { assessExamVariety } from '@/lib/examVarietyAllocation';
import { buildB1TwentyExamAllocation } from '@/lib/b1PreliminaryReadingSpec';

/**
 * B1 development-only topic allocation. Reads actual persisted selections and
 * refuses to generate if history is inaccessible (no silent random fallback).
 * A full multi-dimensional Content Brief bank will replace these initial themes.
 */
export async function chooseB1ReadingVariety(adminDb, { examSlot, partNumber, topicOverride = null }) {
  const { data, error } = await adminDb
    .from('exam_generation_variety_history')
    .select('exam_slot,part_number,topic_id,context_id,genre_id,title_pattern_family,created_at')
    .eq('level_slug', 'b1')
    .order('created_at', { ascending: true });
  if (error) throw new Error('B1 variety history unavailable: ' + error.message);

  const existing = (data || []).find(
    (row) => row.exam_slot === examSlot && row.part_number === partNumber,
  );
  const plan = buildB1TwentyExamAllocation();
  const planned = plan.find((exam) => exam.examNumber === examSlot)?.parts?.find(
    (part) => part.partNumber === partNumber,
  );

  if (existing) {
    if (planned && existing.topic_id !== planned.topicId && !topicOverride) {
      throw new Error('Persisted B1 topic allocation conflicts with the approved 20-exam plan.');
    }
    return {
      topicId: existing.topic_id,
      topic: topicOverride || planned?.topic || existing.topic_id,
      contextId: existing.context_id || planned?.contextId || null,
      context: planned?.context || null,
      grammarFocus: planned?.grammarFocus || null,
      genreId: existing.genre_id || null,
      titlePatternFamily: existing.title_pattern_family || null,
    };
  }

  if (!planned && !topicOverride) {
    throw new Error(`No approved B1 Reading allocation for Exam ${examSlot}, Part ${partNumber}.`);
  }

  const candidate = {
    topicId: planned?.topicId || `manual-${examSlot}-${partNumber}`,
    topic: topicOverride || planned?.topic,
    contextId: planned?.contextId || null,
    context: planned?.context || null,
    grammarFocus: planned?.grammarFocus || null,
  };

  const relevant = (data || []).filter(
    (row) => row.part_number === partNumber || row.exam_slot === examSlot,
  ).map((row) => ({
    topicId: row.topic_id,
    contextId: row.context_id,
    genreId: row.genre_id,
    titlePatternFamily: row.title_pattern_family,
  }));

  const assessment = assessExamVariety(candidate, relevant, { recentWindow: 11 });
  if (!assessment.ok) {
    throw new Error(
      'Approved B1 Reading allocation violates recent-exam variety constraints: ' +
      assessment.repeated.join(', '),
    );
  }
  return { ...candidate, varietyAssessment: assessment };
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
