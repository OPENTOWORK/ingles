export function normalizeDictionaryWord(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z'-]/gi, '');
}

export function buildSavedWordPayload(entry, targetLanguage) {
  const word = normalizeDictionaryWord(entry?.word);
  if (!word) return null;

  const ai = entry?.ai || {};
  const firstMeaning = entry?.meanings?.[0];

  return {
    word,
    translation: ai.wordInTargetLanguage || null,
    phonetic: entry?.phonetic || null,
    definition:
      ai.definitionInTargetLanguage ||
      firstMeaning?.definition ||
      null,
    target_language: targetLanguage || entry?.targetLanguage || 'es',
    cefr_level: ai.cefrLevel || null,
    entry_data: {
      word: entry.word,
      phonetic: entry.phonetic,
      audioUrl: entry.audioUrl,
      meanings: (entry.meanings || []).slice(0, 4),
      ai: ai.cefrLevel || ai.wordInTargetLanguage || ai.definitionInTargetLanguage
        ? {
            cefrLevel: ai.cefrLevel || null,
            wordInTargetLanguage: ai.wordInTargetLanguage || null,
            definitionInTargetLanguage: ai.definitionInTargetLanguage || null,
            grammarCategory: ai.grammarCategory || null,
            usageTip: ai.usageTip || null,
          }
        : null,
    },
  };
}

export function mapSavedWordRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    word: row.word,
    translation: row.translation || '',
    phonetic: row.phonetic || '',
    definition: row.definition || '',
    targetLanguage: row.target_language,
    cefrLevel: row.cefr_level || '',
    entryData: row.entry_data || null,
    createdAt: row.created_at,
  };
}
