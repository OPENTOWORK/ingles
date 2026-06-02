import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { fetchTeoriaExercisesForTopic } from '@/lib/fetchTeoriaExercisesForTopic';
import {
  hashTheoryTopicLevelSeed,
  isPlayableTeoriaExercise,
  pickRandomTheoryExercises,
  THEORY_EXERCISES_PER_TOPIC_LEVEL,
} from '@/lib/theoryTopicLevels';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

function getDbClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  const anonKey = getSupabaseAnonKey();
  const key = serviceKey || anonKey;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req) {
  try {
    const db = getDbClient();
    if (!db) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const topicHref = normalizeTopicHref(searchParams.get('topic_href') || '');
    const cefrLevel = searchParams.get('cefr_level') || 'B2';
    const topicLevel = Number.parseInt(searchParams.get('topic_level') || '0', 10);
    const limit = Number.parseInt(
      searchParams.get('limit') || String(THEORY_EXERCISES_PER_TOPIC_LEVEL),
      10,
    );
    const seedParam = searchParams.get('seed');
    const random = searchParams.get('random') === '1' || searchParams.get('random') === 'true';

    if (!topicHref) {
      return NextResponse.json({ error: 'topic_href es obligatorio' }, { status: 400 });
    }

    const pool = await fetchTeoriaExercisesForTopic(db, {
      topicHref,
      cefrLevel,
      allCefrLevels: random || topicLevel > 0,
    });

    const playablePool = pool.filter(isPlayableTeoriaExercise);
    const sessionSize = Math.min(
      THEORY_EXERCISES_PER_TOPIC_LEVEL,
      Math.max(1, Number.isFinite(limit) ? limit : THEORY_EXERCISES_PER_TOPIC_LEVEL),
    );

    let exercises = playablePool;
    if (random && playablePool.length > 0) {
      const seed =
        seedParam != null && seedParam !== ''
          ? Number.parseInt(seedParam, 10)
          : hashTheoryTopicLevelSeed(
              topicHref,
              topicLevel || 1,
              `${Date.now()}-${Math.random()}`,
            );
      exercises = pickRandomTheoryExercises(
        playablePool,
        sessionSize,
        Number.isFinite(seed) ? seed : Date.now(),
      );
    }

    return NextResponse.json({
      exercises,
      count: exercises.length,
      poolCount: playablePool.length,
      requestedCount: sessionSize,
      topicLevel: topicLevel > 0 ? topicLevel : null,
    });
  } catch (err) {
    console.error('[theory-exercises GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
