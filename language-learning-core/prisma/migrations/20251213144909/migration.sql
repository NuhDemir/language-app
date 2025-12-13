-- DropIndex
DROP INDEX "idx_srs_fetch_queue";

-- CreateIndex
CREATE INDEX "idx_srs_fetch_queue" ON "user_vocabulary_progress"("user_id", "course_id", "next_review_at");
