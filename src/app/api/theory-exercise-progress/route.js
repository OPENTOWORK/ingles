import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { normalizeTopicHref } from '@/lib/normalizeTopicHref';

import {

  computeProgresoPctFromPassedKeys,

  fetchTheoryPassedKeysByTopic,

  recordTheoryExerciseAttempt,

} from '@/lib/levelsTeoriaProgressDb';

import { isTheoryExercisePassed, theoryExerciseStorageKey } from '@/lib/theoryExerciseMeta';

import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';



function getAdminClient() {

  const url = getSupabaseUrl();

  const key = getSupabaseServiceRoleKey();

  if (!url || !key) return null;

  return createClient(url, key, {

    auth: { persistSession: false, autoRefreshToken: false },

  });

}



async function getUserFromRequest(request) {

  const authHeader = request.headers.get('authorization');

  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();

  if (!token) return null;



  const url = getSupabaseUrl();

  const anon = getSupabaseAnonKey();

  if (!url || !anon) return null;



  const client = createClient(url, anon);

  const { data, error } = await client.auth.getUser(token);

  if (error || !data?.user) return null;

  return data.user;

}



async function fetchPassedExerciseKeys(admin, userId, topicHref) {

  const { keysByTopic } = await fetchTheoryPassedKeysByTopic(admin, userId);

  const href = normalizeTopicHref(topicHref);

  const keySet = keysByTopic[href];

  return keySet ? [...keySet] : [];

}



export async function GET(request) {

  try {

    const user = await getUserFromRequest(request);

    if (!user) {

      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    }



    const url = new URL(request.url);

    const all = url.searchParams.get('all') === '1';

    const topicHref = normalizeTopicHref(String(url.searchParams.get('topic_href') || '').trim());



    const admin = getAdminClient();

    if (!admin) {

      return NextResponse.json(all ? { pctByTopic: {} } : { passedKeys: [] });

    }



    if (all) {

      const { keysByTopic, pctByTopic } = await fetchTheoryPassedKeysByTopic(admin, user.id);

      const keysPlain = Object.fromEntries(

        Object.entries(keysByTopic).map(([href, set]) => [href, [...set]]),

      );

      return NextResponse.json({ pctByTopic, keysByTopic: keysPlain });

    }



    if (!topicHref.startsWith('/teoria/')) {

      return NextResponse.json({ error: 'topic_href inválido' }, { status: 400 });

    }



    const passedKeys = await fetchPassedExerciseKeys(admin, user.id, topicHref);

    return NextResponse.json({ passedKeys });

  } catch (error) {

    return NextResponse.json(

      { error: error.message || 'Error al leer progreso de ejercicios' },

      { status: 500 },

    );

  }

}



export async function POST(request) {

  try {

    const user = await getUserFromRequest(request);

    if (!user) {

      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    }



    const body = await request.json();

    const topicHref = normalizeTopicHref(String(body.topic_href || '').trim());

    const exerciseKey = String(body.exercise_key || '').trim();

    const cefrLevel = String(body.cefr_level || 'B2').trim().toUpperCase();

    const topicLevelLabel = String(body.topic_level_label || cefrLevel).trim();

    const score = Number(body.puntuacion ?? body.score ?? 0);



    if (!topicHref.startsWith('/teoria/') || !exerciseKey) {

      return NextResponse.json({ error: 'Datos de ejercicio inválidos' }, { status: 400 });

    }



    if (!Number.isFinite(score) || score < 0 || score > 100) {

      return NextResponse.json({ error: 'Puntuación inválida (0–100).' }, { status: 400 });

    }



    const admin = getAdminClient();

    if (!admin) {

      return NextResponse.json(

        { saved: false, offline: true, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' },

        { status: 503 },

      );

    }



    const result = await recordTheoryExerciseAttempt(admin, {

      userId: user.id,

      topicHref,

      cefrLevel,

      exerciseKey,

      topicLevelLabel,

      score,

      userEmail: user.email,

    });



    const storageKey = theoryExerciseStorageKey(topicHref, cefrLevel, exerciseKey);

    const passedKeys = result.passedKeys.map((key) => {

      const parts = String(key).split('|');

      return parts[parts.length - 1];

    });



    return NextResponse.json({

      saved: true,

      correct: result.correct,

      score: result.score,

      progreso_pct: result.progresoPct,

      passedKeys,

      counts_for_progress: isTheoryExercisePassed(score),

    });

  } catch (error) {

    console.error('[theory-exercise-progress POST]', error);

    return NextResponse.json(

      { error: error.message || 'Error al guardar progreso de ejercicio' },

      { status: 500 },

    );

  }

}


