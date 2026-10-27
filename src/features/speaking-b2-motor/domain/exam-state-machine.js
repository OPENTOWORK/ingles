export const SPEAKING_B2_STATES = [
  'READY',
  'AUDIO_CHECK',
  'INTRODUCTION',
  'ASKING',
  'LISTENING',
  'TURN_VALIDATION',
  'FINISHING',
  'PROCESSING',
  'COMPLETED',
  'PAUSED_TECHNICAL',
  'ABORTED',
  'FAILED',
];

export const SPEAKING_B2_TRANSITIONS = {
  READY: ['AUDIO_CHECK', 'ABORTED'],
  AUDIO_CHECK: ['INTRODUCTION', 'FAILED', 'PAUSED_TECHNICAL', 'ABORTED'],
  INTRODUCTION: ['ASKING', 'LISTENING', 'PAUSED_TECHNICAL', 'ABORTED', 'FAILED'],
  ASKING: ['LISTENING', 'FINISHING', 'PAUSED_TECHNICAL', 'ABORTED', 'FAILED'],
  LISTENING: ['TURN_VALIDATION', 'PAUSED_TECHNICAL', 'ABORTED', 'FAILED'],
  TURN_VALIDATION: ['ASKING', 'LISTENING', 'FINISHING', 'PAUSED_TECHNICAL', 'ABORTED', 'FAILED'],
  FINISHING: ['PROCESSING', 'ABORTED', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  PAUSED_TECHNICAL: ['ASKING', 'LISTENING', 'AUDIO_CHECK', 'INTRODUCTION', 'FAILED', 'ABORTED'],
  ABORTED: [],
  FAILED: [],
};

export function isSpeakingB2State(state) {
  return SPEAKING_B2_STATES.includes(state);
}

export function canTransitionSpeakingB2(from, to) {
  if (!isSpeakingB2State(from) || !isSpeakingB2State(to)) return false;
  if (from === to) return true;
  return (SPEAKING_B2_TRANSITIONS[from] || []).includes(to);
}

export function transitionSpeakingB2(from, to) {
  if (!canTransitionSpeakingB2(from, to)) {
    const error = new Error(`Invalid speaking state transition: ${from} → ${to}`);
    error.code = 'INVALID_STATE_TRANSITION';
    throw error;
  }
  return to;
}

export function isTerminalSpeakingB2State(state) {
  return state === 'COMPLETED' || state === 'ABORTED' || state === 'FAILED';
}

export function isLiveSpeakingB2State(state) {
  return ['INTRODUCTION', 'ASKING', 'LISTENING', 'TURN_VALIDATION', 'FINISHING'].includes(state);
}
