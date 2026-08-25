import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = path.resolve(
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/06_HUMAN_REVIEW_E03_E04_v1_0',
);
const files = [
  { id: 'E03', label: 'RUOE-PILOT-E03', file: 'HUMAN_REVIEW_RUOE_PILOT_E03_v1_0.md' },
  { id: 'E04', label: 'RUOE-PILOT-E04', file: 'HUMAN_REVIEW_RUOE_PILOT_E04_v1_0.md' },
];

function parseExam(md) {
  const headerEnd = md.indexOf('---\n\n## Part 1');
  const header = md.slice(0, headerEnd).trim();
  const rest = md.slice(headerEnd + 5);
  const partChunks = rest.split(/\n---\n\n## /).map((chunk, i) => (i === 0 ? chunk : `## ${chunk}`));
  const parts = [];
  for (const chunk of partChunks) {
    const titleMatch = chunk.match(/^## (Part \d+ — [^\n]+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1];
    const alumnoIdx = chunk.indexOf('#### Vista alumno');
    const revisorIdx = chunk.indexOf('#### Vista revisor');
    const alumno = chunk.slice(alumnoIdx + '#### Vista alumno'.length, revisorIdx).trim();
    const revisor = chunk.slice(revisorIdx + '#### Vista revisor'.length).replace(/\n---\s*$/, '').trim();
    parts.push({ title, alumno, revisor });
  }
  return { header, parts };
}

const exams = files.map((f) => ({
  id: f.id,
  label: f.label,
  ...parseExam(fs.readFileSync(path.join(base, f.file), 'utf8')),
}));

const out = path.join(
  os.homedir(),
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/canvases/ruoe-pilot-e03-e04-review.canvas.tsx',
);

const src = `import {
  Card,
  CardBody,
  CardHeader,
  CollapsibleSection,
  H1,
  H2,
  Pill,
  Row,
  Select,
  Stack,
  Text,
  Toggle,
  useHostTheme,
  useState,
} from 'cursor/canvas';

const EXAMS = ${JSON.stringify(exams, null, 2)} as const;

type Exam = (typeof EXAMS)[number];
type Tokens = ReturnType<typeof useHostTheme>['tokens'];

function PreBlock({ text, tokens }: { text: string; tokens: Tokens }) {
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: tokens.fontFamilyMono,
        fontSize: 12,
        lineHeight: 1.55,
        color: tokens.textPrimary,
        background: tokens.surfaceSecondary,
        border: \`1px solid \${tokens.strokeSecondary}\`,
        borderRadius: 8,
        padding: 16,
        maxHeight: '72vh',
        overflow: 'auto',
      }}
    >
      {text}
    </pre>
  );
}

export default function RuoePilotE03E04ReviewCanvas() {
  const { tokens } = useHostTheme();
  const [examId, setExamId] = useState<'E03' | 'E04'>('E03');
  const [partIndex, setPartIndex] = useState(0);
  const [studentView, setStudentView] = useState(true);

  const exam = EXAMS.find((e) => e.id === examId) ?? EXAMS[0];
  const part = exam.parts[partIndex];
  const body = studentView ? part.alumno : part.revisor;
  const attentionCount = exam.parts.reduce(
    (n, p) => n + (p.revisor.match(/TEACHER ATTENTION/g)?.length ?? 0),
    0,
  );

  return (
    <Stack gap={16} style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
      <Stack gap={8}>
        <H1>RUOE Pilot Exams — Human Review</H1>
        <Text tone="secondary">
          E03 and E04 · Parts 1–7 · student view (no keys) and reviewer view (keys and metadata)
        </Text>
      </Stack>

      <Row gap={12} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          label="Examen"
          value={examId}
          onChange={(v) => {
            setExamId(v as 'E03' | 'E04');
            setPartIndex(0);
          }}
          options={EXAMS.map((e) => ({ value: e.id, label: e.label }))}
        />
        <Select
          label="Part"
          value={String(partIndex)}
          onChange={(v) => setPartIndex(Number(v))}
          options={exam.parts.map((p, i) => ({ value: String(i), label: p.title }))}
        />
        <Toggle label="Vista alumno" checked={studentView} onChange={setStudentView} />
        <Pill tone={studentView ? 'neutral' : 'accent'}>
          {studentView ? 'Sin claves' : 'Con clave y revisor'}
        </Pill>
      </Row>

      <Card>
        <CardHeader
          title={exam.label}
          subtitle={part.title}
          trailing={<Pill tone="warning">PENDING_HUMAN_REVIEW</Pill>}
        />
        <CardBody>
          <Stack gap={12}>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              <Pill tone="success">7/7 PASS</Pill>
              <Pill tone="success">0 HARD</Pill>
              <Pill tone="neutral">TEACHER ATTENTION: {attentionCount}</Pill>
            </Row>
            <CollapsibleSection title="Cabecera del examen" defaultOpen={false}>
              <PreBlock text={exam.header} tokens={tokens} />
            </CollapsibleSection>
            <H2>{studentView ? 'Vista alumno' : 'Vista revisor'}</H2>
            <PreBlock text={body} tokens={tokens} />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, src);
console.log(`Wrote ${out} (${src.length} bytes, ${exams[0].parts.length} parts each)`);
