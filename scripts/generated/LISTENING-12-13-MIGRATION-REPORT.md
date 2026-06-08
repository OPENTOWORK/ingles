# B2 Listening Parts 12–13 — Migration Report

**Date:** 2026-06-08  
**Examen:** Examen 1 B2 (`5bd3e0d7-29a7-4e07-ac15-a4d195528c65`)  
**Status:** Code + previews prepared — **nothing saved to production yet**

---

## 1. Files touched (code only)

| File | Change |
|------|--------|
| `src/lib/b2ExamCatalog.js` | Part 12 → `multiple-matching`, 5 clips, Q19–23; Part 13 → `conversation`, 1 clip, 7 questions Q24–30 |
| `scripts/dump-b2-exam.mjs` | Activity labels aligned with catalog |
| `src/lib/draloAiExamPartSpecs.js` | Directions + question counts swapped to Cambridge Listening P3/P4 |
| `src/lib/draloAiExamPrompts.js` | B2 matching prompt → Part 3 Q19–23; new B2 interview prompt → Part 4 Q24–30 A/B/C; extract length hints |
| `src/lib/levelsCambridgeExamGenerator.js` | Passes `partNumber`/`questionCount` to prompts; stricter `isPartComplete` for L P3/P4 |
| `src/lib/formatB2Enunciado.js` | A–H pool + speakers block moved from `pn===13` to `pn===12` |
| `src/lib/formatLevelsEnunciado.js` | *(unchanged — matching rows already use pool + matchingAnswers)* |
| `src/lib/examPartValidation.js` | Validates Part 12 pool/matching; Part 13 requires 7× A/B/C, warns on A–H pool |
| `src/components/b2/B2ExamPaperPracticePage.js` | Part 12 = matching layout + pool; Part 13 = interview MCQ + single audio |
| `src/utils/b2ExamTextBlocks.js` | Comments updated (Part 12 = Q19–23) |

**Not touched:** Parts 1–7, Writing 8–9, Speaking 14–17, Listening 10–11 content/DB.

---

## 2. Catalog changes (`b2ExamCatalog.js`)

| Dralo Part | Cambridge | Activity | Questions | Audio clips |
|------------|-----------|----------|-----------|-------------|
| 10 | Listening P1 | `short-extracts` | 8 (Q1–8) | 8 |
| 11 | Listening P2 | `sentence-completion` | 10 (Q9–18) | 1 |
| **12** | **Listening P3** | **`multiple-matching`** *(was `conversation`)* | **5 (Q19–23)** | **5** *(was 1)* |
| **13** | **Listening P4** | **`conversation`** *(was `multiple-matching`)* | **7 (Q24–30)** *(was 5)* | **1** |

---

## 3. Prompt changes (`draloAiExamPrompts.js`)

### Before
- `multiple-matching` + B2 → labelled “Listening Part 4”, Q24–28, 5 speakers  
- `conversation` → generic MCQ with Q19+ and A/B/C/D  

### After
- **`multiple-matching` + B2** → “Listening Part 3”, Q19–23, pool A–H, 5 speaker monologues (25–35 s each)  
- **`conversation` + B2** → dedicated “Listening Part 4” block: Q24–30, 7 MCQ with full A/B/C strings, one A/B interview script (~450–650 words), **no A–H pool**  
- **`short-extracts`** → 8 extracts, 80–120 words each (25–35 s target)  
- **`sentence-completion`** → monologue 450–650 words (3–4 min target)  

### Directions (`draloAiExamPartSpecs.js`)
- `multiple-matching` → Part 3, Q19–23, A–H  
- `conversation` → Part 4, Q24–30, A/B/C  

---

## 4. UI / render changes (`B2ExamPaperPracticePage.js`)

| Part | Behaviour |
|------|-----------|
| **12** | `splitListeningSpeakerContextByQuestion` → Q19–23; global **Options A–H** panel; one audio per speaker (`orden` 1–5); label “Your answer (choose A–H)” |
| **13** | Single **monologue/interview** audio when 1 clip; `splitListeningMcqContextByQuestion` for Q24–30; full **A/B/C option text** from DB rows |
| **10–11** | Unchanged |

---

