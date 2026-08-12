/**
 * Deterministic detection of prohibited scoring logic (Doc 03 §12.1, Doc 05 §11.1).
 *
 * The hard part is precision, not recall. "All three mandatory task points are
 * addressed" is a legitimate description of a task fact; "there are three errors"
 * is a counting heuristic. Every pattern here therefore anchors on the *object*
 * being counted or on an explicit causal claim, never on the presence of a
 * number, and each rule carries a positive example that must not match.
 */
import type { ValidationRuleFailure, ValidationSeverity, ValidationStage } from '../../domain/types';

export interface ForbiddenHeuristicRule {
  rule_id: string;
  description: string;
  severity: ValidationSeverity;
  /** Always forbidden, wherever they appear. */
  patterns: RegExp[];
  /**
   * Forbidden only when the same sentence turns the count into a scoring
   * consequence. "The response has three paragraphs" is a fact about the text;
   * "only two paragraphs, so Organisation cannot exceed Band 3" is a rule.
   */
  causal_patterns?: RegExp[];
}

/** A count becomes a heuristic when it explains a band. */
const CAUSAL_MARKER =
  /\b(?:because|therefore|so|thus|hence|as a result|which is why|for this reason|consequently|since|due to|owing to|means that|leads? to|results? in|justifies|determines)\b/i;

const SCORING_TOKEN =
  /\b(?:band|bands|mark|marks|score|scored|scoring|criterion|points?\s+awarded|content|communicative achievement|organisation|language)\b/i;

