-- DropIndex
DROP INDEX "exercises_content_gin_idx";

-- CreateIndex
CREATE INDEX "exercises_content_idx" ON "exercises" USING GIN ("content");
