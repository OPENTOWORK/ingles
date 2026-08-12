/**
 * Document 01 — Task Requirements, encoded as deterministic genre knowledge.
 *
 * Rules of this file:
 *  - Nothing here may add a genre requirement Doc 01 does not contain.
 *  - `mandatory_conventions` are binary: Doc 01 treats them as essential and
 *    they are either present or absent.
 *  - `core_expectations` are what the genre must achieve. They are never
 *    task-completion checkboxes and never a Content failure on their own;
 *    downstream they are evidence primarily for Communicative Achievement.
 *  - Anything Doc 01 calls optional, suggested or "a recommendation" lives in
 *    `recommended_features` and can never be emitted as mandatory.
 *  - Anything Doc 01 makes dependent on the wording of the task lives in
 *    `conditional_conventions` and only becomes mandatory when the wording of
 *    that specific task triggers it.
 *  - Doc 03 may reuse this terminology downstream but may not extend it.
 */
import type { B2FirstTaskType } from '../../domain/task-types';

/** Cambridge B2 First length guidance — mirrors `src/data/b2WritingTasks.js`. */
export const B2_FIRST_WORD_MIN = 140;
export const B2_FIRST_WORD_MAX = 190;

export interface GenreConventionRule {
  key: string;
  text: string;
  doc01_reference: string;
}

export interface ConditionalConventionRule extends GenreConventionRule {
  /** Human-readable condition, surfaced in `ambiguities` when it does not fire. */
  condition: string;
  /** Case-insensitive pattern applied to the task wording only. */
  wording_pattern_source: string;
}

export interface GenreRuleSet {
  task_type: B2FirstTaskType;
  register_guidance: string;
  mandatory_conventions: GenreConventionRule[];
  core_expectations: GenreConventionRule[];
  conditional_conventions: ConditionalConventionRule[];
  recommended_features: GenreConventionRule[];
}

const DOC01 = 'Doc 01 — Task Requirements v1.0';

export const DOC01_GENRE_RULES: Record<B2FirstTaskType, GenreRuleSet> = {
  essay: {
    task_type: 'essay',
    register_guidance: 'neutral to semi-formal',
    // Doc 01 states no binary genre convention for the essay. Coherence is an
    // organisation-quality judgement made downstream, not a Layer-1 checkbox.
    mandatory_conventions: [],
    core_expectations: [],
    conditional_conventions: [],
    recommended_features: [
      {
        key: 'essay.title',
        text: 'Include a title.',
        doc01_reference: `${DOC01} — Essay: "Titles are optional but highly recommended. A missing title should not automatically be treated as task failure."`,
      },
      {
        key: 'essay.suggested_structure',
        text: 'Use an introduction, body and conclusion structure.',
        doc01_reference: `${DOC01} — Essay: the suggested structure is "a recommendation, not the only acceptable organisation".`,
      },
    ],
  },

  informal_email: {
    task_type: 'informal_email',
    register_guidance: 'informal, friendly and natural',
    mandatory_conventions: [
      {
        key: 'informal_email.greeting_closing',
        text: 'Use an appropriate informal greeting and closing.',
        doc01_reference: `${DOC01} — Informal email: "Appropriate informal greeting and closing."`,
      },
      {
        key: 'informal_email.register',
        text: 'Maintain a friendly, natural register.',
        doc01_reference: `${DOC01} — Informal email: "Friendly, natural register."`,
      },
      {
        key: 'informal_email.all_points',
        text: 'Respond to every point raised by the task.',
        doc01_reference: `${DOC01} — Informal email: "Respond to every task point."`,
      },
    ],
    core_expectations: [],
    conditional_conventions: [],
    recommended_features: [
      {
        key: 'informal_email.contractions',
        text: 'Contractions and conversational language are acceptable.',
        doc01_reference: `${DOC01} — Informal email: "Contractions and conversational language are acceptable." This is a permission, not a requirement.`,
      },
    ],
  },

  formal_email: {
    task_type: 'formal_email',
    register_guidance: 'formal, polite and professional',
    mandatory_conventions: [
      {
        key: 'formal_email.greeting_closing',
        text: 'Use an appropriate formal greeting and closing.',
        doc01_reference: `${DOC01} — Formal email: "Appropriate formal greeting and closing."`,
      },
      {
        key: 'formal_email.register',
        text: 'Maintain a polite and professional register.',
        doc01_reference: `${DOC01} — Formal email: "Polite and professional register."`,
      },
      {
        key: 'formal_email.avoid_colloquial',
        text: 'Avoid unnecessarily colloquial language.',
        doc01_reference: `${DOC01} — Formal email: "Avoid unnecessarily colloquial language."`,
      },
      {
        key: 'formal_email.all_points',
        text: 'Respond to every point raised by the task.',
        doc01_reference: `${DOC01} — Formal email: "Respond to every task point."`,
      },
    ],
    core_expectations: [],
    conditional_conventions: [
      {
        key: 'formal_email.formal_phrases',
        text:
          'Use suitable formal phrases for the request, complaint or enquiry the task asks for.',
        condition: 'the task asks for a request, a complaint or an enquiry',
        wording_pattern_source:
          '\\b(request(ing|s)?|ask(ing)? for|complain(t|ts|ing)?|enquir(y|ies|e|ing)|inquir(y|ies|e|ing)|apply(ing)?|application)\\b',
        doc01_reference: `${DOC01} — Formal email: "Suitable formal phrases for requests, complaints or enquiries."`,
      },
    ],
    recommended_features: [],
  },

  article: {
    task_type: 'article',
    register_guidance: 'neutral to semi-formal, reader-facing',
    mandatory_conventions: [],
    core_expectations: [
      {
        key: 'article.engage_reader',
        text: 'Engage the reader.',
        doc01_reference: `${DOC01} — Article: "Keep engaging the reader as an expectation of the genre."`,
      },
    ],
    conditional_conventions: [],
    recommended_features: [
      {
        key: 'article.interesting_title',
        text: 'Use an interesting or catchy title.',
        doc01_reference: `${DOC01} — Article: interesting titles are "recommendations rather than mandatory requirements".`,
      },
      {
        key: 'article.rhetorical_questions',
        text: 'Use rhetorical questions.',
        doc01_reference: `${DOC01} — Article: rhetorical questions are "recommendations rather than mandatory requirements".`,
      },
      {
        key: 'article.personal_experience',
        text: 'Include personal experiences.',
        doc01_reference: `${DOC01} — Article: personal experiences are "recommendations rather than mandatory requirements".`,
      },
      {
        key: 'article.colourful_language',
        text: 'Use colourful language.',
        doc01_reference: `${DOC01} — Article: colourful language is a "recommendation rather than mandatory requirement".`,
      },
      {
        key: 'article.memorable_ending',
        text: 'Finish with a memorable ending.',
        doc01_reference: `${DOC01} — Article: memorable endings are "recommendations rather than mandatory requirements".`,
      },
    ],
  },

  report: {
    task_type: 'report',
    register_guidance: 'formal, objective and impersonal',
    mandatory_conventions: [
      {
        key: 'report.title',
        text: 'Include a title.',
        doc01_reference: `${DOC01} — Report, essential genre conventions: "Title."`,
      },
      {
        key: 'report.purpose_introduction',
        text: 'Open with a clear introduction explaining the purpose of the report.',
        doc01_reference: `${DOC01} — Report, essential genre conventions: "Clear introduction explaining the purpose of the report."`,
      },
      {
        key: 'report.headings',
        text: 'Use headings.',
        doc01_reference: `${DOC01} — Report, essential genre conventions: "Headings."`,
      },
      {
        key: 'report.objective_organisation',
        text: 'Organise the content objectively.',
        doc01_reference: `${DOC01} — Report, essential genre conventions: "Objective organisation."`,
      },
    ],
    core_expectations: [],
    conditional_conventions: [
      {
        key: 'report.recommendations',
        text: 'Provide recommendations or conclusions.',
        condition: 'the task requires recommendations or conclusions',
        wording_pattern_source:
          '\\b(recommend(ation|ations|ing|s|ed)?|conclusion(s)?|suggest(ion|ions|ing|s)?|what could be improved|propose)\\b',
        doc01_reference: `${DOC01} — Report, essential genre conventions: "Recommendations or conclusions when required by the task."`,
      },
    ],
    recommended_features: [],
  },

  review: {
    task_type: 'review',
    register_guidance: 'neutral to semi-formal, reader-facing',
    mandatory_conventions: [],
    core_expectations: [
      {
        key: 'review.reader_awareness',
        text: 'Keep the target reader in mind throughout.',
        doc01_reference: `${DOC01} — Review: "Maintain reader awareness as a core expectation of the genre."`,
      },
    ],
    conditional_conventions: [
      {
        key: 'review.recommendation',
        text: 'Give a clear recommendation or final judgement.',
        condition: 'the wording of the task asks for a recommendation or a final judgement',
        wording_pattern_source:
          '\\b(recommend(ation|ations|ing|s|ed)?|would you .{0,30}recommend|worth\\s+(a\\s+)?\\w+|should (readers|people|we|they|others)|is it (good|worth))\\b',
        doc01_reference: `${DOC01} — Review: "State explicitly that a recommendation or final judgement depends on the wording of the task."`,
      },
    ],
    recommended_features: [],
  },
};

