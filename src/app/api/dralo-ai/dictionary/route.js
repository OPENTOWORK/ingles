import { NextResponse } from 'next/server';
import { draloChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import {
  buildAskDraloPrompt,
  buildTranslatePrompt,
  buildWordEnrichPrompt,
  languageNameForPrompt,
  parseJsonFromModel,
} from '@/lib/dictionaryAiHelpers';
import { DEFAULT_DICTIONARY_LANGUAGE } from '@/data/dictionaryLanguages';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 100;
const ENRICH_TIMEOUT_MS = 14_000;

export const maxDuration = 60;

/** @type {Map<string, { n: number; reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64) || 'unknown';
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

function tryConsumeRate(ip) {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

function normalizeWord(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z'-]/gi, '');
}

function normalizeTargetLang(code) {
  const c = String(code || DEFAULT_DICTIONARY_LANGUAGE).toLowerCase().slice(0, 5);
  const allowed = ['es', 'eu', 'ca', 'gl', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja'];
  return allowed.includes(c) ? c : DEFAULT_DICTIONARY_LANGUAGE;
}

function pickAudioUrl(phonetics = []) {
  for (const p of phonetics) {
    const url = String(p?.audio || '').trim();
    if (url.startsWith('http')) return url;
  }
  return null;
}

function pickPhonetic(phonetics = []) {
  for (const p of phonetics) {
    const t = String(p?.text || '').trim();
    if (t) return t;
  }
  return null;
}

function parseDictionaryEntries(entries) {
  if (!Array.isArray(entries) || !entries.length) return null;

  const meanings = [];
  for (const entry of entries) {
    const word = entry.word || '';
    const phonetic = pickPhonetic(entry.phonetics);
    const audioUrl = pickAudioUrl(entry.phonetics);

    for (const block of entry.meanings || []) {
      const partOfSpeech = block.partOfSpeech || '';
      for (const def of block.definitions || []) {
        if (!def?.definition) continue;
        meanings.push({
          partOfSpeech,
          definition: def.definition,
          example: def.example || null,
          synonyms: (def.synonyms || []).slice(0, 5),
        });
      }
    }

    return {
      word,
      phonetic,
      audioUrl,
      meanings: meanings.slice(0, 12),
      source: 'dictionaryapi.dev',
    };
  }

  return null;
}

async function fetchBaseEntry(word) {
  const w = normalizeWord(word);
  if (!w) return { error: 'Enter an English word.' };

  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
    { cache: 'no-store' },
  );

  if (res.status === 404) {
    return { error: `We couldn't find "${w}" in the dictionary.` };
  }
  if (!res.ok) {
    return { error: 'The dictionary is unavailable right now. Please try again shortly.' };
  }

  const data = await res.json();
  const parsed = parseDictionaryEntries(data);
  if (!parsed?.meanings?.length) {
    return { error: `No definitions found for "${w}".` };
  }
  return { entry: parsed };
}

async function enrichWordWithAi(word, baseEntry, targetLang) {
  const { text } = await draloChatCompletion({
    system:
      'For this lookup only: act as a Cambridge English lexicographer. Return only JSON. Be accurate about CEFR, false friends for Spanish speakers, and grammar labels.',
    messages: [{ role: 'user', content: buildWordEnrichPrompt(word, baseEntry, targetLang) }],
    temperature: 0.35,
    response_format: { type: 'json_object' },
  });
  return parseJsonFromModel(text || '{}');
}

function enrichWithTimeout(word, baseEntry, targetLang) {
  return Promise.race([
    enrichWordWithAi(word, baseEntry, targetLang),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('enrich_timeout')), ENRICH_TIMEOUT_MS);
    }),
  ]);
}

async function lookupWord(word, targetLang) {
  const base = await fetchBaseEntry(word);
  if (base.error) return base;

  if (!isDraloOpenAIConfigured()) {
    return {
      entry: {
        ...base.entry,
        targetLanguage: targetLang,
        ai: null,
        aiUnavailable: true,
      },
    };
  }

  try {
    const ai = await enrichWithTimeout(base.entry.word, base.entry, targetLang);
    return {
      entry: {
        ...base.entry,
        targetLanguage: targetLang,
        ai,
        aiUnavailable: false,
      },
    };
  } catch (e) {
    console.error('[dictionary enrich]', e?.message || e);
    return {
      entry: {
        ...base.entry,
        targetLanguage: targetLang,
        ai: null,
        aiUnavailable: true,
      },
    };
  }
}

async function translatePhrase(text, targetLang) {
  const input = String(text || '').trim();
  if (!input) return { error: 'Enter an English phrase.' };
  if (input.length > 2000) return { error: 'The phrase is too long (max 2000 characters).' };

  if (!isDraloOpenAIConfigured()) {
    return {
      error:
        'Advanced translation requires OPENAI_API_KEY on the server (DRALO AI GPT engine).',
    };
  }

  try {
    const { text } = await draloChatCompletion({
      system: `For this translation only: return only JSON. Target language: ${languageNameForPrompt(targetLang)}.`,
      messages: [{ role: 'user', content: buildTranslatePrompt(input, targetLang) }],
      temperature: 0.35,
      response_format: { type: 'json_object' },
    });
    const analysis = parseJsonFromModel(text || '{}');
    return {
      phrase: input,
      targetLanguage: targetLang,
      analysis,
    };
  } catch (e) {
    console.error('[dictionary translate]', e?.message || e);
    return { error: 'Could not translate the phrase.' };
  }
}

async function askDralo(word, question, enrichment) {
  const w = normalizeWord(word) || String(word || '').trim();
  const q = String(question || '').trim();
  if (!w) return { error: 'No word in context.' };
  if (!q) return { error: 'Enter a question for Dralo.' };

  if (!isDraloOpenAIConfigured()) {
    return { error: 'Asking Dralo requires OPENAI_API_KEY on the server (DRALO AI GPT engine).' };
  }

  try {
    const { text: answer } = await draloChatCompletion({
      system:
        'Answer vocabulary questions clearly in English. Be concise, with examples.',
      messages: [{ role: 'user', content: buildAskDraloPrompt(w, q, enrichment) }],
      temperature: 0.5,
    });
    if (!answer) return { error: 'Dralo returned no response.' };
    return { answer, word: w };
  } catch (e) {
    console.error('[dictionary ask-dralo]', e?.message || e);
    return { error: 'Could not get a response from Dralo.' };
  }
}

export async function POST(req) {
  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const action = String(body?.action || 'lookup');
    const targetLang = normalizeTargetLang(body?.targetLanguage);

    if (action === 'lookup') {
      const result = await lookupWord(body?.word, targetLang);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    if (action === 'translate') {
      const result = await translatePhrase(body?.text, targetLang);
      const status = result.error ? 400 : 200;
      return NextResponse.json(result, { status });
    }

    if (action === 'ask-dralo') {
      const result = await askDralo(body?.word, body?.question, body?.enrichment);
      const status = result.error ? 400 : 200;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (e) {
    console.error('[dralo-ai/dictionary]', e?.message || e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
