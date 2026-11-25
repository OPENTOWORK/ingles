# DRALO session handoff

Date: 25 November 2026  
Project: B1 Preliminary Reading motor, isolated from production  
App version: 1.0.33 (unchanged)

## Repository

- Local branch: `b1-part5-key-adjudication`
- Tracks: `origin/audit/ruoe-b1-safeguards-20261112`
- Latest commit on GitHub: `20c457b1d22bb48b674024d5cba7711c61eaf14b`
- Message: `Record explicit B1 review decisions so rules v3 fails closed instead of guessing.`
- Draft PR #22: OPEN, draft, base `main`, head `audit/ruoe-b1-safeguards-20261112`  
  https://github.com/OPENTOWORK/ingles/pull/22
- Do not push the stale local branch named `audit/ruoe-b1-safeguards-20261112`. That local name is still at ancestor `cafa18fb`. The remote of that name is `20c457b1`.
- Do not merge PR #22 and do not deploy.

## Rules

Motor rules version: `b1-reading-rules-v3`  
Motor version: `b1-reading-pilot-v7`  
Validators were not removed. Workflow status changed so a structurally complete part can be kept for teacher review without being marked validated.

## Work completed today

- Shared versioned B1 contract through `b1-reading-rules-v3` is committed and pushed.
- Teacher-review workflow is implemented locally and not yet committed: `validated_candidate`, `teacher_review_draft`, and `invalid`.
- Drafts are stored separately from the validated cache. Inconclusive semantic review is not converted into a pass.
- Circuit breaker remains: USD 1 estimated cap, four attempts, same-category limit 2, no-progress limit 3.
- Exam 8 was completed earlier under the pilot and was not rewritten today.
- Exam 9 was generated once under the teacher-review workflow. It was not approved for publication.

## Tests at closure

- `npm run test:b1-reading-motor`: 67 tests, 67 passed.
- B2 reading-quality validators and Parts 1–7: all passed.
- No paid API call was made during closure.

## Exam 8

Local cache, gitignored: `diagnostics/b1-reading-motor/cache/exam-8/`  
Files unchanged since the successful resume (`exam.json` 25 November 2026 16:59).  
Status at generation: all six parts stored, automated checks passed for that run. Teacher approval was still pending.  
Downloadable candidate: `C:\Users\Usuario\Downloads\DRALO_B1_Reading_Exam_8_Candidate.docx`  
Not in GitHub. Do not overwrite.

## Exam 9

Generated 25 November 2026 about 19:02–19:04 as a teacher-review draft, not for publication.  
Original candidate, gitignored and not overwritten by a later import:

`diagnostics/b1-reading-motor/cache/exam-9/`

- `exam.json` status `teacher_review`, automated validation `not_approved`, teacher approval `pending`
- Part 1 draft: literal overlap on Q1
- Part 2 validated candidate: 6D, 7B, 8C, 9G, 10A
- Part 3 draft: weak distractors on Q11–Q15
- Part 4 validated candidate: 16D, 17A, 18F, 19C, 20H
- Part 5 draft: blind-solve disagreement on Q21 (C for / A to) and Q25 (C valuable / D essential)
- Part 6 draft: semantic review incomplete; proposed words place, in, been, a, it, if

Usage for that single run: 19 paid calls, 88,606 input tokens, 12,023 output tokens, estimated USD 0.34175.

Word exports, outside the repository, are not a substitute for the cache:

- `C:\Users\Usuario\Downloads\DRALO_B1_Reading_Exam_9.docx`
- `C:\Users\Usuario\Downloads\DRALO_B1_Reading_Exam_9_Teacher_Review.docx`

An independent editorial revision of Exam 9 was completed outside Cursor. That revision has not been imported into the repository and must not be assumed to replace the original cache.

Earlier failed Exam 9 diagnostic, before the workflow change: `diagnostics/b1-reading-motor/exam-9-part-1-2026-11-25T17-41-05-824Z.json`

## Pending teacher approval

Neither Exam 8 nor Exam 9 is approved for publication. Parts 2 and 4 of Exam 9 passed automated validation only. A teacher has not approved any part.

## Outstanding code, local only

Needs a selective commit after approval. App version stays 1.0.33.

- `package.json` (test script only)
- `scripts/pilot-b1-reading-exam.mjs`
- `scripts/export-b1-teacher-review-docx.mjs`
- `src/lib/b1ReadingMotorGuard.js`
- `src/lib/b1ReadingMotorRun.js`
- `src/lib/b1ReadingReviewWorkflow.js`
- `src/lib/b1TeacherReviewDocument.js`
- `src/lib/levelsCambridgeExamGenerator.js`
- `src/lib/__tests__/b1ReadingMotorGuard.test.js`
- `src/lib/__tests__/b1TeacherReviewWorkflow.test.js`
- `docs/DRALO_SESSION_HANDOFF.md`

Leave uncommitted: B2 writing and scoring files, RUOE integration, `fixtures/`, `scripts/export-b1-review-papers.mjs`, `diagnostics/`, caches, Downloads documents, and credentials.

Proposed commit message:

`Keep structurally complete B1 Reading parts for teacher review instead of discarding them.`

Push, if approved, only to `origin/audit/ruoe-b1-safeguards-20261112`. Do not merge and do not deploy.

## Next recommended action

Approve that file list, then commit and push it to the existing draft-PR branch. After that, a teacher can review the original Exam 9 cache and the external editorial revision. Do not generate another exam until that review is recorded.
