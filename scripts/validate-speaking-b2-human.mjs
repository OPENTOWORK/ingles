import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env-local.mjs';
import { loadSpeakingB2HumanBank, readSpeakingB2HumanManifestRaw } from '../src/features/speaking-b2-motor/fixtures/human/bank.js';
import { evaluateSpeakingB2HumanBank } from '../src/features/speaking-b2-motor/fixtures/human/eval.js';
import { inspectSpeakingB2HumanPilot, speakingB2HumanPilotTemplate } from '../src/features/speaking-b2-motor/fixtures/human/pilot.js';
import {
  describeSpeakingB2HumanInterviewReadiness,
  playScriptedSpeakingB2Interview,
  evaluateScriptedSpeakingB2Interview,
} from '../src/features/speaking-b2-motor/fixtures/interview-scenario.js';
import { redactSpeakingB2AudioValue } from '../src/features/speaking-b2-motor/fixtures/human/privacy.js';

loadEnvLocal();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bank = loadSpeakingB2HumanBank({ cwd: root });
const rawManifest = readSpeakingB2HumanManifestRaw(bank.dir);
const pilot = inspectSpeakingB2HumanPilot({
  dir: bank.dir,
  manifest: rawManifest.raw || speakingB2HumanPilotTemplate(),
});
const runStt = process.env.SPEAKING_B2_HUMAN_STT === '1' && bank.count > 0 && pilot.readyCount > 0;
const runScriptedEval = process.env.SPEAKING_B2_INTERVIEW_EVAL === '1';
let transcribe;
if (runStt) {
  ({ transcribeCandidateAudio: transcribe } = await import(
    '../src/features/speaking-b2-motor/services/evaluation/transcribe-acoustic.js'
  ));
}

const human = await evaluateSpeakingB2HumanBank({
  cwd: root,
  transcribe,
});
const scripted = playScriptedSpeakingB2Interview();
const scriptedEval = runScriptedEval
  ? await evaluateScriptedSpeakingB2Interview()
  : { ...scripted, report: null, technicalOk: true, skippedEval: true };
const interviewReadiness = describeSpeakingB2HumanInterviewReadiness({ cwd: root });

const lines = [
  '# Speaking Motor V1.9 — piloto de audio humano',
  '',
  `Fecha: ${new Date().toISOString()}`,
  '',
  'La validación humana no se marca aprobada si el banco está vacío, el piloto está incompleto o solo hay audio sintético/técnico.',
  '',
  '## 1. Grabaciones disponibles',
  '',
  `- Piloto: ${pilot.packId}`,
  `- Listas para evaluar: ${pilot.readyCount}/5`,
  `- Banco validado: ${bank.count} muestra(s)`,
  `- Estado: ${pilot.status}`,
  `- Aprobada: false`,
  `- Motivo: ${pilot.reason}`,
  '',
  ...pilot.items.map(
    (item) =>
      `- ${item.id} / ${item.questionId}: audio ${item.audioPresent ? 'sí' : 'no'} · transcripción ${item.transcriptPresent ? 'sí' : 'no'} · ${item.status}`,
  ),
  '',
  '## 2. Procedencia y autorización',
  '',
  '- Plantilla sin consentimiento inventado (`granted: false`) y sin transcripciones inventadas.',
  '- No se han usado audios de Listening ni voces de alumnos.',
  '- Los originales deben quedarse en `local/speaking-b2-human/originals/` (gitignorado).',
  '',
  '## 3. Resultados WER',
  '',
  bank.count && runStt
    ? human.items
        .map(
          (item) =>
            `- ${item.sample.id}: WER ${item.alignment?.wer ?? 'n/a'} (S ${item.alignment?.substitutions} / D ${item.alignment?.deletions} / I ${item.alignment?.insertions})`,
        )
        .join('\n')
    : '- PENDING. Sin grabaciones humanas autorizadas no hay WER de habla real.',
  '',
  '## 4. Errores críticos de transcripción',
  '',
  bank.count && runStt
    ? human.items
        .map(
          (item) =>
            `- ${item.sample.id}: harm ${item.comparison?.sttHarm}; introducidos ${item.alignment?.grammarIntroduced?.join(', ') || '—'}; eliminados ${item.alignment?.grammarRemoved?.join(', ') || '—'}`,
        )
        .join('\n')
    : '- PENDING.',
  '',
  '## 5. Evaluación humana frente a Whisper',
  '',
  bank.count && runStt ? '- Ver ítems en el JSON del script.' : '- PENDING. No se ha llamado a Whisper.',
  '',
  '## 6–8. FP/FN, bandas y feedback',
  '',
  '- PENDING para audio humano.',
  `- Entrevista scriptada (no humana): orden ${scripted.orderOk ? 'OK' : 'FAIL'}, asociación ${scripted.associationOk ? 'OK' : 'FAIL'}, cierre ${scripted.closingOk ? 'OK' : 'FAIL'}.`,
  runScriptedEval
    ? `- Evaluación conjunta scriptada: GV ${scriptedEval.report?.scores?.grammarVocabulary ?? 'null'} / DM ${scriptedEval.report?.scores?.discourseManagement ?? 'null'}`
    : '- Evaluación conjunta LLM de la entrevista scriptada no solicitada (SPEAKING_B2_INTERVIEW_EVAL=1).',
  '',
  '## Entrevista humana completa',
  '',
  `- Lista: ${interviewReadiness.humanInterview}`,
  `- Motivo: ${interviewReadiness.reason}`,
  '',
  'Cinco tomas aisladas no son una entrevista humana continua.',
  '',
];

const markdown = lines.join('\n');
const out = path.join(root, 'docs/speaking-motor-v1.9-human-eval-report.md');
writeFileSync(out, markdown);

console.log(
  JSON.stringify(
    redactSpeakingB2AudioValue({
      out,
      pilot,
      human,
      scripted: {
        authenticity: scripted.authenticity,
        humanInterview: false,
        orderOk: scripted.orderOk,
        associationOk: scripted.associationOk,
        closed: scripted.closed,
        closingOk: scripted.closingOk,
        candidateTurnCount: scripted.candidateTurnCount,
        skippedEval: !runScriptedEval,
        scores: scriptedEval.report?.scores || null,
      },
      interviewReadiness,
      whisperCalled: runStt,
      quotaCharged: false,
    }),
    null,
    2,
  ),
);
