'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  classifyMicError,
  computePcmRms,
  micErrorMessage,
  shouldEndTurnOnSilence,
} from '../domain/audio-diagnostics';

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return '';
}

export function attachEnergyVad(stream, { onSilence, onSpeech, silenceMs = 1800, minSpeechMs = 1200, rmsThreshold = 0.04 }) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let speechAt = 0;
  let silentAt = 0;
  let stopped = false;
  let raf = 0;

  const tick = (now) => {
    if (stopped) return;
    analyser.getByteTimeDomainData(data);
    const rms = computePcmRms(data);
    const next = shouldEndTurnOnSilence({
      rms,
      now,
      speechAt,
      silentAt,
      rmsThreshold,
      minSpeechMs,
      silenceMs,
    });
    if (!speechAt && next.speechAt) onSpeech?.();
    speechAt = next.speechAt;
    silentAt = next.silentAt;
    if (next.ended) {
      stopped = true;
      onSilence();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    source.disconnect();
    analyser.disconnect();
    ctx.close().catch(() => {});
  };
}

export function useSpeakingMic() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const levelRaf = useRef(0);
  const previewCtxRef = useRef(null);

  const stopLevelMeter = useCallback(() => {
    cancelAnimationFrame(levelRaf.current);
    setLevel(0);
  }, []);

  const release = useCallback(() => {
    stopLevelMeter();
    if (previewCtxRef.current) {
      previewCtxRef.current.close().catch(() => {});
      previewCtxRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      } catch {
        /* already stopped */
      }
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setStatus('idle');
  }, [stopLevelMeter]);

  useEffect(() => () => release(), [release]);

  const startPreview = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (previewCtxRef.current) {
        previewCtxRef.current.close().catch(() => {});
      }
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      previewCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        setLevel(Math.min(1, computePcmRms(data) * 6));
        levelRaf.current = requestAnimationFrame(tick);
      };
      tick();
      setStatus('preview');
      return stream;
    } catch (err) {
      const code = classifyMicError(err);
      setError(`${micErrorMessage(code)} (${code})`);
      setStatus('idle');
      throw err;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    const stream = streamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: true }));
    streamRef.current = stream;
    const mime = pickMimeType();
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorderRef.current = recorder;
    recorder.start(200);
    setStatus('recording');
    return stream;
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setStatus('idle');
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        setStatus('idle');
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  return {
    status,
    error,
    level,
    streamRef,
    startPreview,
    startRecording,
    stopRecording,
    release,
    attachVad: (onSilence, onSpeech) => {
      if (!streamRef.current) return () => {};
      return attachEnergyVad(streamRef.current, { onSilence, onSpeech, silenceMs: 6000 });
    },
  };
}
