-- B2 full-exam speaking: exam bank + enriched turns
-- SAFE: all new columns nullable; legacy speaking_turns rows keep NULL part_number/turn_index/speaker_role.
-- Legacy sessions unaffected; code falls back to role USER/ASSISTANT when speaker_role is NULL.

CREATE TABLE IF NOT EXISTS "speaking_exams" (    "id" TEXT NOT NULL,
    "cefr" "CefrLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "estimated_duration_minutes" INTEGER NOT NULL DEFAULT 14,
    "exam_slot" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speaking_exams_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "speaking_exams_cefr_is_active_idx" ON "speaking_exams"("cefr", "is_active");
CREATE INDEX IF NOT EXISTS "speaking_exams_exam_slot_idx" ON "speaking_exams"("exam_slot");

ALTER TABLE "speaking_sessions" ADD COLUMN IF NOT EXISTS "speaking_exam_id" TEXT;
CREATE INDEX IF NOT EXISTS "speaking_sessions_speaking_exam_id_idx" ON "speaking_sessions"("speaking_exam_id");

DO $$ BEGIN
  ALTER TABLE "speaking_sessions"
    ADD CONSTRAINT "speaking_sessions_speaking_exam_id_fkey"
    FOREIGN KEY ("speaking_exam_id") REFERENCES "speaking_exams"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "speaking_turns" ADD COLUMN IF NOT EXISTS "part_number" INTEGER;
ALTER TABLE "speaking_turns" ADD COLUMN IF NOT EXISTS "turn_index" INTEGER;
ALTER TABLE "speaking_turns" ADD COLUMN IF NOT EXISTS "speaker_role" TEXT;

CREATE INDEX IF NOT EXISTS "speaking_turns_session_id_part_number_idx" ON "speaking_turns"("session_id", "part_number");
