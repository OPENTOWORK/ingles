'use client';

import { useCallback, useRef, useState, type MutableRefObject } from 'react';

function releaseStream(
  streamRef: MutableRefObject<MediaStream | null>,
  mediaRecorderRef: MutableRefObject<MediaRecorder | null>,
) {
  streamRef.current?.getTracks().forEach((t) => t.stop());
  streamRef.current = null;
  mediaRecorderRef.current = null;
}

export function useMediaRecorder() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === 'inactive') {
        setStatus('idle');
        resolve(null);
        return;
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        chunksRef.current = [];
        releaseStream(streamRef, mediaRecorderRef);
        setStatus('idle');
        resolve(blob);
      };
      mr.stop();
      setStatus('stopped');
    });
  }, []);

  const discard = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === 'inactive') {
        chunksRef.current = [];
        releaseStream(streamRef, mediaRecorderRef);
        setStatus('idle');
        resolve();
        return;
      }
      mr.onstop = () => {
        chunksRef.current = [];
        releaseStream(streamRef, mediaRecorderRef);
        setStatus('idle');
        resolve();
      };
      mr.stop();
    });
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mr;
      mr.start(200);
      setStatus('recording');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Microphone error');
      setStatus('idle');
    }
  }, []);

  const pause = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr?.state === 'recording') {
      mr.pause();
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr?.state === 'paused') {
      mr.resume();
      setStatus('recording');
    }
  }, []);

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isActive = isRecording || isPaused;

  return {
    status,
    error,
    start,
    stop,
    discard,
    pause,
    resume,
    isRecording,
    isPaused,
    isActive,
  };
}
