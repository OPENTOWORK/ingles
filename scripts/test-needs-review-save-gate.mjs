/**
 * Test (sin IA, sin DB) del bloqueo de guardado cuando el preview marcó
 * __needsReview (posible segunda respuesta defendible).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-needs-review-save-gate.mjs
 */
const { saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js');

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

const flagged = {
  title: 'X',
  passage: 'irrelevant',
  questions: [],
  modelAnswers: [],
  __needsReview: {
    status: 'ambiguity_warning',
    findings: [
      {
        itemNumber: 8,
        type: 'ambiguity_warning',
        detail: 'Solver considers more than one answer defensible (take/assume responsibility).',
      },
    ],
    detectedAt: new Date().toISOString(),
  },
};

// 1. Sin override: debe bloquear ANTES de tocar la base de datos (adminDb = null).
try {
  await saveLevelExamPartFromPreview(null, {
    levelSlug: 'b2',
    levelId: 'fake',
    examSlot: 5,
    partNumber: 1,
    generated: structuredClone(flagged),
  });
  check('save without override is blocked', false, 'no error thrown');
} catch (e) {
  check(
    'save without override is blocked',
    /Save blocked/.test(e?.message || '') && /defensible answer/.test(e?.message || ''),
    e?.message,
  );
  check('blocked message names the item (Q8)', /Q8/.test(e?.message || ''), e?.message);
}

// 2. Con override explícito: pasa la puerta de ambigüedad y llega a la validación
//    mecánica (que falla con este payload incompleto → "Validation failed", no "Save blocked").
try {
  await saveLevelExamPartFromPreview(null, {
    levelSlug: 'b2',
    levelId: 'fake',
    examSlot: 5,
    partNumber: 1,
    generated: structuredClone(flagged),
    overrideNeedsReview: true,
  });
  check('override passes the ambiguity gate', false, 'no error thrown');
} catch (e) {
  check(
    'override passes the ambiguity gate (fails later in mechanical validation)',
    /Validation failed/.test(e?.message || '') && !/Save blocked/.test(e?.message || ''),
    e?.message,
  );
}

// 3. Sin marca __needsReview: no bloquea por ambigüedad (falla por validación mecánica).
try {
  const clean = structuredClone(flagged);
  delete clean.__needsReview;
  await saveLevelExamPartFromPreview(null, {
    levelSlug: 'b2',
    levelId: 'fake',
    examSlot: 5,
    partNumber: 1,
    generated: clean,
  });
  check('clean payload not blocked by ambiguity gate', false, 'no error thrown');
} catch (e) {
  check(
    'clean payload not blocked by ambiguity gate',
    /Validation failed/.test(e?.message || '') && !/Save blocked/.test(e?.message || ''),
    e?.message,
  );
}

// 4. Part 2 (open cloze): mismatch del blind solve no aceptado como alternativa → bloqueado.
const flaggedPart2 = {
  title: 'X',
  passage: 'irrelevant',
  questions: [],
  modelAnswers: [],
  __needsReview: {
    status: 'ambiguity_warning',
    findings: [
      {
        itemNumber: 12,
        type: 'blind_solve_mismatch',
        detail: 'Blind solver chose "which" but the key says "that" (not listed as accepted alternative).',
      },
    ],
    detectedAt: new Date().toISOString(),
  },
};
try {
  await saveLevelExamPartFromPreview(null, {
    levelSlug: 'b2',
    levelId: 'fake',
    examSlot: 5,
    partNumber: 2,
    generated: structuredClone(flaggedPart2),
  });
  check('Part 2 blind-solve mismatch blocks save', false, 'no error thrown');
} catch (e) {
  check(
    'Part 2 blind-solve mismatch blocks save',
    /Save blocked/.test(e?.message || '') && /Q12/.test(e?.message || ''),
    e?.message,
  );
}

console.log(failures === 0 ? '\nAll needs-review gate tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
