-- Phase 15: Initialize Partitions for lesson_completions
-- Creates default partition and monthly partitions for 2024 Q4 / 2025 Q1

-- 1. DEFAULT PARTITION (Safety Net)
-- Catches data that doesn't match any defined partition range
CREATE TABLE lesson_completions_default 
PARTITION OF lesson_completions DEFAULT;

-- 2. December 2024
CREATE TABLE lesson_completions_y2024m12 
PARTITION OF lesson_completions
FOR VALUES FROM ('2024-12-01 00:00:00+00') TO ('2025-01-01 00:00:00+00');

-- 3. January 2025
CREATE TABLE lesson_completions_y2025m01 
PARTITION OF lesson_completions
FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2025-02-01 00:00:00+00');

-- 4. February 2025
CREATE TABLE lesson_completions_y2025m02 
PARTITION OF lesson_completions
FOR VALUES FROM ('2025-02-01 00:00:00+00') TO ('2025-03-01 00:00:00+00');

-- 5. March 2025
CREATE TABLE lesson_completions_y2025m03 
PARTITION OF lesson_completions
FOR VALUES FROM ('2025-03-01 00:00:00+00') TO ('2025-04-01 00:00:00+00');

-- Note: Indexes defined on parent table are automatically inherited by partitions.
-- The NestJS cron job will create future partitions automatically.