'use client';

import { useCallback, useRef, useState } from 'react';
import PageHero from '@/components/PageHero';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import DictionarySavedPanel, { useDictionarySavedWords } from '@/components/dralo-ai/DictionarySavedPanel';
import {
  DEFAULT_DICTIONARY_LANGUAGE,
  DICTIONARY_TARGET_LANGUAGES,
  getDictionaryLanguageLabel,
} from '@/data/dictionaryLanguages';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

const DICTIONARY_FETCH_MS = 90_000;

async function callDictionary(payload) {
  const url = buildClientApiUrl('/api/dralo-ai/dictionary/');
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DICTIONARY_FETCH_MS),
    });
  } catch (err) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.');
    }
    if (err?.message === 'Failed to fetch' || err instanceof TypeError) {
      throw new Error(
        'Cannot reach the server. Run npm run dev in the project folder and open the same URL (e.g. http://localhost:3000).',
      );
    }
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

/** Una sola palabra → diccionario; varias palabras → frase. */
function detectInputMode(text) {
  const tokens = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return tokens.length > 1 ? 'phrase' : 'word';
}

function speakWithBrowser(text, rate = 0.92, lang = 'en-GB') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}

function CefrBadge({ level }) {
  if (!level) return null;
  return <span className="dralo-dict__badge dralo-dict__badge--cefr">{level}</span>;
}

