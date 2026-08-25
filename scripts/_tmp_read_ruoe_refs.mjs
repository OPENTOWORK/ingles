import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import XLSX from 'xlsx';

const REF = path.join(
  process.cwd(),
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  '03_REFERENCE',
);

const which = process.argv[2] || 'all';

async function docx(file) {
  const { value } = await mammoth.extractRawText({ path: path.join(REF, file) });
  console.log(`\n\n===== ${file} =====\n`);
  console.log(value.replace(/\n{3,}/g, '\n\n'));
}

function xlsx(file) {
  const wb = XLSX.readFile(path.join(REF, file));
  console.log(`\n\n===== ${file} =====`);
  console.log('SHEETS:', wb.SheetNames.join(' | '));
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
    console.log(`\n--- SHEET: ${name} (${rows.length} rows) ---`);
    console.log(JSON.stringify(rows, null, 1));
  }
}

const files = fs.readdirSync(REF);
console.log('REFERENCE FILES:', files.join(' | '));

if (which === 'topics') xlsx('DRALO_RUOE_Topic_Bank_v1_1_Machine_Ready.xlsx');
if (which === 'blueprint') await docx('DRALO_RUOE_Transformation_Blueprint_System_v1_0.docx');
if (which === 'rules') await docx('DRALO_RUOE_Distribution_Rules_v1_1_Auditadas.docx');
if (which === 'briefsys') await docx('DRALO_RUOE_Content_Brief_System_v1_0.docx');
