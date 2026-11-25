/**
 * Builds a teacher-review Word document from saved B1 parts.
 * Automated validation and teacher approval stay separate.
 * A draft is never described as approved.
 */
import fs from 'node:fs';
import path from 'node:path';

import { B1_READING_RULES_VERSION } from '@/lib/b1ReadingRules';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function paragraph(text, style) {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function linesForGenerated(generated) {
  const lines = [];
  if (generated?.title) lines.push(`Title: ${generated.title}`);
  if (generated?.passage) lines.push(`Passage: ${generated.passage}`);
  for (const section of asArray(generated?.sections)) {
    lines.push(`Text ${section?.letter || ''}: ${section?.text || ''}`);
  }
  for (const sentence of asArray(generated?.sentencePool)) {
    const label = sentence?.letter || sentence?.id || '';
    lines.push(`Sentence ${label}: ${sentence?.text || sentence}`);
  }
  for (const question of asArray(generated?.questions)) {
    lines.push(`Question ${question?.number}: ${question?.prompt || question?.question || question?.text || ''}`);
    const source = question?.text || question?.message || question?.notice;
    if (source && source !== question?.prompt) lines.push(`Text: ${source}`);
    asArray(question?.options).forEach((option, index) => {
      lines.push(`Option ${index + 1}: ${option}`);
    });
  }
  for (const answer of asArray(generated?.modelAnswers)) {
    lines.push(`Proposed answer ${answer?.number}: ${answer?.answer}`);
  }
  return lines;
}

export function buildB1TeacherReviewModel(exam = {}) {
  const parts = asArray(exam.parts);
  const present = new Set(parts.map((part) => Number(part.partNumber)));
  const missingPartNumbers = asArray(exam.missingPartNumbers).length
    ? exam.missingPartNumbers.map(Number)
    : [1, 2, 3, 4, 5, 6].filter((partNumber) => !present.has(partNumber));
  const automatedValidation = parts.every((part) => part.automatedValidation === 'passed' && part.reviewStatus === 'validated_candidate')
    ? 'passed'
    : 'not_approved';
  return {
    examSlot: exam.examSlot ?? null,
    rulesVersion: exam.rulesVersion || B1_READING_RULES_VERSION,
    motorVersion: exam.motorVersion || null,
    automatedValidation,
    teacherApproval: 'pending',
    humanTeacherApproved: false,
    publicationStatus: 'teacher review only, not for publication',
    parts: parts.map((part) => ({
      partNumber: Number(part.partNumber),
      reviewStatus: part.reviewStatus || 'teacher_review_draft',
      automatedValidation: part.reviewStatus === 'validated_candidate' ? 'passed' : 'not_approved',
      teacherApproval: 'pending',
      humanTeacherApproved: false,
      topic: part.allocation?.topic || part.topic || null,
      lines: linesForGenerated(part.generated),
      critical: asArray(part.critical),
      pedagogicalWarnings: asArray(part.pedagogicalWarnings),
    })),
    missingPartNumbers,
  };
}

export function renderB1TeacherReviewXml(exam = {}) {
  const model = buildB1TeacherReviewModel(exam);
  const body = [
    paragraph(`DRALO B1 Preliminary Reading Exam ${model.examSlot ?? ''} — teacher review`, 'Heading1'),
    paragraph(`Rules version: ${model.rulesVersion}`),
    paragraph(`Automated validation: ${model.automatedValidation}`),
    paragraph('Teacher approval: pending'),
    paragraph('A teacher has not approved this exam.'),
    paragraph(model.publicationStatus),
  ];
  for (const part of model.parts) {
    body.push(paragraph(`Part ${part.partNumber}`, 'Heading2'));
    body.push(paragraph(`Review status: ${part.reviewStatus}`));
    body.push(paragraph(`Automated validation: ${part.automatedValidation}`));
    body.push(paragraph('Teacher approval: pending'));
    if (part.topic) body.push(paragraph(`Topic: ${part.topic}`));
    for (const line of part.lines) body.push(paragraph(line));
    body.push(paragraph(part.pedagogicalWarnings.length ? 'Pedagogical warnings:' : 'Pedagogical warnings: none'));
    for (const warning of part.pedagogicalWarnings) body.push(paragraph(warning));
    body.push(paragraph(part.critical.length ? 'Unresolved items that block automatic approval:' : 'Unresolved items that block automatic approval: none'));
    for (const item of part.critical) body.push(paragraph(item));
  }
  if (model.missingPartNumbers.length) {
    body.push(paragraph('Parts not available for review', 'Heading2'));
    for (const partNumber of model.missingPartNumbers) {
      body.push(paragraph(`Part ${partNumber} was not generated. No content is invented for this part.`));
    }
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body.join('')}<w:sectPr/></w:body>
</w:document>`;
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

function zipStored(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.from(file.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    name.copy(local, 30);
    locals.push(local, data);
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centrals.push(central);
    offset += local.length + data.length;
  }
  const centralOffset = offset;
  const centralSize = centrals.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, ...centrals, end]);
}

export function writeB1TeacherReviewDocx(exam, filePath) {
  const xml = renderB1TeacherReviewXml(exam);
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
  const buffer = zipStored([
    { name: '[Content_Types].xml', data: contentTypes },
    { name: '_rels/.rels', data: rels },
    { name: 'word/document.xml', data: xml },
    { name: 'word/_rels/document.xml.rels', data: documentRels },
  ]);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function loadB1TeacherReviewPackage(dir, examSlot = null) {
  const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
  const exam = readJson(path.join(dir, 'exam.json'));
  if (exam?.payload?.parts?.length) {
    return buildB1TeacherReviewModel({
      examSlot: exam.exam_slot ?? exam.payload.examSlot ?? examSlot,
      rulesVersion: exam.payload.parts.find((part) => part.rulesVersion)?.rulesVersion,
      motorVersion: exam.motor_version || null,
      parts: exam.payload.parts,
    });
  }
  const parts = [];
  for (let partNumber = 1; partNumber <= 6; partNumber += 1) {
    const validated = readJson(path.join(dir, `part-${partNumber}.json`));
    const draft = readJson(path.join(dir, `part-${partNumber}.draft.json`));
    const row = validated?.validation?.ok === true ? validated : draft;
    if (!row?.payload) continue;
    parts.push(row.payload);
  }
  return buildB1TeacherReviewModel({ examSlot, parts });
}
