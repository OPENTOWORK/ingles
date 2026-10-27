import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { speakingB2HumanBankDir, readSpeakingB2HumanManifestRaw } from '../src/features/speaking-b2-motor/fixtures/human/bank.js';
import {
  inspectSpeakingB2HumanPilot,
  speakingB2HumanPilotTemplate,
  SPEAKING_B2_HUMAN_PILOT_ITEMS,
} from '../src/features/speaking-b2-motor/fixtures/human/pilot.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] || 'prepare';
const dir = speakingB2HumanBankDir({ cwd: root });
const originals = path.join(dir, 'originals');
const templateSrc = path.join(
  root,
  'src/features/speaking-b2-motor/fixtures/human/manifest.template.json',
);

if (mode === 'prepare') {
  mkdirSync(originals, { recursive: true });
  const dest = path.join(dir, 'manifest.json');
  if (!existsSync(dest)) {
    copyFileSync(templateSrc, dest);
  }
  writeFileSync(
    path.join(dir, 'DO-NOT-COMMIT.txt'),
    'Human recordings stay in this folder. It is gitignored. Do not add these files to git.\n',
  );
}

const raw = readSpeakingB2HumanManifestRaw(dir);
const inspection = inspectSpeakingB2HumanPilot({
  dir,
  manifest: raw.raw || speakingB2HumanPilotTemplate(),
});

const report = {
  mode,
  dir: 'local/speaking-b2-human',
  packId: inspection.packId,
  status: inspection.status,
  humanValidationApproved: false,
  reason: inspection.reason,
  readyCount: inspection.readyCount,
  draftCount: inspection.draftCount,
  items: inspection.items.map((item) => ({
    id: item.id,
    questionId: item.questionId,
    question: item.question,
    status: item.status,
    audioPresent: item.audioPresent,
    transcriptPresent: item.transcriptPresent,
    missing: item.missing,
    suggestedFile: item.suggestedFile,
  })),
  questions: SPEAKING_B2_HUMAN_PILOT_ITEMS.map((item) => ({
    id: item.id,
    questionId: item.questionId,
    question: item.question,
  })),
};

console.log(JSON.stringify(report, null, 2));

if (mode === 'check' && inspection.status !== 'ready') {
  process.exitCode = 0;
}
