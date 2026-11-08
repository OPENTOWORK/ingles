'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import {
  loadVocabulary,
  saveVocabulary,
  speakVocabularyWord,
} from '@/lib/vocabularyStore';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import styles from './ProfileVocabularyPanel.module.css';

function fromSavedWord(item) {
  return {
    id: item.id,
    word: item.word || '',
    meaning: item.definition || item.meaning || '',
    translation: item.translation || '',
    pronunciation: item.phonetic || item.pronunciation || '',
    audioUrl: item.entryData?.audioUrl || item.audioUrl || '',
    createdAt: item.createdAt || item.created_at || '',
  };
}

export default function ProfileVocabularyPanel() {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      const id = data?.session?.user?.id || null;
      const accessToken = data?.session?.access_token || '';
      setUserId(id);
      setToken(accessToken);
      if (!id || !accessToken) {
        setEntries([]);
        setReady(true);
        return;
      }
      try {
        const res = await fetch(buildClientApiUrl('/api/profile/vocabulary/'), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'Could not load vocabulary.');
        const remote = (payload.words || []).map(fromSavedWord);
        const local = loadVocabulary(id);
        if (local.length) {
          for (const entry of local) {
            await fetch(buildClientApiUrl('/api/profile/vocabulary/'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(entry),
            });
          }
          saveVocabulary(id, []);
          const again = await fetch(buildClientApiUrl('/api/profile/vocabulary/'), {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const refreshed = await again.json().catch(() => ({}));
          if (!cancelled) setEntries((refreshed.words || []).map(fromSavedWord));
        } else if (!cancelled) {
          setEntries(remote);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load vocabulary.');
      } finally {
        if (!cancelled) setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = [...entries].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (!needle) return list;
    return list.filter((entry) =>
      [entry.word, entry.meaning, entry.translation, entry.pronunciation]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [entries, query]);

  function persistLocal(next) {
    setEntries(next);
  }

  async function removeEntry(id) {
    if (!token) return;
    const res = await fetch(buildClientApiUrl(`/api/profile/vocabulary/?id=${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error || 'Could not delete the word.');
      return;
    }
    persistLocal(entries.filter((entry) => entry.id !== id));
  }

  return (
    <div className="profile-tab-panels">
      <ProfileCollapsibleSection title="Vocabulary" defaultOpen>
        <div className={styles.wrap}>
          {!ready ? <p className={styles.status}>Loading your words…</p> : null}
          {ready && !userId ? (
            <p className={styles.status}>Sign in to save your vocabulary.</p>
          ) : null}
          {ready && userId ? (
            <>
              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.toolbar}>
                <input
                  className={styles.search}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your words"
                  aria-label="Search your words"
                />
                <p className={styles.count}>
                  {entries.length} {entries.length === 1 ? 'word' : 'words'}
                </p>
              </div>

              {visible.length === 0 ? (
                <p className={styles.status}>
                  {entries.length === 0
                    ? 'No words yet. Select a word in an exercise and press Save word.'
                    : 'No words match that search.'}
                </p>
              ) : (
                <ul className={styles.list}>
                  {visible.map((entry) => (
                    <li key={entry.id} className={styles.card}>
                      <div className={styles.cardHead}>
                        <h3>{entry.word}</h3>
                        <button
                          type="button"
                          className={styles.speak}
                          onClick={() => speakVocabularyWord(entry.word, entry.audioUrl)}
                          aria-label={`Play ${entry.word}`}
                        >
                          <Volume2 size={16} aria-hidden="true" />
                          Play
                        </button>
                      </div>
                      {entry.pronunciation ? (
                        <p className={styles.sound}>{entry.pronunciation}</p>
                      ) : null}
                      {entry.meaning ? <p><strong>Meaning.</strong> {entry.meaning}</p> : null}
                      {entry.translation ? (
                        <p><strong>Translation.</strong> {entry.translation}</p>
                      ) : null}
                      <div className={styles.cardActions}>
                        <button type="button" className={styles.danger} onClick={() => removeEntry(entry.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </ProfileCollapsibleSection>
    </div>
  );
}
