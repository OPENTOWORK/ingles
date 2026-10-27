import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReferenceWav } from '../src/features/speaking-b2-motor/domain/audio-diagnostics.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/features/speaking-b2-motor/fixtures/audio');
writeFileSync(path.join(dir, 'empty.wav'), Buffer.alloc(0));
writeFileSync(path.join(dir, 'non-linguistic-tone.wav'), buildReferenceWav({ seconds: 1.2, frequency: 90 }));
writeFileSync(path.join(dir, 'corrupt.bin'), Buffer.from('this-is-not-audio'));
writeFileSync(
  path.join(dir, 'README.md'),
  `# Speaking B2 audio fixtures

These files are technical references. They are not authentic student recordings.

| File | Kind | Authenticity |
|---|---|---|
| \`empty.wav\` | empty / silent | synthetic-technical |
| \`non-linguistic-tone.wav\` | non-linguistic tone | synthetic-technical |
| \`corrupt.bin\` | corrupt / invalid | synthetic-technical |

There is no human speech file in this folder yet. Do not treat a failed TTS fallback as speech.
`,
);
console.log('Wrote technical audio fixtures (empty, tone, corrupt). No human speech.');
