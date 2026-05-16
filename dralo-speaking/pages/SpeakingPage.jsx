// SpeakingPage.jsx
// Main speaking practice page for Dralo
// Drop this into your pages/ or app/ folder
//
// DEPENDENCIES: Make sure these are installed:
//   npm install lucide-react
//
// ENV: Add to your .env file:
//   VITE_GEMINI_API_KEY=your_gemini_api_key_here

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Award, MessageSquare, BookOpen, FileText } from 'lucide-react';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import { TranscriptPanel } from '@/features/speaking/ui/components/TranscriptPanel';
import { VoiceControls } from '@/features/speaking/ui/components/VoiceControls';
import { ExamTimer } from '@/features/speaking/ui/components/ExamTimer';
import { PartStepper } from '@/features/speaking/ui/components/PartStepper';
import { ExaminerPanel } from '@/features/speaking/ui/components/ExaminerPanel';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import { sendToGemini, speakText, stopSpeaking, getBritishVoices, setPreferredBritishVoice } from '../lib/gemini-coach';
import { CAMBRIDGE_TOPICS, EXAM_PARTS } from '../prompts/cambridge-prompts';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const MODES = [
  { id: 'practice', label: 'Practice', icon: MessageSquare, description: 'Free conversation with your AI coach' },
  { id: 'correction', label: 'Correction', icon: BookOpen, description: 'Detailed feedback on every answer' },
  { id: 'exam', label: 'Exam sim', icon: Award, description: 'Official speaking exam simulation' },
];

const LEVEL_COLORS = {
  A2: { bg: '#E1F5EE', text: '#085041', border: '#5DCAA5' },
  B1: { bg: '#E6F1FB', text: '#0C447C', border: '#378ADD' },
  B2: { bg: '#EEEDFE', text: '#3C3489', border: '#7F77DD' },
  C1: { bg: '#FAEEDA', text: '#633806', border: '#EF9F27' },
  C2: { bg: '#FAECE7', text: '#712B13', border: '#D85A30' },
};

function withBasePath(path) {
  const b =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
      ? String(process.env.NEXT_PUBLIC_BASE_PATH).replace(/\/$/, '')
      : '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return b ? `${b}${p}` : p;
}

function greetingsFor(level, topic) {
  return {
    practice:
      `Hi! I'm Dralo, your ${level} speaking coach. Let's practise! Here's your first topic:\n\n"${topic}"\n\nTake a moment to think, then start speaking whenever you're ready.`,
    correction:
      `Hello! In correction mode, I'll give you detailed feedback on grammar, vocabulary, discourse and fluency after each answer. Your topic:\n\n"${topic}"\n\nSpeak for 1-2 minutes, then I'll give you a full analysis.`,
    exam:
      `Good morning. My name is Dralo, and I'm going to conduct your ${level} speaking examination today. This is Part 1. I'd like to know something about you. Could you start by telling me your full name, please?`,
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Waveform({ isActive }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      height: '32px',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.3s',
    }}>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            backgroundColor: '#D85A30',
            animation: isActive ? `waveAnim 0.8s ease-in-out ${i * 0.1}s infinite` : 'none',
            height: isActive ? '4px' : '4px',
          }}
        />
      ))}
      <style>{`
        @keyframes waveAnim {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
      `}</style>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const isCorrection = message.role === 'correction';

  const styles = {
    user: {
      background: '#1D9E75',
      color: 'white',
      alignSelf: 'flex-end',
      borderBottomRightRadius: '4px',
    },
    ai: {
      background: '#eef2f6',
      color: '#111827',
      border: '1px solid #e2e8f0',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: '4px',
    },
    correction: {
      background: '#FAEEDA',
      color: '#633806',
      borderLeft: '3px solid #EF9F27',
      borderRadius: '8px',
      alignSelf: 'flex-start',
    },
  };

  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: '14px',
      fontSize: '14px',
      lineHeight: '1.5',
      maxWidth: '85%',
      ...(isUser ? styles.user : isCorrection ? styles.correction : styles.ai),
    }}>
      {message.text}
    </div>
  );
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', margin: '4px 0' }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: color,
        borderRadius: '3px',
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

