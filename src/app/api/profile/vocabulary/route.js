import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getServiceDb, isSchemaNotReadyError } from '@/lib/teacherAccess';
import {
  buildSavedWordPayload,
  mapSavedWordRow,
  normalizeDictionaryWord,
} from '@/lib/dictionarySavedWords';

const WORD_COLUMNS =
  'id, user_id, word, translation, phonetic, definition, target_language, cefr_level, entry_data, created_at, updated_at';

const TABLE_NAME = 'Dictionary_words';

function notReady() {
  return NextResponse.json(
    { words: [], tablesReady: false, error: 'Vocabulary storage is not ready yet.' },
    { status: 503 },
  );
}

async function context(request) {
  const auth = await getSupabaseUserFromRequest(request);
  if (!auth?.user) return { error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }) };
  return { user: auth.user, db: getServiceDb(auth.accessToken || '') };
}

export async function GET(request) {
  try {
    const auth = await context(request);
    if (auth.error) return auth.error;

    const { data, error } = await auth.db
      .from(TABLE_NAME)
      .select(WORD_COLUMNS)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaNotReadyError(error)) return notReady();
      console.error('[profile/vocabulary GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ words: (data || []).map(mapSavedWordRow), tablesReady: true });
  } catch (error) {
    console.error('[profile/vocabulary GET]', error);
    return NextResponse.json({ error: 'Could not load vocabulary.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await context(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const entry = body?.entry || {
      word: body.word,
      phonetic: body.pronunciation || body.phonetic || '',
      audioUrl: body.audioUrl || '',
      meanings: body.meaning ? [{ definition: body.meaning }] : [],
      ai: {
        wordInTargetLanguage: body.translation || '',
        definitionInTargetLanguage: body.meaning || '',
      },
    };
    const payload = buildSavedWordPayload(entry, body.targetLanguage || 'es');
    if (!payload) {
      return NextResponse.json({ error: 'Write a word to save.' }, { status: 400 });
    }

    const { data, error } = await auth.db
      .from(TABLE_NAME)
      .upsert(
        { user_id: auth.user.id, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,word' },
      )
      .select(WORD_COLUMNS)
      .single();

    if (error) {
      if (isSchemaNotReadyError(error)) return notReady();
      console.error('[profile/vocabulary POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true, word: mapSavedWordRow(data), tablesReady: true });
  } catch (error) {
    console.error('[profile/vocabulary POST]', error);
    return NextResponse.json({ error: 'Could not save the word.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await context(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();
    const word = normalizeDictionaryWord(searchParams.get('word'));
    if (!id && !word) {
      return NextResponse.json({ error: 'Missing word.' }, { status: 400 });
    }

    let query = auth.db.from(TABLE_NAME).delete().eq('user_id', auth.user.id);
    query = id ? query.eq('id', id) : query.eq('word', word);
    const { error } = await query;
    if (error) {
      if (isSchemaNotReadyError(error)) return notReady();
      console.error('[profile/vocabulary DELETE]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[profile/vocabulary DELETE]', error);
    return NextResponse.json({ error: 'Could not delete the word.' }, { status: 500 });
  }
}
