-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "CambridgeExam" AS ENUM ('KEY', 'PET', 'FIRST', 'ADVANCED', 'PROFICIENCY');

-- CreateEnum
CREATE TYPE "SpeakingMode" AS ENUM ('PRACTICE', 'CORRECTION', 'EXAM');

-- CreateEnum
CREATE TYPE "SpeakingTaskType" AS ENUM ('INTERVIEW', 'LONG_TURN', 'COLLABORATIVE', 'DISCUSSION', 'OTHER');

-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TurnRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "TranscriptSource" AS ENUM ('STT', 'TYPED', 'MOCK');

-- CreateTable
CREATE TABLE "speaking_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cefr" "CefrLevel" NOT NULL,
    "exam_type" "CambridgeExam" NOT NULL,
    "part" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "follow_up_questions" JSONB NOT NULL DEFAULT '[]',
    "target_vocabulary" JSONB NOT NULL DEFAULT '[]',
    "time_limit_sec" INTEGER,
    "task_type" "SpeakingTaskType" NOT NULL,
    "metadata" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speaking_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speaking_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "mode" "SpeakingMode" NOT NULL,
    "cefr" "CefrLevel" NOT NULL,
    "exam" "CambridgeExam" NOT NULL,
    "state" "SessionState" NOT NULL DEFAULT 'ACTIVE',
    "exam_blueprint_version" TEXT NOT NULL DEFAULT '1',
    "exam_state" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "speaking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speaking_turns" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" "TurnRole" NOT NULL,
    "text" TEXT NOT NULL,
    "transcript_source" "TranscriptSource" NOT NULL DEFAULT 'MOCK',
    "audio_url" TEXT,
    "micro_feedback" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speaking_evaluations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "turn_id" TEXT,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "speaking_tasks_cefr_exam_type_part_idx" ON "speaking_tasks"("cefr", "exam_type", "part");

-- CreateIndex
CREATE INDEX "speaking_tasks_published_idx" ON "speaking_tasks"("published");

-- CreateIndex
CREATE INDEX "speaking_sessions_user_id_started_at_idx" ON "speaking_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "speaking_sessions_cefr_mode_idx" ON "speaking_sessions"("cefr", "mode");

-- CreateIndex
CREATE INDEX "speaking_turns_session_id_created_at_idx" ON "speaking_turns"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "speaking_evaluations_session_id_idx" ON "speaking_evaluations"("session_id");

-- AddForeignKey
ALTER TABLE "speaking_turns" ADD CONSTRAINT "speaking_turns_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "speaking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaking_evaluations" ADD CONSTRAINT "speaking_evaluations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "speaking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaking_evaluations" ADD CONSTRAINT "speaking_evaluations_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "speaking_turns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
