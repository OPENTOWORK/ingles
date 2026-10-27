function normalizeSpeechText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\[inaudible\]|\[unclear\]|\[noise\]/g, ' ')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenOverlap(left, right) {
  const a = new Set(normalizeSpeechText(left).split(' ').filter(Boolean));
  const b = new Set(normalizeSpeechText(right).split(' ').filter(Boolean));
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) {
    if (b.has(token)) shared += 1;
  }
  return shared / Math.max(a.size, b.size);
}

export function compareSpeakingB2FixtureItem({
  fixture,
  whisperTranscript = '',
  sttSource = '',
  detectedIssueCodes = [],
} = {}) {
  const expected = [...(fixture?.expectedIssueCodes || [])];
  const detected = [...detectedIssueCodes];
  const missed = expected.filter((code) => !detected.includes(code));
  const falsePositives = detected.filter((code) => !expected.includes(code));
  const overlap = tokenOverlap(fixture?.referenceTranscript, whisperTranscript);
  const mockStt = sttSource === 'MOCK';

  return {
    fixtureId: fixture?.id,
    questionId: fixture?.questionId,
    question: fixture?.question,
    authenticity: fixture?.authenticity,
    referenceTranscript: fixture?.referenceTranscript || '',
    whisperTranscript: String(whisperTranscript || ''),
    sttSource: sttSource || null,
    sttExecuted: Boolean(sttSource) && !mockStt,
    transcriptOverlap: Number(overlap.toFixed(3)),
    expectedIssueCodes: expected,
    detectedIssueCodes: detected,
    missed,
    falsePositives,
    expectUncertain: Boolean(fixture?.expectUncertain),
  };
}

export function compareSpeakingB2FixtureRun({ packId, items = [], report = null } = {}) {
  const scores = report?.scores || {};
  return {
    packId,
    authenticity: 'synthetic-technical',
    officialCambridge: false,
    items,
    missed: items.flatMap((item) => item.missed.map((code) => ({ fixtureId: item.fixtureId, code }))),
    falsePositives: items.flatMap((item) =>
      item.falsePositives.map((code) => ({ fixtureId: item.fixtureId, code })),
    ),
    scores: {
      grammarVocabulary: scores.grammarVocabulary ?? null,
      discourseManagement: scores.discourseManagement ?? null,
      pronunciation: scores.pronunciation ?? null,
      interactiveCommunication: scores.interactiveCommunication ?? null,
      globalAchievement: scores.globalAchievement ?? null,
    },
    feedback: {
      summaryEs: report?.summaryEs || '',
      issueCount: report?.issues?.length || 0,
      recommendationCount: report?.recommendations?.length || 0,
      disclaimer: report?.disclaimer || '',
    },
  };
}

export function renderSpeakingB2FixtureReportMarkdown(result) {
  const lines = [
    '# Speaking Motor V1.4 — informe de fixtures',
    '',
    'Los audios de esta pasada son sintéticos y técnicos. No son grabaciones auténticas de alumnos.',
    '',
    `Pack: ${result.packId || 'n/a'}`,
    '',
    '## Transcripción',
    '',
  ];
  for (const item of result.items || []) {
    lines.push(`### ${item.fixtureId}`);
    lines.push(`- Pregunta: ${item.question}`);
    lines.push(`- Referencia: ${item.referenceTranscript || '(vacío)'}`);
    lines.push(`- Whisper: ${item.whisperTranscript || '(vacío)'}`);
    lines.push(`- Fuente STT: ${item.sttSource || 'n/a'} (${item.sttExecuted ? 'ejecutado' : 'no es Whisper real'})`);
    lines.push(`- Solapamiento: ${item.transcriptOverlap}`);
    lines.push(`- Errores esperados: ${item.expectedIssueCodes.join(', ') || 'ninguno'}`);
    lines.push(`- Errores detectados: ${item.detectedIssueCodes.join(', ') || 'ninguno'}`);
    lines.push(`- No detectados: ${item.missed.join(', ') || 'ninguno'}`);
    lines.push(`- Falsos positivos: ${item.falsePositives.join(', ') || 'ninguno'}`);
    lines.push('');
  }
  lines.push('## Evaluación');
  lines.push('');
  lines.push(`- Grammar and Vocabulary: ${result.scores.grammarVocabulary ?? 'null'}`);
  lines.push(`- Discourse Management: ${result.scores.discourseManagement ?? 'null'}`);
  lines.push(`- Pronunciation: ${result.scores.pronunciation ?? 'null'}`);
  lines.push(`- Interactive Communication: ${result.scores.interactiveCommunication ?? 'null'}`);
  lines.push(`- Global Achievement: ${result.scores.globalAchievement ?? 'null'}`);
  lines.push('');
  lines.push('## Feedback');
  lines.push('');
  lines.push(result.feedback.summaryEs || 'Sin resumen.');
  lines.push('');
  lines.push(result.feedback.disclaimer || '');
  lines.push('');
  return lines.join('\n');
}
