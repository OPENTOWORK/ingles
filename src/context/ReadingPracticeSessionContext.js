'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_READING_SETTINGS,
  loadReadingSettings,
  readingSettingsClassNames,
  readingSettingsToStyle,
  saveReadingSettings,
} from '@/lib/readingPracticeSettingsStorage';

const ReadingPracticeSessionContext = createContext(null);

export function ReadingPracticeSessionProvider({ children }) {
  const [focusMode, setFocusMode] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timerHidden, setTimerHidden] = useState(false);
  const [confidenceByQuestion, setConfidenceByQuestion] = useState({});
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [answersRevealed, setAnswersRevealed] = useState(false);
  const [readingSettings, setReadingSettingsState] = useState(DEFAULT_READING_SETTINGS);

  useEffect(() => {
    setReadingSettingsState(loadReadingSettings());

    const onSettingsChange = (event) => {
      setReadingSettingsState(event.detail || loadReadingSettings());
    };
    window.addEventListener('dralo-reading-settings-changed', onSettingsChange);
    return () => window.removeEventListener('dralo-reading-settings-changed', onSettingsChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.classList.toggle('focus-mode-active', focusMode);
    return () => document.body.classList.remove('focus-mode-active');
  }, [focusMode]);

  const updateReadingSettings = useCallback((patch) => {
    setReadingSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveReadingSettings(next);
      return next;
    });
  }, []);

  const resetReadingSettings = useCallback(() => {
    setReadingSettingsState(DEFAULT_READING_SETTINGS);
    saveReadingSettings(DEFAULT_READING_SETTINGS);
  }, []);

  const toggleFocusMode = useCallback(() => setFocusMode((v) => !v), []);

  const toggleFlagQuestion = useCallback((questionKey) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionKey]: !prev[questionKey],
    }));
  }, []);

  const setConfidence = useCallback((questionKey, value) => {
    setConfidenceByQuestion((prev) => ({ ...prev, [questionKey]: value }));
  }, []);

  const incrementCheckAttempts = useCallback(() => {
    setCheckAttempts((n) => n + 1);
  }, []);

  const revealAnswers = useCallback(() => {
    setAnswersRevealed(true);
  }, []);

  const resetAnswersRevealed = useCallback(() => {
    setAnswersRevealed(false);
  }, []);

  const adjustFontSize = useCallback((delta) => {
    setReadingSettingsState((prev) => {
      const next = {
        ...prev,
        fontSize: Math.min(130, Math.max(90, (prev.fontSize || 100) + delta)),
      };
      saveReadingSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      focusMode,
      toggleFocusMode,
      flaggedQuestions,
      toggleFlagQuestion,
      timerHidden,
      setTimerHidden,
      confidenceByQuestion,
      setConfidence,
      checkAttempts,
      incrementCheckAttempts,
      answersRevealed,
      revealAnswers,
      resetAnswersRevealed,
      readingSettings,
      updateReadingSettings,
      resetReadingSettings,
      adjustFontSize,
      readingAreaClassName: readingSettingsClassNames(readingSettings),
      readingAreaStyle: readingSettingsToStyle(readingSettings),
    }),
    [
      focusMode,
      toggleFocusMode,
      flaggedQuestions,
      toggleFlagQuestion,
      timerHidden,
      confidenceByQuestion,
      setConfidence,
      checkAttempts,
      incrementCheckAttempts,
      answersRevealed,
      revealAnswers,
      resetAnswersRevealed,
      readingSettings,
      updateReadingSettings,
      resetReadingSettings,
      adjustFontSize,
    ],
  );

  return (
    <ReadingPracticeSessionContext.Provider value={value}>
      {children}
    </ReadingPracticeSessionContext.Provider>
  );
}

export function useReadingPracticeSession() {
  const ctx = useContext(ReadingPracticeSessionContext);
  if (!ctx) {
    return {
      focusMode: false,
      toggleFocusMode: () => {},
      flaggedQuestions: {},
      toggleFlagQuestion: () => {},
      timerHidden: false,
      setTimerHidden: () => {},
      confidenceByQuestion: {},
      setConfidence: () => {},
      checkAttempts: 0,
      incrementCheckAttempts: () => {},
      answersRevealed: false,
      revealAnswers: () => {},
      resetAnswersRevealed: () => {},
      readingSettings: DEFAULT_READING_SETTINGS,
      updateReadingSettings: () => {},
      resetReadingSettings: () => {},
      adjustFontSize: () => {},
      readingAreaClassName: 'reading-area',
      readingAreaStyle: {},
    };
  }
  return ctx;
}
