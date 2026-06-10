'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  STUDY_NOTES_UPDATED_EVENT,
  buildStudyNotesContextKey,
  createStudyNote,
  loadStudyNotes,
  saveStudyNotes,
} from '@/lib/studyNotes';
import {
  deleteStudyNoteFromDb,
  fetchStudyNotesFromDb,
  insertStudyNoteToDb,
  migrateLocalNotesToDb,
  updateStudyNoteInDb,
  upsertScratchNoteToDb,
} from '@/lib/studyNotesRepository';

function sortNotesNewestFirst(notes) {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
  );
}

function notifyNotesUpdated(userId) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDY_NOTES_UPDATED_EVENT, { detail: { userId } }));
}

export function useStudyNotes() {
  const [userId, setUserId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [ready, setReady] = useState(false);
  const [usingDb, setUsingDb] = useState(false);
  const saveTimersRef = useRef(new Map());

  const reload = useCallback(async (uid) => {
    if (!uid) {
      setNotes([]);
      setReady(true);
      setUsingDb(false);
      return;
    }

    try {
      const remote = await fetchStudyNotesFromDb(uid);
      const local = loadStudyNotes(uid);
      if (remote.length === 0 && local.length > 0) {
        await migrateLocalNotesToDb(uid, local);
        saveStudyNotes(uid, []);
        const migrated = await fetchStudyNotesFromDb(uid);
        setNotes(sortNotesNewestFirst(migrated));
      } else {
        setNotes(sortNotesNewestFirst(remote));
      }
      setUsingDb(true);
    } catch (err) {
      console.warn('[useStudyNotes] Supabase unavailable, using local storage', err);
      setNotes(sortNotesNewestFirst(loadStudyNotes(uid)));
      setUsingDb(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      if (cancelled) return;
      setUserId(uid);
      await reload(uid);
    })();

    return () => {
      cancelled = true;
      saveTimersRef.current.forEach((timer) => clearTimeout(timer));
      saveTimersRef.current.clear();
    };
  }, [reload]);

  useEffect(() => {
    const onUpdated = (event) => {
      const uid = event?.detail?.userId;
      if (!userId || uid !== userId) return;
      void reload(userId);
    };
    window.addEventListener(STUDY_NOTES_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(STUDY_NOTES_UPDATED_EVENT, onUpdated);
  }, [reload, userId]);

  const persistLocal = useCallback(
    (nextNotes, uid) => {
      saveStudyNotes(uid, nextNotes);
      notifyNotesUpdated(uid);
    },
    [],
  );

  const scheduleDbUpdate = useCallback((noteId, updates, uid) => {
    const key = String(noteId);
    const existing = saveTimersRef.current.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      saveTimersRef.current.delete(key);
      try {
        const saved = await updateStudyNoteInDb(noteId, updates);
        setNotes((prev) =>
          sortNotesNewestFirst(prev.map((n) => (n.id === noteId ? saved : n))),
        );
        notifyNotesUpdated(uid);
      } catch (err) {
        console.error('[useStudyNotes] update failed', err);
      }
    }, 450);

    saveTimersRef.current.set(key, timer);
  }, []);

  const addNote = useCallback(
    async (payload = {}) => {
      if (!userId) return null;
      const draft = createStudyNote(payload);

      if (usingDb) {
        try {
          const saved = await insertStudyNoteToDb(userId, draft);
          setNotes((prev) => sortNotesNewestFirst([saved, ...prev]));
          notifyNotesUpdated(userId);
          return saved;
        } catch (err) {
          console.error('[useStudyNotes] insert failed', err);
          return null;
        }
      }

      setNotes((prev) => {
        const next = sortNotesNewestFirst([draft, ...prev]);
        persistLocal(next, userId);
        return next;
      });
      return draft;
    },
    [persistLocal, userId, usingDb],
  );

  const updateNote = useCallback(
    (id, updates) => {
      if (!userId || !id) return;

      setNotes((prev) => {
        const next = sortNotesNewestFirst(
          prev.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note,
          ),
        );

        if (usingDb) {
          scheduleDbUpdate(id, updates, userId);
        } else {
          persistLocal(next, userId);
        }
        return next;
      });
    },
    [persistLocal, scheduleDbUpdate, userId, usingDb],
  );

  const saveNoteNow = useCallback(
    async (id, updates) => {
      if (!userId || !id) return null;

      const key = String(id);
      const pending = saveTimersRef.current.get(key);
      if (pending) clearTimeout(pending);
      saveTimersRef.current.delete(key);

      setNotes((prev) => {
        const next = sortNotesNewestFirst(
          prev.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note,
          ),
        );

        if (!usingDb) {
          persistLocal(next, userId);
        }
        return next;
      });

      if (usingDb) {
        try {
          const saved = await updateStudyNoteInDb(id, updates);
          setNotes((prev) =>
            sortNotesNewestFirst(prev.map((n) => (n.id === id ? saved : n))),
          );
          notifyNotesUpdated(userId);
          return saved;
        } catch (err) {
          console.error('[useStudyNotes] save failed', err);
          return null;
        }
      }

      notifyNotesUpdated(userId);
      return null;
    },
    [persistLocal, userId, usingDb],
  );

  const deleteNote = useCallback(
    async (id) => {
      if (!userId || !id) return;

      if (usingDb) {
        try {
          await deleteStudyNoteFromDb(id);
          setNotes((prev) => prev.filter((note) => note.id !== id));
          notifyNotesUpdated(userId);
        } catch (err) {
          console.error('[useStudyNotes] delete failed', err);
        }
        return;
      }

      setNotes((prev) => {
        const next = prev.filter((note) => note.id !== id);
        persistLocal(next, userId);
        return next;
      });
    },
    [persistLocal, userId, usingDb],
  );

  const getOrCreateScratchNote = useCallback(
    async (context = {}, contextLabel = '') => {
      if (!userId) return null;
      const contextKey = buildStudyNotesContextKey(context);

      if (usingDb) {
        try {
          const saved = await upsertScratchNoteToDb(userId, context, contextLabel);
          setNotes((prev) => {
            const without = prev.filter((n) => n.contextKey !== contextKey);
            return sortNotesNewestFirst([saved, ...without]);
          });
          notifyNotesUpdated(userId);
          return saved.id;
        } catch (err) {
          console.error('[useStudyNotes] scratch upsert failed', err);
          return null;
        }
      }

      setNotes((prev) => {
        const existing = prev.find((n) => n.contextKey === contextKey);
        if (existing) return prev;
        const note = createStudyNote({
          title: contextLabel ? `Session · ${contextLabel}` : 'Session notes',
          content: '',
          tags: ['exam-practice'],
          context: { ...context, contextKey },
        });
        note.contextKey = contextKey;
        const next = sortNotesNewestFirst([note, ...prev]);
        persistLocal(next, userId);
        return next;
      });
      return contextKey;
    },
    [persistLocal, userId, usingDb],
  );

  return {
    userId,
    notes,
    ready,
    usingDb,
    addNote,
    updateNote,
    saveNoteNow,
    deleteNote,
    getOrCreateScratchNote,
  };
}
