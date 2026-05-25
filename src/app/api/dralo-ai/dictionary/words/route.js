import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceDb, isSchemaNotReadyError } from '@/lib/teacherAccess';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  buildSavedWordPayload,
  mapSavedWordRow,
  normalizeDictionaryWord,
} from '@/lib/dictionarySavedWords';
import { DEFAULT_DICTIONARY_LANGUAGE } from '@/data/dictionaryLanguages';

const WORD_COLUMNS =
  'id, user_id, word, translation, phonetic, definition, target_language, cefr_level, entry_data, created_at, updated_at';

const TABLE_NAME = 'Dictionary_words';

async function getAuthedContext(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return { error: 'Unauthorized', status: 401 };

  const client = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return {
    user: data.user,
    token,
    db: getServiceDb(token),
  };
}

function normalizeTargetLang(code) {
  const c = String(code || DEFAULT_DICTIONARY_LANGUAGE).toLowerCase().slice(0, 5);
  const allowed = ['es', 'eu', 'ca', 'gl', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja'];
  return allowed.includes(c) ? c : DEFAULT_DICTIONARY_LANGUAGE;
}

function schemaNotReadyResponse() {
  return NextResponse.json(
    {
      words: [],
      tablesReady: false,
      error:
        'Dictionary_words table is not ready. Run scripts/dictionary_words.sql in Supabase.',
    },
    { status: 503 },
  );
}

export async function GET(request) {
  try {
    const auth = await getAuthedContext(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const { data, error } = await db
      .from(TABLE_NAME)
      .select(WORD_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyResponse();
      }
      console.error('[dictionary/words GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      words: (data || []).map(mapSavedWordRow),
      tablesReady: true,
    });
  } catch (error) {
    console.error('[dictionary/words GET]', error);
    return NextResponse.json(
      { error: error.message || 'Could not load saved words' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthedContext(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const entry = body?.entry;
    const targetLanguage = normalizeTargetLang(body?.targetLanguage || entry?.targetLanguage);
    const payload = buildSavedWordPayload(entry, targetLanguage);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid word entry.' }, { status: 400 });
    }

    const { user, db } = auth;
    const row = {
      user_id: user.id,
      ...payload,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from(TABLE_NAME)
      .upsert(row, { onConflict: 'user_id,word' })
      .select(WORD_COLUMNS)
      .single();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyResponse();
      }
      console.error('[dictionary/words POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true, word: mapSavedWordRow(data), tablesReady: true });
  } catch (error) {
    console.error('[dictionary/words POST]', error);
    return NextResponse.json(
      { error: error.message || 'Could not save word' },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const auth = await getAuthedContext(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();
    const word = normalizeDictionaryWord(searchParams.get('word'));

    if (!id && !word) {
      return NextResponse.json({ error: 'Missing id or word.' }, { status: 400 });
    }

    const { user, db } = auth;
    let query = db.from(TABLE_NAME).delete().eq('user_id', user.id);
    if (id) query = query.eq('id', id);
    else query = query.eq('word', word);

    const { error } = await query;

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyResponse();
      }
      console.error('[dictionary/words DELETE]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true, tablesReady: true });
  } catch (error) {
    console.error('[dictionary/words DELETE]', error);
    return NextResponse.json(
      { error: error.message || 'Could not remove word' },
      { status: 500 },
    );
  }
}
