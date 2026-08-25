/**
 * DRALO RUOE Editorial Quality Standard v1.0 — rule-based post-structural pass.
 * Does not trust generator self-claims (e.g. answer_validity_notes).
 */
import {
  countWords,
  detectLiteralPart5Match,
  extractMcqOptionText,
  extractPoolSentenceText,
  normalizeForMatch,
  significantWords,
} from '@/lib/b2RuoeExamQuality';
import { classifyTitlePatternFamily, scoreTitleAgainstBrief } from '@/lib/ruoeStyleCardV11';

const FILLER_PHRASES = [
  /\bin conclusion\b/i,
  /\bto sum up\b/i,
  /\ball in all\b/i,
  /\bin summary\b/i,
  /\boverall\b/i,
  /\bit is clear that\b/i,
  /\bit is important to note\b/i,
  /\bneedless to say\b/i,
];

const CORPORATE_ABSTRACT = [
  /\bleverage\b/i,
  /\bsynerg(y|ies)\b/i,
  /\bparadigm\b/i,
  /\bstakeholders\b/i,
  /\bholistic approach\b/i,
  /\bfacilitate outcomes\b/i,
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function paragraphSimilarity(a, b) {
  const wa = new Set(significantWords(a, 4));
  const wb = new Set(significantWords(b, 4));
  if (wa.size < 3 || wb.size < 3) return 0;
  const shared = [...wa].filter((w) => wb.has(w)).length;
  return shared / Math.max(wa.size, wb.size);
}

/**
 * @typedef {{ rule_id: string, severity: 'HARD_FAIL'|'QUALITY_FAIL'|'WARNING', location: string, evidence: string, reason: string, recommended_local_action: string }} EditorialFinding
 */

/**
 * @param {number} partNumber
 * @param {object} generated
 * @param {{ contentBriefWorkingTitle?: string, styleCardId?: string }} [context]
 * @returns {{ findings: EditorialFinding[], hardFails: string[], qualityFails: string[], warnings: string[] }}
 */
export function validateRuoeEditorialQuality(partNumber, generated, context = {}) {
  const findings = [];
  const hardFails = [];
  const qualityFails = [];
  const warnings = [];

  function add(finding) {
    findings.push(finding);
    const msg = `[${finding.rule_id}] ${finding.location}: ${finding.reason}`;
    if (finding.severity === 'HARD_FAIL') hardFails.push(msg);
    else if (finding.severity === 'QUALITY_FAIL') qualityFails.push(msg);
    else warnings.push(msg);
  }

  const pn = Number(partNumber);
  const passage = String(generated?.passage || generated?.text || '').trim();
  const title = String(generated?.title || '').trim();

  // Title quality (Parts with passages)
  if (title && [1, 2, 3, 5, 6].includes(pn)) {
    const briefTitle = String(
      context.contentBriefWorkingTitle || generated?.contentBriefWorkingTitle || generated?.workingTitle || '',
    ).trim();
    if (briefTitle) {
      const titleScore = scoreTitleAgainstBrief(title, briefTitle);
      if (titleScore.isLiteralParaphrase) {
        add({
          rule_id: 'TEST-TITLE-LITERAL',
          severity: 'QUALITY_FAIL',
          location: 'title',
          evidence: title,
          reason: `Title is a near-literal paraphrase of the Content Brief working title ("${briefTitle}").`,
          recommended_local_action: 'Regenerate title from 3+ candidates after text is stable.',
        });
      }
    }
    const pattern = classifyTitlePatternFamily(title);
    if (generated?.titlePatternFamily) {
      generated.titlePatternFamily = pattern;
    }
    if (/^(the|what|when|how|why)\s+\w+\s+(that|who|when)\b/i.test(title)) {
      add({
        rule_id: 'TQ-03',
        severity: 'WARNING',
        location: 'title',
        evidence: title,
        reason: 'Title uses a repeated template frame ("The X that…" / "What happens when…").',
        recommended_local_action: 'Pick a more concrete or understated title pattern.',
      });
    }
  }

  // Passage filler / redundancy (EQS-05, QA-004)
  if (passage && [1, 2, 3, 5, 6].includes(pn)) {
    const paragraphs = splitParagraphs(passage);
    if (paragraphs.length >= 3) {
      const last = paragraphs[paragraphs.length - 1];
      const prev = paragraphs[paragraphs.length - 2];
      if (paragraphSimilarity(last, prev) >= 0.55) {
        add({
          rule_id: 'TEST-EDQ-FILLER',
          severity: 'QUALITY_FAIL',
          location: 'passage.final_paragraphs',
          evidence: last.slice(0, 120),
          reason: 'Final paragraph largely repeats the previous paragraph (filler/conclusion echo).',
          recommended_local_action: 'Replace closing paragraph with a new development or implication.',
        });
      }
      const fillerHits = paragraphs.filter((p) => FILLER_PHRASES.some((re) => re.test(p))).length;
      if (fillerHits >= 2) {
        add({
          rule_id: 'EQS-05',
          severity: 'QUALITY_FAIL',
          location: 'passage',
          evidence: `${fillerHits} paragraphs with stock conclusion phrases`,
          reason: 'Repeated conclusion/filler phrasing detected across paragraphs.',
          recommended_local_action: 'Cut redundant evaluative closings; advance the article instead.',
        });
      }
    }

    const corporateHits = CORPORATE_ABSTRACT.filter((re) => re.test(passage)).length;
    if (corporateHits >= 2) {
      add({
        rule_id: 'EQS-03',
        severity: 'WARNING',
        location: 'passage',
        evidence: `${corporateHits} corporate/abstract phrases`,
        reason: 'Passage may sound overly abstract or corporate rather than genre-natural.',
        recommended_local_action: 'Prefer concrete verbs and situations.',
      });
    }
  }

  // Part 5: literal match on correct option (upgrade to QUALITY_FAIL in editorial layer)
  if (pn === 5 && passage) {
    const questions = asArray(generated.questions);
    questions.forEach((q, i) => {
      const label = `Q${q?.number ?? 31 + i}`;
      const opts = asArray(q.options);
      const letter = String(q?.answer || '').trim().toUpperCase();
      const correct = extractMcqOptionText(
        opts.find((o) => String(o).match(/^[A-D]/i)?.[0]?.toUpperCase() === letter) ?? '',
      );
      const literal = detectLiteralPart5Match(passage, correct);
      if (literal) {
        add({
          rule_id: 'P5-LITERAL-MATCH',
          severity: 'QUALITY_FAIL',
          location: label,
          evidence: literal.slice(0, 80),
          reason: 'Correct option may be solvable by literal word matching from the passage.',
          recommended_local_action: 'Rewrite question/options to require inference, not phrase copying.',
        });
      }
    });
  }

  // Part 7: lexical overlap / literal phrase copy
  if (pn === 7) {
    const sections = asArray(generated.sections || generated.people || generated.profileSections);
    const questions = asArray(generated.questions);
    questions.forEach((q, i) => {
      const prompt = String(q?.prompt || q?.question || q?.stem || '').trim();
      const stemNorm = normalizeForMatch(prompt).replace(/^who\s+/, '');
      if (stemNorm.length >= 18) {
        const phraseLen = Math.min(36, stemNorm.length);
        const phrase = stemNorm.slice(0, phraseLen);
        const copiedSection = sections.find((s) => {
          const t = normalizeForMatch(s?.text || s?.body || s?.profile || '');
          return t.includes(phrase);
        });
        if (copiedSection) {
          add({
            rule_id: 'TEST-P7-WORD-MATCH',
            severity: 'QUALITY_FAIL',
            location: `Q${q?.number ?? 43 + i}`,
            evidence: prompt.slice(0, 100),
            reason: `Question copies phrasing from section ${copiedSection?.letter || '?'}.`,
            recommended_local_action: 'Paraphrase with synonyms and different structure.',
          });
          return;
        }
      }
      const promptWords = significantWords(prompt, 5);
      if (promptWords.length < 3) return;
      const hits = sections.map((s, idx) => {
        const text = normalizeForMatch(s?.text || s?.body || s?.profile || '');
        const matched = promptWords.filter((w) => text.includes(w));
        return { idx, letter: s?.letter, ratio: matched.length / promptWords.length };
      }).filter((h) => h.ratio >= 0.65);
      if (hits.length === 1 && hits[0].ratio >= 0.7) {
        add({
          rule_id: 'TEST-P7-WORD-MATCH',
          severity: 'QUALITY_FAIL',
          location: `Q${q?.number ?? 43 + i}`,
          evidence: prompt.slice(0, 100),
          reason: 'Question wording overlaps heavily with a single profile (literal word matching).',
          recommended_local_action: 'Paraphrase the question; require discrimination of attitude/motivation.',
        });
      }
    });
  }

  // Do not treat generator notes as evidence of quality
  if (generated?.answer_validity_notes || generated?.answerValidityNotes) {
    add({
      rule_id: 'EQS-10',
      severity: 'WARNING',
      location: 'metadata',
      evidence: 'answer_validity_notes present',
      reason: 'Generator self-notes are ignored for pass/fail; independent checks apply.',
      recommended_local_action: 'Review items via validators, not generator commentary.',
    });
  }

  return { findings, hardFails, qualityFails, warnings };
}
