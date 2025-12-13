-- CreateTable
CREATE TABLE "courses" (
    "id" BIGSERIAL NOT NULL,
    "learning_lang_code" CHAR(2) NOT NULL,
    "from_lang_code" CHAR(2) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "phase" VARCHAR(20) NOT NULL DEFAULT 'live',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_learning_lang_code_from_lang_code_key" ON "courses"("learning_lang_code", "from_lang_code");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_learning_lang_code_fkey" FOREIGN KEY ("learning_lang_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_from_lang_code_fkey" FOREIGN KEY ("from_lang_code") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
