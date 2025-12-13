-- CreateTable
CREATE TABLE "units" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "guidebook_content" JSONB,
    "color_theme" VARCHAR(7),
    "icon_url" VARCHAR(255),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" BIGSERIAL NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "total_lessons" INTEGER NOT NULL DEFAULT 5,
    "chest_reward_id" INTEGER,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_course_id_order_index_key" ON "units"("course_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "levels_unit_id_order_index_key" ON "levels"("unit_id", "order_index");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
