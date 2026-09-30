import { NextResponse } from 'next/server';

const MAX_CHARS = 160;
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

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  const text = cleanText(body?.text);
  if (!text || text.length > MAX_CHARS || !/[A-Za-z]/.test(text)) {
    return NextResponse.json(
      { error: 'Select a word or a short phrase.' },
      { status: 400 },
    );
  }

  const key = text.toLowerCase();
  const cached = cache.get(key);
  if (cached) {
    return NextResponse.json({ translation: cached, source: text });
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
  let data;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Translation is unavailable.' }, { status: 502 });
    }
    data = await res.json();
  } catch {
    return NextResponse.json({ error: 'Translation is unavailable.' }, { status: 502 });
  }

  const translation = cleanText(data?.responseData?.translatedText);
  const status = Number(data?.responseStatus);
  if (!translation || status !== 200 || /MYMEMORY WARNING/i.test(translation)) {
    return NextResponse.json({ error: 'Could not translate that selection.' }, { status: 502 });
  }

  remember(key, translation);
  return NextResponse.json({ translation, source: text });
}
