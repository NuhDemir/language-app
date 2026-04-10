-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GEMS', 'HEARTS');

-- CreateTable
CREATE TABLE "user_wallets" (
    "user_id" UUID NOT NULL,
    "currency" "Currency" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("user_id","currency"),
    
    -- CHECK: Prevent negative balance (double-spend protection)
    CONSTRAINT "chk_wallet_balance_non_negative" CHECK (balance >= 0)
);

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
