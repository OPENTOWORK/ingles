import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const isPlaceholder = (value = '') =>
  !value ||
  value.includes('tu_supabase_url_aqui') ||
  value.includes('tu_supabase_anon_key_aqui');

const isValidHttpUrl = (value = '') => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl =
  !isPlaceholder(envSupabaseUrl) && isValidHttpUrl(envSupabaseUrl)
    ? envSupabaseUrl
    : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = !isPlaceholder(envSupabaseAnonKey)
  ? envSupabaseAnonKey
  : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Compatibility layer: maps legacy frontend table names to current Supabase names.
const TABLE_NAME_MAP = {
  profiles: 'Usuarios_y_Perfil_profiles',
  user_profiles: 'Usuarios_y_Perfil_users',
  teachers: 'Usuarios_y_Perfil_profiles',
  user_preferences: 'perfil_preferencias_estudio',
  study_sessions: 'estudio_sesiones',
  training_sessions: 'training_intentos',
  answers: 'levels_respuestas',
  theory_progress: 'teoria_favoritos',
  user_progress: 'perfil_progreso',
  user_achievements: 'perfil_objetivos',
  user_stats: 'perfil_rendimiento',
  adaptive_learning_data: 'perfil_recomendaciones',
  exercises: 'training_ejercicios',
  achievements: 'perfil_objetivos',
  contact_tickets: 'contacto_soporte',
  internal_messages: 'contacto_mensajes',
};

const originalFrom = supabase.from.bind(supabase);
supabase.from = (relation) => originalFrom(TABLE_NAME_MAP[relation] || relation);
