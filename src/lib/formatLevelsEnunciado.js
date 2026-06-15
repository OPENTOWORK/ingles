import { asGeneratedArray, getA2PartDef } from '@/lib/draloAiA2ExamPrompts';
import { getA2OfficialDirections } from '@/data/a2-key-official-spec';

/**
 * Convierte JSON generado por DRALO AI al formato de levels_preguntas.enunciado (como B2 Levels).
 */

function pushBlock(lines, items) {
  for (const item of items || []) {
    if (!item) continue;
    lines.push(String(item));
  }
}

function parsePoolOptionLetterText(opt) {
  if (typeof opt === 'string') {
    const m = opt.match(/^([A-H])\)\s*(.*)$/i) || opt.match(/^([A-H])\s+(.*)$/i);
    if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  }
  if (opt && typeof opt === 'object') {
    const letter = String(opt.letter || opt.id || '')
      .replace(/[^A-H]/gi, '')
      .charAt(0)
      .toUpperCase();
    const text = String(opt.text || opt.label || '').trim();
    if (letter) return { letter, text: text || letter };
  }
  return null;
}

export function buildEnunciadoFromGenerated(gen = {}) {
  const g = {
    ...gen,
    questions: asGeneratedArray(gen.questions),
    profiles: asGeneratedArray(gen.profiles),
    sections: asGeneratedArray(gen.sections),
    notices: asGeneratedArray(gen.notices),
    optionPool: asGeneratedArray(gen.optionPool),
    matchingAnswers: asGeneratedArray(gen.matchingAnswers),
    speakingPrompts: asGeneratedArray(gen.speakingPrompts),
    bulletPoints: asGeneratedArray(gen.bulletPoints),
    phases: asGeneratedArray(gen.phases),
    picturePrompts: asGeneratedArray(gen.picturePrompts),
  };
  const lines = [];
  const partDef = g.partNumber != null ? getA2PartDef(g.partNumber) : null;
  const directions =
    g.directions ||
    (partDef ? getA2OfficialDirections(partDef) : '') ||
    g.partTitle ||
    '';
  if (directions) {
    pushBlock(lines, directions.split('\n'));
    lines.push('');
  }

  if (g.example) {
    lines.push('Example:');
    const ex = g.example;
    if (ex.label) lines.push(ex.label);
    else if (ex.number != null) lines.push(`(${ex.number})`);
    if (ex.message) lines.push(ex.message);
    if (ex.prompt) lines.push(ex.prompt);
    if (Array.isArray(ex.options)) {
      for (const o of ex.options) lines.push(typeof o === 'string' ? o : `${o.letter || ''}) ${o.text || ''}`.trim());
    }
    lines.push(`Answer: ${ex.answer ?? ''}`);
    if (ex.explanation) lines.push(ex.explanation);
    lines.push('');
  }

  lines.push('Text');

  if (g.passageTitle) lines.push(g.passageTitle);
  if (g.passage) pushBlock(lines, String(g.passage).split('\n'));
  if (g.script) pushBlock(lines, String(g.script).split('\n'));
  if (g.setting) lines.push(g.setting);

  if (g.matchingIntro) {
    lines.push('');
    pushBlock(lines, String(g.matchingIntro).split('\n'));
  }

  const profileList = [...g.profiles, ...g.sections];
  if (profileList.length) {
    for (const sec of profileList) {
      const letter = sec.letter || sec.id || '';
      const name = sec.name || sec.title || '';
      const text = sec.text || sec.body || '';
      lines.push(`${letter}) ${name}`.trim());
      if (text) pushBlock(lines, String(text).split('\n'));
      lines.push('');
    }
  }

  if (g.notices.length) {
    for (const opt of g.notices) {
      const letter = opt.letter || opt.id || '';
      lines.push(`${letter}) ${opt.text || opt.label || ''}`.trim());
    }
    lines.push('');
  } else if (g.optionPool.length) {
    for (const opt of g.optionPool) {
      const letter = opt.letter || opt.id || '';
      lines.push(`${letter}) ${opt.text || opt.label || ''}`.trim());
    }
    lines.push('');
  }

  const situations = asGeneratedArray(gen.situations);
  if (situations.length) {
    lines.push('Questions');
    for (const sit of situations) {
      lines.push('');
      lines.push(String(sit.number ?? ''));
      if (sit.prompt) lines.push(sit.prompt);
    }
    lines.push('');
  }

  if (g.taskTitle) lines.push(g.taskTitle);
  if (g.storyPrompt) pushBlock(lines, String(g.storyPrompt).split('\n'));
  if (g.picturePrompts.length) {
    for (const pic of g.picturePrompts) {
      const label =
        typeof pic === 'string' ? 'Picture' : pic.label || pic.title || 'Picture';
      const scene = typeof pic === 'string' ? pic : pic.scene || pic.description || '';
      lines.push(label);
      if (scene) lines.push(scene);
      const url = typeof pic === 'object' ? pic.imageUrl : '';
      if (url) lines.push(`IMAGE: ${url}`);
      lines.push('');
    }
  }
  if (g.formTitle) lines.push(g.formTitle);
  if (g.instructions) pushBlock(lines, String(g.instructions).split('\n'));
  if (g.bulletPoints.length) {
    for (const b of g.bulletPoints) lines.push(`• ${b}`);
  }
  if (g.inputNotes) lines.push(g.inputNotes);
  if (g.wordMin != null && g.wordMax != null) {
    lines.push(`Write ${g.wordMin}–${g.wordMax} words.`);
  }

  const questions = g.questions;
  const hasSituationsBlock = situations.length > 0;
  if (questions.length && !hasSituationsBlock) {
    lines.push('');
    lines.push('Questions');
  }

  const partNum = g.partNumber != null ? Number(g.partNumber) : null;
  questions.forEach((q, idx) => {
    const num =
      q.number != null && q.number !== ''
        ? Number(q.number)
        : partNum === 1
          ? idx + 1
          : idx + 1;
    lines.push('');
    lines.push(String(num));
    if (q.stimulusType) lines.push(`STIMULUS: ${q.stimulusType}`);
    if (q.imageUrl) lines.push(`IMAGE: ${q.imageUrl}`);
    if (q.message) pushBlock(lines, String(q.message).split('\n'));
    if (q.prompt) lines.push(q.prompt);
    if (q.stem) lines.push(q.stem);
    if (q.sentence2Start) lines.push(q.sentence2Start);
    if (q.keyword) lines.push(`(${q.keyword})`);
    const imageOpts = asGeneratedArray(q.imageOptions);
    if (imageOpts.length) {
      for (const opt of imageOpts) {
        const letter = String(opt.letter || opt.id || '').toUpperCase();
        if (opt.imageUrl) lines.push(`${letter}) IMAGE: ${opt.imageUrl}`);
        else if (opt.scene) lines.push(`${letter}) ${opt.scene}`);
      }
    }
    for (const opt of asGeneratedArray(q.options)) {
      const line =
        typeof opt === 'string' ? opt : `${opt.letter || ''}) ${opt.text || ''}`.trim();
      if (line && !/^IMAGE:/i.test(line)) lines.push(line);
    }
  });

  const phases = g.phases;
  if (phases.length) {
    lines.push('');
    lines.push('Speaking script');
    for (const phase of phases) {
      if (phase.title) lines.push(phase.title);
      if (phase.intro) lines.push(phase.intro);
      for (const line of asGeneratedArray(phase.interlocutorLines)) lines.push(line);
      for (const p of asGeneratedArray(phase.prompts)) {
        if (p.to) lines.push(`To Candidate ${p.to}:`);
        if (p.main) lines.push(p.main);
        for (const b of asGeneratedArray(p.backup)) lines.push(`Back-up: ${b}`);
      }
      if (phase.extended) {
        lines.push(`Extended (${phase.extended.to || 'candidate'}):`);
        lines.push(phase.extended.main || '');
        for (const b of asGeneratedArray(phase.extended.backup)) lines.push(`Back-up: ${b}`);
      }
      lines.push('');
    }
  }

  if (g.speakingPrompts.length) {
    g.speakingPrompts.forEach((p, i) => {
      lines.push('');
      lines.push(String(i + 1));
      lines.push(p);
    });
  }

  return lines.join('\n').trim();
}

