import {
  cleanWritingFeedbackHeading,
  formatWritingFeedbackDisplay,
  isWritingFeedbackHeadingLine,
} from '@/lib/formatWritingFeedback';
import {
  isAnnotatedTextSection,
  renderAnnotatedWritingHtml,
  renderWritingAnnotationLegendHtml,
} from '@/lib/writingAnnotatedMarkup';

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripWrappingQuotes(text) {
  const t = String(text || '').trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Clean Why / Problem text — fix corrupted quotes without inserting new ones blindly. */
function sanitizeExplanationText(text) {
  let t = cleanCorrectionText(text);
  if (!t) return t;

  // Quotes accidentally split inside a word: "S"erious" → "Serious", "a"lways" → "always"
  t = t.replace(/"([A-Za-z])"([A-Za-z]+)"/g, (_, ch, rest) => `"${ch}${rest}"`);

  // Unclosed quoted word before period: "became. / "is. → "became". / "is".
  t = t.replace(/"([A-Za-z][A-Za-z'-]*)\.(?=\s*[,;)]|\s*$)/g, '"$1".');

  // Orphan quote-period artefact with no word inside (not "word".)
  t = t.replace(/\s"\.'?\s*$/g, '.');
  t = t.replace(/^\s*"\.'?\s*$/g, '.');

  // Trailing orphan quotes/apostrophes after final punctuation
  t = t.replace(/([.!?])\s*["']+\s*$/g, '$1');

  // Collapse doubled quotes
  t = t.replace(/"{2,}/g, '"');

  // Missing opening quote at sentence start only: Fast food" is → "Fast food" is
  if (!t.startsWith('"')) {
    t = t.replace(
      /^([A-Za-z][A-Za-z\s'-]{0,48})"\s+(is|are|was|were|has|have|means|should|can|must|will)\b/i,
      '"$1" $2',
    );
  }

  return t.trim();
}

function cleanCorrectionText(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/\s*[-─━]{2,}\s*$/g, '').trim())
    .filter((line) => line && !/^[-─━]{2,}$/.test(line))
    .join('\n')
    .replace(/\s*[-─━]{2,}\s*$/g, '')
    .replace(/\s*---+\s*$/g, '')
    .trim();
}

/** Fix AI output that merges Problem + Correct labels on one line. */
function normalizeMergedCorrectionLabels(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\*\*Problem\*\*\s*\/?\s*\*\*Correct\*\*/gi, 'Problem:\nCorrect:')
    .replace(/\*\*Problem\s+\/?\s*Correct\*\*/gi, 'Problem:\nCorrect:')
    .replace(/^Problem\s+\/?\s*Correct\s*:\s*(.*)$/gim, (_, rest) => {
      const body = String(rest || '').trim();
      if (body) return `Problem:\n${body}\nCorrect:\n`;
      return 'Problem:\nCorrect:\n';
    })
    .replace(/\nProblem\s+\/?\s*Correct\s*:\s*(.*)$/gim, (_, rest) => {
      const body = String(rest || '').trim();
      if (body) return `\nProblem:\n${body}\nCorrect:\n`;
      return '\nProblem:\nCorrect:\n';
    })
    .replace(/^Problem\s+Correct\s*:\s*(.*)$/gim, (_, rest) => {
      const body = String(rest || '').trim();
      if (body) return `Problem:\n${body}\nCorrect:\n`;
      return 'Problem:\nCorrect:\n';
    })
    .replace(/\nProblem\s+Correct\s*:\s*(.*)$/gim, (_, rest) => {
      const body = String(rest || '').trim();
      if (body) return `\nProblem:\n${body}\nCorrect:\n`;
      return '\nProblem:\nCorrect:\n';
    })
    .replace(/^Problem\s+Correct\s*$/gim, 'Problem:\nCorrect:')
    .replace(/\nProblem\s+Correct\s*$/gim, '\nProblem:\nCorrect:')
    .replace(/([^\n])Problem\s+Correct\s*:/gi, '$1\nProblem:\nCorrect:');
}

const CATEGORY_LINE_RE =
  /^(?:\*\s*)?(?:type:\s*)?(?:grammar|vocabulary\s*\/?\s*spelling|vocabulary\s*\/\s*spelling)\s*\.?\s*$/i;

function stripCategoryNoise(text) {
  const lines = cleanCorrectionText(text).split('\n');
  const filtered = lines.filter((line) => !CATEGORY_LINE_RE.test(line.trim()));
  return filtered.join('\n').trim();
}

function getField(block, name) {
  const re = new RegExp(
    `${name}:\\s*\\n?([\\s\\S]*?)(?=\\n(?:Type|Problem|Correct|Why|Original):|$)`,
    'i',
  );
  const match = block.match(re);
  if (!match) return '';

  let value = match[1].trim();

  if (/^problem$/i.test(name)) {
    const correctIdx = value.search(/\nCorrect:\s*/i);
    if (correctIdx >= 0) {
      value = value.slice(0, correctIdx).trim();
    } else {
      const inlineCorrect = value.match(/^([\s\S]*?)\sCorrect:\s*([\s\S]*)$/i);
      if (inlineCorrect) value = inlineCorrect[1].trim();
    }
  }

  const cleaned = stripCategoryNoise(value);

  if (/^why$/i.test(name) || /^problem$/i.test(name)) {
    return sanitizeExplanationText(cleaned);
  }

  if (/^original$/i.test(name) || /^correct$/i.test(name)) {
    return stripWrappingQuotes(cleaned);
  }

  return cleaned;
}

function inferErrorType(problem, why, original) {
  const text = `${problem} ${why} ${original}`.toLowerCase();
  const p = String(problem || '').trim().toLowerCase();

  if (/^ww\b|^ww[—–-]|rep\.?\s*vocab|wrong word|word choice|colloc|awkward|unnatural|register|lexis|style upgrade|flat adjective/.test(p)) {
    return 'vocabulary';
  }

  if (/tell me which|needs more developing|right concept|mentioned in passing|only mentioned|too generic|underdeveloped|not specific/.test(text)) {
    return 'task response';
  }

  if (/spell|misspell|typo|orthograph|spelling\s*[⇒=>]/.test(text)) {
    return 'spelling';
  }

  if (
    /subject-verb|agreement|missing subject|passive form|participle|past participle|tense|article|gerund|infinitive|grammar|auxiliary|word order|contraction|apostrophe|third person|verb form|helps keeping|help \+ -ing|base verb|on the other hand|in the other hand|too long|clunk|break the sentence/.test(
      text,
    ) ||
    /\b(dont|doesnt|wont|cant|isnt|helps keeping|help keeping)\b/.test(text)
  ) {
    return 'grammar';
  }

  if (
    /wrong word|word choice|collocation|awkward phrasing|unnatural|preposition|vocabular|lexis|transparent with|transparent about|linker|naturalness/.test(
      text,
    )
  ) {
    return 'vocabulary';
  }

  return 'grammar';
}

const DETAILED_ERROR_CATEGORIES = [
  'grammar',
  'vocabulary',
  'spelling',
  'word order',
  'articles',
  'prepositions',
  'verb tense',
  'subject-verb agreement',
  'cohesion',
  'register',
  'task response',
];

function normalizeErrorType(rawType, problem, why, original) {
  const t = String(rawType || '').trim().toLowerCase().replace(/\.$/, '');

  const detailed = DETAILED_ERROR_CATEGORIES.find(
    (cat) => t === cat || t === cat.replace(/-/g, ' ') || t.replace(/-/g, ' ') === cat,
  );
  if (detailed) return detailed;

  if (/subject.verb/.test(t)) return 'subject-verb agreement';
  if (/tense/.test(t)) return 'verb tense';
  if (/article/.test(t)) return 'articles';
  if (/preposition/.test(t)) return 'prepositions';
  if (/order/.test(t)) return 'word order';
  if (/cohesion|linking|connector/.test(t)) return 'cohesion';
  if (/register|formal|informal|tone/.test(t)) return 'register';
  if (/task|content|relevan/.test(t)) return 'task response';
  if (/spell|typo|orthograph/.test(t)) return 'spelling';
  if (/naturalness|natural phrasing|colloc|vocab|lexis|word choice/.test(t)) {
    return 'vocabulary';
  }
  if (/grammar|gramm|verb form|agreement/.test(t)) return 'grammar';

  return inferErrorType(problem, why, original);
}

/** Visual bucket for the correction card colour (grammar-ish vs vocabulary-ish). */
function errorTypeStyleKey(type) {
  return type === 'vocabulary' || type === 'spelling' ? 'vocabulary' : 'grammar';
}

/** Split legacy AI output that merged Problem + Why on one line. */
function normalizeProblemWhy(problem, why) {
  let p = cleanCorrectionText(problem);
  let w = cleanCorrectionText(why);

  if (/\s[—–-]\s/.test(p)) {
    const match = p.match(/^(.+?)\s[—–-]\s(.+)$/s);
    if (match) {
      const tail = cleanCorrectionText(match[2]);
      p = cleanCorrectionText(match[1]);
      if (!w) w = tail;
    }
  }

  if (w && p.toLowerCase() === w.toLowerCase()) w = '';

  return { problem: p, why: w };
}

/** Fix mislabelled "Missing subject" when a subject is clearly present. */
function normalizeProblemDescription(problem, original, correct, why) {
  let p = String(problem || '').trim();
  const o = String(original || '');
  const c = String(correct || '');
  const context = `${o} ${c} ${why}`.toLowerCase();

  if (/missing subject/i.test(p) && /\b(it|he|she|they|there)\s+(is|are|was|were|has|have)\b/i.test(o)) {
    if (
      /passive|participle|argu|ed\b|incorrect passive/i.test(context) ||
      /\b(is|are|was|were)\s+(often|usually|always|sometimes|generally)\s+\w+[^d\s]/i.test(o)
    ) {
      p = 'Incorrect passive form.';
    }
  }

  return p;
}

function sanitizeCorrectionsSectionText(sectionText) {
  return normalizeMergedCorrectionLabels(String(sectionText || ''))
    .split('\n')
    .filter((line) => !/^[-─━]{3,}\s*$/.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitCorrectionSections(sectionText) {
  const text = sanitizeCorrectionsSectionText(sectionText);
  if (!text) return [];

  const lines = text.split('\n');
  const sections = [];
  let currentType = null;
  let buffer = [];
  let sawHeader = false;

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (body) sections.push({ type: currentType, body });
    buffer = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (/^grammar$/i.test(t)) {
      sawHeader = true;
      flush();
      currentType = 'grammar';
      continue;
    }
    if (/^vocabulary\s*\/?\s*spelling$/i.test(t)) {
      sawHeader = true;
      flush();
      currentType = 'vocabulary';
      continue;
    }
    buffer.push(line);
  }
  flush();

  if (!sawHeader) return [{ type: null, body: text }];
  return sections;
}

/** Normaliza para comparar Original vs Correct: trim, lowercase, puntuación final, espacios. */
function normalizeCorrectionComparable(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/["'""'']/g, '')
    .replace(/[.,;:!?…]+$/, '')
    .replace(/\s+/g, ' ');
}

function parseBlocksFromSection(sectionBody, sectionType = null) {
  const text = sanitizeCorrectionsSectionText(sectionBody);
  if (!text) return [];

  const chunks = text.split(/\n(?=(?:Type:|Original:)\s*)/i).filter(Boolean);
  const blocks = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!/^(?:Type:|Original:)/i.test(trimmed)) continue;

    const original = getField(chunk, 'Original');
    const problemRaw = getField(chunk, 'Problem');
    const correct = getField(chunk, 'Correct');
    const whyRaw = getField(chunk, 'Why');
    const severityRaw = getField(chunk, 'Severity');
    const typeRaw = getField(chunk, 'Type');
    const { problem, why } = normalizeProblemWhy(problemRaw, whyRaw);
    const problemNormalized = normalizeProblemDescription(problem, original, correct, why);
    const problemClean = sanitizeExplanationText(problemNormalized);
    const whyClean = sanitizeExplanationText(why);

    if (!original && !problemClean && !correct) continue;

    // Card defectuosa: el modelo a veces repite el texto original como "corrección"
    // (Original === Correct). Confunde al alumno; se descarta la card entera.
    if (
      original &&
      correct &&
      normalizeCorrectionComparable(original) === normalizeCorrectionComparable(correct)
    ) {
      continue;
    }

    const inferredType = normalizeErrorType(typeRaw, problemClean, whyClean, original);
    blocks.push({
      original,
      problem: problemClean,
      correct,
      why: whyClean,
      severity: severityRaw ? String(severityRaw).trim().toLowerCase() : '',
      type: typeRaw ? inferredType : sectionType || inferredType,
    });
  }

  return blocks;
}

/** Parse Original / Problem / Correct / Why blocks from a corrections section. */
export function parseWritingCorrectionBlocks(sectionText) {
  const sections = splitCorrectionSections(sectionText);
  const blocks = sections.flatMap(({ type, body }) => parseBlocksFromSection(body, type));
  // Dedupe: el modelo a veces repite la misma card (mismo Original + Correct).
  const seen = new Set();
  return blocks.filter((b) => {
    const key = `${normalizeCorrectionComparable(b.original)}|${normalizeCorrectionComparable(b.correct)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderCorrectionBlock({ original, problem, correct, why = '', type = 'grammar' }) {
  const originalHtml = escapeHtml(original);
  const problemHtml = escapeHtml(problem);
  const correctHtml = escapeHtml(correct);
  const whyHtml = escapeHtml(why);
  const typeKey = errorTypeStyleKey(type);
  const categoryChip = type
    ? `<span class="writing-correction-item__category">${escapeHtml(type)}</span>`
    : '';

  const whyBlock = whyHtml
    ? `<div class="writing-correction-item__why">
    <span class="writing-correction-item__label">Why</span>
    <p class="writing-correction-item__why-text">${whyHtml}</p>
  </div>`
    : '';

  return `<article class="writing-correction-item writing-correction-item--${typeKey}">
  <div class="writing-correction-item__original">
    <span class="writing-correction-item__label">Original${categoryChip}</span>
    <p class="writing-correction-item__quote">${originalHtml ? `"${originalHtml}"` : '—'}</p>
  </div>
  <div class="writing-correction-item__callout" role="note">
    <div class="writing-correction-item__compare">
      <div class="writing-correction-item__field writing-correction-item__field--problem">
        <span class="writing-correction-item__label">Problem</span>
        <p class="writing-correction-item__field-text writing-correction-item__problem">${problemHtml || '—'}</p>
      </div>
      <div class="writing-correction-item__field writing-correction-item__field--correct">
        <span class="writing-correction-item__label">Correct</span>
        <p class="writing-correction-item__field-text writing-correction-item__correct">${correctHtml ? `"${correctHtml}"` : '—'}</p>
      </div>
    </div>
    ${whyBlock}
  </div>
</article>`;
}

function renderCorrectionList(blocks) {
  const hasDetailedCategories = blocks.some(
    (b) => b.type && b.type !== 'grammar' && b.type !== 'vocabulary',
  );
  if (hasDetailedCategories) {
    return `<div class="writing-correction-list">${blocks.map(renderCorrectionBlock).join('')}</div>`;
  }

  const grammar = blocks.filter((b) => b.type === 'grammar');
  const vocabulary = blocks.filter((b) => b.type === 'vocabulary');
  let html = '';

  if (grammar.length > 0) {
    html += `<section class="writing-correction-group writing-correction-group--grammar">
      <h5 class="writing-correction-group__title">Grammar</h5>
      <div class="writing-correction-group__list">${grammar.map(renderCorrectionBlock).join('')}</div>
    </section>`;
  }

  if (vocabulary.length > 0) {
    html += `<section class="writing-correction-group writing-correction-group--vocabulary">
      <h5 class="writing-correction-group__title">Vocabulary / Spelling</h5>
      <div class="writing-correction-group__list">${vocabulary.map(renderCorrectionBlock).join('')}</div>
    </section>`;
  }

  if (!html && blocks.length > 0) {
    return `<div class="writing-correction-list">${blocks.map(renderCorrectionBlock).join('')}</div>`;
  }

  return html;
}

function splitMarkdownSections(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const parts = raw.split(/(?=^#{1,3}\s+)/m).filter(Boolean);
  if (parts.length === 0) return [{ heading: null, body: raw }];

  return parts.map((part) => {
    const headingMatch = part.match(/^#{1,3}\s+(.+?)(?:\r?\n|$)/);
    if (!headingMatch) {
      return { heading: null, body: part.trim() };
    }
    return {
      heading: headingMatch[1].trim(),
      body: part.slice(headingMatch[0].length).trim(),
    };
  });
}

function isCorrectionsSection(heading) {
  return /corrections?/i.test(String(heading || ''));
}

/** Split feedback that uses emoji headings (📝 🎓 📊 …) instead of markdown #. */
function splitEmojiSections(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const sections = [];
  let heading = null;
  let buffer = [];

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (heading || body) sections.push({ heading, body });
    buffer = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (t && isWritingFeedbackHeadingLine(t) && !/^#{1,6}\s+/.test(t)) {
      flush();
      heading = t;
      continue;
    }
    buffer.push(line);
  }
  flush();

  return sections;
}

function isStrengthsSection(heading) {
  return /main strengths|strengths/i.test(String(heading || ''));
}

function isProblemsSection(heading) {
  return /main problems|areas for improvement|problems/i.test(String(heading || ''));
}

function sectionSortKey(heading) {
  const h = String(heading || '').toLowerCase();
  if (/dralo writing feedback|^📝/.test(h)) return 0;
  if (/main strengths|💪/.test(h)) return 10;
  if (/main problems|🎯/.test(h)) return 20;
  if (/annotated text|🔍/.test(h)) return 22;
  if (/estimated cefr|🎓/.test(h)) return 30;
  if (/task check|📋/.test(h)) return 40;
  if (/scores|📊/.test(h)) return 50;
  if (/corrections|✏️/.test(h)) return 60;
  if (/improved version|📈/.test(h)) return 80;
  if (/stronger b2|🚀/.test(h)) return 90;
  if (/study plan|📚/.test(h)) return 100;
  if (/^✅|^🟡|^❌/.test(h)) return 110;
  return 55;
}

function reorderFeedbackSections(sections) {
  return [...sections].sort((a, b) => sectionSortKey(a.heading) - sectionSortKey(b.heading));
}

function formatStrengthsOrProblemsBody(body) {
  const normalized = formatWritingFeedbackDisplay(body);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const items = escaped
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^Problem\s+\/?\s*Correct/i.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, ''));

  if (items.length) {
    return `<ul class="writing-feedback-block__list">${items
      .map((item) => `<li>${item}</li>`)
      .join('')}</ul>`;
  }

  return `<ul class="writing-feedback-block__list"><li>—</li></ul>`;
}

function shouldUseParagraphLayout(heading) {
  return /improved version|stronger b2/i.test(String(heading || ''));
}

function formatParagraphBody(body) {
  const normalized = formatWritingFeedbackDisplay(body);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split(/\n{2,}/)
    .map((para) => {
      const t = para.trim();
      if (!t) return '';
      return `<p class="levels-b2-writing-panel__feedback-paragraph">${t.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('');
}

function formatBulletLines(body) {
  const normalized = formatWritingFeedbackDisplay(body);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return '';

  let html = '';
  let openList = false;
  const closeList = () => {
    if (openList) {
      html += '</ul>';
      openList = false;
    }
  };

  for (const trimmed of lines) {
    if (/^Problem\s+\/?\s*Correct/i.test(trimmed)) continue;

    if (/^(✅|🟡|❌)/.test(trimmed)) {
      closeList();
      html += `<p class="levels-b2-writing-panel__feedback-readiness">${trimmed}</p>`;
      continue;
    }

    if (/^(Grammar|Vocabulary|Strategy):$/i.test(trimmed)) {
      closeList();
      html += `<p class="writing-feedback-subheading">${trimmed}</p>`;
      continue;
    }

    if (/^→/.test(trimmed) || (/→/.test(trimmed) && !/^[-*•]/.test(trimmed))) {
      closeList();
      html += `<p class="levels-b2-writing-panel__feedback-correction">${trimmed}</p>`;
      continue;
    }

    const item = trimmed.replace(/^[-*•]\s+/, '').replace(/^\*\*Total Score:/i, 'Total Score:');
    if (!openList) {
      html += '<ul class="writing-feedback-block__list levels-b2-writing-panel__feedback-ul">';
      openList = true;
    }
    html += `<li>${item}</li>`;
  }

  closeList();
  return html;
}

function renderStrengthsOrProblemsSection(heading, body) {
  const display = cleanWritingFeedbackHeading(heading);
  const variant = isStrengthsSection(heading) ? 'strengths' : 'problems';
  return `<section class="writing-feedback-block writing-feedback-block--${variant}">
    <h4 class="writing-feedback-block__title">${escapeHtml(display)}</h4>
    ${formatStrengthsOrProblemsBody(body, variant)}
  </section>`;
}

function renderAnnotatedSection(body) {
  return `<section class="writing-annotated-section">
    ${renderWritingAnnotationLegendHtml(true)}
    <div class="writing-annotated-text">${renderAnnotatedWritingHtml(body)}</div>
  </section>`;
}

function isBetterVocabularySection(heading) {
  return /better vocabular/i.test(String(heading || ''));
}

function renderFeedbackSection({ heading, body }) {
  let html = '';

  if (heading) {
    if (isStrengthsSection(heading) || isProblemsSection(heading)) {
      return renderStrengthsOrProblemsSection(heading, body);
    }
    if (isAnnotatedTextSection(heading)) {
      html += formatSectionHeading(heading);
      html += renderAnnotatedSection(body);
      return html;
    }
    html += formatSectionHeading(heading);
  }

  if (heading && isCorrectionsSection(heading)) {
    const blocks = parseWritingCorrectionBlocks(body);
    if (blocks.length > 0) {
      html += renderCorrectionList(blocks);
      return html;
    }
  }

  if (heading && isBetterVocabularySection(heading)) {
    html += formatBulletLines(body);
    return html;
  }

  if (shouldUseParagraphLayout(heading)) {
    html += formatParagraphBody(body);
    return html;
  }

  html += formatBulletLines(body);
  return html;
}

function normalizeVocabArrowLine(line) {
  const t = String(line || '').trim();
  if (!t) return '';

  const insteadMatch = t.match(/^[-*•]?\s*"([^"]+)"\s+instead of\s+"([^"]+)"\.?\s*$/i);
  if (insteadMatch) {
    return `"${insteadMatch[2]}" → "${insteadMatch[1]}"`;
  }

  return t.replace(/^[-*•]\s+/, '');
}

function formatBetterVocabularyLines(body) {
  const normalized = formatWritingFeedbackDisplay(body);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<br />';

      const arrowLine = normalizeVocabArrowLine(trimmed);
      if (/→/.test(arrowLine)) {
        return `<p class="levels-b2-writing-panel__feedback-correction">${arrowLine}</p>`;
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        const item = trimmed.replace(/^[-*•]\s+/, '');
        if (/^"[^"]+"\s*→/.test(item)) {
          return `<p class="levels-b2-writing-panel__feedback-correction">${item}</p>`;
        }
        return `<p class="levels-b2-writing-panel__feedback-li">• ${item}</p>`;
      }

      return `<p class="levels-b2-writing-panel__feedback-p">${trimmed}</p>`;
    })
    .join('');
}

function formatPlainLines(body) {
  const normalized = formatWritingFeedbackDisplay(body);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<br />';
      if (/^Problem\s+\/?\s*Correct\s*:?\s*$/i.test(trimmed)) return '';
      if (isWritingFeedbackHeadingLine(trimmed)) {
        return formatSectionHeading(trimmed);
      }
      if (/^[-*]\s+/.test(trimmed)) {
        const item = trimmed.replace(/^[-*]\s+/, '');
        return `<p class="levels-b2-writing-panel__feedback-li">• ${item}</p>`;
      }
      if (/^→/.test(trimmed) || /→/.test(trimmed)) {
        return `<p class="levels-b2-writing-panel__feedback-correction">${trimmed}</p>`;
      }
      return `<p class="levels-b2-writing-panel__feedback-p">${trimmed}</p>`;
    })
    .join('');
}

function formatSectionHeading(heading) {
  const display = cleanWritingFeedbackHeading(heading);
  if (!display) return '';
  return `<h4 class="levels-b2-writing-panel__feedback-heading">${escapeHtml(display)}</h4>`;
}

/** Render one feedback section to HTML (exported for React wrapper). */
export function renderFeedbackSectionHtml(heading, body, options = {}) {
  if (options.skipCorrections && isCorrectionsSection(heading)) return '';
  if (options.skipAnnotated && isAnnotatedTextSection(heading)) return '';
  return renderFeedbackSection({ heading, body });
}

/** Líneas de corrección → HTML (emojis en títulos, bloques estructurados en Corrections). */
export function formatWritingFeedbackHtml(text, options = {}) {
  const raw = String(text || '').trim();
  if (!raw) return '';

  const sections = splitMarkdownSections(raw);
  const hasHeadings = sections.some((s) => s.heading);

  if (!hasHeadings) {
    const emojiSections = splitEmojiSections(raw);
    const hasEmojiHeadings = emojiSections.some((s) => s.heading);

    if (hasEmojiHeadings) {
      return reorderFeedbackSections(emojiSections)
        .map(({ heading, body }) =>
          renderFeedbackSectionHtml(heading, body, options),
        )
        .join('');
    }

    const blocks = parseWritingCorrectionBlocks(raw);
    if (blocks.length > 0) {
      return renderCorrectionList(blocks);
    }
    return formatBulletLines(raw);
  }

  return reorderFeedbackSections(sections)
    .map(({ heading, body }) => renderFeedbackSectionHtml(heading, body, options))
    .join('');
}
