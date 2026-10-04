import { NextResponse } from 'next/server';

const MAX_CHARS = 160;
const EXPLANATION_MAX_CHARS = 900;
const CHUNK_CHARS = 140;
const CACHE_MAX = 300;

/** @type {Map<string, string>} */
const cache = new Map();

function cleanText(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim();
}

function remember(key, translation) {
  cache.delete(key);
  cache.set(key, translation);
  if (cache.size <= CACHE_MAX) return;
  const oldest = cache.keys().next().value;
  if (oldest !== undefined) cache.delete(oldest);
}

function splitForTranslation(text) {
  if (text.length <= CHUNK_CHARS) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const parts = [];
  let current = '';
  for (const sentence of sentences) {
    const piece = cleanText(sentence);
    if (!piece) continue;
    if (piece.length > CHUNK_CHARS) {
      if (current) parts.push(current);
      current = '';
      const words = piece.split(' ');
      let chunk = '';
      for (const word of words) {
        const next = chunk ? `${chunk} ${word}` : word;
        if (next.length > CHUNK_CHARS && chunk) {
          parts.push(chunk);
          chunk = word;
        } else {
          chunk = next;
        }
      }
      if (chunk) parts.push(chunk);
      continue;
    }
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > CHUNK_CHARS && current) {
      parts.push(current);
      current = piece;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

async function translateChunk(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return '';
  const data = await res.json();
  const translation = cleanText(data?.responseData?.translatedText);
  const status = Number(data?.responseStatus);
  if (!translation || status !== 200 || /MYMEMORY WARNING/i.test(translation)) return '';
  return translation;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  const explanation = body?.kind === 'explanation';
  const maxChars = explanation ? EXPLANATION_MAX_CHARS : MAX_CHARS;
  const text = cleanText(body?.text);
  if (!text || text.length > maxChars || !/[A-Za-z]/.test(text)) {
    return NextResponse.json(
      { error: explanation ? 'That explanation is too long to translate.' : 'Select a word or a short phrase.' },
      { status: 400 },
    );
  }

  const key = text.toLowerCase();
  const cached = cache.get(key);
  if (cached) {
    return NextResponse.json({ translation: cached, source: text });
  }

  try {
    const parts = explanation ? splitForTranslation(text) : [text];
    const translated = [];
    for (const part of parts) {
      const chunk = await translateChunk(part);
      if (!chunk) {
        return NextResponse.json({ error: 'Could not translate that selection.' }, { status: 502 });
      }
      translated.push(chunk);
    }
    const translation = cleanText(translated.join(' '));
    if (!translation) {
      return NextResponse.json({ error: 'Could not translate that selection.' }, { status: 502 });
    }
    remember(key, translation);
    return NextResponse.json({ translation, source: text });
  } catch {
    return NextResponse.json({ error: 'Translation is unavailable.' }, { status: 502 });
  }
}
