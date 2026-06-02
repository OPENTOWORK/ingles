// useSpeechRecognition.js
// Custom React hook for Web Speech API (free, no API key needed)
// Works on: Chrome, Edge, Safari (partial)
// Does NOT work on: Firefox

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onEnd, continuous = false }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const latestInterimRef = useRef('');
  const isManualStopRef = useRef(false);
  const langIndexRef = useRef(0);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const LANG_CANDIDATES = ['en-GB', 'en-US'];

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = LANG_CANDIDATES[langIndexRef.current];
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscriptRef.current = '';
      latestInterimRef.current = '';
      isManualStopRef.current = false;
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      latestInterimRef.current = interim;
      setTranscript(final.trim());
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      const latestInterim = latestInterimRef.current.trim();
      setInterimTranscript('');
      const finalText = finalTranscriptRef.current.trim() || latestInterim;
      if (finalText && onResultRef.current) {
        onResultRef.current(finalText);
      }
      if (onEndRef.current) onEndRef.current(finalTranscriptRef.current.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setInterimTranscript('');

      const errorMessages = {
        'not-allowed':
          'Microphone blocked. Click the lock icon in the address bar → Microphone → Allow, then reload. On Windows: Settings → Privacy → Microphone → enable access for your browser.',
        'no-speech': 'No speech detected. Please try speaking louder.',
        'audio-capture': 'No microphone found. Please connect a microphone.',
        'network': 'Speech service network error. You can continue by typing your answer below.',
        'aborted': null, // User stopped — not really an error
      };

      const msg = errorMessages[event.error];
      if (msg) setError(msg);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [continuous]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    latestInterimRef.current = '';
    isManualStopRef.current = false;

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError(
        'Microphone needs a secure connection. Use http://localhost:3002 (not an IP address) or HTTPS.',
      );
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError(
          'Microphone blocked. In Chrome/Edge: click the lock icon in the address bar → Site settings → Microphone → Allow. Then reload this page. On Windows: Settings → Privacy → Microphone → allow apps to access the microphone.',
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No microphone found. Connect a microphone and try again.');
      } else {
        setError(err?.message || 'Could not access the microphone.');
      }
      return;
    }

    try {
      recognitionRef.current.lang = LANG_CANDIDATES[langIndexRef.current];
      recognitionRef.current.start();
    } catch (e) {
      if (String(e?.message || e).includes('already started')) return;
      setError('Could not start speech recognition. Please try again.');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    isManualStopRef.current = true;
    recognitionRef.current.stop();
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    latestInterimRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,          // real-time partial text (show while speaking)
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
