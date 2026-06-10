import { supabase } from '@/utils/supabaseClient';
import { buildStudyNotesContextKey } from '@/lib/studyNotes';

export function noteFromRow(row) {
  if (!row) return null;
  const context = row.contexto && typeof row.contexto === 'object' ? row.contexto : {};
  return {
    id: row.id,
    title: row.titulo || '',
    content: row.contenido || '',
    tags: Array.isArray(row.etiquetas) ? row.etiquetas : [],
    context: row.context_key ? { ...context, contextKey: row.context_key } : context,
    contextKey: row.context_key || null,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export function noteToRow(note, userId) {
  const contextKey =
    note.contextKey ||
    note.context?.contextKey ||
    (note.context ? buildStudyNotesContextKey(note.context) : null);

  return {
    usuario_id: userId,
    titulo: String(note.title || 'New note').trim() || 'New note',
    contenido: String(note.content || ''),
    etiquetas: Array.isArray(note.tags) ? note.tags : [],
    contexto: note.context && typeof note.context === 'object' ? note.context : {},
    context_key: contextKey || null,
  };
}

export async function fetchStudyNotesFromDb(userId) {
  const { data, error } = await supabase
    .from('levels_notas')
    .select('id, titulo, contenido, etiquetas, contexto, context_key, creado_en, actualizado_en')
    .eq('usuario_id', userId)
    .order('actualizado_en', { ascending: false });

  if (error) throw error;
  return (data || []).map(noteFromRow);
}

export async function insertStudyNoteToDb(userId, note) {
  const payload = noteToRow(note, userId);
  const { data, error } = await supabase
    .from('levels_notas')
    .insert(payload)
    .select('id, titulo, contenido, etiquetas, contexto, context_key, creado_en, actualizado_en')
    .single();

  if (error) throw error;
  return noteFromRow(data);
}

export async function updateStudyNoteInDb(noteId, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.titulo = String(updates.title || '').trim() || 'New note';
  if (updates.content !== undefined) payload.contenido = String(updates.content || '');
  if (updates.tags !== undefined) payload.etiquetas = Array.isArray(updates.tags) ? updates.tags : [];
  if (updates.context !== undefined) {
    payload.contexto = updates.context && typeof updates.context === 'object' ? updates.context : {};
    const contextKey = updates.context?.contextKey || null;
    if (contextKey) payload.context_key = contextKey;
  }

  const { data, error } = await supabase
    .from('levels_notas')
    .update(payload)
    .eq('id', noteId)
    .select('id, titulo, contenido, etiquetas, contexto, context_key, creado_en, actualizado_en')
    .single();

  if (error) throw error;
  return noteFromRow(data);
}

export async function deleteStudyNoteFromDb(noteId) {
  const { error } = await supabase.from('levels_notas').delete().eq('id', noteId);
  if (error) throw error;
}

export async function upsertScratchNoteToDb(userId, context, contextLabel = '') {
  const contextKey = buildStudyNotesContextKey(context);
  const { data: existing, error: fetchError } = await supabase
    .from('levels_notas')
    .select('id, titulo, contenido, etiquetas, contexto, context_key, creado_en, actualizado_en')
    .eq('usuario_id', userId)
    .eq('context_key', contextKey)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return noteFromRow(existing);

  return insertStudyNoteToDb(userId, {
    title: contextLabel ? `Session · ${contextLabel}` : 'Session notes',
    content: '',
    tags: ['exam-practice'],
    context: { ...context, contextKey },
    contextKey,
  });
}

export async function migrateLocalNotesToDb(userId, localNotes) {
  if (!localNotes?.length) return;
  const remote = await fetchStudyNotesFromDb(userId);
  if (remote.length > 0) return;

  for (const note of localNotes) {
    try {
      await insertStudyNoteToDb(userId, note);
    } catch (err) {
      console.warn('[studyNotes] local migration row failed', err);
    }
  }
}
