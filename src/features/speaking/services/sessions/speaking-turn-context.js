/** @typedef {'user' | 'assistant'} LlmHistoryRole */
/** @typedef {{ role: LlmHistoryRole, content: string }} LlmHistoryLine */
/** @typedef {{ role: 'USER' | 'ASSISTANT', text: string }} StoredSpeakingTurn */

/** Max prior turns sent to the LLM (user + assistant messages combined). */
export const SPEAKING_LLM_HISTORY_MAX_MESSAGES = 8;

/**
 * Build a bounded LLM history from persisted session turns.
 * The current user utterance must be passed separately as `transcript`.
 *
 * @param {StoredSpeakingTurn[]} turns Chronological session turns.
 * @param {{ maxMessages?: number, omitLatestUserTurn?: boolean }} [options]
 * @returns {LlmHistoryLine[]}
 */
export function buildLlmHistoryFromStoredTurns(turns, options = {}) {
  const maxMessages = options.maxMessages ?? SPEAKING_LLM_HISTORY_MAX_MESSAGES;
  const omitLatestUserTurn = options.omitLatestUserTurn ?? true;

  let mapped = (turns || []).map((turn) => ({
    role: turn.role === 'USER' ? /** @type {const} */ ('user') : /** @type {const} */ ('assistant'),
    content: String(turn.text || ''),
  }));

  if (
    omitLatestUserTurn &&
    mapped.length > 0 &&
    mapped[mapped.length - 1].role === 'user'
  ) {
    mapped = mapped.slice(0, -1);
  }

  if (mapped.length <= maxMessages) return mapped;
  return mapped.slice(-maxMessages);
}

/**
 * Estimate character size of the LLM history block (stable once the window is full).
 * @param {LlmHistoryLine[]} history
 */
export function estimateLlmHistoryPayloadChars(history) {
  return JSON.stringify(history ?? []).length;
}

/**
 * Client turn request body — intentionally excludes accumulated conversation history.
 * History is resolved server-side from the session store with a fixed window.
 *
 * @param {Record<string, unknown>} params
 */
export function buildSpeakingTurnClientPayload(params) {
  const {
    sessionId,
    cefr,
    mode,
    prompt,
    text = '',
    examPartIndex,
    b2PartNumber,
    taskContext,
    isOpening = false,
  } = params;

  const payload = {
    sessionId,
    cefr,
    mode,
    prompt,
    text,
    isOpening,
  };

  if (examPartIndex != null) payload.examPartIndex = examPartIndex;
  if (b2PartNumber != null) payload.b2PartNumber = b2PartNumber;
  if (taskContext != null) payload.taskContext = taskContext;

  return payload;
}

/** @param {Record<string, unknown>} payload */
export function estimateSpeakingTurnClientPayloadChars(payload) {
  return JSON.stringify(payload).length;
}

/**
 * Serialize LLM messages for a single turn (system excluded) — used in tests to detect growth.
 * @param {LlmHistoryLine[]} history
 * @param {string} transcript
 */
export function estimateSpeakingTurnLlmInputChars(history, transcript) {
  const messages = [
    ...history.map((line) => ({ role: line.role, content: line.content })),
    { role: 'user', content: transcript },
  ];
  return JSON.stringify(messages).length;
}
