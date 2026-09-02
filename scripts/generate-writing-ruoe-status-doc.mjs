/**
 * Generates DRALO Writing & RUOE Status Report (Word).
 * Run: node scripts/generate-writing-ruoe-status-doc.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const OUT_DIR = path.join(process.cwd(), 'DOCUMENTOS DE CORRECION');
const OUT_FILE = path.join(OUT_DIR, '08_DRALO_Writing_and_RUOE_Status_Report_v1.0.docx');

const FONT = 'Calibri';
const ACCENT = '1F4E79';
const MUTED = '5A6C7D';

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size ?? 22,
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color,
  });
}

function para(children, opts = {}) {
  const runs = typeof children === 'string' ? [run(children, opts)] : children;
  return new Paragraph({
    children: runs,
    spacing: { after: opts.after ?? 160, before: opts.before ?? 0 },
    alignment: opts.alignment,
    heading: opts.heading,
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 140 },
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function spacer() {
  return para('', { after: 80 });
}

function metaTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([field, value], i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            shading: { fill: i === 0 ? 'D9E2F3' : 'F2F6FA' },
            children: [
              para([run(field, { bold: true, size: 20, color: ACCENT })], { after: 60 }),
            ],
          }),
          new TableCell({
            width: { size: 72, type: WidthType.PERCENTAGE },
            children: [para(value, { size: 20, after: 60 })],
          }),
        ],
      }),
    ),
  });
}

function statusTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map((h) =>
          new TableCell({
            shading: { fill: 'D9E2F3' },
            children: [para([run(h, { bold: true, size: 20, color: ACCENT })], { after: 60 })],
          }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({
                children: [para(cell, { size: 20, after: 60 })],
              }),
            ),
          }),
      ),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Title',
        name: 'Title',
        basedOn: 'Normal',
        run: { size: 52, bold: true, color: ACCENT, font: FONT },
        paragraph: { spacing: { after: 120 }, alignment: AlignmentType.CENTER },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, color: ACCENT, font: FONT },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 26, bold: true, color: '2F5496', font: FONT },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                run('DRALO Academy — Confidential internal status report · ', { size: 18, color: MUTED }),
                run('Page ', { size: 18, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [
        para([run('DRALO', { bold: true, size: 56, color: ACCENT })], {
          alignment: AlignmentType.CENTER,
          after: 80,
        }),
        para([run('Writing Engine & RUOE Generation', { bold: true, size: 40, color: ACCENT })], {
          alignment: AlignmentType.CENTER,
          after: 80,
        }),
        para(
          [
            run('Consolidated status report — correction motor, exam content pipeline and quality systems', {
              italics: true,
              size: 24,
              color: MUTED,
            }),
          ],
          { alignment: AlignmentType.CENTER, after: 120 },
        ),
        para([run('Version 1.0 · 1 September 2026', { size: 22, color: MUTED })], {
          alignment: AlignmentType.CENTER,
          after: 240,
        }),
        para(
          [
            run('Status: ', { bold: true }),
            run('Vigente — reflects repository and production database state as of September 2026. ', {}),
            run('For internal planning and handover; not a student-facing document.', { italics: true }),
          ],
          { after: 200 },
        ),

        heading('Document metadata'),
        metaTable([
          ['Document ID', '08'],
          ['Document name', 'DRALO — Writing Engine & RUOE Status Report'],
          ['Version', '1.0'],
          ['Last updated', '2026-09-01'],
          ['Scope', 'Writing correction motor (v3) and B2 Reading & Use of English generation pipeline'],
          ['Related documents', '01–07 Writing Engine package; DRALO RUOE Pilot Generation Pack v1.1; RUOE System Quality Upgrade v1.0'],
          ['Audience', 'Product owner, pedagogy lead, engineering'],
        ]),
        spacer(),

        heading('Executive summary'),
        para(
          'Dralo now has two major AI content systems operating in parallel. The Writing Engine v3 is a multi-phase Cambridge-aligned correction motor that produces structured feedback for B2 First writing tasks. The RUOE pipeline generates and validates Reading & Use of English exam parts for twenty full B2 exam slots, using a pilot-derived “double engine” design for content briefs and Part 4 transformation blueprints, plus a separate quality layer of blind-solve and adversarial validators.',
        ),
        para(
          'At the content level, the B2 catalogue is substantially complete: all twenty exam slots contain RUOE parts 1–7 and Writing parts 8–9 (180 parts verified in the database). The Writing motor is wired to B2 exam and practice surfaces for eligible subscribers. Remaining work is concentrated in calibration, persistence sign-off, prompt synchronisation to production, a human review queue for flagged parts, and the deferred Listening & Speaking catalogue.',
        ),

        heading('Part A — Writing correction motor'),
        heading('A.1 What was built', HeadingLevel.HEADING_2),
        para(
          'The Writing Engine v3 replaces the legacy markdown essay feedback path for B2 when enabled. It implements the architecture defined in Documents 01–04 and the technical handoff in Document 05. The pipeline runs in strict order:',
        ),
        bullet('Task Analysis — interprets what the task requires (Document 01); never scores.'),
        bullet('Observation extraction — Teacher DNA observations on the candidate script (Document 02).'),
        bullet('Cambridge assessment — four criteria scored 0–5 each (Document 03).'),
        bullet('Deterministic validation — hard and retryable checks before any learner output.'),
        bullet('Feedback composition — criterion cards, annotations and Interactive Writing Map payload (Document 04).'),
        bullet('Persistence — append-only execution records when database tables are available.'),
        para('Primary code location: src/features/writing/. Orchestration entry: evaluate-writing-v3.server.ts.'),

        heading('A.2 How it reaches students today', HeadingLevel.HEADING_2),
        statusTable(
          ['Surface', 'Engine path', 'UI', 'Eligibility'],
          [
            ['B2 exam / practice writing', 'v3 primary; legacy fallback on failure', 'WritingFeedbackPage + Interactive Writing Map', 'B2 + Plus/Premium (writingAdvanced)'],
            ['/api/writing/evaluate', 'v3 dedicated endpoint', 'Client-dependent', 'Authenticated'],
            ['/api/dralo-ai (exam_writing_correction)', 'Same handler as above', 'Via B2WritingLongFormAiPanel', 'Plan-gated'],
            ['Dralo sandbox (LevelsWritingCorrectionPanel)', 'API may return v3', 'Still expects legacy markdown', 'Staff / internal'],
            ['Placement writing', 'Legacy Chat Completions only', 'Markdown', 'Placement flow'],
          ],
        ),
        spacer(),
        para(
          'Default model for v3: gpt-4o-2024-08-06 (override via DRALO_WRITING_ENGINE_MODEL). Feature flag DRALO_WRITING_ENGINE_V3_ENABLED is on by default. Legacy path uses cambridgeEssayFeedback.js and remains the automatic fallback if v3 validation or persistence fails.',
        ),

        heading('A.3 Architecture diagram (logical)', HeadingLevel.HEADING_2),
        para(
          'Student submission → Task Analysis (cached per task fingerprint) → Observations → Assessment (4×0–5) → Validators → Feedback payload → UI render. Re-evaluation creates a new execution row; prior runs are never overwritten.',
          { italics: true, color: MUTED },
        ),

        heading('A.4 Completed vs open (Writing)', HeadingLevel.HEADING_2),
        statusTable(
          ['Area', 'Status', 'Notes'],
          [
            ['Pipeline phases 1–7 (logic)', 'Complete', 'Contracts, prompts, services, repository port'],
            ['Phase 8 UI components', 'Complete', 'WritingMapCanvas, criterion cards, v3 page shell'],
            ['B2 production wiring', 'Complete', 'B2WritingLongFormAiPanel renders v3 when payload present'],
            ['Test suite', 'Complete', 'npm run test:writing-engine (13 test files)'],
            ['E2E script', 'Complete', 'scripts/run-writing-v3-e2e.mjs'],
            ['Scoring calibration (R3)', 'Open', 'Golden cases G-01–G-12 not validated on live model'],
            ['Persistence verification (R5)', 'Open', 'Schema exists; prod must confirm tables applied'],
            ['Dralo sandbox UI parity', 'Open', 'Sandbox panel does not render v3 feedback_payload'],
            ['UX accessibility review (R6)', 'Open', 'Screenshot workflow exists; formal review pending'],
          ],
        ),
        spacer(),

        heading('Part B — RUOE generation (“double engine”)'),
        heading('B.1 What “double engine” means', HeadingLevel.HEADING_2),
        para(
          'The term refers to the authorised pilot generation design in DRALO RUOE Cursor Pilot Generation Pack v1.1, not to two unrelated production codebases. The two authorised phases must not be merged into a single autonomous engine without explicit approval.',
        ),
        statusTable(
          ['Phase', 'Engine name', 'Input', 'Parts covered'],
          [
            ['Phase A', 'Content Brief (CB)', 'Approved Content Brief + Style Card', '1, 2, 3, 5, 6, 7'],
            ['Phase B', 'Transformation Blueprint (TBP)', 'Approved Transformation Blueprint only', '4 (Key Word Transformations)'],
          ],
        ),
        spacer(),
        para(
          'At application runtime, generation is unified through levelsCambridgeExamGenerator.js. Part 4 retains additional blueprint quality logic in ruoePart4Quality.js. A secondary “dual” quality layer uses a generation model (OPENAI_MODEL_CAMBRIDGE) and optionally a separate validator model (DRALO_OPENAI_MODEL_VALIDATOR) for blind-solve and adversarial review.',
        ),

        heading('B.2 Generation pipeline (runtime)', HeadingLevel.HEADING_2),
        bullet('Prompt assembly — draloAiExamPrompts.js + optional Supabase overrides (levels_exam_part_prompt_overrides).'),
        bullet('AI completion — draloAiEngine.js → cambridgeExamGenerationCompletion (Chat Completions or Assistant if configured).'),
        bullet('Mechanical validation — examPartValidation.js (strict per-part rules).'),
        bullet('Editorial / heuristic quality — b2RuoeExamQuality.js, ruoeEditorialQuality.js, part-specific modules.'),
        bullet('AI quality — Part 1–2 blind solve; Parts 3, 5, 6, 7 adversarial review (ruoeAiAdversarialQuality.js).'),
        bullet('Review gate — needsReview findings; save blocked unless override or within soft ceiling (default max 4 findings).'),
        bullet('Persist — saveLevelExamPartFromPreview into levels_examenes / questions / answers.'),

        heading('B.3 B2 exam catalogue status', HeadingLevel.HEADING_2),
        statusTable(
          ['Exam slots', 'Origin', 'RUOE 1–7', 'Writing 8–9', 'Notes'],
          [
            ['1–4', 'Pilots E01–E04 (imported JSON)', 'Complete', 'Complete', 'Production-protected; teacher-patched variants'],
            ['5–20', 'AI pipeline + topic bank', 'Complete', 'Complete', 'Generated via b2-build-exam / b2-build-range scripts'],
            ['All 20', '—', '7/7 each', '2/2 each', '180/180 parts verified in connected Supabase'],
          ],
        ),
        spacer(),
        para('Listening and Speaking parts for exams 1–20 are explicitly deferred and not part of this catalogue completion.'),

        heading('B.4 Pilot mapping (slots 1–4)', HeadingLevel.HEADING_2),
        statusTable(
          ['Pilot', 'Slot', 'RUOE source version', 'Notes'],
          [
            ['E01', '1', 'Teacher patch v1.1.3', 'Regenerated with teacher feedback incorporated'],
            ['E02', '2', 'v1.1.3 (Part 1 from v1.1.2)', 'Part 1 kept from earlier pass after validator failure'],
            ['E03', '3', 'Pilot v1.0', 'Generated under PENDING_HUMAN_REVIEW before import'],
            ['E04', '4', 'Pilot v1.0', 'Generated under PENDING_HUMAN_REVIEW before import'],
          ],
        ),
        spacer(),

        heading('B.5 Quality system (v1.1.1)', HeadingLevel.HEADING_2),
        para('Severity model:'),
        bullet('HARD_FAIL — blocks validation.ok; part cannot save without fix.'),
        bullet('QUALITY_FAIL — surfaces in needsReview; may save with override within review ceiling.'),
        para('Per-part coverage: strict mechanical validators for all seven parts; adversarial AI for 3, 5, 6, 7; blind solve for 1–2; Part 4 blueprint engine and marking-point repair without adversarial pass in preview.'),
        para(
          'Approximately twenty-two parts (concentrated in Parts 4 and 6) remain in the human review queue from generation runs. These were flagged, not regenerated, pending editorial sign-off.',
        ),

        heading('B.6 Infrastructure fixes completed (recent engineering)', HeadingLevel.HEADING_2),
        bullet('max_tokens compatibility fixed for GPT-5 family models in draloAiEngine.'),
        bullet('Generation model configured via OPENAI_MODEL_CAMBRIDGE (gpt-5.4 in recent build sessions).'),
        bullet('Adversarial reviewer corrected for Parts 5, 6 and 7 (was marking valid distractors as defects).'),
        bullet('Part 2 prompt: prohibited specific relative-clause ambiguity patterns.'),
        bullet('Exam slot capacity raised from 6 to 20 in UI, picker grid and catalog constants.'),
        bullet('Pilot import script (b2-import-ruoe-pilots.mjs) loads E01–E04 into slots 1–4 without OpenAI.'),

        heading('B.7 Completed vs open (RUOE)', HeadingLevel.HEADING_2),
        statusTable(
          ['Area', 'Status', 'Notes'],
          [
            ['20-slot RUOE + Writing content in DB', 'Complete', 'All slots populated'],
            ['v1.1.1 validators and prompts in code', 'Complete', 'Test scripts per part'],
            ['Supabase prompt overrides sync', 'Open', 'Production overrides may lag code v1.1.1'],
            ['Human review queue (~22 parts)', 'Open', 'Mainly Parts 4 and 6'],
            ['Listening & Speaking (exams 1–20)', 'Deferred', 'Not started'],
            ['B2 Scoring V2 feature flag', 'Local/dev only', 'NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED'],
          ],
        ),
        spacer(),

        heading('Part C — How Writing and RUOE fit together'),
        para(
          'A student practising B2 exam mode selects one of twenty exam slots. Parts 1–7 present RUOE content generated and validated through the pipeline above. Parts 8–9 present Writing tasks. When the student submits writing, the correction motor evaluates against Cambridge criteria and returns structured feedback if plan entitlements allow.',
        ),
        para(
          'The two systems share the broader DRALO AI stack (OpenAI, usage logging, admin generation tools) but maintain separate contracts: RUOE output is JSON exam content with validators; Writing output is assessment and pedagogy payloads governed by Documents 01–04.',
        ),

        heading('Part D — Recommended priorities'),
        heading('D.1 Writing (next 30 days)', HeadingLevel.HEADING_2),
        bullet('Confirm writing_engine_* tables on production Supabase (R5 persistence gate).'),
        bullet('Run calibration harness against live model (G-01–G-12).'),
        bullet('Wire v3 feedback UI into Dralo sandbox / staff correction panel.'),
        bullet('Close UX review for Interactive Writing Map accessibility.'),

        heading('D.2 RUOE (next 30 days)', HeadingLevel.HEADING_2),
        bullet('Sync v1.1.1 prompt overrides to production Supabase (dry-run first).'),
        bullet('Clear human review queue for flagged Parts 4 and 6.'),
        bullet('Spot-check slots 5–20 in exam mode and skill practice after prompt sync.'),
        bullet('Plan Listening & Speaking generation as a separate phase (not blocking RUOE/Writing).'),

        heading('Part E — Glossary'),
        statusTable(
          ['Term', 'Meaning'],
          [
            ['RUOE', 'Reading and Use of English — Cambridge B2 First parts 1–7 in Dralo'],
            ['CB', 'Content Brief — Phase A pilot input for parts 1–3 and 5–7'],
            ['TBP', 'Transformation Blueprint — Phase B pilot input for Part 4 only'],
            ['needsReview', 'Quality findings attached at preview; may block save'],
            ['feedback_payload', 'v3 structured learner feedback object for UI rendering'],
            ['Pilot E01–E04', 'First four authorised RUOE pilot exams imported to slots 1–4'],
          ],
        ),
        spacer(),
        para(
          [
            run('End of document. ', { italics: true, color: MUTED }),
            run(
              'For technical detail see src/features/writing/README.md, DOCUMENTOS DE CORRECION/07_DRALO_Writing_Engine_Implementation_Plan_v1.0.md, and DRALO_RUOE_System_Quality_Upgrade_v1_0/IMPLEMENTATION_REPORT.md.',
              { italics: true, color: MUTED },
            ),
          ],
          { after: 240 },
        ),
      ],
    },
  ],
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buffer);
console.log(`Written: ${OUT_FILE}`);
