-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "firmRules" JSONB,
ADD COLUMN     "instrumentGroups" JSONB,
ADD COLUMN     "leverageTiers" JSONB,
ADD COLUMN     "tradingCommissions" JSONB;
