-- Phase 14: Create Partitioned Table for Lesson Completions
-- Uses Range Partitioning by completed_at for high-volume scalability

-- 1. Create partitioned table with PARTITION BY RANGE
-- Note: PRIMARY KEY must include partition key (completed_at)
CREATE TABLE lesson_completions (
    id BIGSERIAL NOT NULL,
    user_id UUID NOT NULL,
    course_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    accuracy_percentage DECIMAL(5,2) NOT NULL CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Composite PK with partition key (completed_at) included
    CONSTRAINT lesson_completions_pkey PRIMARY KEY (user_id, completed_at, id)
) PARTITION BY RANGE (completed_at);

-- 2. Create index for user-course progress queries
-- This index will be inherited by all partitions
CREATE INDEX lesson_completions_user_id_course_id_idx 
ON lesson_completions (user_id, course_id);

-- NOTE: This table is now a partitioned table without any partitions.
-- INSERT operations will fail with "no partition of relation found" error.
-- Partitions will be created in Phase 15.
