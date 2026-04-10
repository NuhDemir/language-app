-- ============================================================
-- LOOT BOX SYSTEM - Tables and Stored Procedure
-- Phase 27: Weighted Randomness Strategy
-- PDF Reference: Page 14, 16-17
-- ============================================================

-- CreateTable: loot_boxes
CREATE TABLE "loot_boxes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "cost_gems" INTEGER NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "loot_boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: loot_box_rates
CREATE TABLE "loot_box_rates" (
    "id" SERIAL NOT NULL,
    "loot_box_id" INTEGER NOT NULL,
    "item_type" VARCHAR(50) NOT NULL,
    "item_value" VARCHAR(100) NOT NULL,
    "weight" INTEGER NOT NULL,
    "is_rare" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loot_box_rates_pkey" PRIMARY KEY ("id"),
    -- Ensure weight is always positive
    CONSTRAINT "chk_weight_positive" CHECK (weight > 0)
);

-- AddForeignKey
ALTER TABLE "loot_box_rates" ADD CONSTRAINT "loot_box_rates_loot_box_id_fkey" 
FOREIGN KEY ("loot_box_id") REFERENCES "loot_boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- STORED PROCEDURE: pick_loot_item
-- Implements weighted random selection algorithm
-- Input: box_id (INTEGER) - The loot box to open
-- Output: item_value (TEXT) - The winning item's value/ID
-- 
-- Algorithm:
-- 1. Calculate total weight of all items in the box
-- 2. Generate random number between 1 and total_weight
-- 3. Iterate through items, accumulating weights
-- 4. Return item when cumulative sum >= random number
-- ============================================================

CREATE OR REPLACE FUNCTION pick_loot_item(p_box_id INT) 
RETURNS TEXT AS $$
DECLARE
  v_total_weight INT;
  v_random_val   INT;
  rec            RECORD;
  v_current_sum  INT := 0;
BEGIN
  -- Step 1: Calculate total weight for this box
  SELECT SUM(weight) INTO v_total_weight 
  FROM loot_box_rates 
  WHERE loot_box_id = p_box_id;

  -- Handle empty box
  IF v_total_weight IS NULL OR v_total_weight = 0 THEN
    RETURN NULL;
  END IF;

  -- Step 2: Generate random number between 1 and total_weight
  -- floor(random() * total_weight + 1) gives value in [1, total_weight]
  v_random_val := floor(random() * v_total_weight + 1)::INT;

  -- Step 3: Find winner using cumulative sum
  FOR rec IN 
    SELECT item_value, weight 
    FROM loot_box_rates 
    WHERE loot_box_id = p_box_id 
    ORDER BY id -- Deterministic ordering is important
  LOOP
    v_current_sum := v_current_sum + rec.weight;
    
    -- Step 4: Return when we hit the winning threshold
    IF v_current_sum >= v_random_val THEN
       RETURN rec.item_value;
    END IF;
  END LOOP;

  -- Fallback (should never reach here if data is valid)
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comment to function for documentation
COMMENT ON FUNCTION pick_loot_item(INT) IS 
'Weighted random selection for loot box rewards. Returns item_value of the selected reward.';
