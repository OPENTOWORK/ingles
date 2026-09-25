import fs from 'node:fs';

function slice(file, needle, before = 500, after = 900) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  console.log('\n####', needle, index);
  if (index < 0) return;
  console.log(text.slice(Math.max(0, index - before), index + after));
}

const input = 'local-teacher-repairs/ruoe-v2-phase10/input/';
slice(input + 'DRALO_RUOE_Exam_6_Human_Review_v1_1_Teacher_Patch.extracted.txt', 'Option\n\nA', 0, 1200);
slice(input + 'DRALO_RUOE_Exam_5_Human_Review_v1_1_Teacher_Patch.extracted.txt', 'astronaut', 200, 500);
slice(input + 'DRALO_RUOE_Exam_7_Human_Review_v1_2_Teacher_Patch.extracted.txt', '31.', 0, 800);
slice(input + 'DRALO_RUOE_Exam_8_Human_Review_v1_1_Teacher_Patch.extracted.txt', '35.', 0, 700);
slice(input + 'DRALO_RUOE_Exam_9_Human_Review_v1_1_Teacher_Patch.extracted.txt', '35.', 0, 600);
slice('scripts/generated/b2-exams/exam-09/part-06.json', '(37)', 80, 220);
