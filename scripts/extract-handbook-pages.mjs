#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = path.join(ROOT, 'docs/writing-v3/calibration/sources/167791-b2-first-handbook.pdf');
const buf = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data: buf });

for (const page of [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]) {
  const result = await parser.getText({ partial: [page] });
  const text = result.text.trim();
  if (text) {
    console.log(`\n===== PAGE ${page} =====\n${text.slice(0, 2500)}\n`);
  }
}
