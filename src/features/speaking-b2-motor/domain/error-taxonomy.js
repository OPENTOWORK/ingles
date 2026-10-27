export const SPEAKING_B2_ERROR_CATEGORIES = {
  GR: 'Grammar',
  VC: 'Vocabulary',
  DM: 'Discourse Management',
  FL: 'Fluency',
  PN: 'Pronunciation',
  IC: 'Interactive Communication',
};

export const SPEAKING_B2_ERROR_CODES = {
  'GR-AR': { category: 'GR', label: 'Articles' },
  'GR-VT': { category: 'GR', label: 'Verb tenses' },
  'GR-AG': { category: 'GR', label: 'Agreement' },
  'GR-WO': { category: 'GR', label: 'Word order' },
  'GR-PR': { category: 'GR', label: 'Prepositions' },
  'VC-CO': { category: 'VC', label: 'Collocations' },
  'VC-WF': { category: 'VC', label: 'Word formation' },
  'VC-WW': { category: 'VC', label: 'Word choice' },
  'VC-RP': { category: 'VC', label: 'Excessive repetition' },
  'DM-OR': { category: 'DM', label: 'Organisation' },
  'DM-EL': { category: 'DM', label: 'Elaboration' },
  'DM-LK': { category: 'DM', label: 'Linking' },
  'DM-RV': { category: 'DM', label: 'Relevance' },
  'FL-HP': { category: 'FL', label: 'Hesitation' },
  'FL-RS': { category: 'FL', label: 'Restarts' },
  'FL-PB': { category: 'FL', label: 'Disruptive pauses' },
  'PN-SO': { category: 'PN', label: 'Sounds' },
  'PN-WS': { category: 'PN', label: 'Word stress' },
  'PN-ST': { category: 'PN', label: 'Sentence stress' },
  'PN-IN': { category: 'PN', label: 'Intonation' },
  'IC-AN': { category: 'IC', label: 'Response appropriacy' },
  'IC-CL': { category: 'IC', label: 'Clarification' },
  'IC-RT': { category: 'IC', label: 'Turn-taking' },
};

const QUESTION_INDEX = /P1-Q(\d+)/i;

export function speakingB2QuestionOrdinal(questionId) {
  const match = String(questionId || '').match(QUESTION_INDEX);
  if (!match) return '00';
  return String(Number(match[1])).padStart(2, '0');
}

export function buildSpeakingB2IssueId({ examCode = 'SP-EX001', questionId, code, index = 1 }) {
  const q = speakingB2QuestionOrdinal(questionId);
  const n = String(index).padStart(3, '0');
  return `${examCode}-P1-Q${q}-${code}-${n}`;
}

export const SPEAKING_B2_META_ISSUE_CODES = {
  review_required: { category: 'RV', label: 'Needs review' },
  unclassified: { category: 'RV', label: 'Unclassified' },
};

export function isSpeakingB2MetaIssueCode(code) {
  return Boolean(SPEAKING_B2_META_ISSUE_CODES[code]);
}

export function isKnownSpeakingB2ErrorCode(code) {
  return Boolean(SPEAKING_B2_ERROR_CODES[code]) || isSpeakingB2MetaIssueCode(code);
}
