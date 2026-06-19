'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_PLAYS = 2;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Listening audio. Exam simulation: 2 plays max, no pause, no seek.
 * Skill practice: native browser controls (examMode=false).
 */
export default function ExamListeningAudioPlayer({
  src,
  examMode = false,
  clipKey = '',
  lang = 'en',
  className = '',
}) {
  const audioRef = useRef(null);
  const maxTimeRef = useRef(0);
  const playingRef = useRef(false);
  const tickRef = useRef(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const isEn = lang !== 'es';
  const exhausted = attemptsUsed >= MAX_PLAYS && !isPlaying;
  const showFirstPlay = attemptsUsed === 0 && !isPlaying;
  const showReplay = attemptsUsed === 1 && hasCompletedOnce && !isPlaying;

  const stopTick = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finishPlayback = useCallback(() => {
    const audio = audioRef.current;
    playingRef.current = false;
    stopTick();
    setIsPlaying(false);
    setHasCompletedOnce(true);
    if (audio && Number.isFinite(audio.duration)) {
      setCurrentTime(audio.duration);
      maxTimeRef.current = audio.duration;
    }
  }, [stopTick]);

  const syncProgressFromAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    const t = audio.currentTime;
    if (playingRef.current && t > maxTimeRef.current) {
      maxTimeRef.current = t;
    }
    setCurrentTime(t);

    if (playingRef.current && audio.ended) {
      finishPlayback();
    }
  }, [finishPlayback]);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !playingRef.current) return;

      syncProgressFromAudio();

      if (audio.ended) {
        finishPlayback();
        return;
      }

      if (audio.paused) {
        void audio.play().catch(() => {
          playingRef.current = false;
          stopTick();
          setIsPlaying(false);
          setError(isEn ? 'Playback was interrupted.' : 'Se interrumpió la reproducción.');
        });
        return;
      }

      if (maxTimeRef.current > 0.05 && audio.currentTime < maxTimeRef.current - 0.05) {
        audio.currentTime = maxTimeRef.current;
      }
    }, 100);
  }, [finishPlayback, isEn, stopTick, syncProgressFromAudio]);

  useEffect(() => {
    maxTimeRef.current = 0;
    playingRef.current = false;
    stopTick();
    setAttemptsUsed(0);
    setHasCompletedOnce(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, [src, clipKey, stopTick]);

  useEffect(() => () => stopTick(), [stopTick]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !examMode) return undefined;

    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    if (audio.readyState >= 1) onMeta();

    return () => {
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
    };
  }, [src, clipKey, examMode]);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || attemptsUsed >= MAX_PLAYS || playingRef.current) return;

    setError(null);

    try {
      audio.pause();
      audio.currentTime = 0;
      maxTimeRef.current = 0;
      setCurrentTime(0);

      await audio.play();

      playingRef.current = true;
      setIsPlaying(true);
      setAttemptsUsed((count) => count + 1);
      syncProgressFromAudio();
      startTick();
    } catch {
      playingRef.current = false;
      stopTick();
      setIsPlaying(false);
      setError(isEn ? 'Playback was blocked.' : 'La reproducción fue bloqueada.');
    }
  }, [attemptsUsed, isEn, startTick, stopTick, syncProgressFromAudio]);

  if (!src) return null;

  if (!examMode) {
    return (
      <audio controls src={src} className={className} style={{ width: '100%' }}>
        <track kind="captions" />
      </audio>
    );
  }

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={`exam-listening-audio exam-listening-audio--strict${className ? ` ${className}` : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        className="exam-listening-audio__element"
      />

      <div className="exam-listening-audio__bar" aria-live="polite">
        {showFirstPlay ? (
          <button
            type="button"
            className="exam-listening-audio__play"
            onClick={() => void startPlayback()}
            aria-label={isEn ? 'Play audio' : 'Reproducir audio'}
          >
            ▶
          </button>
        ) : (
          <span
            className={`exam-listening-audio__status${
              isPlaying ? ' exam-listening-audio__status--playing' : ''
            }`}
            aria-hidden
          >
            ▶
          </span>
        )}

        <div className="exam-listening-audio__track-wrap">
          <div className="exam-listening-audio__track" aria-hidden>
            <div className="exam-listening-audio__fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="exam-listening-audio__times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {error ? <p className="exam-listening-audio__hint exam-listening-audio__hint--error">{error}</p> : null}

      {isPlaying ? (
        <p className="exam-listening-audio__hint exam-listening-audio__hint--playing">
          {isEn ? 'Playing — cannot be paused.' : 'Reproduciendo — no se puede pausar.'}
        </p>
      ) : null}

      {showReplay ? (
        <button type="button" className="exam-listening-audio__replay" onClick={() => void startPlayback()}>
          {isEn ? 'Listen again (1 remaining)' : 'Escuchar otra vez (1 restante)'}
        </button>
      ) : null}

      {exhausted ? (
        <p className="exam-listening-audio__hint exam-listening-audio__hint--done">
          {isEn ? 'Both listens used.' : 'Has usado las dos escuchas.'}
        </p>
      ) : null}
    </div>
  );
}