/**
 * @returns {{ mcq: Array<{questionNumber: number, letter: string, text: string, correcta: boolean}>, open: Array<{questionNumber: number, text: string}> }}
 */
export function buildAnswerRowsFromGenerated(gen = {}) {
  const mcq = [];
  const open = [];
  const answerById = {};
  const questions = asGeneratedArray(gen.questions);
  const modelAnswers = asGeneratedArray(gen.modelAnswers);
  for (const ma of modelAnswers) {
    if (ma?.id) answerById[ma.id] = ma.answer;
  }

  if (gen.example && asGeneratedArray(gen.example.options).length >= 2) {
    const ex = gen.example;
    const correctLetter = String(ex.answer || '').match(/^[A-D]/i)?.[0]?.toUpperCase() || '';
    for (const opt of asGeneratedArray(ex.options)) {
      let letter = '';
      let text = '';
      if (typeof opt === 'string') {
        const m = opt.match(/^([A-D])\)\s*(.*)$/i) || opt.match(/^([A-D])\s+(.*)$/i);
        if (m) {
          letter = m[1].toUpperCase();
          text = m[2].trim();
        }
      } else if (opt && typeof opt === 'object') {
        letter = String(opt.letter || opt.id || '')
          .replace(/[^A-D]/gi, '')
          .charAt(0)
          .toUpperCase();
        text = String(opt.text || opt.label || opt.option || '').trim();
      }
      if (!letter) continue;
      mcq.push({
        questionNumber: 0,
        letter,
        text: text || letter,
        correcta: letter === correctLetter,
      });
    }
  }

  const pool = [...asGeneratedArray(gen.optionPool), ...asGeneratedArray(gen.notices)];
  const sentencePool = asGeneratedArray(gen.sentencePool);
  const sections = asGeneratedArray(gen.sections);
  const matchingRows = asGeneratedArray(gen.matchingAnswers);

  /** Gapped text (Reading Part 6): shared A–G pool, letter-only answers in DB. */
  if (sentencePool.length >= 7 && questions.length >= 4) {
    const poolTexts = {};
    sentencePool.forEach((item, i) => {
      const raw = typeof item === 'string' ? item : item?.text || item?.sentence || '';
      const m = String(raw).match(/^([A-G])\)\s*(.*)$/i) || String(raw).match(/^([A-G])\s+(.*)$/i);
      if (m) poolTexts[m[1].toUpperCase()] = m[2].trim();
      else poolTexts['ABCDEFG'[i] || 'A'] = String(raw).trim();
    });
    for (const q of questions) {
      const num = Number(q.number ?? 0);
      if (!Number.isFinite(num)) continue;
      const correctRaw =
        answerById[q.id] ??
        modelAnswers.find((m) => m.id === q.id || Number(String(m.id || '').replace(/\D/g, '')) === num)
          ?.answer ??
        '';
      const correctLetter = String(correctRaw).match(/^[A-G]/i)?.[0]?.toUpperCase() || '';
      for (const L of 'ABCDEFG') {
        mcq.push({
          questionNumber: num,
          letter: L,
          text: poolTexts[L] || L,
          correcta: L === correctLetter,
        });
      }
    }
    return { mcq, open };
  }

  /** Reading Part 7: match statements to people A–D (letter-only in DB). */
  if (sections.length >= 4 && questions.length >= 4) {
    const people = {};
    for (const sec of sections) {
      const L = String(sec.letter || sec.id || '')
        .replace(/[^A-D]/gi, '')
        .charAt(0)
        .toUpperCase();
      if (L) people[L] = String(sec.name || sec.title || L).trim();
    }
    const hasPerQuestionOptions = questions.some((q) => asGeneratedArray(q.options).length > 0);
    if (!hasPerQuestionOptions) {
      for (const q of questions) {
        const num = Number(q.number ?? 0);
        if (!Number.isFinite(num)) continue;
        const correctRaw =
          answerById[q.id] ??
          modelAnswers.find((m) => m.id === q.id || Number(String(m.id || '').replace(/\D/g, '')) === num)
            ?.answer ??
          '';
        const correctLetter = String(correctRaw).match(/^[A-D]/i)?.[0]?.toUpperCase() || '';
        for (const L of 'ABCD') {
          mcq.push({
            questionNumber: num,
            letter: L,
            text: people[L] || L,
            correcta: L === correctLetter,
          });
        }
      }
      return { mcq, open };
    }
  }

  /** Listening multiple matching: shared A–H pool. */
  if (matchingRows.length && pool.length) {
    for (const row of matchingRows) {
      const num = Number(row.number ?? row.questionNumber);
      const letter = String(row.answer || row.letter || '')
        .replace(/[^A-H]/gi, '')
        .charAt(0)
        .toUpperCase();
      if (!Number.isFinite(num) || !letter) continue;
      for (const opt of pool) {
        const parsed = parsePoolOptionLetterText(opt);
        const L = parsed?.letter || '';
        if (!L) continue;
        const text = parsed?.text || L;
        mcq.push({
          questionNumber: num,
          letter: L,
          text,
          correcta: L === letter,
        });
      }
    }
    return { mcq, open };
  }

  questions.forEach((q, idx) => {
    const num = Number(q.number ?? idx + 1);
    if (!Number.isFinite(num)) return;

    if (q.type === 'short' || q.type === 'word-formation' || q.type === 'transformation' || q.type === 'open') {
      const perQuestionAnswers = asGeneratedArray(q.modelAnswers);
      const sharedAnswer = modelAnswers.find(
        (m) =>
          m.id === q.id ||
          Number(String(m.id || '').replace(/\D/g, '')) === num ||
          Number(m.number) === num,
      )?.answer;
      const perQuestionRaw = perQuestionAnswers.length
        ? typeof perQuestionAnswers[0] === 'object' && perQuestionAnswers[0]?.answer != null
          ? perQuestionAnswers[0].answer
          : perQuestionAnswers[0]
        : null;
      const ans = String(
        answerById[q.id] ?? q.answer ?? perQuestionRaw ?? sharedAnswer ?? '',
      ).trim();
      open.push({ questionNumber: num, text: ans });
      return;
    }

    const correctRaw =
      answerById[q.id] ??
      answerById[`q${num}`] ??
      q.answer ??
      modelAnswers.find((m) => Number(String(m.id || '').replace(/\D/g, '')) === num)?.answer ??
      '';
    const correctLetter = String(correctRaw).match(/^[A-H]/i)?.[0]?.toUpperCase() || '';

    const imageOpts = asGeneratedArray(q.imageOptions);
    if (imageOpts.length && correctLetter) {
      for (const opt of imageOpts) {
        const letter = String(opt.letter || opt.id || '')
          .replace(/[^A-H]/gi, '')
          .charAt(0)
          .toUpperCase();
        if (!letter) continue;
        mcq.push({
          questionNumber: num,
          letter,
          text: opt.scene || opt.description || letter,
          correcta: letter === correctLetter,
        });
      }
      return;
    }

    for (const opt of asGeneratedArray(q.options)) {
      let letter = '';
      let text = '';
      if (typeof opt === 'string') {
        const m = opt.match(/^([A-H])\)\s*(.*)$/i);
        if (m) {
          letter = m[1].toUpperCase();
          text = m[2].trim();
        }
      } else if (opt && typeof opt === 'object') {
        letter = String(opt.letter || opt.id || '')
          .replace(/[^A-H]/gi, '')
          .charAt(0)
          .toUpperCase();
        text = String(opt.text || opt.label || opt.option || '').trim();
      }
      if (!letter) continue;
      mcq.push({
        questionNumber: num,
        letter,
        text: text || letter,
        correcta: letter === correctLetter,
      });
    }

    if (correctLetter) {
      const letters = ['A', 'B', 'C'];
      const present = new Set(mcq.filter((r) => r.questionNumber === num).map((r) => r.letter));
      if (present.size > 0 && present.size < 3) {
        for (const L of letters) {
          if (!present.has(L)) {
            mcq.push({
              questionNumber: num,
              letter: L,
              text: L,
              correcta: L === correctLetter,
            });
          }
        }
      }
    }
  });

  if (!open.length && modelAnswers.length) {
    for (const ma of modelAnswers) {
      const m = String(ma.id || '').match(/^q?(\d+)$/i);
      if (!m) continue;
      const num = Number(m[1]);
      if (!Number.isFinite(num)) continue;
      const ans = String(ma.answer || '').trim();
      if (!ans) continue;
      if (/^[A-H]$/i.test(ans)) continue;
      if (open.some((o) => o.questionNumber === num)) continue;
      open.push({ questionNumber: num, text: ans });
    }
  }

  return { mcq, open };
}

/** Formato levels_respuestas: "1 A) text" o "21 B" */
export function formatMcqRespuestaRow({ questionNumber, letter, text }) {
  const t = String(text || '').trim();
  if (t && !/^\d+\s+[A-H]\)/i.test(t)) {
    return `${questionNumber} ${letter}) ${t}`;
  }
  if (t) return `${questionNumber} ${t}`;
  return `${questionNumber} ${letter}`;
}

export function formatOpenRespuestaRow({ questionNumber, text }) {
  return `${questionNumber} ${String(text || '').trim()}`;
}
