-- OptimizeIndex: GIN with jsonb_path_ops for containment queries
-- Phase 10: Advanced JSONB Indexing Strategy

-- Drop default GIN index if exists (created by Prisma schema sync)
DROP INDEX IF EXISTS "exercises_content_idx";

-- Create optimized GIN index with jsonb_path_ops operator class
-- jsonb_path_ops: 30-50% smaller, optimized for @> (containment) queries
-- Trade-off: Only supports @> operator, not ? (key existence)
CREATE INDEX "exercises_content_gin_idx" 
ON "exercises" 
USING GIN ("content" jsonb_path_ops);

-- Add comment for documentation
COMMENT ON INDEX "exercises_content_gin_idx" IS 'Optimized GIN index with jsonb_path_ops for containment queries (@>)';