function CorrectionPanel({ data, level }) {
  if (!data) return null;

  const colors = LEVEL_COLORS[level];
  const scores = data.scores || {};
  const scoreEntries = Object.entries(scores);

  const getBarColor = (score) => {
    if (score >= 70) return '#1D9E75';
    if (score >= 50) return '#EF9F27';
    return '#E24B4A';
  };

  return (
    <div style={{
      border: '0.5px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '8px',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: colors.bg,
        borderBottom: '0.5px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text }}>Feedback</span>
        <span style={{
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: '12px',
          background: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontWeight: 500,
        }}>
          {data.overall_band || level}
        </span>
      </div>

      {/* Scores grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        {scoreEntries.map(([key, value], i) => (
          <div key={key} style={{
            padding: '10px 14px',
            borderRight: i % 2 === 0 ? '0.5px solid #e0e0e0' : 'none',
            borderBottom: i < scoreEntries.length - 2 ? '0.5px solid #e0e0e0' : 'none',
          }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'capitalize', marginBottom: '2px' }}>
              {key.replace(/_/g, ' ')}
            </div>
            <ScoreBar value={value} color={getBarColor(value)} />
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{value}%</div>
          </div>
        ))}
      </div>

      {/* Corrections */}
      {data.corrections?.length > 0 && (
        <div style={{ padding: '12px 14px', borderTop: '0.5px solid #e0e0e0' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Corrections
          </div>
          {data.corrections.map((c, i) => (
            <div key={i} style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.5' }}>
              <span style={{ color: '#E24B4A', textDecoration: 'line-through', marginRight: '6px' }}>{c.original}</span>
              <span style={{ color: '#1D9E75', marginRight: '6px' }}>→ {c.corrected}</span>
              <span style={{ color: '#666' }}>({c.explanation})</span>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      {(data.tip || data.priority_tip) && (
        <div style={{
          padding: '10px 14px',
          borderTop: '0.5px solid #e0e0e0',
          background: '#E1F5EE',
          fontSize: '13px',
          color: '#085041',
        }}>
          💡 {data.tip || data.priority_tip}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SpeakingPage() {
  const [level, setLevel] = useState('B1');
  const [mode, setMode] = useState('practice');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [correctionData, setCorrectionData] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('');
  /** Exam simulation — mirrors `/niveles/speaking-lab/[cefr]/exam` */
  const examBlueprint = useMemo(() => getExamBlueprint(level), [level]);
  const examMedia = useMediaRecorder();
  const [examSessionId, setExamSessionId] = useState(null);
  const [examPartIndex, setExamPartIndex] = useState(0);
  const [examTimerKey, setExamTimerKey] = useState(0);
  const [examLines, setExamLines] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examReport, setExamReport] = useState(null);
  const [examTyped, setExamTyped] = useState('');
  const [examRestartKey, setExamRestartKey] = useState(0);

  const examCurrentPart = examBlueprint.parts[examPartIndex] ?? examBlueprint.parts[0];
  const examPromptStub = examCurrentPart?.instructions ?? '';
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [useBrowserSttFallback, setUseBrowserSttFallback] = useState(false);
  const [speechInfo, setSpeechInfo] = useState(null);
  const [sttHardUnavailable, setSttHardUnavailable] = useState(false);

  const [practiceSessionId, setPracticeSessionId] = useState(null);
  const [practiceReport, setPracticeReport] = useState(null);
  const [practiceEnded, setPracticeEnded] = useState(false);
  const [practiceReportLoading, setPracticeReportLoading] = useState(false);
  const [practiceRestartKey, setPracticeRestartKey] = useState(0);

  const chatScrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Scroll only inside the chat column — scrollIntoView was scrolling the whole window
  // and hid the site header + pushed the conversation out of view.
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };
    requestAnimationFrame(run);
  }, [messages]);

  // Get a random topic for the current level
  const getRandomTopic = useCallback((lvl = level) => {
    const topics = CAMBRIDGE_TOPICS[lvl];
    return topics[Math.floor(Math.random() * topics.length)];
  }, [level]);

  // Initialize conversation when level or mode changes (practice / correction — not exam)
  useEffect(() => {
    if (mode === 'exam') return;

    const topic = getRandomTopic(level);
    setCurrentTopic(topic);
    setCorrectionData(null);
    setPracticeReport(null);
    setPracticeEnded(false);

    const g = greetingsFor(level, topic);

    setMessages([{ role: 'ai', text: g[mode] }]);

    if (ttsEnabled) {
      queueMicrotask(() => speakText(g[mode]));
    }
  }, [level, mode]);

  useEffect(() => {
    if (mode !== 'exam') {
      setExamSessionId(null);
      setExamFinished(false);
      setExamReport(null);
      setExamLoading(false);
      setExamTyped('');
      return undefined;
    }

    setExamLines([]);
    setExamHistory([]);
    setExamFinished(false);
    setExamReport(null);
    setExamPartIndex(0);
    setExamTimerKey((k) => k + 1);

    let cancelled = false;
    (async () => {
      const res = await fetch(withBasePath('/api/speaking/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'EXAM', cefr: level }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setExamSessionId(data.sessionId);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, level, examRestartKey]);

  useEffect(() => {
    if (mode !== 'practice') {
      setPracticeSessionId(null);
      setPracticeEnded(false);
      setPracticeReport(null);
      setPracticeReportLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(withBasePath('/api/speaking/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PRACTICE', cefr: level }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setPracticeSessionId(data.sessionId);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, level, practiceRestartKey]);

  useEffect(() => {
    let active = true;
    (async () => {
      const ukVoices = await getBritishVoices();
      if (!active) return;
      setVoiceOptions(ukVoices);
      if (ukVoices.length > 0 && !selectedVoiceName) {
        const scoreVoice = (name = '') => {
          const n = name.toLowerCase();
          if (n.includes('microsoft sonia online (natural)')) return 100;
          if (n.includes('microsoft maisie online (natural)')) return 98;
          if (n.includes('google uk english female')) return 95;
          if (n.includes('microsoft ryan online (natural)')) return 95;
          if (n.includes('microsoft libby online (natural)')) return 92;
          if (n.includes('microsoft') && n.includes('online') && n.includes('natural')) return 90;
          if (n.includes('google uk english male')) return 82;
          if (n.includes('sonia')) return 80;
          if (n.includes('maisie')) return 79;
          if (n.includes('ryan')) return 78;
          if (n.includes('libby')) return 76;
          if (n.includes('hazel')) return 70;
          return 10;
        };

        const best = [...ukVoices].sort((a, b) => scoreVoice(b.name) - scoreVoice(a.name))[0];
        if (best?.name) {
          setSelectedVoiceName(best.name);
          setPreferredBritishVoice(best.name);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Handle transcription result from speech recognition
  const handleTranscript = useCallback(async (transcript) => {
    if (!transcript.trim()) return;
    if (mode === 'exam') return;
    if (mode === 'practice' && practiceEnded) return;

    // Add user message to chat
    const userMsg = { role: 'user', text: transcript };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setCorrectionData(null);

    try {
      // Get history for context (last 10 messages)
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));

      const response = await sendToGemini({
        userMessage: transcript,
        level,
        mode,
        conversationHistory: history,
      });

      if (response.type === 'conversation') {
        const aiMsg = { role: 'ai', text: response.text };
        setMessages(prev => [...prev, aiMsg]);

        if (ttsEnabled) {
          setIsSpeaking(true);
          speakText(response.text, {
            onEnd: () => setIsSpeaking(false),
          });
        }
      } else if (response.type === 'correction') {
        // Show correction panel
        setCorrectionData(response.data);

        const summary = response.data.positive
          ? `Good effort! ${response.data.positive} Check the detailed feedback below.`
          : 'Here\'s your detailed feedback. Check the panel below for corrections and scores.';

        const aiMsg = { role: 'ai', text: summary };
        setMessages(prev => [...prev, aiMsg]);

        if (ttsEnabled) {
          setIsSpeaking(true);
          speakText(summary, { onEnd: () => setIsSpeaking(false) });
        }
      }
    } catch (error) {
      const errorMsg = {
        role: 'ai',
        text: `Sorry, I had a problem processing that. ${error.message}. Please try again.`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [level, mode, messages, ttsEnabled, practiceEnded]);

  const practiceHasUserTurns = messages.some((m) => m.role === 'user');

  const endPracticeAndReport = useCallback(async () => {
    const userLines = messages
      .filter((m) => m.role === 'user')
      .map((m) => String(m.text).trim())
      .filter(Boolean);
    if (!practiceSessionId || userLines.length === 0) return;
    stopSpeaking();
    setPracticeReportLoading(true);
    try {
      const res = await fetch(withBasePath('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: practiceSessionId,
          cefr: level,
          mode: 'PRACTICE',
          combinedTranscript: userLines.join('\n\n'),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.details || payload.error || res.statusText);
      }
      setPracticeReport(payload.report);
      setPracticeEnded(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "Here's your full practice session report below (same style as Speaking Lab «End exam & get report»). When you're ready, tap Practice again.",
        },
      ]);
      if (ttsEnabled) {
        setIsSpeaking(true);
        speakText('Here is your holistic practice session report.', { onEnd: () => setIsSpeaking(false) });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Could not generate the report: ${err?.message || 'Unknown error'}. Check OPENAI_API_KEY and try again.`,
        },
      ]);
    } finally {
      setPracticeReportLoading(false);
    }
  }, [practiceSessionId, messages, level, ttsEnabled]);

  const restartPracticeConversation = useCallback(() => {
    stopSpeaking();
    setPracticeEnded(false);
    setPracticeReport(null);
    const topic = getRandomTopic(level);
    setCurrentTopic(topic);
    const g = greetingsFor(level, topic);
    setMessages([{ role: 'ai', text: g.practice }]);
    setCorrectionData(null);
    setPracticeRestartKey((k) => k + 1);
    if (ttsEnabled) {
      queueMicrotask(() => speakText(g.practice));
    }
  }, [level, ttsEnabled, getRandomTopic]);

  const submitExamTurn = useCallback(
    async (text, audio) => {
      if (!examSessionId || examFinished) return;
      const trimmed = typeof text === 'string' ? text.trim() : '';
      setExamLoading(true);
      try {
        let res;
        if (audio) {
          const form = new FormData();
          form.set('sessionId', examSessionId);
          form.set('cefr', level);
          form.set('mode', 'EXAM');
          form.set('prompt', examPromptStub);
          form.set('history', JSON.stringify(examHistory));
          form.set('examPartIndex', String(examPartIndex));
          form.append('audio', audio, 'capture.webm');
          res = await fetch(withBasePath('/api/speaking/turn'), { method: 'POST', body: form });
        } else {
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: examSessionId,
              cefr: level,
              mode: 'EXAM',
              prompt: examPromptStub,
              history: examHistory,
              text: trimmed,
              examPartIndex,
            }),
          });
        }
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload.details || payload.error || res.statusText);
        }
        setExamLines((prev) => [
          ...prev,
          { role: 'user', content: payload.transcript },
          { role: 'assistant', content: payload.assistantText },
        ]);
        setExamHistory((h) => [
          ...h,
          { role: 'user', content: payload.transcript },
          { role: 'assistant', content: payload.assistantText },
        ]);
        if (ttsEnabled && payload.assistantText) {
          setIsSpeaking(true);
          speakText(payload.assistantText, { onEnd: () => setIsSpeaking(false) });
        }
      } catch (err) {
        setExamLines((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Turn failed: ${err?.message || 'unknown error'}. Try again or type your answer.`,
          },
        ]);
      } finally {
        setExamLoading(false);
      }
    },
    [
      examSessionId,
      examFinished,
      level,
      examPromptStub,
      examHistory,
      examPartIndex,
      ttsEnabled,
    ],
  );

  const finalizeExamReport = useCallback(async () => {
    if (!examSessionId) return;
    const userOnly = examLines.filter((l) => l.role === 'user').map((l) => l.content);
    const combinedTranscript = userOnly.join('\n\n');
    if (!combinedTranscript.trim()) return;
    stopSpeaking();
    setExamLoading(true);
    try {
      const res = await fetch(withBasePath('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: examSessionId,
          cefr: level,
          mode: 'EXAM',
          combinedTranscript,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.details || payload.error || res.statusText);
      }
      setExamReport(payload.report);
      setExamFinished(true);
    } catch (err) {
      setExamLines((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Could not generate the report: ${err?.message || 'Unknown error'}. Check OPENAI_API_KEY.`,
        },
      ]);
    } finally {
      setExamLoading(false);
    }
  }, [examSessionId, examLines, level]);

  const restartExamSimulation = useCallback(() => {
    stopSpeaking();
    setExamRestartKey((k) => k + 1);
  }, []);

  const {
    isListening: isBrowserListening,
    interimTranscript,
    error: browserSpeechError,
    isSupported: isBrowserSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (text) => {
      handleTranscript(text);
    },
    onEnd: () => {},
    continuous: false,
  });

  useEffect(() => {
    if (useBrowserSttFallback && browserSpeechError) {
      const lower = String(browserSpeechError).toLowerCase();
      if (lower.includes('network')) {
        setUseBrowserSttFallback(false);
        setSttHardUnavailable(true);
        setSpeechError(
          'Voice transcription is currently unavailable (Gemini quota exceeded and browser speech service network error). Add OPENAI_API_KEY to restore voice input.',
        );
        return;
      }
      setSpeechError(browserSpeechError);
    }
  }, [useBrowserSttFallback, browserSpeechError]);

  useEffect(() => {
    if (isBrowserListening) {
      setSpeechError(null);
      setSpeechInfo('Browser speech recognition active.');
      const timer = setTimeout(() => setSpeechInfo(null), 1800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isBrowserListening]);

  const stopRecordingAndProcess = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    setSpeechError(null);
    stopSpeaking();
    setIsSpeaking(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop());
        mediaStreamRef.current = null;

        if (!blob || blob.size === 0) {
          setSpeechError('No audio captured. Please try again.');
          return;
        }

        setIsLoading(true);
        try {
          const form = new FormData();
          form.append('audio', blob, 'speech.webm');
          const response = await fetch('/api/gemini-transcribe/', {
            method: 'POST',
            body: form,
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const details = payload?.details ? ` (${payload.details})` : '';
            throw new Error((payload?.error || 'Transcription failed') + details);
          }

          const payload = await response.json();
          const transcript = String(payload?.text || '').trim();
          if (!transcript) {
            throw new Error('No speech recognized. Try speaking a bit louder and closer to the mic.');
          }
          await handleTranscript(transcript);
        } catch (err) {
          const rawMessage = String(err?.message || '');
          const normalized = rawMessage.toLowerCase();
          const isQuotaError =
            normalized.includes('quota') ||
            normalized.includes('rate limit') ||
            normalized.includes('resource_exhausted') ||
            normalized.includes('limit: 0');

          if (isQuotaError) {
            setUseBrowserSttFallback(true);
            if (isBrowserSpeechSupported) {
              setSpeechError(null);
              setSpeechInfo('Gemini STT has no quota. Switching to browser speech recognition fallback.');
              queueMicrotask(() => {
                try {
                  startListening();
                } catch {
                  /* ignore start race errors */
                }
              });
            } else {
              setSpeechError(
                'Gemini STT has no quota and browser speech recognition is unavailable. Please use typed input below.',
              );
            }
          } else {
            setSpeechError(rawMessage || 'Speech transcription failed. You can continue by typing below.');
          }
          setIsLoading(false);
        }
      };

      recorder.start(120);
      setIsRecording(true);
    } catch (err) {
      setSpeechError('Microphone access failed. Please allow microphone permissions.');
      setIsRecording(false);
    }
  }, [handleTranscript, isBrowserSpeechSupported, startListening]);

  const toggleListening = () => {
    if (mode === 'exam') return;
    if (mode === 'practice' && practiceEnded) return;
    if (sttHardUnavailable) {
      setSpeechError(
        'Voice input is temporarily disabled. Configure OPENAI_API_KEY in .env.local and restart dev server.',
      );
      return;
    }

    if (useBrowserSttFallback && isBrowserSpeechSupported) {
      if (isBrowserListening) {
        stopListening();
      } else {
        setSpeechError(null);
        stopSpeaking();
        setIsSpeaking(false);
        startListening();
      }
      return;
    }

    if (isRecording) {
      stopRecordingAndProcess();
      return;
    }
    startRecording();
  };

  const handleSendTypedMessage = async () => {
    const text = typedMessage.trim();
    if (!text || isLoading || (mode === 'practice' && practiceEnded)) return;
    setTypedMessage('');
    await handleTranscript(text);
  };

  const handleNewTopic = () => {
    if (mode === 'practice' && practiceEnded) return;
    const topic = getRandomTopic();
    setCurrentTopic(topic);
    const msg = { role: 'ai', text: `Here's a new topic for you:\n\n"${topic}"\n\nTake your time and speak for at least 1 minute.` };
    setMessages(prev => [...prev, msg]);
    setCorrectionData(null);
    if (ttsEnabled) speakText(msg.text);
  };

  const levelColors = LEVEL_COLORS[level];
  const micIsActive = isRecording || isBrowserListening;
  const lastExamAssistant = [...examLines].reverse().find((l) => l.role === 'assistant');

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      width: '100%',
      maxWidth: '100%',
      background: 'var(--color-background-primary, #fff)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: '0.5px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        background: 'var(--color-background-primary, #fff)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' }} />
          <span style={{ fontWeight: 700, fontSize: '18px' }}>Dralo</span>
          <span style={{ color: '#999', fontSize: '14px' }}>/ Speaking</span>
        </div>

        {/* Level selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: l === level ? `1.5px solid ${LEVEL_COLORS[l].border}` : '0.5px solid #ddd',
                background: l === level ? LEVEL_COLORS[l].bg : 'transparent',
                color: l === level ? LEVEL_COLORS[l].text : '#666',
                fontSize: '13px',
                fontWeight: l === level ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* TTS toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {voiceOptions.length > 0 && (
            <select
              value={selectedVoiceName}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedVoiceName(name);
                setPreferredBritishVoice(name);
              }}
              style={{
                maxWidth: '220px',
                padding: '6px 8px',
                borderRadius: '8px',
                border: '0.5px solid #ddd',
                background: 'white',
                fontSize: '12px',
                color: '#333',
              }}
              title="English voice selection"
            >
              {voiceOptions.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.recommended ? `UK ★ ${v.name}` : `${v.lang} ${v.name}`}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => { setTtsEnabled(prev => !prev); stopSpeaking(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '0.5px solid #ddd',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: ttsEnabled ? '#1D9E75' : '#999',
            }}
            title={ttsEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{ttsEnabled ? 'Voice on' : 'Voice off'}</span>
          </button>
        </div>
      </header>

      {/* Mode tabs — justo bajo la barra (el vídeo va al final para no tapar la práctica) */}
      <div style={{ padding: '12px 24px', borderBottom: '0.5px solid #e0e0e0', display: 'flex', gap: '8px', flexShrink: 0, background: '#fff' }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '0.5px solid',
              borderColor: mode === m.id ? levelColors.border : '#ddd',
              background: mode === m.id ? levelColors.bg : 'transparent',
              color: mode === m.id ? levelColors.text : '#666',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: mode === m.id ? 500 : 400,
              transition: 'all 0.15s',
            }}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'exam' ? (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px 28px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'var(--color-background-primary, #fff)',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
            {level} — examiner role until the final report (same simulation as Speaking Lab → Exam).
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <PartStepper parts={examBlueprint.parts} currentIndex={examPartIndex} />
            <ExamTimer
              key={`${examPartIndex}-${examTimerKey}`}
              seconds={examCurrentPart?.suggestedTimeSec ?? 120}
              resetKey={examTimerKey}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TranscriptPanel lines={examLines} />
              <div className="mt-4 space-y-4">
                <VoiceControls
                  media={examMedia}
                  disabled={examLoading || !examSessionId || examFinished}
                  onRecorded={(blob) => submitExamTurn('', blob)}
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={examTyped}
                    onChange={(e) => setExamTyped(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    placeholder="Or type your answer"
                    disabled={examFinished}
                  />
                  <button
                    type="button"
                    disabled={examLoading || !examTyped.trim() || examFinished}
                    onClick={async () => {
                      const t = examTyped.trim();
                      setExamTyped('');
                      await submitExamTurn(t);
                    }}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            <ExaminerPanel
              title={examCurrentPart?.name ?? 'Part'}
              instructions={examCurrentPart?.instructions ?? ''}
              lastPrompt={lastExamAssistant?.content}
            />
          </div>

          <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              disabled={examPartIndex >= examBlueprint.parts.length - 1 || examFinished}
              onClick={() => {
                setExamPartIndex((i) => Math.min(i + 1, examBlueprint.parts.length - 1));
                setExamTimerKey((k) => k + 1);
              }}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:opacity-40"
            >
              Next part
            </button>
            <button
              type="button"
              disabled={examLoading || examLines.length === 0 || examFinished}
              onClick={() => finalizeExamReport()}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                cursor: examLoading || examLines.length === 0 || examFinished ? 'not-allowed' : 'pointer',
                background: '#d97706',
                opacity: examLoading || examLines.length === 0 || examFinished ? 0.45 : 1,
              }}
            >
              End exam & get report
            </button>
            {examFinished ? (
              <button
                type="button"
                onClick={() => restartExamSimulation()}
                className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-800 hover:bg-slate-100"
              >
                New exam attempt
              </button>
            ) : null}
          </div>

          {examFinished && examReport ? (
            <div style={{ marginTop: '28px', maxWidth: '960px' }}>
              <FeedbackCards report={examReport} />
            </div>
          ) : null}
        </div>
      ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 300px) minmax(0, 1fr)',
          alignItems: 'stretch',
          width: '100%',
          flexShrink: 0,
          borderTop: '0.5px solid #e0e0e0',
        }}
      >
        {/* Left panel — Avatar + controls */}
        <div style={{
          borderRight: '0.5px solid #e0e0e0',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}>
          {/* Avatar */}
          <div style={{
            background: levelColors.bg,
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              {/* Pulse ring when AI is speaking */}
              {isSpeaking && (
                <>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px', height: '100px',
                    borderRadius: '50%',
                    border: `2px solid ${levelColors.border}`,
                    animation: 'pulseRing 1.2s ease-out infinite',
                  }} />
                  <style>{`@keyframes pulseRing { 0% { transform: translate(-50%,-50%) scale(0.95); opacity:0.8; } 100% { transform: translate(-50%,-50%) scale(1.4); opacity:0; } }`}</style>
                </>
              )}

              <img
                src="/dralo-coach.png"
                alt="Dralo speaking coach"
                width={90}
                height={90}
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: `2px solid ${levelColors.border}`,
                  background: levelColors.bg,
                }}
              />
            </div>

            <div style={{ fontSize: '13px', color: levelColors.text, textAlign: 'center', fontWeight: 500 }}>
              {micIsActive ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : isLoading ? '⏳ Thinking...' : '✨ Dralo — your coach'}
            </div>

            <Waveform isActive={micIsActive} />
          </div>

          {/* Current topic */}
          {mode !== 'exam' && (
            <div style={{
              border: '0.5px solid #e0e0e0',
              borderRadius: '12px',
              padding: '14px',
              background: 'var(--color-background-secondary, #f9f9f9)',
            }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                {level} topic
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-primary, #111)' }}>
                {currentTopic}
              </div>
            </div>
          )}

          {useBrowserSttFallback && isBrowserSpeechSupported && (
            <div style={{
              padding: '10px',
              border: '0.5px solid #e0e0e0',
              borderRadius: '8px',
              background: '#E6F1FB',
              fontSize: '12px',
              color: '#0C447C',
            }}>
              Browser STT fallback active{interimTranscript ? `: "${interimTranscript}"` : '.'}
            </div>
          )}

          {speechError && (
            <div style={{
              padding: '12px',
              background: '#FAECE7',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#712B13',
            }}>
              {speechError}
            </div>
          )}

          {speechInfo && (
            <div style={{
              padding: '10px',
              background: '#E6F1FB',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0C447C',
            }}>
              {speechInfo}
            </div>
          )}

          {mode === 'practice' && !practiceEnded ? (
            <button
              type="button"
              onClick={endPracticeAndReport}
              disabled={
                practiceReportLoading || !practiceHasUserTurns || !practiceSessionId || isLoading
              }
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: '#d97706',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor:
                  practiceReportLoading || !practiceHasUserTurns || !practiceSessionId
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  practiceReportLoading || !practiceHasUserTurns || !practiceSessionId ? 0.55 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FileText size={17} />
              {practiceReportLoading ? 'Generating report…' : 'End conversation & get report'}
            </button>
          ) : null}

          {mode === 'practice' && practiceEnded ? (
            <button
              type="button"
              onClick={restartPracticeConversation}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1.5px solid ${levelColors.border}`,
                background: levelColors.bg,
                color: levelColors.text,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Practice again
            </button>
          ) : null}

          {/* Record button */}
          <button
            onClick={toggleListening}
            disabled={isLoading || sttHardUnavailable || (mode === 'practice' && practiceEnded)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: micIsActive ? '#D85A30' : '#1D9E75',
              color: 'white',
              fontSize: '15px',
              fontWeight: 500,
              cursor: !isLoading && !sttHardUnavailable ? 'pointer' : 'not-allowed',
              opacity: !isLoading && !sttHardUnavailable ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
              animation: micIsActive ? 'btnPulse 1.2s ease-in-out infinite' : 'none',
            }}
          >
            {micIsActive ? <MicOff size={18} /> : <Mic size={18} />}
            {micIsActive ? 'Stop speaking' : sttHardUnavailable ? 'Voice unavailable' : isLoading ? 'Processing...' : 'Start speaking'}
          </button>

          {/* Manual input fallback */}
          <div style={{
            border: '0.5px solid #e0e0e0',
            borderRadius: '10px',
            padding: '10px',
            background: 'var(--color-background-secondary, #f9f9f9)',
          }}>
            <div style={{ fontSize: '12px', color: '#777', marginBottom: '8px' }}>
              Type your answer (fallback if mic/network fails)
            </div>
            <textarea
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              rows={4}
              disabled={mode === 'practice' && practiceEnded}
              placeholder="Type your response in English..."
              style={{
                width: '100%',
                border: '0.5px solid #ddd',
                borderRadius: '8px',
                padding: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '13px',
                background: 'white',
              }}
            />
            <button
              onClick={handleSendTypedMessage}
              disabled={isLoading || !typedMessage.trim() || (mode === 'practice' && practiceEnded)}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#3C3489',
                color: 'white',
                fontSize: '13px',
                cursor: isLoading || !typedMessage.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !typedMessage.trim() ? 0.6 : 1,
              }}
            >
              Send typed answer
            </button>
          </div>

          {/* New topic button */}
          {mode !== 'exam' && !(mode === 'practice' && practiceEnded) ? (
            <button
              onClick={handleNewTopic}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '0.5px solid #ddd',
                background: 'transparent',
                color: '#666',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              New topic
            </button>
          ) : null}
        </div>

        {/* Right panel — Chat (altura mínima para que no “desaparezca” con flex del padre) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#fff',
        }}>
          {/* Chat messages */}
          <div
            ref={chatScrollRef}
            style={{
            minHeight: 300,
            maxHeight: 560,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            WebkitOverflowScrolling: 'touch',
            borderLeft: '0.5px solid #f0f0f0',
          }}
          >
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '14px',
                borderBottomLeftRadius: '4px',
                background: 'var(--color-background-secondary, #f5f5f5)',
                alignSelf: 'flex-start',
                fontSize: '14px',
                color: '#999',
              }}>
                Dralo is thinking...
              </div>
            )}

            {/* Correction panel */}
            {correctionData && mode === 'correction' && (
              <CorrectionPanel data={correctionData} level={level} />
            )}

            {practiceReport && mode === 'practice' && (
              <div
                style={{
                  alignSelf: 'stretch',
                  marginTop: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '0.5px solid #e0e0e0',
                  background: '#0f172a',
                }}
              >
                <div
                  style={{
                    padding: '10px 12px',
                    background: '#1e293b',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#bae6fd',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Practice session report
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <FeedbackCards report={practiceReport} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      )}

      {/* Vídeo de presentación al final: antes ocupaba todo el hueco visual y la práctica quedaba fuera de vista */}
      {mode !== 'exam' ? (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 24px 20px',
            borderTop: '0.5px solid #e0e0e0',
            background: 'var(--color-background-secondary, #f5f5f5)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Presentation video (optional)
          </div>
          <video
            controls
            preload="metadata"
            playsInline
            style={{
              width: '100%',
              maxHeight: '200px',
              height: 'auto',
              borderRadius: '10px',
              background: '#111',
            }}
          >
            <source src="/dralo-presentation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null}

      <style>{`
        @keyframes btnPulse { 0%,100% { opacity:1; } 50% { opacity:0.85; } }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
