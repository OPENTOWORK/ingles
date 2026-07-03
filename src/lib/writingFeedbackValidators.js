/** Regression validators for B2 Writing feedback (libraries essay fixture). */

export const LIBRARIES_WRITING_FIXTURE = {
  task:
    'Libraries are no longer needed, as people can learn all they need to online. Do you agree?',
  notes: [
    'College libraries and public libraries',
    'Different services libraries can offer',
    'your own idea',
  ],
  studentAnswer: `It is often discussed how much the way of studying has changed in the past few years, moreover since the pandemic of 2020. While some people have grown into the online era, others still prefer a more traditional way of learning such as public libraries or college libraries.

First of all, we can differentiate the different types of libraries. Colleague libraries, spaces where students can gather, discuss, organise meetups and study, generally in preparation for their exams, whereas public libraries are spaces ruled by a very quiet and calmed atmosphere where you can focus on studying or doing intensive research since, usually, they have the widest offer in terms of books, magazines, scientific publications, posters... basically a more concentration-friendly space.

However, we can't ignore the reality that nowadays online learning might seem an easier and faster way of learning that can also provide a lot options towards it.

In conclusion, the world has to adapt to the diverse ways of learning that offer specific benefits and the good news is that you can choose what suits you best and make the most of it for your own good.`,
  expectedScoreRange: { min: 11, max: 14 },
  expectedCefrPatterns: [/b1\+?/i, /low b2/i, /b1/i],
};

/**
 * Main findings the feedback must mention (flexible wording).
 * Each item: { id, patterns: RegExp[], minMatches = 1 }
 */
export const LIBRARIES_EXPECTED_FINDINGS = [
  { id: 'missing_title', patterns: [/title|heading|t[ií]tulo/i] },
  {
    id: 'unclear_opinion',
    patterns: [/do you agree|clear opinion|direct answer|stance|position|agree\?|disagree|not clearly answer/i],
  },
  {
    id: 'services_underdeveloped',
    patterns: [/services|second note|different services|underdevelop|only mentioned|in passing|barely/i],
  },
  {
    id: 'own_idea_weak',
    patterns: [/own idea|your own|third note|weak|not clearly|underdevelop/i],
  },
  { id: 'moreover_misused', patterns: [/moreover/i] },
  {
    id: 'grown_into_unnatural',
    patterns: [/grown into|online era|unnatural|adapted to online|word choice|colloc/i],
  },
  {
    id: 'colleague_spelling',
    patterns: [/colleague|college librar|spelling/i],
  },
  {
    id: 'calmed_atmosphere',
    patterns: [/calmed|calm atmosphere|quiet atmosphere|wrong word|vocab/i],
  },
  {
    id: 'lot_options_grammar',
    patterns: [/lot of options|a lot of options|grammar|missing.*of/i],
  },
  {
    id: 'towards_it',
    patterns: [/towards it|colloc|preposition|vague|unnatural/i],
  },
  {
    id: 'for_your_own_good',
    patterns: [/for your own good|idiom|inappropriate|register|vocab/i],
  },
  {
    id: 'long_sentences',
    patterns: [/too long|long sentence|clunk|break the sentence|sentence length/i],
  },
];

/** @param {string} feedback */
export function feedbackMatchesFinding(feedback, finding) {
  const text = String(feedback || '');
  const hits = finding.patterns.filter((re) => re.test(text)).length;
  return hits >= (finding.minMatches || 1);
}

/** @param {string} feedback */
export function validateLibrariesFeedbackFindings(feedback, findings = LIBRARIES_EXPECTED_FINDINGS) {
  const missing = [];
  for (const finding of findings) {
    if (!feedbackMatchesFinding(feedback, finding)) missing.push(finding.id);
  }
  return { ok: missing.length === 0, missing };
}

/** @param {{ content?: number, communication?: number, organisation?: number, language?: number, total?: number, cefr?: string }} scores */
export function validateLibrariesScores(scores, fixture = LIBRARIES_WRITING_FIXTURE) {
  const issues = [];
  const { content, communication, organisation, language, total, cefr } = scores || {};
  for (const key of ['content', 'communication', 'organisation', 'language']) {
    const v = scores?.[key];
    if (typeof v !== 'number' || v < 2 || v > 4) issues.push(`${key}_out_of_range`);
  }
  if (typeof total !== 'number' || total < fixture.expectedScoreRange.min || total > fixture.expectedScoreRange.max) {
    issues.push('total_out_of_range');
  }
  if (cefr && !fixture.expectedCefrPatterns.some((re) => re.test(String(cefr)))) {
    issues.push('cefr_too_high');
  }
  if (typeof content === 'number' && content >= 4 && typeof language === 'number' && language <= 3) {
    issues.push('content_language_mismatch');
  }
  return { ok: issues.length === 0, issues };
}

/** @param {string} feedback */
export function hasStrongerB2SkipPlaceholder(feedback) {
  return /not needed yet/i.test(String(feedback || ''));
}

/** @param {string} feedback */
export function hasSuperficialConnectorStrengths(feedback) {
  return /good connector!|passive! ✓.*however|however.*good connector/i.test(String(feedback || ''));
}

/** @param {string} prompt */
export function promptRequiresStrictTeacherMarking(prompt) {
  const p = String(prompt || '');
  return (
    /do NOT mark connectors.*as strengths if they are misused/i.test(p) &&
    /MUST always write a full Stronger B2 version/i.test(p) &&
    /Title included:/i.test(p) &&
    /Severity:/i.test(p)
  );
}
