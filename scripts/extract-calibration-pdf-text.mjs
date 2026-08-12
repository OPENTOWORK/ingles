#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs', 'writing-v3', 'calibration', 'sources');
const OUT = path.join(SRC, 'extracted');

async function extractPdf(filename) {
  const pdfPath = path.join(SRC, filename);
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const outPath = path.join(OUT, filename.replace('.pdf', '.txt'));
  fs.writeFileSync(outPath, result.text, 'utf8');
  console.log(`${filename}: ${result.total} pages, ${result.text.length} chars -> ${outPath}`);
  return result;
}

fs.mkdirSync(OUT, { recursive: true });
await extractPdf('167791-b2-first-handbook.pdf');
await extractPdf('182410-first-writing-sample-answers-and-examiner-comments-2015.pdf');
