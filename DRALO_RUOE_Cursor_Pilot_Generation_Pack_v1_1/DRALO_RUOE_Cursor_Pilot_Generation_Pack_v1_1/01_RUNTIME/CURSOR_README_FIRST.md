# DRALO RUOE — Cursor Pilot Generation Pack v1.1

## Read this first
This pack is an IMPLEMENTATION PILOT. It is not permission to redesign the editorial architecture or build the final autonomous RUOE engine.

Both input systems have now received explicit human approval for pilot generation:
- 12 Content Briefs for Parts 1, 2, 3, 5, 6 and 7.
- 2 Transformation Blueprints for Part 4.

The two pipelines MUST be tested separately before integration.

## PHASE A — Content Brief pipeline
Generate exactly 12 exercises: Parts 1, 2, 3, 5, 6 and 7 for each of the two pilot exams.

Source priority:
1. `02_APPROVED_INPUTS/DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json`
2. Assigned Style Card in `03_REFERENCE/DRALO_RUOE_Style_Cards_v1_0_Ready_for_Pilot.docx`
3. Target Part prompt in `01_RUNTIME/DRALO_RUOE_Pilot_Runtime_Prompts_v1_1.md`
4. `03_REFERENCE/DRALO_RUOE_Content_Brief_System_v1_0.docx`
5. `03_REFERENCE/DRALO_RUOE_Distribution_Rules_v1_1_Auditadas.docx`

Topic Bank is reference/traceability only for this pilot. Topic selection is already approved.

For each brief:
1. Confirm `editorial_status = Approved`.
2. Load the assigned Style Card.
3. Load the target Part runtime prompt.
4. Generate the complete exercise.
5. Self-check brief fidelity, Style Card, mechanics, B2/British English, factuality and answer validity.
6. Save independently under the correct exam folder.
7. If it fails, regenerate only that exercise and preserve versions.

### PHASE A STOP GATE
After all 12 exercises are generated and self-checked, STOP. Produce the generation report and validation summary. Hand the outputs to humans using `04_REVIEW/DRALO_RUOE_Checklist_Revision_Ejercicios_Piloto_v1_1.docx`.

Do not start Phase B automatically unless explicitly instructed after the Phase A handoff.

## PHASE B — Part 4 Blueprint pipeline
When explicitly instructed to proceed with Phase B, generate exactly two Part 4 tasks: one for each pilot exam.

Source priority:
1. `02_APPROVED_INPUTS/DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json`
2. `03_REFERENCE/DRALO_RUOE_Transformation_Blueprint_System_v1_0.docx`
3. Part 4 prompt in `01_RUNTIME/DRALO_RUOE_Pilot_Runtime_Prompts_v1_1.md`

For each exam:
1. Load the matching approved Blueprint.
2. Generate example (0) without colliding with a scored slot.
3. Generate Q25–30 slot by slot.
4. Do not change family, target structure, exact keyword, difficulty band or marking-point intent.
5. Validate semantic equivalence, one valid route, 2–5 words, unchanged keyword and exactly two coherent marking points.
6. If one item fails, regenerate only that item.
7. Save the complete Part 4 and its validation metadata.

### PHASE B STOP GATE
After both Part 4 tasks are generated and self-checked, STOP and hand off for human review using `04_REVIEW/DRALO_RUOE_Checklist_Revision_Part4_Piloto_v1_0.docx`.

## Do not do yet
- Do not build the final orchestrator.
- Do not integrate all seven Parts into an autonomous production pipeline.
- Do not generate the remaining 18 exams.
- Do not rewrite Topic Bank, Style Cards, Content Brief System, Distribution Rules or Blueprint taxonomy because of one bad output.
- Do not use Cursor memory as Usage History. Persistent history belongs to the future runtime/data layer.
- Do not write pilot results to production.

## Output folders
Use `05_OUTPUTS/EXAM-01/` and `05_OUTPUTS/EXAM-02/`.

For Phase A, filenames must include Brief ID + Part.
For Phase B, filenames must include Blueprint ID + Part 4.

Also create:
- `05_OUTPUTS/PILOT_GENERATION_REPORT.md`
- `05_OUTPUTS/PILOT_VALIDATION_SUMMARY.json`

The report must clearly separate PHASE A and PHASE B.

## Pilot purpose
We are testing whether the approved planning layers reliably produce high-quality B2 RUOE exercises. A single poor generation is a local failure. Repeated failures of the same type are evidence to inspect the relevant prompt, validator or planning layer.
