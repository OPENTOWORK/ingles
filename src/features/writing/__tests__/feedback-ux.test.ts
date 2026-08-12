/**
 * Phase 8 — Interactive Writing Map and feedback UX.
 *
 * The project has no DOM test runner (no jsdom, no testing-library), so the UX
 * rules are verified where they actually live:
 *
 *  - Behaviour that decides what the learner sees lives in pure modules
 *    (`annotation-segments`, `annotation-selection`, `feedback-view-model`) and is
 *    tested as behaviour, against the same validated fixtures the preview renders.
 *  - Rules about the markup itself — a mark is a real button, nothing opens on
 *    hover, no colour value is in JavaScript, the legacy sections do not exist on
 *    this path — are asserted against the component sources, which is the only
 *    honest option without a renderer.
 *
 * Visual acceptance is not claimed here. That is R6, and it needs the screenshots.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WRITING_CATEGORY_KEYS } from '../domain/categories';
import { CAMBRIDGE_CRITERION_KEYS, FINAL_CTA, feedbackPayloadSchema } from '../domain/schemas';
import type { FeedbackPayload, WritingAnnotation } from '../domain/types';
import {
  buildAnnotationSegments,
  markSegments,
  segmentsPreserveText,
} from '../ui/annotation-segments';
import {
  WRITING_MAP_LEGEND,
  WRITING_MAP_CATEGORY_TOKENS,
  resolveCategoryToken,
} from '../ui/annotation-palette';
import {
  initialSelectionState,
  isOpen,
  resolvePresentation,
  selectionReducer,
  WRITING_MAP_MOBILE_BREAKPOINT,
} from '../ui/annotation-selection';
import { buildFeedbackViewModel } from '../ui/feedback-view-model';

// ---------------------------------------------------------------------------
// Fixtures and sources
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const FIXTURE_DIR = path.join(ROOT, 'src', 'features', 'writing', '__tests__', 'fixtures', 'ui');
const V3_DIR = path.join(ROOT, 'src', 'components', 'writing', 'v3');
const UI_DIR = path.join(ROOT, 'src', 'features', 'writing', 'ui');

interface UiFixture {
  fixture_name: string;
  description: string;
  candidate_response: string;
  task_prompt: string;
  feedback_payload: FeedbackPayload;
}

function loadFixture(name: string): UiFixture {
  const raw = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, `${name}.json`), 'utf8'));
  // Every fixture is re-validated here: a preview built on an illegal payload
  // would prove nothing about the real interface.
  raw.feedback_payload = feedbackPayloadSchema.parse(raw.feedback_payload);
  return raw as UiFixture;
}

const FIXTURE_NAMES = ['standard', 'zero-strengths', 'dense-overlap', 'band-five'] as const;
const FIXTURES = Object.fromEntries(
  FIXTURE_NAMES.map((name) => [name, loadFixture(name)]),
) as Record<(typeof FIXTURE_NAMES)[number], UiFixture>;

function viewOf(name: (typeof FIXTURE_NAMES)[number]) {
  const fixture = FIXTURES[name];
  return buildFeedbackViewModel({
    candidate_response: fixture.candidate_response,
    feedback_payload: fixture.feedback_payload,
  });
}

function componentSources(): { file: string; source: string }[] {
  return fs
    .readdirSync(V3_DIR)
    .filter((file) => file.endsWith('.js'))
    .map((file) => ({ file, source: fs.readFileSync(path.join(V3_DIR, file), 'utf8') }));
}

function readComponent(file: string): string {
  return fs.readFileSync(path.join(V3_DIR, file), 'utf8');
}

/** Comments explain why a rule exists; only real code should be searched for it. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

// ---------------------------------------------------------------------------
// The learner's words
// ---------------------------------------------------------------------------

test('A — the writing is preserved character for character in every fixture', () => {
  for (const name of FIXTURE_NAMES) {
    const fixture = FIXTURES[name];
    const { segments, dropped } = buildAnnotationSegments(
      fixture.candidate_response,
      fixture.feedback_payload.annotations,
    );
    assert.deepEqual(dropped, [], `${name}: no annotation should be unrenderable`);
    assert.equal(
      segments.map((segment) => segment.text).join(''),
      fixture.candidate_response,
      `${name}: the rendered map must reproduce the submitted response exactly`,
    );
    assert.ok(segmentsPreserveText(fixture.candidate_response, segments));
    assert.ok(viewOf(name).map.text_is_intact);
  }
});

test('A — every mark covers exactly the offsets Phase 3 bound', () => {
  const fixture = FIXTURES.standard;
  const { segments } = buildAnnotationSegments(
    fixture.candidate_response,
    fixture.feedback_payload.annotations,
  );
  for (const annotation of fixture.feedback_payload.annotations) {
    const covering = markSegments(segments).filter((segment) =>
      segment.annotations.some((item) => item.annotation_id === annotation.annotation_id),
    );
    assert.ok(covering.length >= 1, `${annotation.annotation_id} must be rendered`);
    const start = Math.min(...covering.map((segment) => segment.start));
    const end = Math.max(...covering.map((segment) => segment.end));
    assert.equal(start, annotation.span_start);
    assert.equal(end, annotation.span_end);
    assert.equal(
      fixture.candidate_response.slice(start, end),
      annotation.original_text,
      'the highlighted words must be the words the observation was bound to',
    );
  }
});

test('A — an annotation whose offsets no longer match the text is dropped, not rendered wrongly', () => {
  const fixture = FIXTURES.standard;
  const [first, ...rest] = fixture.feedback_payload.annotations;
  const shifted: WritingAnnotation = { ...first!, span_start: first!.span_start + 3 };
  const outOfRange: WritingAnnotation = {
    ...first!,
    annotation_id: 'ann-out-of-range',
    span_start: fixture.candidate_response.length - 1,
    span_end: fixture.candidate_response.length + 40,
  };
  const { segments, dropped } = buildAnnotationSegments(fixture.candidate_response, [
    shifted,
    outOfRange,
    ...rest,
  ]);
  assert.deepEqual(
    dropped.map((item) => item.reason).sort(),
    ['span_out_of_range', 'text_mismatch'],
  );
  assert.ok(segmentsPreserveText(fixture.candidate_response, segments));
});

// ---------------------------------------------------------------------------
// Overlapping and adjacent spans
// ---------------------------------------------------------------------------

test('B — overlapping spans keep both identities and write the shared words once', () => {
  const fixture = FIXTURES['dense-overlap'];
  const { segments } = buildAnnotationSegments(
    fixture.candidate_response,
    fixture.feedback_payload.annotations,
  );
  const overlapping = markSegments(segments).filter((segment) => segment.overlapping);
  assert.ok(overlapping.length > 0, 'the dense fixture must actually contain an overlap');

  for (const segment of overlapping) {
    assert.ok(segment.annotations.length > 1);
    const ids = new Set(segment.annotations.map((item) => item.observation_id));
    assert.equal(ids.size, segment.annotations.length, 'both observations survive the overlap');
  }

  // The shared words appear once in the output, and the whole response is intact.
  const shared = overlapping[0]!.text;
  const occurrencesInMap = segments.filter((segment) => segment.text === shared).length;
  assert.equal(occurrencesInMap, 1);
  assert.equal(segments.map((segment) => segment.text).join(''), fixture.candidate_response);

  // Every character belongs to exactly one segment: no duplication is possible.
  let cursor = 0;
  for (const segment of segments) {
    assert.equal(segment.start, cursor);
    cursor = segment.end;
  }
  assert.equal(cursor, fixture.candidate_response.length);
});

test('B — segmentation is deterministic regardless of annotation array order', () => {
  const fixture = FIXTURES['dense-overlap'];
  const forward = buildAnnotationSegments(
    fixture.candidate_response,
    fixture.feedback_payload.annotations,
  );
  const reversed = buildAnnotationSegments(
    fixture.candidate_response,
    [...fixture.feedback_payload.annotations].reverse(),
  );
  assert.deepEqual(
    forward.segments.map((segment) => [segment.start, segment.end, segment.kind]),
    reversed.segments.map((segment) => [segment.start, segment.end, segment.kind]),
  );
  assert.deepEqual(
    markSegments(forward.segments).map((segment) => segment.group_id),
    markSegments(reversed.segments).map((segment) => segment.group_id),
  );
});

test('B — adjacent spans that touch do not merge into one mark', () => {
  const text = 'one two three';
  const annotation = (id: string, start: number, end: number): WritingAnnotation => ({
    annotation_id: id,
    observation_id: `obs-${id}`,
    category_key: 'grammar',
    span_start: start,
    span_end: end,
    original_text: text.slice(start, end),
    feedback_kind: 'explanation',
    local_explanation: 'Explanation.',
  });
  const { segments } = buildAnnotationSegments(text, [
    annotation('a', 0, 3),
    annotation('b', 4, 7),
  ]);
  const marks = markSegments(segments);
  assert.equal(marks.length, 2);
  assert.deepEqual(marks.map((segment) => segment.text), ['one', 'two']);
  assert.ok(segmentsPreserveText(text, segments));
});

// ---------------------------------------------------------------------------
// No legacy markup on the v3 path
// ---------------------------------------------------------------------------

test('C — the v3 path contains no legacy markup parser', () => {
  for (const { file, source } of componentSources()) {
    assert.ok(
      !source.includes('writingAnnotatedMarkup'),
      `${file} must not import the legacy markup parser`,
    );
    for (const tag of ['[[gram', '[[voc', '[[spell', '[[cont', '[[good']) {
      assert.ok(!source.includes(tag), `${file} must not know about ${tag}`);
    }
  }
  const segmentation = fs.readFileSync(path.join(UI_DIR, 'annotation-segments.ts'), 'utf8');
  assert.ok(!stripComments(segmentation).includes('[['));
  assert.ok(!segmentation.includes('parseAnnotatedTextSegments'));
});

test('C — no v3 component renders model-supplied HTML', () => {
  for (const { file, source } of componentSources()) {
    assert.ok(!source.includes('dangerouslySetInnerHTML'), `${file} must not inject raw HTML`);
  }
});

// ---------------------------------------------------------------------------
// Desktop interaction
// ---------------------------------------------------------------------------

test('D — only one annotation is open at a time, and the second click replaces the first', () => {
  let state = initialSelectionState(1280);
  assert.equal(state.active_group_id, null);
  assert.equal(state.presentation, 'bubble');

  state = selectionReducer(state, { type: 'activate', group_id: 'ann-1' });
  assert.ok(isOpen(state, 'ann-1'));

  state = selectionReducer(state, { type: 'activate', group_id: 'ann-2' });
  assert.ok(isOpen(state, 'ann-2'));
  assert.ok(!isOpen(state, 'ann-1'), 'opening the second closes the first');
  assert.equal(state.active_group_id, 'ann-2', 'there is exactly one active group, never a list');
});

test('D — clicking the open mark again closes it', () => {
  let state = selectionReducer(initialSelectionState(1280), {
    type: 'activate',
    group_id: 'ann-1',
  });
  state = selectionReducer(state, { type: 'activate', group_id: 'ann-1' });
  assert.equal(state.active_group_id, null);
});

test('D — dismiss covers Escape and click-outside, and remembers where focus returns', () => {
  let state = selectionReducer(initialSelectionState(1280), {
    type: 'activate',
    group_id: 'ann-7',
  });
  state = selectionReducer(state, { type: 'dismiss' });
  assert.equal(state.active_group_id, null);
  assert.equal(state.return_focus_group_id, 'ann-7');

  const canvas = stripComments(readComponent('WritingMapCanvas.js'));
  assert.match(canvas, /event\.key === 'Escape'/, 'Escape must close the open feedback');
  assert.match(canvas, /addEventListener\('mousedown'/, 'a click outside must close it');
  assert.match(canvas, /containerRef\.current\?\.contains\(event\.target\)/);
  assert.match(canvas, /\.focus\(\)/, 'focus must return to the mark that was opened');
});

test('D — nothing on the v3 path opens on hover', () => {
  for (const { file, source } of componentSources()) {
    const code = stripComments(source);
    for (const handler of ['onMouseEnter', 'onMouseOver', 'onPointerEnter', 'onFocusCapture']) {
      assert.ok(!code.includes(handler), `${file} must not react to ${handler}`);
    }
  }
});

// ---------------------------------------------------------------------------
// Mobile interaction
// ---------------------------------------------------------------------------

test('E — below the mobile breakpoint the feedback becomes a bottom sheet', () => {
  assert.equal(resolvePresentation(WRITING_MAP_MOBILE_BREAKPOINT + 1), 'bubble');
  assert.equal(resolvePresentation(WRITING_MAP_MOBILE_BREAKPOINT), 'sheet');
  assert.equal(resolvePresentation(390), 'sheet');

  let state = initialSelectionState(390);
  assert.equal(state.presentation, 'sheet');
  state = selectionReducer(state, { type: 'activate', group_id: 'ann-1' });
  state = selectionReducer(state, { type: 'viewport', width: 1280 });
  assert.equal(state.presentation, 'bubble');
  assert.equal(state.active_group_id, 'ann-1', 'crossing the breakpoint moves the surface only');

  const canvas = stripComments(readComponent('WritingMapCanvas.js'));
  assert.match(canvas, /presentation === 'sheet'[\s\S]*WritingMapBottomSheet/);
  assert.match(canvas, /presentation === 'bubble'[\s\S]*WritingMapBubble/);
});

test('E — the bottom sheet is dismissible and manages focus', () => {
  const sheet = stripComments(readComponent('WritingMapBottomSheet.js'));
  assert.match(sheet, /writing-map__sheet-scrim/, 'tapping outside the sheet closes it');
  assert.equal((sheet.match(/onClick=\{onClose\}/g) ?? []).length, 2, 'scrim and button close it');
  assert.match(sheet, /closeRef\.current\?\.focus\(\)/, 'focus moves into the sheet');
  assert.match(sheet, /role="dialog"/);
  assert.match(sheet, /aria-label=/);
});

// ---------------------------------------------------------------------------
// Categories and colour
// ---------------------------------------------------------------------------

test('F — the six closed category keys all resolve, and a seventh does not exist', () => {
  assert.deepEqual(
    WRITING_MAP_LEGEND.map((token) => token.key),
    [...WRITING_CATEGORY_KEYS],
  );
  for (const key of WRITING_CATEGORY_KEYS) {
    const token = resolveCategoryToken(key);
    assert.equal(token.key, key);
    assert.ok(token.label.length > 0);
    assert.ok(token.hint.length > 0);
    assert.ok(token.marker.length > 0);
    assert.match(token.className, /^writing-map-mark--/);
  }
  assert.equal(Object.keys(WRITING_MAP_CATEGORY_TOKENS).length, 6);
  assert.throws(() => resolveCategoryToken('punctuation'), /closed/);
});

test('F — a global or punctuation observation produces no local mark', () => {
  const fixture = FIXTURES.standard;
  const categories = new Set(fixture.feedback_payload.annotations.map((a) => a.category_key));
  for (const category of categories) {
    assert.ok((WRITING_CATEGORY_KEYS as readonly string[]).includes(category));
  }
  // The fixture carries a bound punctuation observation and a global register
  // observation. Neither may appear as a mark in the writing.
  assert.ok(
    !fixture.feedback_payload.annotations.some((annotation) =>
      annotation.original_text.includes('For a student who works and studies'),
    ),
    'a punctuation observation has no approved map category in v1',
  );
  assert.equal(fixture.feedback_payload.annotations.length, 7);
});

test('F — no colour value is read from the payload or written in a component', () => {
  const fixture = FIXTURES.standard;
  const payloadText = JSON.stringify(fixture.feedback_payload);
  for (const forbidden of ['colour', 'color', 'className', 'hex', '#'] as const) {
    assert.ok(!payloadText.includes(forbidden), `the payload must not carry ${forbidden}`);
  }

  const view = viewOf('standard');
  assert.ok(!JSON.stringify(view).match(/#[0-9a-fA-F]{3,8}\b/), 'the view model carries no colour');

  for (const { file, source } of componentSources()) {
    const code = stripComments(source);
    assert.ok(!/#[0-9a-fA-F]{6}\b/.test(code), `${file} must not hard-code a colour`);
    for (const key of WRITING_CATEGORY_KEYS) {
      assert.ok(
        !new RegExp(`===\\s*'${key}'`).test(code),
        `${file} must not branch on the category "${key}" to choose styling`,
      );
    }
  }

  const palette = fs.readFileSync(path.join(UI_DIR, 'annotation-palette.ts'), 'utf8');
  assert.ok(!/#[0-9a-fA-F]{6}\b/.test(stripComments(palette)));
  assert.match(palette, /PROVISIONAL — REQUIRES R6 VISUAL APPROVAL/);
});

test('F — category meaning never depends on colour alone', () => {
  const annotation = stripComments(readComponent('WritingMapAnnotation.js'));
  assert.match(annotation, /aria-label=\{label\}/);
  assert.match(annotation, /category\.label/, 'the accessible name names the category');

  const canvas = stripComments(readComponent('WritingMapCanvas.js'));
  assert.match(canvas, /writing-map__legend/, 'a legend names every category in use');
  assert.match(canvas, /token\.marker/, 'each category also carries a non-colour marker');
  assert.ok(!canvas.includes('writing-map__legend-hint'), 'permanent explanatory legend phrases are not rendered');

  const view = viewOf('standard');
  assert.ok(view.map.legend.length >= 4);
  for (const token of view.map.legend) {
    assert.ok(token.label && token.hint && token.marker);
  }
});

// ---------------------------------------------------------------------------
// The result
// ---------------------------------------------------------------------------

test('G — the result shows four marks out of five and one total out of twenty', () => {
  const view = viewOf('standard');
  assert.equal(view.result.criteria.length, 4);
  assert.deepEqual(
    view.result.criteria.map((row) => row.key),
    [...CAMBRIDGE_CRITERION_KEYS],
  );
  for (const row of view.result.criteria) {
    assert.equal(row.max, 5);
    assert.ok(row.mark >= 0 && row.mark <= 5);
  }
  assert.equal(view.result.max_total, 20);
  assert.equal(
    view.result.raw_total,
    view.result.criteria.reduce((sum, row) => sum + row.mark, 0),
    'the total is the copied sum, never a recomputation',
  );
  assert.equal(view.result.raw_total, FIXTURES.standard.feedback_payload.global_result.raw_total);
});

test('G — the marks are copied from the frozen payload, not derived in the UI', () => {
  for (const name of FIXTURE_NAMES) {
    const payload = FIXTURES[name].feedback_payload;
    const view = viewOf(name);
    for (const key of CAMBRIDGE_CRITERION_KEYS) {
      const card = view.criteria.find((row) => row.key === key)!;
      assert.equal(card.mark, payload.global_result.criteria[key]);
    }
    assert.equal(view.result.raw_total, payload.global_result.raw_total);
  }
});

test('G — no pass, fail, pass mark, CEFR, scale or readiness anywhere on the v3 path', () => {
  const forbidden = [
    /\bpass mark\b/i,
    /\bpass\b/i,
    /\bfail\b/i,
    /\bfailed\b/i,
    /12\s*\/\s*20/,
    /\bCEFR\b/i,
    /\bB2 standard met\b/i,
    /Cambridge English Scale/i,
    /\breadiness\b/i,
    /\bready for\b/i,
    /estimated level/i,
    /improved version/i,
    /stronger .*version/i,
    /study plan/i,
  ];

  for (const name of FIXTURE_NAMES) {
    const text = JSON.stringify(viewOf(name));
    for (const pattern of forbidden) {
      assert.ok(!pattern.test(text), `${name}: the view model must not contain ${pattern}`);
    }
  }

  for (const { file, source } of componentSources()) {
    const code = stripComments(source);
    for (const pattern of forbidden) {
      assert.ok(!pattern.test(code), `${file} must not render ${pattern}`);
    }
  }
});

test('G — the DRALO disclaimer is present without becoming a verdict', () => {
  const view = viewOf('standard');
  assert.match(view.result.disclaimer, /not an official Cambridge result/);
  assert.ok(!/\bpass\b/i.test(view.result.disclaimer));
  const result = stripComments(readComponent('WritingGlobalResult.js'));
  assert.match(result, /result\.disclaimer/);
});

// ---------------------------------------------------------------------------
// Opening strengths
// ---------------------------------------------------------------------------

test('H — the strengths rendered are exactly the ones Phase 6 selected', () => {
  const payload = FIXTURES.standard.feedback_payload;
  const view = viewOf('standard');
  assert.equal(view.strengths.length, payload.opening_strengths.length);
  assert.deepEqual(
    view.strengths.map((strength) => strength.id),
    payload.opening_strengths.map((strength) => strength.strength_id),
  );
  assert.deepEqual(
    view.strengths.map((strength) => strength.headline),
    payload.opening_strengths.map((strength) => strength.headline),
  );
  assert.ok(view.strengths.length >= 2 && view.strengths.length <= 3);
});

test('H — zero strengths renders nothing rather than manufactured praise', () => {
  const view = viewOf('zero-strengths');
  assert.deepEqual(view.strengths, []);
  assert.ok(view.map.annotation_count > 0, 'the rest of the correction is unaffected');

  const strengths = stripComments(readComponent('WritingOpeningStrengths.js'));
  assert.match(strengths, /if \(!strengths\.length\) return null;/);
  assert.ok(
    !/Well done|Good job|Keep it up/i.test(strengths),
    'the component invents no praise of its own',
  );
});

// ---------------------------------------------------------------------------
// Criterion cards and progressive disclosure
// ---------------------------------------------------------------------------

test('I — all four criterion cards exist, in Cambridge order, with learner-facing names', () => {
  const view = viewOf('standard');
  assert.deepEqual(
    view.criteria.map((card) => card.key),
    [...CAMBRIDGE_CRITERION_KEYS],
  );
  assert.deepEqual(
    view.criteria.map((card) => card.label),
    ['Content', 'Communicative Achievement', 'Organisation', 'Language'],
  );
  const page = stripComments(readComponent('WritingFeedbackPage.js'));
  assert.match(page, /view\.criteria\.map/);
});

test('I — collapsed shows a summary, expanded shows the four disclosure fields', () => {
  const view = viewOf('standard');
  for (const card of view.criteria) {
    assert.ok(card.summary.length > 0);
    assert.ok(card.expanded.what_worked.length > 0);
    assert.ok(card.expanded.what_limited_the_band.length > 0);
    assert.ok(card.expanded.next_focus.length > 0);
    assert.ok(Array.isArray(card.expanded.evidence));
    for (const quote of card.expanded.evidence) {
      assert.equal(typeof quote, 'string');
      assert.ok(
        FIXTURES.standard.candidate_response.includes(quote),
        'evidence is quoted from the learner’s own writing',
      );
    }
  }

  const card = stripComments(readComponent('WritingCriterionCard.js'));
  assert.match(card, /aria-expanded=\{expanded\}/, 'disclosure state is exposed to assistive tech');
  assert.match(card, /aria-controls=\{panelId\}/);
  assert.match(card, /hidden=\{!expanded\}/, 'the panel is really hidden when collapsed');
  assert.match(card, /<button/, 'the toggle is a button, so the keyboard already works');
  assert.match(card, /setExpanded\(\(value\) => !value\)/);
});

test('I — the cards expose no internal assessment machinery', () => {
  for (const name of FIXTURE_NAMES) {
    const view = viewOf(name);
    // Everything the learner reads. The map segments are excluded because they
    // legitimately carry offsets and observation ids: those are what let an
    // overlapping mark keep both identities, and they are rendered as data
    // attributes, never as text.
    const text = JSON.stringify({
      result: view.result,
      strengths: view.strengths,
      criteria: view.criteria,
      review_next: view.review_next,
      groups: view.map.groups,
      legend: view.map.legend,
    });
    for (const forbidden of [
      'why_not_lower',
      'why_not_higher',
      'band_anchor',
      'source_rule_ids',
      'confidence',
      'provenance',
      'engine_version',
      'schema_version',
      'prompt_version',
      'validator',
      'retry',
      'calibration',
      'model_config',
      'teacher_dna_rule_ids',
      'occurrence_index',
      'span_start',
    ]) {
      assert.ok(!text.includes(forbidden), `${name}: the view model must not carry ${forbidden}`);
    }
  }
});

test('J — band 5 consolidates and never points at a band 6', () => {
  const view = viewOf('band-five');
  const top = view.criteria.filter((card) => card.mark === 5);
  assert.ok(top.length >= 1, 'the band-five fixture must contain a band 5');
  for (const card of top) {
    assert.equal(card.is_top_band, true);
    assert.notEqual(card.next_focus_label, 'Next focus');
    assert.match(card.next_focus_label, /Keeping it there/);
  }
  for (const card of view.criteria) {
    if (card.mark < 5) {
      assert.equal(card.is_top_band, false);
      assert.equal(card.next_focus_label, 'Next focus');
    }
  }

  const text = JSON.stringify(view);
  for (const pattern of [/band 6/i, /band six/i, /reach band 6/i]) {
    assert.ok(!pattern.test(text), `no wording may imply ${pattern}`);
  }
  const card = stripComments(readComponent('WritingCriterionCard.js'));
  assert.ok(!/band 6/i.test(card));
  assert.match(card, /criterion\.next_focus_label/);
});

// ---------------------------------------------------------------------------
// Review next and the single action
// ---------------------------------------------------------------------------

test('K — review_next is plain text with no links and no invented resources', () => {
  const view = viewOf('standard');
  assert.ok(view.review_next.length > 0);
  for (const item of view.review_next) {
    assert.equal(typeof item.concept, 'string');
    assert.equal(typeof item.reason, 'string');
    assert.ok(!/https?:\/\//.test(`${item.concept}${item.reason}`));
    assert.deepEqual(Object.keys(item).sort(), ['concept', 'id', 'reason']);
  }
  for (const item of FIXTURES.standard.feedback_payload.review_next) {
    assert.equal(item.resource_key, null);
  }

  const review = stripComments(readComponent('WritingReviewNext.js'));
  assert.ok(!review.includes('<a '), 'v1 renders no anchors');
  assert.ok(!review.includes('next/link'), 'v1 links to nothing');
  assert.ok(!review.includes('<button'), 'and offers no button to material that does not exist');
});

test('K2 — review_next reasons are specific and not duplicated in the standard fixture', () => {
  const items = FIXTURES.standard.feedback_payload.review_next;
  const reasons = items.map((item) => item.reason.trim().toLowerCase());
  assert.equal(new Set(reasons).size, reasons.length, 'each review item carries a distinct reason');
  for (const reason of reasons) {
    assert.ok(
      !reason.includes('it appeared in this response and it is the kind of detail an examiner notices immediately'),
      'generic canned reasons are not acceptable',
    );
  }
});

test('K3 — criterion next_focus is independently composed in the standard fixture', () => {
  for (const row of FIXTURES.standard.feedback_payload.criterion_feedback) {
    const limited = row.expanded.what_limited_the_band.trim().toLowerCase();
    const focus = row.expanded.next_focus.trim().toLowerCase();
    assert.ok(!focus.startsWith('to move closer to the next band'), `${row.criterion} next_focus is not mechanical`);
    assert.ok(!focus.includes(limited) || focus.length > limited.length + 20, `${row.criterion} next_focus is independent`);
  }
});

test('L — the only action is “Write another task”', () => {
  const view = viewOf('standard');
  assert.equal(view.cta_label, FINAL_CTA);
  assert.equal(view.cta_label, 'Write another task');

  const page = stripComments(readComponent('WritingFeedbackPage.js'));
  const buttons = page.match(/<button/g) ?? [];
  assert.equal(buttons.length, 1, 'the page itself offers exactly one action');
  for (const forbidden of [
    'Save progress',
    'View lesson',
    'Practise weakness',
    'Upgrade',
    'Share correction',
  ]) {
    assert.ok(!page.includes(forbidden), `${forbidden} is not a v1 action`);
  }
});

test('L — no rewritten version of the response is anywhere in the payload or the view', () => {
  for (const name of FIXTURE_NAMES) {
    const fixture = FIXTURES[name];
    const view = viewOf(name);
    const response = fixture.candidate_response;
    const serialised = JSON.stringify(view);
    // The full response appears exactly once: as the learner's own writing.
    const occurrences = serialised.split(JSON.stringify(response).slice(1, -1)).length - 1;
    assert.equal(occurrences, 1, `${name}: the response is shown once and never rewritten`);
    assert.equal(view.map.candidate_response, response);
  }
});

// ---------------------------------------------------------------------------
// Accessibility and keyboard
// ---------------------------------------------------------------------------

test('M — a mark is keyboard operable with a visible focus state', () => {
  // A `<button>` cannot break across lines, which shatters a paragraph on a phone,
  // so the mark is a span that declares everything a button would have provided.
  const annotation = stripComments(readComponent('WritingMapAnnotation.js'));
  assert.match(annotation, /role="button"/);
  assert.match(annotation, /tabIndex=\{0\}/, 'the mark is in the tab order');
  assert.match(annotation, /event\.key === 'Enter'/, 'Enter activates it');
  assert.match(annotation, /event\.key === ' '/, 'Space activates it');
  assert.match(annotation, /event\.preventDefault\(\)/, 'Space does not scroll the page instead');
  assert.match(annotation, /aria-expanded=\{open\}/);
  assert.match(annotation, /aria-controls=/);
  assert.ok(!annotation.includes('tabIndex={-1}'), 'a mark is never removed from the tab order');

  const css = fs.readFileSync(path.join(ROOT, 'src', 'app', 'globals.css'), 'utf8');
  assert.match(css, /\.writing-map__mark:focus-visible\s*\{[^}]*outline/);
  assert.match(css, /\.writing-map__mark:focus\s*\{[^}]*outline:\s*none/);
  assert.match(css, /\.writing-criterion--expanded\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.ok(
    !/writing-result__total[\s\S]{0,120}background:\s*var\(--writing-v3-accent-soft\)/.test(css),
    'the total is not styled as a loud status pill',
  );
  assert.match(css, /\.writing-criterion__toggle:focus-visible\s*\{[^}]*outline/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*writing-map__sheet/);
});

test('M — screen-reader labels say what the mark is and which words it covers', () => {
  const annotation = stripComments(readComponent('WritingMapAnnotation.js'));
  assert.match(annotation, /feedback on/i);
  assert.match(annotation, /categories\.join/, 'an overlap names every category involved');

  const bubble = stripComments(readComponent('WritingMapBubble.js'));
  assert.match(bubble, /role="dialog"/);
  assert.match(bubble, /aria-label=\{`Feedback on/);
  assert.match(bubble, /aria-label="Close this feedback"/);

  const result = stripComments(readComponent('WritingGlobalResult.js'));
  assert.match(result, /out of \{criterion\.max\}/, 'a mark reads as “4 out of 5”, not “4 slash 5”');
  assert.match(result, /writing-result__sr-only/);
});

test('M — the reading order is result, strengths, writing, criteria, review, action', () => {
  const page = readComponent('WritingFeedbackPage.js');
  const order = [
    'WritingGlobalResult',
    'WritingOpeningStrengths',
    'WritingMapCanvas',
    'writing-v3__criteria',
    'WritingReviewNext',
    'writing-v3__cta',
  ];
  let cursor = page.indexOf('return (');
  for (const marker of order) {
    const next = page.indexOf(marker, cursor);
    assert.ok(next > cursor, `${marker} must come after the previous section`);
    cursor = next;
  }
});

test('M2 — candidate writing inherits DRALO UI font, not a dedicated serif', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src', 'app', 'globals.css'), 'utf8');
  const start = css.indexOf('Writing v3 — Interactive Writing Map');
  const end = css.indexOf('/* --- Writing v3 internal preview harness');
  assert.ok(start >= 0 && end > start, 'Writing v3 CSS block must exist');
  const block = css.slice(start, end);
  assert.ok(!/Georgia/i.test(block), 'Writing v3 must not use Georgia');
  assert.ok(!/Times New Roman/i.test(block), 'Writing v3 must not use Times New Roman');
  assert.ok(!/,\s*serif\s*;/i.test(block), 'Writing v3 must not declare a serif generic family');
  assert.match(
    block,
    /\.writing-map__text[\s\S]*?font-family:\s*inherit/,
    'candidate text inherits the site font stack',
  );
  const mapCanvas = stripComments(readComponent('WritingMapCanvas.js'));
  assert.ok(!/fontFamily|font-family/i.test(mapCanvas), 'map canvas must not set a font inline');
});

const COMPACT_WRITING_MAP_TEXT_SIZE = 1.02;
const COMPACT_SECTION_LABEL_SIZE = 0.6875;
const COMPACT_PAGE_TITLE_SIZE = 1.15;

test('M3 — desktop scale increases presence without changing mobile rules', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src', 'app', 'globals.css'), 'utf8');
  const start = css.indexOf('Writing v3 — Interactive Writing Map');
  const end = css.indexOf('/* --- Writing v3 internal preview harness');
  const block = css.slice(start, end);

  const desktopStart = block.indexOf('@media (min-width: 901px)');
  assert.ok(desktopStart >= 0, 'desktop scale block must exist');
  const desktopBlock = block.slice(desktopStart);

  const writingSize = desktopBlock.match(/\.writing-map__text[\s\S]*?font-size:\s*([\d.]+)rem/);
  assert.ok(writingSize, 'desktop candidate writing size must be declared');
  assert.ok(
    Number(writingSize[1]) > COMPACT_WRITING_MAP_TEXT_SIZE,
    'desktop writing must be larger than the compact baseline',
  );

  const sectionSize = desktopBlock.match(
    /\.writing-v3 \.levels-exam-split__section-title[\s\S]*?font-size:\s*([\d.]+)rem/,
  );
  assert.ok(sectionSize, 'desktop section labels must be declared');
  assert.ok(
    Number(sectionSize[1]) > COMPACT_SECTION_LABEL_SIZE,
    'desktop section labels must be larger than the compact baseline',
  );

  const titleSize = desktopBlock.match(/\.writing-v3__title[\s\S]*?font-size:\s*([\d.]+)rem/);
  assert.ok(titleSize, 'desktop page title must be declared');
  assert.ok(
    Number(titleSize[1]) > COMPACT_PAGE_TITLE_SIZE,
    'desktop page title must be larger than the compact baseline',
  );

  assert.match(desktopBlock, /\.writing-map\s*\{[\s\S]*?max-width:\s*52rem/);
  assert.ok(
    !/@media\s*\(max-width:\s*640px\)[\s\S]*font-size:\s*1\.15rem/.test(block),
    'mobile writing scale must not inherit the desktop bump',
  );
});

// ---------------------------------------------------------------------------
// No production wiring
// ---------------------------------------------------------------------------

test('N — the preview route is development-only and reaches no engine, model or database', () => {
  const route = path.join(ROOT, 'src', 'app', 'dralo-dev', 'writing-v3', 'page.js');
  const source = fs.readFileSync(route, 'utf8');
  assert.match(source, /process\.env\.NODE_ENV === 'production'/, 'production refuses to render it');
  assert.match(source, /fixtures\/ui\//, 'it renders static fixtures');
  const code = stripComments(source).toLowerCase();
  for (const forbidden of ['openai', 'supabase', 'composefeedback', 'repository', 'fetch(']) {
    assert.ok(!code.includes(forbidden), `the route must not use ${forbidden}`);
  }

  // The exemption lives in one module, applied by the server middleware and the
  // client shell, and it is false in production.
  const helper = fs.readFileSync(path.join(ROOT, 'src', 'utils', 'writingV3Preview.js'), 'utf8');
  assert.match(helper, /NODE_ENV === 'production'\) return false/);
  const middleware = fs.readFileSync(path.join(ROOT, 'src', 'middleware.ts'), 'utf8');
  assert.match(middleware, /isWritingV3PreviewPath\(pathname\)/);
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'app', 'RootLayoutClient.js'), 'utf8');
  assert.match(shell, /isWritingV3PreviewPath\(pathname\)/);

  const publicRoutes = fs.readFileSync(path.join(ROOT, 'src', 'utils', 'publicRoutes.js'), 'utf8');
  assert.ok(!publicRoutes.includes('dralo-dev'), 'the preview is not a public route');

  const nav = fs.readFileSync(path.join(ROOT, 'src', 'config', 'appNavMenu.js'), 'utf8');
  assert.ok(!nav.includes('dralo-dev'), 'the preview appears in no navigation menu');
});

test('N — no v3 component talks to the network, the database or a model', () => {
  for (const { file, source } of componentSources()) {
    const code = stripComments(source).toLowerCase();
    for (const forbidden of ['fetch(', 'supabase', 'openai', '/api/']) {
      assert.ok(!code.includes(forbidden), `${file} must not use ${forbidden}`);
    }
  }
});

test('N — the legacy correction path remains available alongside gated v3', () => {
  const legacy = fs.readFileSync(
    path.join(ROOT, 'src', 'components', 'writing', 'WritingInteractiveAnnotatedText.js'),
    'utf8',
  );
  assert.match(legacy, /parseAnnotatedTextSegments/, 'the legacy component still parses legacy markup');
  assert.ok(!legacy.includes('v3/'), 'and it knows nothing about the v3 path');

  const panel = fs.readFileSync(
    path.join(ROOT, 'src', 'components', 'b2', 'B2WritingLongFormAiPanel.js'),
    'utf8',
  );
  // Phase 10: panel may render WritingFeedbackPage when the server returns engine=v3.
  // Legacy markup rendering must still exist for the default (flag-off) path.
  assert.match(panel, /WritingFeedbackBody/, 'legacy feedback body remains for non-v3 results');
  assert.match(panel, /!v3Payload && aiFeedback/, 'v3 and legacy UI branches stay mutually exclusive');
});

// ---------------------------------------------------------------------------
// Performance shape
// ---------------------------------------------------------------------------

test('O — a normal B2 response renders as a handful of segments, not one per character', () => {
  const fixture = FIXTURES.standard;
  const { segments } = buildAnnotationSegments(
    fixture.candidate_response,
    fixture.feedback_payload.annotations,
  );
  const annotations = fixture.feedback_payload.annotations.length;
  assert.ok(
    segments.length <= annotations * 2 + 1,
    `expected at most ${annotations * 2 + 1} segments, got ${segments.length}`,
  );
  assert.ok(segments.length < fixture.candidate_response.length / 10);

  const canvas = readComponent('WritingMapCanvas.js');
  assert.match(canvas, /useMemo/, 'the segment nodes are memoised');
  for (const heavy of ['draft-js', 'slate', 'quill', 'tiptap', 'prosemirror']) {
    assert.ok(!canvas.includes(heavy), `no rich-text editor dependency (${heavy})`);
  }
});

test('O — an unannotated response still renders as one segment', () => {
  const { segments, dropped } = buildAnnotationSegments('Just plain writing.', []);
  assert.deepEqual(dropped, []);
  assert.equal(segments.length, 1);
  assert.equal(segments[0]!.kind, 'text');
  assert.equal(segments[0]!.text, 'Just plain writing.');
});
