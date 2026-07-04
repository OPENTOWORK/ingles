/**
 * Voice profiles for B2 Listening — varied accents and speakers per extract.
 * Uses Microsoft Edge neural voices (British, US, Australian, Irish, etc.).
 */

/** @typedef {{ edge: string, openai: string }} TtsVoice */
/** @typedef {{ label: string, mono: TtsVoice, speakers: Record<string, TtsVoice> }} ExtractVoiceProfile */

/** Eight distinct extract profiles (one per Part 1 question). */
export const EXTRACT_VOICE_PROFILES = [
  {
    label: 'British female monologue',
    mono: { edge: 'en-GB-SoniaNeural', openai: 'nova' },
    speakers: {
      A: { edge: 'en-GB-SoniaNeural', openai: 'nova' },
      B: { edge: 'en-GB-RyanNeural', openai: 'onyx' },
      C: { edge: 'en-GB-LibbyNeural', openai: 'shimmer' },
    },
  },
  {
    label: 'American male monologue',
    mono: { edge: 'en-US-GuyNeural', openai: 'onyx' },
    speakers: {
      A: { edge: 'en-US-GuyNeural', openai: 'onyx' },
      B: { edge: 'en-US-JennyNeural', openai: 'nova' },
      C: { edge: 'en-US-DavisNeural', openai: 'echo' },
    },
  },
  {
    label: 'Australian female',
    mono: { edge: 'en-AU-NatashaNeural', openai: 'shimmer' },
    speakers: {
      A: { edge: 'en-AU-NatashaNeural', openai: 'shimmer' },
      B: { edge: 'en-AU-WilliamNeural', openai: 'fable' },
      C: { edge: 'en-AU-AnnetteNeural', openai: 'nova' },
    },
  },
  {
    label: 'British male',
    mono: { edge: 'en-GB-RyanNeural', openai: 'onyx' },
    speakers: {
      A: { edge: 'en-GB-RyanNeural', openai: 'onyx' },
      B: { edge: 'en-GB-SoniaNeural', openai: 'nova' },
      C: { edge: 'en-GB-MaisieNeural', openai: 'shimmer' },
    },
  },
  {
    label: 'American female',
    mono: { edge: 'en-US-JennyNeural', openai: 'nova' },
    speakers: {
      A: { edge: 'en-US-JennyNeural', openai: 'nova' },
      B: { edge: 'en-US-GuyNeural', openai: 'onyx' },
      C: { edge: 'en-US-AriaNeural', openai: 'shimmer' },
    },
  },
  {
    label: 'Irish male',
    mono: { edge: 'en-IE-ConnorNeural', openai: 'fable' },
    speakers: {
      A: { edge: 'en-IE-ConnorNeural', openai: 'fable' },
      B: { edge: 'en-IE-EmilyNeural', openai: 'nova' },
      C: { edge: 'en-GB-RyanNeural', openai: 'onyx' },
    },
  },
  {
    label: 'Canadian female',
    mono: { edge: 'en-CA-ClaraNeural', openai: 'shimmer' },
    speakers: {
      A: { edge: 'en-CA-ClaraNeural', openai: 'shimmer' },
      B: { edge: 'en-CA-LiamNeural', openai: 'echo' },
      C: { edge: 'en-US-GuyNeural', openai: 'onyx' },
    },
  },
  {
    label: 'New Zealand male',
    mono: { edge: 'en-NZ-MitchellNeural', openai: 'onyx' },
    speakers: {
      A: { edge: 'en-NZ-MitchellNeural', openai: 'onyx' },
      B: { edge: 'en-NZ-MollyNeural', openai: 'nova' },
      C: { edge: 'en-AU-NatashaNeural', openai: 'shimmer' },
    },
  },
];

/**
 * @param {number} extractIndex 0-based (question 1 → 0)
 * @returns {ExtractVoiceProfile}
 */
export function getExtractVoiceProfile(extractIndex = 0) {
  const profiles = EXTRACT_VOICE_PROFILES;
  const idx = Number(extractIndex);
  if (!Number.isFinite(idx) || idx < 0) return profiles[0];
  return profiles[idx % profiles.length];
}

/**
 * Split script into speaker segments ("A:" / "B:" / "C:" lines).
 * Returns one monologue segment if no labels are found.
 * @param {string} text
 * @returns {Array<{ speaker: string | null, text: string }>}
 */
export function parseDialogueSegments(text) {
  const raw = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return [];

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const speakerRe = /^([A-C])\s*:\s*(.*)$/i;
  const hasLabels = lines.some((l) => speakerRe.test(l));

  if (!hasLabels) {
    return [{ speaker: null, text: raw }];
  }

  /** @type {Array<{ speaker: string | null, text: string }>} */
  const segments = [];
  let currentSpeaker = null;
  /** @type {string[]} */
  let buffer = [];

  const flush = () => {
    if (!currentSpeaker || !buffer.length) return;
    segments.push({ speaker: currentSpeaker, text: buffer.join(' ').trim() });
    buffer = [];
  };

  for (const line of lines) {
    const m = line.match(speakerRe);
    if (m) {
      flush();
      currentSpeaker = m[1].toUpperCase();
      if (m[2].trim()) buffer = [m[2].trim()];
      else buffer = [];
    } else if (currentSpeaker) {
      buffer.push(line);
    }
  }
  flush();

  return segments.length ? segments : [{ speaker: null, text: raw }];
}
