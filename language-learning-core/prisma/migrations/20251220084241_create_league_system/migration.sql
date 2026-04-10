-- CreateTable
CREATE TABLE "leagues" (
    "tier" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "promotion_threshold" INTEGER NOT NULL,
    "demotion_threshold" INTEGER NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("tier")
);

-- CreateTable
CREATE TABLE "league_cohorts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "league_tier" INTEGER NOT NULL,
    "week_start_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_memberships" (
    "cohort_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_weekly_xp" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_memberships_pkey" PRIMARY KEY ("cohort_id","user_id")
);

-- CreateIndex
CREATE INDEX "league_cohorts_league_tier_week_start_date_is_active_idx" ON "league_cohorts"("league_tier", "week_start_date", "is_active");

-- CreateIndex
CREATE INDEX "idx_league_ranking" ON "league_memberships"("cohort_id", "current_weekly_xp" DESC);

-- AddForeignKey
ALTER TABLE "league_cohorts" ADD CONSTRAINT "league_cohorts_league_tier_fkey" FOREIGN KEY ("league_tier") REFERENCES "leagues"("tier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "league_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
