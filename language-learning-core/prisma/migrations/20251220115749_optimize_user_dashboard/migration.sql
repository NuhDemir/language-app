-- ============================================================
-- COVERING INDEX FOR DASHBOARD PERFORMANCE
-- Phase 29: Dashboard Performance Tuning
-- PDF Reference: Page 15
-- ============================================================

-- PROBLEM:
-- When app loads, we query: SELECT username, total_xp, streak_days FROM users WHERE id = ?
-- Standard PK lookup finds the row but needs "Heap Fetch" to get column values.

-- SOLUTION:
-- Covering index includes frequently accessed columns directly in the index.
-- PostgreSQL can satisfy the query from index alone (Index-Only Scan).

-- Drop if exists (for idempotency)
DROP INDEX IF EXISTS "idx_users_dashboard_covering";

-- COVERING INDEX with INCLUDE clause
-- Key column: id (search criteria)
-- Include columns: Most accessed fields in dashboard
-- - username: Display name
-- - total_xp: XP counter display
-- - streak_days: Streak fire animation
CREATE INDEX "idx_users_dashboard_covering" 
ON "users" ("id") 
INCLUDE ("username", "total_xp", "streak_days");

-- Additional covering index for leaderboard queries
-- When we need to show top XP users by total XP
DROP INDEX IF EXISTS "idx_users_leaderboard_covering";

CREATE INDEX "idx_users_leaderboard_covering"
ON "users" ("total_xp" DESC)
INCLUDE ("username", "id");

-- PERFORMANCE NOTES:
-- 1. Index-Only Scan requires pages to be "visible" (vacuum has marked them)
-- 2. Run VACUUM ANALYZE after bulk inserts for best performance
-- 3. Monitor Heap Fetches in EXPLAIN output - should be 0 for covered queries

COMMENT ON INDEX "idx_users_dashboard_covering" IS 
'Covering index for dashboard profile query. Enables Index-Only Scan.';

COMMENT ON INDEX "idx_users_leaderboard_covering" IS 
'Covering index for global leaderboard. Sorted by total_xp descending.';