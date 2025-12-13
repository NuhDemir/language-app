-- CreateTable
CREATE TABLE "languages" (
    "code" CHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "native_name" VARCHAR(50) NOT NULL,
    "flag_emoji" VARCHAR(10) NOT NULL,
    "direction" VARCHAR(3) NOT NULL DEFAULT 'LTR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);