export function getGenreRules(taskType: B2FirstTaskType): GenreRuleSet {
  return DOC01_GENRE_RULES[taskType];
}

/**
 * Doc 01 conditional conventions become mandatory only where the wording of the
 * specific task requires them. Everything else stays out of the mandatory set.
 */
export function selectWordingTriggeredConventions(
  taskType: B2FirstTaskType,
  sourceTaskText: string,
): Array<{ rule: ConditionalConventionRule; evidence_quote: string }> {
  const text = String(sourceTaskText ?? '');
  const triggered: Array<{ rule: ConditionalConventionRule; evidence_quote: string }> = [];

  for (const rule of getGenreRules(taskType).conditional_conventions) {
    const pattern = new RegExp(rule.wording_pattern_source, 'i');
    const match = pattern.exec(text);
    if (!match) continue;
    triggered.push({ rule, evidence_quote: extractSentence(text, match.index) });
  }

  return triggered;
}

export function listUntriggeredConditions(
  taskType: B2FirstTaskType,
  sourceTaskText: string,
): ConditionalConventionRule[] {
  const triggeredKeys = new Set(
    selectWordingTriggeredConventions(taskType, sourceTaskText).map((t) => t.rule.key),
  );
  return getGenreRules(taskType).conditional_conventions.filter(
    (rule) => !triggeredKeys.has(rule.key),
  );
}

function extractSentence(text: string, index: number): string {
  const before = text.lastIndexOf('\n', index);
  const beforeStop = Math.max(
    text.lastIndexOf('.', index),
    text.lastIndexOf('?', index),
    text.lastIndexOf('!', index),
    before,
  );
  const start = beforeStop === -1 ? 0 : beforeStop + 1;
  const candidates = ['.', '?', '!', '\n']
    .map((mark) => text.indexOf(mark, index))
    .filter((position) => position !== -1);
  const end = candidates.length ? Math.min(...candidates) + 1 : text.length;
  return text.slice(start, end).trim() || text.trim();
}