/** Scoring causation can also be expressed without a connective. */
const SCORING_LIMIT =
  /\b(?:cannot exceed|can(?:'|no)?t (?:go|rise) above|caps? (?:it |this )?at|capped at|limited to|lowers? the|raises? the|reduces? the|deducts?|is worth) \w*\s?(?:band|mark|score)\b/i;

export function hasScoringCausation(sentence: string): boolean {
  if (SCORING_LIMIT.test(sentence)) return true;
  return CAUSAL_MARKER.test(sentence) && SCORING_TOKEN.test(sentence);
}

/** Spelled-out numbers evade a digit-only pattern, so both forms are covered. */
const COUNT = '(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|several|numerous)';

const COUNTED_ERRORS = '(?:errors?|mistakes?|inaccuracies|slips?)';
const COUNTED_LINKS = '(?:connectors?|linkers?|linking words?|cohesive devices?)';
const COUNTED_PARAGRAPHS = '(?:paragraphs?)';

export const FORBIDDEN_HEURISTIC_RULES: ForbiddenHeuristicRule[] = [
  {
    rule_id: 'FH-01',
    description: 'Error counting used as scoring evidence',
    severity: 'hard_failure',
    patterns: [
      new RegExp(`\\b(?:error|mistake)\\s+(?:count|total|rate|percentage|frequency)\\b`, 'i'),
      new RegExp(`\\bnumber of ${COUNTED_ERRORS}\\b`, 'i'),
      new RegExp(`\\bcount(?:s|ed|ing)? (?:the )?${COUNTED_ERRORS}\\b`, 'i'),
    ],
    causal_patterns: [
      new RegExp(`\\b${COUNT}\\s+${COUNTED_ERRORS}\\b`, 'i'),
      new RegExp(`\\bmore than ${COUNT} ${COUNTED_ERRORS}\\b`, 'i'),
    ],
  },
  {
    rule_id: 'FH-02',
    description: 'Grammar-error threshold determining the mark',
    severity: 'hard_failure',
    patterns: [
      new RegExp(`\\b${COUNTED_ERRORS}\\b[^.]{0,40}\\b(?:therefore|so)\\b[^.]{0,40}\\bband\\b`, 'i'),
      /\berror (?:threshold|limit|budget|allowance)\b/i,
      /\b(?:per|for every|each) \w+ errors?\b/i,
    ],
  },
  {
    rule_id: 'FH-03',
    description: 'Connector or cohesive-device counting',
    severity: 'hard_failure',
    patterns: [
      new RegExp(`\\bnumber of ${COUNTED_LINKS}\\b`, 'i'),
      new RegExp(`\\b(?:connector|linker)\\s+(?:count|total)\\b`, 'i'),
      new RegExp(`\\bcount(?:s|ed|ing)? (?:the )?${COUNTED_LINKS}\\b`, 'i'),
    ],
    causal_patterns: [new RegExp(`\\b${COUNT}\\s+${COUNTED_LINKS}\\b`, 'i')],
  },
  {
    rule_id: 'FH-04',
    description: 'Paragraph counting',
    severity: 'hard_failure',
    patterns: [
      new RegExp(`\\bnumber of ${COUNTED_PARAGRAPHS}\\b`, 'i'),
      /\bparagraph count\b/i,
      new RegExp(`\\bcount(?:s|ed|ing)? (?:the )?${COUNTED_PARAGRAPHS}\\b`, 'i'),
    ],
    causal_patterns: [new RegExp(`\\b${COUNT}\\s+${COUNTED_PARAGRAPHS}\\b`, 'i')],
  },
  {
    rule_id: 'FH-05',
    description: 'Automatic title deduction',
    severity: 'hard_failure',
    patterns: [
      /\btitle (?:penalty|deduction)\b/i,
      /\b(?:deduct|subtract|lose|lower)\w*\b[^.]{0,40}\b(?:missing|no|absent) (?:title|heading|greeting)\b/i,
      /\b(?:missing|no|absent) (?:title|heading|greeting)\b[^.]{0,30}\b(?:one band|a band|deduct)\b/i,
    ],
  },
  {
    rule_id: 'FH-06',
    description: 'Automatic word-count deduction or length cap',
    severity: 'hard_failure',
    patterns: [
      /\bword[- ]count (?:penalty|deduction|cap)\b/i,
      /\blength (?:penalty|deduction|cap)\b/i,
      /\b(?:capped|limited) (?:to|at) band \d\b[^.]{0,40}\b(?:short|long|words)\b/i,
      /\b(?:under|over) \d+ words[^.]{0,40}\b(?:deduct|penal\w+|automatically lowers?)\b/i,
    ],
  },
  {
    rule_id: 'FH-07',
    description: 'Score smoothing, averaging or normalisation',
    severity: 'hard_failure',
    patterns: [
      /\bsmooth\w*\b[^.]{0,30}\b(?:marks?|scores?|profile|bands?)\b/i,
      /\b(?:averag\w+|normalis\w+|normaliz\w+)\b[^.]{0,30}\b(?:marks?|scores?|profile|bands?|criteria)\b/i,
      /\b(?:marks?|bands?) (?:were|are|have been) (?:aligned|balanced|harmonis\w+|brought into line)\b/i,
      /\bwithin one band of (?:each other|the others)\b/i,
    ],
  },
  {
    rule_id: 'FH-08',
    description: 'Cross-criterion numerical compensation',
    severity: 'hard_failure',
    patterns: [
      /\b(?:compensat\w+|offsets?|makes? up for|balances? out)\b[^.]{0,50}\b(?:content|communicative achievement|organisation|language)\b[^.]{0,20}\b(?:mark|band|score)\b/i,
      /\b(?:raised|lowered|increased|reduced)\b[^.]{0,30}\bbecause\b[^.]{0,40}\b(?:content|language|organisation|communicative achievement) (?:mark|band|score)\b/i,
      /\bcapped by the\b[^.]{0,30}\b(?:mark|band)\b/i,
    ],
  },
  {
    rule_id: 'FH-09',
    description: 'CEFR level claimed from a single response',
    severity: 'hard_failure',
    patterns: [
      /\bcefr\b/i,
      /\b[abc][12] standard (?:is |has been |was )?(?:met|achieved|reached)\b/i,
      /\bis at (?:a )?[abc][12] level\b/i,
      /\bdemonstrates? [abc][12] ability\b/i,
    ],
  },
  {
    rule_id: 'FH-10',
    description: 'Cambridge English Scale conversion from a single response',
    severity: 'hard_failure',
    patterns: [/\bcambridge english scale\b/i, /\bscale score\b/i, /\bconverted to \d{3}\b/i],
  },
  {
    rule_id: 'FH-11',
    description: 'Pass/fail judgement',
    severity: 'hard_failure',
    patterns: [
      /\bpass(?:ed|es)?\s*\/\s*fail(?:ed|s)?\b/i,
      /\bpass(?:ed|es)? or fail(?:ed|s)?\b/i,
      /\b(?:pass|failing|passing) (?:mark|grade|threshold|standard)\b/i,
      /\bhas (?:passed|failed) (?:this|the) (?:task|writing|exam)\b/i,
    ],
  },
  {
    rule_id: 'FH-12',
    description: '12/20 progression threshold inside the engine',
    severity: 'hard_failure',
    patterns: [/\b12\s*\/\s*20\b/, /\b12 out of 20\b/i, /\bthreshold of 12\b/i],
  },
  {
    rule_id: 'FH-13',
    description: 'Exam-readiness claim',
    severity: 'hard_failure',
    patterns: [/\breadiness\b/i, /\bready for the (?:exam|test|b2 first)\b/i, /\bexam[- ]ready\b/i],
  },
  {
    rule_id: 'FH-14',
    description: 'Learner history used as scoring authority',
    severity: 'hard_failure',
    patterns: [
      /\b(?:previous|earlier|last|prior) (?:writing|essay|submission|attempt|score|mark)s?\b/i,
      /\b(?:has|have) improved since\b/i,
      /\bpreviously taught\b/i,
      /\b(?:recurring|repeated) (?:learner )?error history\b/i,
      /\bcourse stage\b/i,
      /\b(?:effort|motivation|personality)\b[^.]{0,30}\b(?:mark|band|score)\b/i,
    ],
  },
  {
    rule_id: 'FH-15',
    description: 'Teacher DNA pedagogical priority used as a deduction or reward',
    severity: 'hard_failure',
    patterns: [
      /\bpedagogical(?:ly)? (?:priority|important)\b[^.]{0,40}\b(?:mark|band|deduct|lower|raise)\w*\b/i,
      /\b(?:foundational|teaching) (?:importance|priority)\b[^.]{0,40}\b(?:mark|band|deduct)\w*\b/i,
      /\bR\d{2}\b[^.]{0,30}\b(?:justifies|determines|sets) (?:the )?(?:mark|band)\b/i,
      /\b(?:ambitious attempt|ambition)\b[^.]{0,25}\bbonus\b/i,
    ],
  },
  {
    rule_id: 'FH-16',
    description: 'Fractional, half or weighted micro-scoring',
    severity: 'hard_failure',
    patterns: [
      /\bhalf[- ]band\b/i,
      /\bband \d\.\d\b/i,
      /\b\d\.\d\s*\/\s*5\b/,
      /\b(?:weighted|micro)[- ]score\b/i,
      /\bsub[- ]points?\b/i,
    ],
  },
  {
    rule_id: 'FH-17',
    description: 'A band outside the 0–5 scale is invented',
    severity: 'hard_failure',
    patterns: [
      /\bband\s*6\b/i,
      /\bband\s*-\s*1\b/i,
      /\bbelow band (?:0|zero)\b/i,
      /\bband below (?:0|zero)\b/i,
      /\blower than band (?:0|zero)\b/i,
    ],
  },
  {
    rule_id: 'FH-18',
    description: 'Confidence used to adjust a mark',
    severity: 'hard_failure',
    patterns: [
      /\b(?:low|medium|reduced) confidence\b[^.]{0,40}\b(?:so|therefore|hence)\b[^.]{0,30}\b(?:lower|reduce|drop)\w*\b/i,
      /\bconfidence[- ]adjusted (?:mark|band|score)\b/i,
    ],
  },
];

/**
 * Wording that legitimately contains numbers or scale vocabulary. Used by the
 * test suite as the false-positive guard, and exported so that any new pattern
 * can be checked against it.
 */
export const LEGITIMATE_PHRASES: string[] = [
  'The response contains three mandatory task points.',
  'All three mandatory points are addressed and developed.',
  'Two of the four required functions are performed.',
  'The second paragraph introduces the counter-argument and links back to the opening.',
  'Repeated verb-form instability requires local reader repair, but meaning remains recoverable.',
  'The writer uses reference and paraphrase rather than explicit linking words.',
  'The task asks for 140–190 words and the response stays within that guidance.',
  'Band 5 is the highest available band and its descriptor is met.',
  'The response shares features of Bands 3 and 5.',
  'Confidence is medium because the register sits between two profiles.',
  'The candidate gives one concrete example and one consequence.',
  'The response has three paragraphs.',
  'The text uses two connectors and relies mainly on reference.',
  'Verb-form slips occur in three places without blocking meaning.',
];

/** Splits on sentence boundaries so causation is judged locally, not across a whole rationale. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function matchedRule(sentence: string): ForbiddenHeuristicRule | null {
  for (const rule of FORBIDDEN_HEURISTIC_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(sentence))) return rule;
    if (
      rule.causal_patterns?.some((pattern) => pattern.test(sentence)) &&
      hasScoringCausation(sentence)
    ) {
      return rule;
    }
  }
  return null;
}

export function detectForbiddenHeuristics(
  value: unknown,
  stage: ValidationStage,
  pathPrefix = '',
): ValidationRuleFailure[] {
  const failures: ValidationRuleFailure[] = [];
  const seen = new Set<string>();

  for (const { path, text } of collectStrings(value, pathPrefix)) {
    for (const sentence of splitSentences(text)) {
      const rule = matchedRule(sentence);
      if (!rule) continue;
      const key = `${rule.rule_id}:${path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      failures.push({
        rule_id: rule.rule_id,
        stage,
        severity: rule.severity,
        message: `${rule.description}: "${truncate(sentence)}"`,
        path: path || undefined,
      });
    }
  }
  return failures;
}

export function isForbiddenHeuristic(text: string): string | null {
  for (const sentence of splitSentences(text)) {
    const rule = matchedRule(sentence);
    if (rule) return rule.rule_id;
  }
  return null;
}

function truncate(text: string): string {
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function* collectStrings(
  value: unknown,
  path: string,
): Generator<{ path: string; text: string }> {
  if (typeof value === 'string') {
    yield { path, text: value };
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      yield* collectStrings(value[i], `${path}[${i}]`);
    }
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      yield* collectStrings(child, path ? `${path}.${key}` : key);
    }
  }
}
