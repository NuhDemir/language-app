-- ============================================================
-- TRANSACTION HISTORY - PARTITIONED LEDGER TABLE
-- Phase 22: Financial Audit Trail with Time-Based Partitioning
-- PDF Reference: Page 11-12
-- ============================================================

-- 1. Create Partitioned Master Table
-- CRITICAL: This is an APPEND-ONLY table. No UPDATE/DELETE allowed by convention.
CREATE TABLE "transaction_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "reference_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_history_pkey" PRIMARY KEY ("user_id", "created_at", "id")
) PARTITION BY RANGE ("created_at");

-- 2. Create Indexes on Partitioned Table
-- These will automatically apply to all partitions
CREATE INDEX "transaction_history_user_id_created_at_idx" 
ON "transaction_history" ("user_id", "created_at" DESC);

-- 3. Default Partition (catches any data outside defined ranges)
-- CRITICAL: Without this, inserts outside defined ranges will fail
CREATE TABLE transaction_history_default 
PARTITION OF transaction_history DEFAULT;

-- 4. Monthly Partitions for Current and Future Months
-- December 2024 (historical catch-up)
CREATE TABLE transaction_history_y2024m12 
PARTITION OF transaction_history
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- January 2025
CREATE TABLE transaction_history_y2025m01 
PARTITION OF transaction_history
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- February 2025
CREATE TABLE transaction_history_y2025m02 
PARTITION OF transaction_history
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- March 2025
CREATE TABLE transaction_history_y2025m03 
PARTITION OF transaction_history
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- ============================================================
-- PARTITION MAINTENANCE NOTES:
-- 1. New partitions should be created BEFORE the month begins
-- 2. Use CronJob (Phase 24) to auto-create future partitions
-- 3. Old partitions can be detached and archived (pg_dump)
-- 4. Example archive: ALTER TABLE transaction_history 
--    DETACH PARTITION transaction_history_y2024m12;
-- ============================================================