function TagList({ tags, variant = 'default' }) {
  if (!tags?.length) return null;
  return (
    <div className="dralo-dict__tags">
      {tags.map((tag) => (
        <span key={tag} className={`dralo-dict__badge dralo-dict__badge--${variant}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function LanguageSelect({ value, onChange, id }) {
  return (
    <label className="dralo-dict__lang-label" htmlFor={id}>
      <span className="dralo-dict__lang-label-text">Language</span>
      <select
        id={id}
        className="dralo-dict__lang-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {DICTIONARY_TARGET_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function DraloDictionary() {
  const { session } = useUserRole();
  const [activeTab, setActiveTab] = useState('search');
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_DICTIONARY_LANGUAGE);
  const [queryInput, setQueryInput] = useState('');
  const [resultMode, setResultMode] = useState(null);
  const [entry, setEntry] = useState(null);
  const [phraseResult, setPhraseResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState('');
  const [askOpen, setAskOpen] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const audioRef = useRef(null);

  const {
    savedWords,
    loading: savedLoading,
    tablesReady: savedTablesReady,
    saveLoading,
    isWordSaved,
    toggleSaveWord,
    removeWord,
  } = useDictionarySavedWords(session);

  const langLabel = getDictionaryLanguageLabel(targetLanguage);
  const currentWordSaved = entry?.word ? isWordSaved(entry.word) : false;

  const playPronunciation = useCallback(async (text, audioUrl, speedMode = 'normal') => {
    const w = String(text || '').trim();
    if (!w) return;

    const isSlow = speedMode === 'slow';
    const ttsSpeed = isSlow ? 0.82 : 1.05;
    const browserRate = isSlow ? 0.72 : 0.95;

    setAudioLoading(true);
    setError('');

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (audioUrl && !isSlow) {
        const audio = new Audio(audioUrl);
        audio.playbackRate = 1;
        audioRef.current = audio;
        await audio.play();
        return;
      }

      try {
        const res = await fetch(buildClientApiUrl('/api/coach-tts/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: w, speed: ttsSpeed }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play();
          return;
        }
      } catch {
        /* fallback */
      }

      if (!speakWithBrowser(w, browserRate)) {
        throw new Error('Your browser cannot play audio.');
      }
    } catch (e) {
      setError(e.message || 'Could not play pronunciation.');
    } finally {
      setAudioLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const q = queryInput.trim();
    if (!q) return;

    const mode = detectInputMode(q);
    setLoading(true);
    setError('');
    setEntry(null);
    setPhraseResult(null);
    setResultMode(null);
    setAskAnswer('');
    setAskOpen(false);

    try {
      if (mode === 'phrase') {
        const data = await callDictionary({
          action: 'translate',
          text: q,
          targetLanguage,
        });
        setPhraseResult(data);
        setResultMode('phrase');
      } else {
        const data = await callDictionary({
          action: 'lookup',
          word: q,
          targetLanguage,
        });
        setEntry(data.entry);
        setResultMode('word');
        const suggestion = data.entry?.ai?.askDraloSuggestion;
        if (suggestion) setAskQuestion(suggestion);
      }
    } catch (err) {
      setError(err.message || 'Could not process your text.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!entry?.word) return;
    if (!session) {
      setError('Sign in to save words to your list.');
      return;
    }

    setError('');
    const result = await toggleSaveWord(entry, targetLanguage);
    if (!result.ok && result.error) {
      setError(result.error);
    }
  };

  const submitAskDralo = async (e) => {
    e?.preventDefault();
    if (!askQuestion.trim()) return;

    const wordContext =
      resultMode === 'word'
        ? entry?.word
        : phraseResult?.phrase?.split(/\s+/)[0] || queryInput.trim().split(/\s+/)[0];

    if (!wordContext) return;

    setAskLoading(true);
    setError('');
    setAskAnswer('');

    try {
      const enrichment =
        resultMode === 'word' ? entry?.ai : phraseResult?.analysis;
      const data = await callDictionary({
        action: 'ask-dralo',
        word: wordContext,
        question: askQuestion.trim(),
        enrichment,
      });
      setAskAnswer(data.answer);
    } catch (err) {
      setError(err.message || 'Dralo could not answer.');
    } finally {
      setAskLoading(false);
    }
  };

  const ai = entry?.ai;
  const phraseAnalysis = phraseResult?.analysis;

  return (
    <main className="dralo-ai-page">
      <PageHero
        eyebrow="Dralo AI · Dictionary"
        title="Dictionary"
        description="Definitions, CEFR level, translation into your language, slow or normal pronunciation, and questions for Dralo."
        accent="violet"
        mascotVariant={9}
        stats={[
          { value: 'CEFR', label: 'Level' },
          { value: '🔊', label: 'Slow / normal' },
          { value: '🌐', label: 'Multi-language' },
        ]}
      />

      <div className="dralo-dict">
        <div className="dralo-dict__toolbar">
          <div className="dralo-dict__tabs" role="tablist" aria-label="Dictionary sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'search'}
              className={`dralo-dict__tab${activeTab === 'search' ? ' dralo-dict__tab--active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              🔍 Search
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'saved'}
              className={`dralo-dict__tab${activeTab === 'saved' ? ' dralo-dict__tab--active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              ♥ Saved words
              {savedWords.length ? (
                <span className="dralo-dict__tab-count">{savedWords.length}</span>
              ) : null}
            </button>
          </div>
          {activeTab === 'search' ? (
            <LanguageSelect
              id="dict-global-lang"
              value={targetLanguage}
              onChange={setTargetLanguage}
            />
          ) : null}
        </div>

        {error ? (
          <p className="dralo-dict__error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="dralo-dict__panel">
          {activeTab === 'saved' ? (
            <DictionarySavedPanel
              savedWords={savedWords}
              loading={savedLoading}
              tablesReady={savedTablesReady}
              session={session}
              targetLanguage={targetLanguage}
              onRemove={removeWord}
              onPlayAudio={playPronunciation}
              audioLoading={audioLoading}
            />
          ) : (
            <>
          <form className="dralo-dict__form dralo-dict__form--stack" onSubmit={handleSubmit}>
            <textarea
              className="dralo-ai-input dralo-dict__textarea"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. pelican, however, achieve…"
              rows={3}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="dralo-ai-btn dralo-ai-btn--primary" disabled={loading}>
              {loading ? 'Analyzing…' : 'Translate'}
            </button>
          </form>

          {resultMode === 'word' && entry ? (
            <article className="dralo-dict__result">
              <header className="dralo-dict__word-head">
                <div className="dralo-dict__word-row">
                  <button
                    type="button"
                    className="dralo-dict__word-btn"
                    onClick={() => playPronunciation(entry.word, entry.audioUrl, 'normal')}
                    disabled={audioLoading}
                    title="Normal pronunciation"
                  >
                    <span className="dralo-dict__word-text">{entry.word}</span>
                    {entry.phonetic ? (
                      <span className="dralo-dict__phonetic">{entry.phonetic}</span>
                    ) : null}
                    <span className="dralo-dict__speak-icon" aria-hidden>
                      {audioLoading ? '⏳' : '🔊'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`dralo-dict__heart${currentWordSaved ? ' dralo-dict__heart--active' : ''}`}
                    onClick={handleToggleSave}
                    disabled={saveLoading}
                    title={currentWordSaved ? 'Remove from saved words' : 'Save word'}
                    aria-label={currentWordSaved ? 'Remove from saved words' : 'Save word'}
                    aria-pressed={currentWordSaved}
                  >
                    {saveLoading ? '…' : currentWordSaved ? '♥' : '♡'}
                  </button>

                  {ai?.wordInTargetLanguage ? (
                    <div className="dralo-dict__word-translated" title={`Translation (${langLabel})`}>
                      <span className="dralo-dict__word-translated-label">{langLabel}</span>
                      <span className="dralo-dict__word-translated-text">{ai.wordInTargetLanguage}</span>
                    </div>
                  ) : entry.aiUnavailable ? (
                    <div className="dralo-dict__word-translated dralo-dict__word-translated--muted">
                      <span className="dralo-dict__word-translated-text">AI unavailable</span>
                    </div>
                  ) : null}
                </div>

                <div className="dralo-dict__audio-speed">
                  <button
                    type="button"
                    className="dralo-dict__speed-btn"
                    disabled={audioLoading}
                    onClick={() => playPronunciation(entry.word, entry.audioUrl, 'slow')}
                  >
                    🐢 Slow
                  </button>
                  <button
                    type="button"
                    className="dralo-dict__speed-btn dralo-dict__speed-btn--active"
                    disabled={audioLoading}
                    onClick={() => playPronunciation(entry.word, entry.audioUrl, 'normal')}
                  >
                    ▶️ Normal
                  </button>
                </div>

                <div className="dralo-dict__meta-row">
                  <CefrBadge level={ai?.cefrLevel} />
                  {ai?.grammarCategory ? (
                    <span className="dralo-dict__badge dralo-dict__badge--grammar">
                      {ai.grammarCategory}
                    </span>
                  ) : null}
                  {ai?.isFalseFriend ? (
                    <span className="dralo-dict__badge dralo-dict__badge--warning">
                      ⚠️ False friend
                    </span>
                  ) : null}
                </div>

                <TagList tags={ai?.linguisticTags} />
                {ai?.collocations?.length ? (
                  <p className="dralo-dict__collocations">
                    <strong>Collocations:</strong> {ai.collocations.join(' · ')}
                  </p>
                ) : null}
                {ai?.cefrNote ? <p className="dralo-dict__note">{ai.cefrNote}</p> : null}
                {ai?.falseFriendNote ? (
                  <p className="dralo-dict__note dralo-dict__note--warn">{ai.falseFriendNote}</p>
                ) : null}
                {ai?.definitionInTargetLanguage ? (
                  <p className="dralo-dict__def-target">
                    <strong>Definition ({langLabel}):</strong> {ai.definitionInTargetLanguage}
                  </p>
                ) : null}
                {ai?.usageTip ? (
                  <p className="dralo-dict__note">
                    <strong>Tip:</strong> {ai.usageTip}
                  </p>
                ) : null}
                {ai?.examRelevance ? (
                  <p className="dralo-dict__note dralo-dict__note--exam">{ai.examRelevance}</p>
                ) : null}
              </header>

              <ol className="dralo-dict__meanings">
                {entry.meanings.map((m, idx) => (
                  <li key={`${m.partOfSpeech}-${idx}`} className="dralo-dict__meaning">
                    {m.partOfSpeech ? (
                      <span className="dralo-dict__pos">{m.partOfSpeech}</span>
                    ) : null}
                    <p className="dralo-dict__definition">{m.definition}</p>
                    {m.example ? (
                      <p className="dralo-dict__example">
                        <em>e.g.</em> {m.example}
                      </p>
                    ) : null}
                    {m.synonyms?.length ? (
                      <p className="dralo-dict__synonyms">
                        <strong>Synonyms:</strong> {m.synonyms.join(', ')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>

              <div className="dralo-dict__ask">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-dict__ask-toggle"
                  onClick={() => setAskOpen((o) => !o)}
                >
                  💬 Ask Dralo
                </button>
                {askOpen ? (
                  <form className="dralo-dict__ask-form" onSubmit={submitAskDralo}>
                    <input
                      className="dralo-ai-input"
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      placeholder="e.g. When do I use however vs although?"
                    />
                    <button
                      type="submit"
                      className="dralo-ai-btn dralo-ai-btn--primary"
                      disabled={askLoading}
                    >
                      {askLoading ? 'Dralo is thinking…' : 'Send'}
                    </button>
                    {askAnswer ? (
                      <div className="dralo-dict__ask-answer">
                        <p className="dralo-dict__ask-answer-label">Dralo</p>
                        <p>{askAnswer}</p>
                      </div>
                    ) : null}
                  </form>
                ) : null}
              </div>
            </article>
          ) : null}

          {resultMode === 'phrase' && phraseAnalysis ? (
            <article className="dralo-dict__result">
              <header className="dralo-dict__word-head">
                <p className="dralo-dict__phrase-source">{phraseResult.phrase}</p>

                <div className="dralo-dict__audio-speed">
                  <button
                    type="button"
                    className="dralo-dict__speed-btn"
                    disabled={audioLoading}
                    onClick={() => playPronunciation(phraseResult.phrase, null, 'slow')}
                  >
                    🐢 Slow
                  </button>
                  <button
                    type="button"
                    className="dralo-dict__speed-btn dralo-dict__speed-btn--active"
                    disabled={audioLoading}
                    onClick={() => playPronunciation(phraseResult.phrase, null, 'normal')}
                  >
                    ▶️ Normal
                  </button>
                </div>

                <div className="dralo-dict__meta-row">
                  <CefrBadge level={phraseAnalysis.cefrLevel} />
                  <TagList tags={phraseAnalysis.linguisticTags} variant="grammar" />
                </div>
                {phraseAnalysis.cefrNote ? (
                  <p className="dralo-dict__note">{phraseAnalysis.cefrNote}</p>
                ) : null}
                {phraseAnalysis.grammarAnalysis?.length ? (
                  <p className="dralo-dict__grammar-list">
                    <strong>Grammar:</strong> {phraseAnalysis.grammarAnalysis.join(' · ')}
                  </p>
                ) : null}

                <div className="dralo-dict__pronunciation-box">
                  <p className="dralo-dict__pronunciation-title">Pronunciation</p>
                  <p className="dralo-dict__pronunciation-text">
                    {phraseAnalysis.pronunciationNotes || '—'}
                  </p>
                </div>
              </header>

              <div className="dralo-dict__translation dralo-dict__translation--literal">
                <p className="dralo-dict__translation-label">Literal ({langLabel})</p>
                <p className="dralo-dict__translation-text">{phraseAnalysis.literalTranslation}</p>
              </div>
              <div className="dralo-dict__translation dralo-dict__translation--natural">
                <p className="dralo-dict__translation-label">Natural ({langLabel})</p>
                <p className="dralo-dict__translation-text">{phraseAnalysis.naturalTranslation}</p>
              </div>
              {phraseAnalysis.translationNotes ? (
                <p className="dralo-dict__note">{phraseAnalysis.translationNotes}</p>
              ) : null}

              <div className="dralo-dict__ask">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-dict__ask-toggle"
                  onClick={() => setAskOpen((o) => !o)}
                >
                  💬 Ask Dralo
                </button>
                {askOpen ? (
                  <form className="dralo-dict__ask-form" onSubmit={submitAskDralo}>
                    <input
                      className="dralo-ai-input"
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      placeholder="e.g. Is this formal or informal?"
                    />
                    <button
                      type="submit"
                      className="dralo-ai-btn dralo-ai-btn--primary"
                      disabled={askLoading}
                    >
                      {askLoading ? 'Dralo is thinking…' : 'Send'}
                    </button>
                    {askAnswer ? (
                      <div className="dralo-dict__ask-answer">
                        <p className="dralo-dict__ask-answer-label">Dralo</p>
                        <p>{askAnswer}</p>
                      </div>
                    ) : null}
                  </form>
                ) : null}
              </div>
            </article>
          ) : null}
            </>
          )}
        </section>

        <p className="dralo-dict__back">
          <Link href="/dralo-ai">← Back to Dralo AI</Link>
        </p>
      </div>
    </main>
  );
}
