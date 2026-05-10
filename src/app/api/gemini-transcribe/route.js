import { NextResponse } from 'next/server';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_OPENAI_STT_MODEL = 'gpt-4o-mini-transcribe';

async function transcribeWithOpenAI(audio, openAiApiKey) {
  const model = process.env.OPENAI_STT_MODEL || DEFAULT_OPENAI_STT_MODEL;
  const form = new FormData();
  form.append('model', model);
  form.append('file', audio, 'speech.webm');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    let details = response.statusText;
    try {
      const err = await response.json();
      details = err?.error?.message || details;
    } catch {
      /* ignore */
    }
    throw new Error(`OpenAI STT failed (${model}): ${details}`);
  }

  const payload = await response.json();
  const text = String(payload?.text || '').trim();
  return { text, provider: 'openai', model };
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const audio = form.get('audio');

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio file.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY.' }, { status: 500 });
    }

    const model = process.env.GEMINI_STT_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const openAiApiKey = process.env.OPENAI_API_KEY;

    const arrayBuffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = audio.type || 'audio/webm';

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Transcribe this spoken English audio exactly. Return only the transcript text with no extra commentary.',
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let details = response.statusText;
      try {
        const err = await response.json();
        details = err?.error?.message || details;
      } catch {
        /* ignore */
      }
      const lowerDetails = String(details || '').toLowerCase();
      const quotaLike = lowerDetails.includes('quota') || lowerDetails.includes('rate') || lowerDetails.includes('resource_exhausted');
      if (openAiApiKey) {
        try {
          const openAiResult = await transcribeWithOpenAI(audio, openAiApiKey);
          if (openAiResult.text) {
            return NextResponse.json({
              text: openAiResult.text,
              provider: openAiResult.provider,
              model: openAiResult.model,
              fallbackFrom: `gemini:${model}`,
            });
          }
        } catch (openAiError) {
          const hint = quotaLike
            ? ' Gemini has no available quota and OpenAI fallback also failed.'
            : ' Gemini failed and OpenAI fallback also failed.';
          return NextResponse.json(
            {
              error: `Gemini transcription failed (model: ${model})`,
              details: `${details}${hint} ${openAiError?.message || ''}`.trim(),
            },
            { status: 502 },
          );
        }
      }

      const hint = quotaLike
        ? ' Your key/model has no available quota right now. Configure a key with billing or set OPENAI_API_KEY for automatic STT fallback.'
        : '';
      return NextResponse.json({ error: `Gemini transcription failed (model: ${model})`, details: `${details}${hint}` }, { status: 502 });
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    return NextResponse.json({ text, provider: 'gemini', model });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal transcription error', details: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