## 5. Preview Part 12 — migrated “First Jobs, First Lessons”

**File:** `scripts/generated/preview-exam1-part12-migrated-b2.json`  
**Target preguntaId:** `9535484c-d2da-4c82-9f2e-94442c658cef`

| Field | Value |
|-------|-------|
| Questions | 19–23 (Speaker 1–5) |
| Pool | A–H (3 extras: A, D, F) |
| Answer key | 19→C, 20→H, 21→B, 22→E, 23→G |
| Audio plan | Copy existing TTS files (no re-synthesis): |

```
part-13/speaker-01.mp3 → part-12/speaker-01.mp3
part-13/speaker-02.mp3 → part-12/speaker-02.mp3
…
part-13/speaker-05.mp3 → part-12/speaker-05.mp3
```

**Remove on save:** legacy `part-12/clip-01-v2.mp3` link (city/tech MCQ A–D).

**Pipeline check (local):** 40 MCQ rows (5×8) with full option text; question numbers 19–23.

---

## 6. Preview Part 13 — new Listening Part 4

**File:** `scripts/generated/preview-exam1-part13-b2.json`  
**Future preguntaId:** `bdb3f9bc-1a00-42cb-ac65-c6e6beea8fc6` (replace content on save)

| Field | Value |
|-------|-------|
| Title | **Running Together** (sport & wellbeing) |
| Questions | 24–30 (7 MCQ) |
| Format | A/B/C with full option text |
| Script | Interview A/B (~520 words) — **text only, no audio yet** |
| Answer key | 24B 25B 26B 27A 28B 29A 30B |

**Pipeline check (local):** 21 MCQ rows (7×3) with full option text; no A–H pool.

---

## 7. Planned save sequence (after your validation)

### Step A — Part 12
1. Copy 5 MP3s in Supabase Storage (`part-13/speaker-*` → `part-12/speaker-*`)
2. `POST /api/internal/save-exam-part-preview` with `preview-exam1-part12-migrated-b2.json`, `replacePartContent: true`, `skipAudio: true`
3. Register 5 audio rows pointing at `part-12/speaker-0N.mp3`
4. Delete orphan `levels_preguntas_audios` for old `clip-01-v2.mp3` on Part 12

### Step B — Part 13
1. Your approval of preview text + answer key
2. Save content (`replacePartContent: true`, `skipAudio: true`)
3. TTS single clip → `part-13/clip-01-v3.mp3` (~3–4 min)
4. Remove old 5× `speaker-0N.mp3` rows from Part 13 pregunta

### Step C — Deploy
- Vercel deploy if API/UI routes changed (this session touched UI + validation only on existing routes)

---

## 8. Rollback plan

| Step | Rollback |
|------|----------|
| Code | `git revert` / restore from GitHub `main` before merge |
| Part 12 DB | Re-dump current production Part 12 from backup JSON (city/tech MCQ + `clip-01-v2.mp3`) via save-exam-part-preview |
| Part 13 DB | Re-save from archived `preview-exam1-part13-b2.json` (First Jobs version) + re-link 5 speaker audios |
| Storage | Old files remain in bucket unless explicitly deleted; copy is non-destructive |
| User scores | Part 12/13 progress rows may show stale counts — acceptable or manual reset |

**Pre-save backup command:**
```bash
node scripts/dump-b2-exam.mjs 1
cp scripts/generated/dump-exam1-b2.json scripts/generated/dump-exam1-b2-pre-migration-backup.json
```

---

## 9. What to validate

### Part 12 preview
- [ ] Directions say Q19–23 and A–H  
- [ ] Pool text matches First Jobs theme  
- [ ] Answer key C, H, B, E, G  
- [ ] Audio copy plan acceptable (same clips, new paths)  

### Part 13 preview
- [ ] Seven questions with plausible A/B/C  
- [ ] Script matches answer key  
- [ ] Theme distinct from city/tech and first jobs  
- [ ] Wording / level appropriate for B2  

---

## 10. Next actions (waiting on you)

1. Review both preview JSON files  
2. Confirm Part 13 theme/title/script or request edits  
3. Approve save order: **Part 12 first**, then **Part 13**  
4. Parts 10–11 remain in backlog after 12/13 are stable  
