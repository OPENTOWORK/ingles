# DRALO RUOE System Quality Upgrade v1.0

This pack converts the first pilot teacher feedback into versioned system rules.

## Contents
- `DRALO_RUOE_Editorial_Quality_Standard_v1_0.docx`
- `DRALO_RUOE_Style_Cards_v1_1_Pilot_Revised.docx`
- `DRALO_RUOE_Generation_Validator_Upgrade_v1_1.docx`
- `DRALO_RUOE_QA_Lessons_Learned_v1_0.docx`
- `CURSOR_IMPLEMENTATION_PROMPT.md`

## Scope
This upgrade changes language quality, title strategy, Part-specific prompts/validators and Part 6 generation architecture. It does not change Topic Bank and does not touch Part 4.

## Recommended order
1. Human owner reads the four specification documents.
2. Add this whole folder to the repository.
3. Paste `CURSOR_IMPLEMENTATION_PROMPT.md` into Cursor.
4. Cursor maps current runtime before editing.
5. Cursor implements + tests + dry-runs only.
6. Human reviews `IMPLEMENTATION_REPORT.md`.
7. Only then regenerate corrected pilot exams.
