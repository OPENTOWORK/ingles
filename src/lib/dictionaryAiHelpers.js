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

export function buildAskDraloPrompt(word, question, enrichment) {
  const ctx = enrichment ? JSON.stringify(enrichment).slice(0, 2500) : '';
  return `You are Dralo, a Cambridge English coach. A student is in the Dictionary tool.

English word: "${word}"
${ctx ? `Context JSON: ${ctx}` : ''}

Student question (answer in Spanish, clear and exam-focused): ${question}`;
}
