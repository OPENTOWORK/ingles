/**
 * Extract the RUOE Topic Bank (Engine Export sheet) into JSON so the exam builder
 * can assign blueprint topics without re-reading the spreadsheet.
 *
 * Usage: node scripts/b2-extract-topic-bank.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  root,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);

const workbook = XLSX.readFile(
  path.join(PACK, '03_REFERENCE', 'DRALO_RUOE_Topic_Bank_v1_1_Machine_Ready.xlsx'),
);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Engine Export']);

const topics = rows
  .filter((r) => String(r.status || '').toLowerCase() === 'active' && r.topic_id && r.example_context)
  .map((r) => ({
    topicId: String(r.topic_id).trim(),
    mainTopic: String(r.main_topic || '').trim(),
    subtopic1: String(r.subtopic_1 || '').trim(),
    subtopic2: String(r.subtopic_2 || '').trim(),
    exampleContext: String(r.example_context).trim(),
    combinationKey: String(r.combination_key || '').trim(),
  }));

// Topics the approved pilot briefs already consumed, so exams 5–20 can prefer fresh ones.
const briefs = JSON.parse(
  readFileSync(
    path.join(PACK, '02_APPROVED_INPUTS', 'DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json'),
    'utf8',
  ),
).briefs;

const proposedPath = path.join(
  PACK,
  '02_PROPOSED_INPUTS_E03_E04_v1_0',
  'DRALO_RUOE_12_Content_Briefs_E03_E04_v1_0_PROPOSED.json',
);
let proposedBriefs = [];
try {
  proposedBriefs = JSON.parse(readFileSync(proposedPath, 'utf8')).briefs || [];
} catch {
  proposedBriefs = [];
}

const usedByPilots = [...new Set([...briefs, ...proposedBriefs].map((b) => b.topic_id).filter(Boolean))].sort();

const outDir = path.join(root, 'scripts', 'data');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'ruoe-topic-bank.json');
writeFileSync(
  outPath,
  JSON.stringify({ source: 'DRALO_RUOE_Topic_Bank_v1_1_Machine_Ready.xlsx · Engine Export', usedByPilots, topics }, null, 2),
  'utf8',
);

console.log(`Wrote ${topics.length} active topics to ${outPath}`);
console.log(`Topics already used by pilots E01–E04 (${usedByPilots.length}): ${usedByPilots.join(', ')}`);
