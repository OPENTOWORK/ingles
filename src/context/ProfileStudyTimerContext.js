'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'dralo_profile_study_timer_v2';

const ProfileStudyTimerContext = createContext(null);

function emptyClock() {
  return { baseSeconds: 0, isRunning: false, startedAt: null };
}

function normalizeStored(data) {
  if (!data || typeof data !== 'object') return emptyClock();

  if (typeof data.baseSeconds === 'number') {
    return {
      baseSeconds: Math.max(0, Math.floor(data.baseSeconds)),
      isRunning: Boolean(data.isRunning),
      startedAt: data.startedAt ? Number(data.startedAt) : null,
    };
  }

  // v1: { sessionTime, isRunning }
  const baseSeconds = Math.max(0, Math.floor(Number(data.sessionTime) || 0));
  const isRunning = Boolean(data.isRunning);
  return {
    baseSeconds,
    isRunning,
    startedAt: isRunning ? Date.now() : null,
  };
}

function readStoredClock() {
  if (typeof window === 'undefined') return emptyClock();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem('dralo_profile_study_timer_v1');
      if (legacy) return normalizeStored(JSON.parse(legacy));
      return emptyClock();
    }
    return normalizeStored(JSON.parse(raw));
  } catch {
    return emptyClock();
  }
}

function writeStoredClock(clock) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clock));
  } catch {
    /* ignore quota */
  }
}

/** Segundos transcurridos según base + tramo en curso. */
export function elapsedStudySeconds(clock) {
  if (!clock?.isRunning || !clock.startedAt) {
    return Math.max(0, Math.floor(Number(clock?.baseSeconds) || 0));
  }
  const base = Math.max(0, Math.floor(Number(clock.baseSeconds) || 0));
  const delta = Math.floor((Date.now() - Number(clock.startedAt)) / 1000);
  return base + Math.max(0, delta);
}

export function formatProfileStudyTimer(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function loadClockForClient() {
  const stored = readStoredClock();
  if (!stored.isRunning || !stored.startedAt) return stored;

  const total = elapsedStudySeconds(stored);
  return {
    baseSeconds: total,
    isRunning: true,
    startedAt: Date.now(),
  };
}

export function ProfileStudyTimerProvider({ children }) {
  const [clock, setClock] = useState(emptyClock);
  const [hydrated, setHydrated] = useState(false);
  const [uiTick, setUiTick] = useState(0);

  useEffect(() => {
    const loaded = loadClockForClient();
    setClock(loaded);
    writeStoredClock(loaded);
    setHydrated(true);
  }, []);

  const sessionTime = useMemo(() => elapsedStudySeconds(clock), [clock, uiTick]);

  useEffect(() => {
    if (!clock.isRunning) return undefined;
    const id = window.setInterval(() => setUiTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [clock.isRunning]);

  const start = useCallback(() => {
    setClock((prev) => {
      const base = elapsedStudySeconds(prev);
      const next = { baseSeconds: base, isRunning: true, startedAt: Date.now() };
      writeStoredClock(next);
      return next;
    });
  }, []);

  const pause = useCallback(() => {
    setClock((prev) => {
      const next = {
        baseSeconds: elapsedStudySeconds(prev),
        isRunning: false,
        startedAt: null,
      };
      writeStoredClock(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = emptyClock();
    writeStoredClock(next);
    setClock(next);
  }, []);

  const toggle = useCallback(() => {
    setClock((prev) => {
      if (prev.isRunning) {
        const next = {
          baseSeconds: elapsedStudySeconds(prev),
          isRunning: false,
          startedAt: null,
        };
        writeStoredClock(next);
        return next;
      }
      const next = {
        baseSeconds: elapsedStudySeconds(prev),
        isRunning: true,
        startedAt: Date.now(),
      };
      writeStoredClock(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      sessionTime,
      isRunning: clock.isRunning,
      hydrated,
      start,
      pause,
      reset,
      toggle,
      formatted: formatProfileStudyTimer(sessionTime),
    }),
    [sessionTime, clock.isRunning, hydrated, start, pause, reset, toggle],
  );

  return (
    <ProfileStudyTimerContext.Provider value={value}>{children}</ProfileStudyTimerContext.Provider>
  );
}

export function useProfileStudyTimer() {
  const ctx = useContext(ProfileStudyTimerContext);
  if (!ctx) {
    throw new Error('useProfileStudyTimer must be used within ProfileStudyTimerProvider');
  }
  return ctx;
}
