export function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Invalid JSON from model');
  }
}

export function languageNameForPrompt(code) {
  const map = {
    es: 'Spanish',
    eu: 'Basque',
    ca: 'Catalan',
    gl: 'Galician',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ar: 'Arabic',
    zh: 'Chinese (Simplified)',
    ja: 'Japanese',
  };
  return map[code] || 'Spanish';
}

export function buildWordEnrichPrompt(word, baseEntry, targetLang) {
  const lang = languageNameForPrompt(targetLang);
  const defs = (baseEntry?.meanings || [])
    .slice(0, 6)
    .map((m) => `- ${m.partOfSpeech}: ${m.definition}`)
    .join('\n');

  return `Analyze the English word "${word}" for Spanish-speaking Cambridge exam learners.
Dictionary hints:
${defs || '(no definitions)'}

Return ONLY valid JSON:
{
  "wordInTargetLanguage": "main translation in ${lang} (single word or short phrase)",
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "cefrNote": "one line why this level",
  "grammarCategory": "noun|verb|adjective|adverb|phrasal verb|idiom|collocation|conjunction|preposition|other",
  "linguisticTags": ["up to 8 short tags e.g. countable noun, present perfect marker, conditional clause, false friend, collocation, formal register"],
  "isFalseFriend": boolean,
  "falseFriendNote": "string or null — warn Spanish speakers if looks like a Spanish word but differs",
  "collocations": ["2-5 common collocations in English"],
  "examRelevance": "one line PET/FCE/CAE relevance",
  "definitionInTargetLanguage": "clear definition in ${lang} for learners",
  "usageTip": "one practical tip",
  "askDraloSuggestion": "example question in Spanish like ¿Cuándo uso X vs Y?"
}`;
}

export function buildTranslatePrompt(text, targetLang) {
  const lang = languageNameForPrompt(targetLang);
  return `Analyze this English sentence/phrase for learners and translate to ${lang}.

English: """${text}"""

Return ONLY valid JSON:
{
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "cefrNote": "why this complexity level",
  "grammarAnalysis": ["list grammar points: e.g. present perfect, third conditional, passive, phrasal verb give up"],
  "linguisticTags": ["short tags: register, false friend traps, collocation, etc."],
  "pronunciationNotes": "2-4 lines in Spanish: stress, linking, weak forms, intonation — guide for reading aloud",
  "literalTranslation": "word-by-word or exam-style translation in ${lang}",
  "naturalTranslation": "how a native would say it in ${lang}",
  "translationNotes": "brief contrast literal vs natural in Spanish"
}`;
}

export function buildFallbackLookupPrompt(word, targetLang) {
  const lang = languageNameForPrompt(targetLang);
  return `The external English dictionary is unavailable. Define the English word "${word}" for Cambridge exam learners.

If "${word}" is not a real English word or phrase, set "known" to false and leave the other fields empty.

Return ONLY valid JSON:
{
  "known": true,
  "phonetic": "IPA between slashes, or an empty string",
  "meanings": [
    {
      "partOfSpeech": "noun|verb|adjective|adverb|other",
      "definition": "clear English definition",
      "example": "one short example sentence, or null",
      "synonyms": ["up to 4"]
    }
  ],
  "wordInTargetLanguage": "main translation in ${lang}",
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "cefrNote": "one line why this level",
  "grammarCategory": "noun|verb|adjective|adverb|phrasal verb|idiom|collocation|conjunction|preposition|other",
  "linguisticTags": ["up to 8 short tags"],
  "isFalseFriend": false,
  "falseFriendNote": null,
  "collocations": ["2-5 common collocations"],
  "examRelevance": "one line PET/FCE/CAE relevance",
  "definitionInTargetLanguage": "clear definition in ${lang}",
  "usageTip": "one practical tip",
  "askDraloSuggestion": "example question in Spanish like ¿Cuándo uso X vs Y?"
}`;
}

export function entryFromFallbackLookup(word, raw) {
  if (!raw || raw.known === false) return null;
  const meanings = (Array.isArray(raw.meanings) ? raw.meanings : [])
    .map((item) => ({
      partOfSpeech: String(item?.partOfSpeech || '').trim().slice(0, 40),
      definition: String(item?.definition || '').trim(),
      example: item?.example ? String(item.example).trim() : null,
      synonyms: (Array.isArray(item?.synonyms) ? item.synonyms : [])
        .map((synonym) => String(synonym || '').trim())
        .filter(Boolean)
        .slice(0, 5),
    }))
    .filter((item) => item.definition)
    .slice(0, 8);
  if (!meanings.length) return null;

  const phonetic = String(raw.phonetic || '').trim();
  return {
    word,
    phonetic: phonetic && phonetic.length <= 80 ? phonetic : null,
    audioUrl: null,
    meanings,
    source: 'dralo-ai',
    ai: {
      wordInTargetLanguage: String(raw.wordInTargetLanguage || '').trim() || null,
      cefrLevel: String(raw.cefrLevel || '').trim() || null,
      cefrNote: String(raw.cefrNote || '').trim() || null,
      grammarCategory: String(raw.grammarCategory || '').trim() || null,
      linguisticTags: Array.isArray(raw.linguisticTags)
        ? raw.linguisticTags.map((tag) => String(tag || '').trim()).filter(Boolean).slice(0, 8)
        : [],
      isFalseFriend: Boolean(raw.isFalseFriend),
      falseFriendNote: raw.falseFriendNote ? String(raw.falseFriendNote).trim() : null,
      collocations: Array.isArray(raw.collocations)
        ? raw.collocations.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5)
        : [],
      examRelevance: String(raw.examRelevance || '').trim() || null,
      definitionInTargetLanguage: String(raw.definitionInTargetLanguage || '').trim() || null,
      usageTip: String(raw.usageTip || '').trim() || null,
      askDraloSuggestion: String(raw.askDraloSuggestion || '').trim() || null,
    },
  };
}

export function buildAskDraloPrompt(word, question, enrichment) {
  const ctx = enrichment ? JSON.stringify(enrichment).slice(0, 2500) : '';
  return `You are Dralo, a Cambridge English coach. A student is in the Dictionary tool.

English word: "${word}"
${ctx ? `Context JSON: ${ctx}` : ''}

Student question (answer in Spanish, clear and exam-focused): ${question}`;
}
