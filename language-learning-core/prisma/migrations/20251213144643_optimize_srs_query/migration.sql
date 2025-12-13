-- Phase 17: Optimize SRS Query with Covering Index
-- This index enables Index Only Scan for the SRS fetch queue query

-- Drop default index (if exists)
DROP INDEX IF EXISTS "idx_srs_fetch_queue";

-- Create optimized COVERING INDEX with INCLUDE
-- Key columns: (user_id, course_id, next_review_at) for filtering
-- INCLUDE columns: (word_token, stability, difficulty) for projection
-- This enables Index Only Scan - no Heap Fetch needed

CREATE INDEX "idx_srs_fetch_queue"
ON "user_vocabulary_progress" (user_id, course_id, next_review_at ASC)
INCLUDE (word_token, stability, difficulty);

-- Query that benefits:
-- SELECT word_token, stability, difficulty
-- FROM user_vocabulary_progress
-- WHERE user_id = $1 AND course_id = $2 AND next_review_at <= NOW()
-- → Index Only Scan (Heap Fetches: 0)
