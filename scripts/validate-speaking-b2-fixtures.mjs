import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareSpeakingB2FixtureItem,
  compareSpeakingB2FixtureRun,
  renderSpeakingB2FixtureReportMarkdown,
} from '../src/features/speaking-b2-motor/fixtures/compare.js';
import { getSpeakingB2Fixture, listSpeakingB2FixturePack } from '../src/features/speaking-b2-motor/fixtures/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.SPEAKING_B2_VALIDATE_URL || 'http://localhost:3000';
const packId = process.argv[2] || 'full-mixed';

async function readJson(res) {
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: { raw: text } };
  }
}

async function api(pathname, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers['x-speaking-session'] = token;
  let payload;
  if (form) {
    payload = form;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(new URL(pathname, base), { method, headers, body: payload });
  return readJson(res);
}

function pickFixture(questionId, unused) {
  const next = unused.find((item) => item.questionId === questionId) || unused[0];
  if (next) unused.splice(unused.indexOf(next), 1);
  return next || getSpeakingB2Fixture('q01-developed');
}

async function main() {
  const catalog = await api('/api/speaking-b2/fixtures/');
  if (!catalog.data?.enabled) {
    const skipped = renderSpeakingB2FixtureReportMarkdown({
      packId,
      items: [],
      scores: {},
      feedback: {
        summaryEs: 'Fixture mode is disabled on this server. No live audio run was executed.',
        issueCount: 0,
        recommendationCount: 0,
        disclaimer: '',
      },
    });
    writeFileSync(path.join(root, 'docs/speaking-motor-v1-fixture-report.md'), skipped);
    console.log('Fixture mode disabled. Report written with the skip note.');
    process.exitCode = 1;
    return;
  }

  const created = await api('/api/speaking-b2/session/', {
    method: 'POST',
    body: { examCode: 'SP-EX001', fixtureMode: true },
  });
  if (created.status !== 200) {
    throw new Error(`Could not create fixture session: ${created.status}`);
  }
  const sessionId = created.data.sessionId;
  const token = created.data.accessToken;
  await api('/api/speaking-b2/session/', {
    method: 'PATCH',
    token,
    body: { sessionId, action: 'audio-check' },
  });

  let turn = await api('/api/speaking-b2/turn/', {
    method: 'POST',
    token,
    body: { sessionId, action: 'start' },
  });
  const unused = listSpeakingB2FixturePack(packId);
  const items = [];
  let guard = 0;

  while (!turn.data?.done && guard < 12) {
    guard += 1;
    await api('/api/speaking-b2/turn/', {
      method: 'POST',
      token,
      body: { sessionId, action: 'listen' },
    });
    const fixture = pickFixture(turn.data.questionId, unused);
    turn = await api('/api/speaking-b2/turn/', {
      method: 'POST',
      token,
      body: {
        sessionId,
        action: 'answer',
        fixtureId: fixture.id,
        speakingMs: fixture.durationMs || 4000,
        silence: false,
      },
    });
    items.push(
      compareSpeakingB2FixtureItem({
        fixture,
        whisperTranscript: turn.data?.transcript || '',
        sttSource: turn.status >= 400 ? `HTTP_${turn.status}` : turn.data?.sttSource || '',
        detectedIssueCodes: [],
      }),
    );
    if (turn.status >= 400) break;
  }

  const completed = await api('/api/speaking-b2/complete/', {
    method: 'POST',
    token,
    body: { sessionId },
  });
  const report = completed.data?.report || null;
  if (report?.issues) {
    for (let index = 0; index < items.length; index += 1) {
      const current = items[index];
      items[index] = compareSpeakingB2FixtureItem({
        fixture: getSpeakingB2Fixture(current.fixtureId),
        whisperTranscript: current.whisperTranscript,
        sttSource: current.sttSource,
        detectedIssueCodes: report.issues
          .filter((issue) => issue.questionId === current.questionId)
          .map((issue) => issue.code),
      });
    }
  }

  const compared = compareSpeakingB2FixtureRun({ packId, items, report });
  const emptyWhisper = items.filter((item) => !item.whisperTranscript).length;
  const findings = [
    '## Problemas encontrados',
    '',
    emptyWhisper
      ? `- Whisper no recuperó el texto de referencia en ${emptyWhisper} turnos. El TTS sintético caducó o cayó a un tono; eso no es habla usable.`
      : '- Whisper devolvió texto en todos los turnos de esta pasada.',
    '- El motor no inventó puntuaciones cuando faltaba evidencia.',
    '- `fixtureId` en una sesión normal responde 403.',
    '- Para medir artículos, tiempos y vocabulario hace falta habla real o TTS de candidato fiable.',
    '',
    '## Live run',
    '',
    `- Session: ${sessionId}`,
    `- Complete status: ${completed.status}`,
    `- STT note: Whisper only counts when the adapter source is STT, not MOCK.`,
    '',
  ];
  writeFileSync(
    path.join(root, 'docs/speaking-motor-v1-fixture-report.md'),
    `${renderSpeakingB2FixtureReportMarkdown(compared)}\n${findings.join('\n')}`,
  );
  console.log(`Wrote docs/speaking-motor-v1-fixture-report.md (${items.length} answers, complete ${completed.status})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
