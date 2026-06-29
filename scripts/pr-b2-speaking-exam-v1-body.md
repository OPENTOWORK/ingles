## Summary

- Script-driven **B2 Speaking full exam** (Parts 1–4, one session) without per-turn GPT
- New authenticated APIs: `/api/speaking/b2-exam/session`, `/transcribe`, `/turn`
- Final feedback via `/api/speaking/evaluate` — **1× `exam_speaking_feedback`** per exam
- STT cost logged as **`exam_speaking_transcription`** (internal, no student daily limit)
- Prisma migration included — **do NOT deploy to production yet**

## Pre-merge validation (automated)

Run: `node --loader ./scripts/alias-loader.mjs scripts/validate-b2-speaking-exam-v1.mjs`

- [x] Engine completes Parts 1–4
- [x] Full exam UI: zero `/api/speaking/turn` calls
- [x] Typed answers skip STT/transcribe API
- [x] Mic answers log `exam_speaking_transcription` (STT only)
- [x] No visible UI limit for transcription
- [x] Single preflight for `exam_speaking_feedback`
- [x] 4th feedback/day blocked (limit 3)
- [x] 30-turn session limit does not consume feedback quota
- [x] `speaking_evaluations.payload` + meta saved
- [x] Dralo AI guard unchanged

## Manual test plan (staging/local)

1. Log in → `/exam-practice/b2/exam-speaking/` → **Full B2 Speaking exam simulation**
2. Complete Parts 1–4 (mix text + mic)
3. DevTools Network: **no** `POST /api/speaking/turn` during full exam
4. Text answers: **no** `POST /api/speaking/b2-exam/transcribe`
5. Mic answers: **yes** transcribe + row in `ai_usage_logs` (`exam_speaking_transcription`)
6. **Get exam feedback** once → `exam_speaking_feedback` usage +1
7. 4th feedback same day → blocked with beta limit message
8. >30 candidate turns → `SPEAKING_SESSION_TURN_LIMIT_REACHED` (no feedback consume)
9. Check `speaking_evaluations.payload` in DB after feedback
10. `/dralo-ai/speaking` still blocked for students

## Migration

```bash
# staging/local ONLY until sign-off:
npx prisma migrate deploy
```

**Production: hold until staging sign-off.**

## Out of scope

- Dralo AI Speaking Coach / missions
- Writing, Listening, Reading
- Legacy part practice still uses `/api/speaking/turn` (individual parts only)
