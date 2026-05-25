'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { getDictionaryLanguageLabel } from '@/data/dictionaryLanguages';
import { normalizeDictionaryWord } from '@/lib/dictionarySavedWords';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

function SavedWordCard({ item, langLabel, onRemove, onPractice }) {
  return (
    <article className="dralo-dict__saved-card">
      <div className="dralo-dict__saved-card-head">
        <div>
          <h3 className="dralo-dict__saved-word">{item.word}</h3>
          {item.phonetic ? <p className="dralo-dict__saved-phonetic">{item.phonetic}</p> : null}
        </div>
        <button
          type="button"
          className="dralo-dict__heart dralo-dict__heart--active"
          onClick={() => onRemove(item)}
          title="Remove from saved words"
          aria-label={`Remove ${item.word}`}
        >
          ♥
        </button>
      </div>
      {item.translation ? (
        <p className="dralo-dict__saved-translation">
          <span>{langLabel}</span> {item.translation}
        </p>
      ) : null}
      {item.definition ? <p className="dralo-dict__saved-definition">{item.definition}</p> : null}
      <div className="dralo-dict__saved-meta">
        {item.cefrLevel ? (
          <span className="dralo-dict__badge dralo-dict__badge--cefr">{item.cefrLevel}</span>
        ) : null}
        <button type="button" className="dralo-dict__saved-practice-btn" onClick={() => onPractice(item)}>
          Practise →
        </button>
      </div>
    </article>
  );
}

