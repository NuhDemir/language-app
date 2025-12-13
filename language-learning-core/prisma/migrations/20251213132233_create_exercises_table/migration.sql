-- CreateTable
CREATE TABLE "exercises" (
    "id" BIGSERIAL NOT NULL,
    "level_id" BIGINT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "difficulty_score" SMALLINT NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "media_metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercises_level_id_idx" ON "exercises"("level_id");

-- CreateIndex
CREATE INDEX "exercises_type_idx" ON "exercises"("type");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
