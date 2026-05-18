/** URL y anon key por defecto (mismo proyecto que supabaseClient). */
export const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
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

export function getSupabaseUrl() {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!isPlaceholder(env) && isValidHttpUrl(env)) return env;
  return DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey() {
  const env = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isPlaceholder(env)) return env;
  return DEFAULT_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ''
  );
}