function PracticeFlashcard({ words, langLabel, onPlayAudio, audioLoading, onExit }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = words[index];
  const total = words.length;

  useEffect(() => {
    setRevealed(false);
  }, [index]);

  if (!current) return null;

  const goNext = () => {
    setIndex((prev) => (prev + 1) % total);
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="dralo-dict__practice">
      <div className="dralo-dict__practice-top">
        <p className="dralo-dict__practice-progress">
          Card {index + 1} of {total}
        </p>
        <button type="button" className="dralo-dict__practice-exit" onClick={onExit}>
          Back to list
        </button>
      </div>

      <article className="dralo-dict__practice-card">
        <button
          type="button"
          className="dralo-dict__practice-word-btn"
          onClick={() => onPlayAudio(current.word, current.entryData?.audioUrl, 'normal')}
          disabled={audioLoading}
        >
          <span className="dralo-dict__practice-word">{current.word}</span>
          {current.phonetic ? <span className="dralo-dict__practice-phonetic">{current.phonetic}</span> : null}
          <span aria-hidden>{audioLoading ? '⏳' : '🔊'}</span>
        </button>

        {revealed ? (
          <div className="dralo-dict__practice-reveal">
            {current.translation ? (
              <p>
                <strong>{langLabel}:</strong> {current.translation}
              </p>
            ) : null}
            {current.definition ? <p>{current.definition}</p> : null}
            {current.entryData?.ai?.usageTip ? (
              <p className="dralo-dict__practice-tip">
                <strong>Tip:</strong> {current.entryData.ai.usageTip}
              </p>
            ) : null}
          </div>
        ) : (
          <button type="button" className="dralo-ai-btn dralo-ai-btn--primary" onClick={() => setRevealed(true)}>
            Reveal meaning
          </button>
        )}
      </article>

      <div className="dralo-dict__practice-nav">
        <button type="button" className="dralo-ai-btn dralo-ai-btn--ghost" onClick={goPrev}>
          ← Previous
        </button>
        <button type="button" className="dralo-ai-btn dralo-ai-btn--ghost" onClick={() => setRevealed(false)}>
          Hide
        </button>
        <button type="button" className="dralo-ai-btn dralo-ai-btn--primary" onClick={goNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default function DictionarySavedPanel({
  savedWords,
  loading,
  tablesReady,
  session,
  targetLanguage,
  onRemove,
  onPlayAudio,
  audioLoading,
}) {
  const [practiceWords, setPracticeWords] = useState(null);
  const langLabel = getDictionaryLanguageLabel(targetLanguage);

  const startPractice = (item) => {
    const idx = savedWords.findIndex((w) => w.id === item.id);
    const ordered =
      idx >= 0 ? [...savedWords.slice(idx), ...savedWords.slice(0, idx)] : savedWords;
    setPracticeWords(ordered);
  };

  if (!session) {
    return (
      <div className="dralo-dict__saved-empty">
        <p>Sign in to save words and practise your vocabulary later.</p>
        <Link href="/login" className="dralo-ai-btn dralo-ai-btn--primary">
          Sign in
        </Link>
      </div>
    );
  }

  if (!tablesReady) {
    return (
      <p className="dralo-dict__hint">
        Saved words are not available yet. Run <code>scripts/dictionary_words.sql</code> in Supabase.
      </p>
    );
  }

  if (loading) {
    return <p className="dralo-dict__hint">Loading saved words…</p>;
  }

  if (practiceWords?.length) {
    return (
      <PracticeFlashcard
        words={practiceWords}
        langLabel={langLabel}
        onPlayAudio={onPlayAudio}
        audioLoading={audioLoading}
        onExit={() => setPracticeWords(null)}
      />
    );
  }

  if (!savedWords.length) {
    return (
      <div className="dralo-dict__saved-empty">
        <p>No saved words yet. Search a word and tap the heart to add it here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="dralo-dict__saved-toolbar">
        <p className="dralo-dict__hint">
          {savedWords.length} saved word{savedWords.length === 1 ? '' : 's'}. Practise them with flashcards.
        </p>
        <button
          type="button"
          className="dralo-ai-btn dralo-ai-btn--primary"
          onClick={() => setPracticeWords(savedWords)}
        >
          Start practice
        </button>
      </div>
      <ul className="dralo-dict__saved-list">
        {savedWords.map((item) => (
          <li key={item.id}>
            <SavedWordCard
              item={item}
              langLabel={langLabel}
              onRemove={onRemove}
              onPractice={startPractice}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function useDictionarySavedWords(session) {
  const [savedWords, setSavedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tablesReady, setTablesReady] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const accessToken = session?.access_token;

  const loadSavedWords = useCallback(async () => {
    if (!accessToken) {
      setSavedWords([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildClientApiUrl('/api/dralo-ai/dictionary/words/'), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.tablesReady === false) {
          setTablesReady(false);
          setSavedWords([]);
          return;
        }
        throw new Error(data.error || 'Could not load saved words');
      }
      setTablesReady(data.tablesReady !== false);
      setSavedWords(data.words || []);
    } catch {
      setSavedWords([]);
      setTablesReady(true);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadSavedWords();
  }, [loadSavedWords]);

  const savedWordSet = useMemo(
    () => new Set(savedWords.map((item) => normalizeDictionaryWord(item.word))),
    [savedWords],
  );

  const isWordSaved = useCallback(
    (word) => savedWordSet.has(normalizeDictionaryWord(word)),
    [savedWordSet],
  );

  const saveWord = useCallback(
    async (entry, targetLanguage) => {
      if (!accessToken || !entry?.word) return { ok: false, error: 'Sign in to save words.' };

      setSaveLoading(true);
      try {
        const res = await fetch(buildClientApiUrl('/api/dralo-ai/dictionary/words/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ entry, targetLanguage }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data.tablesReady === false) {
            setTablesReady(false);
          }
          throw new Error(data.error || 'Could not save word');
        }
        setTablesReady(data.tablesReady !== false);
        if (data.word) {
          setSavedWords((prev) => {
            const next = prev.filter((w) => w.id !== data.word.id && w.word !== data.word.word);
            return [data.word, ...next];
          });
        } else {
          await loadSavedWords();
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || 'Could not save word' };
      } finally {
        setSaveLoading(false);
      }
    },
    [accessToken, loadSavedWords],
  );

  const removeWord = useCallback(
    async (item) => {
      if (!accessToken || !item?.id) return { ok: false };

      try {
        const res = await fetch(
          buildClientApiUrl(`/api/dralo-ai/dictionary/words/?id=${encodeURIComponent(item.id)}`),
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not remove word');
        setSavedWords((prev) => prev.filter((w) => w.id !== item.id));
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [accessToken],
  );

  const toggleSaveWord = useCallback(
    async (entry, targetLanguage) => {
      const word = normalizeDictionaryWord(entry?.word);
      if (!word) return { ok: false };

      if (isWordSaved(word)) {
        const existing = savedWords.find((w) => normalizeDictionaryWord(w.word) === word);
        if (existing) return removeWord(existing);
        return { ok: false };
      }

      return saveWord(entry, targetLanguage);
    },
    [isWordSaved, removeWord, saveWord, savedWords],
  );

  return {
    savedWords,
    loading,
    tablesReady,
    saveLoading,
    isWordSaved,
    toggleSaveWord,
    removeWord,
    reloadSavedWords: loadSavedWords,
  };
}
