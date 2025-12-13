-- CreateTable
CREATE TABLE "user_vocabulary_progress" (
    "user_id" UUID NOT NULL,
    "course_id" BIGINT NOT NULL,
    "word_token" VARCHAR(100) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetition_count" INTEGER NOT NULL DEFAULT 0,
    "last_reviewed_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "next_review_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_vocabulary_progress_pkey" PRIMARY KEY ("user_id","course_id","word_token")
);

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
