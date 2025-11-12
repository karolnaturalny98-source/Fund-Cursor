-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CashbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REDEEMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InfluencerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DataIssueStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "logoUrl" TEXT,
    "shortDescription" TEXT,
    "websiteUrl" TEXT,
    "country" TEXT,
    "foundedYear" INTEGER,
    "discountCode" TEXT,
    "cashbackRate" INTEGER,
    "payoutFrequency" TEXT,
    "rating" DECIMAL(2,1),
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "socials" JSONB,
    "regulation" TEXT,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instruments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "educationLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPlan" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "evaluationModel" TEXT NOT NULL,
    "maxDrawdown" DECIMAL(10,2),
    "maxDailyLoss" DECIMAL(10,2),
    "profitTarget" DECIMAL(10,2),
    "profitSplit" TEXT,
    "description" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minTradingDays" INTEGER,
    "payoutFirstAfterDays" INTEGER,
    "payoutCycleDays" INTEGER,
    "leverage" INTEGER,
    "trailingDrawdown" BOOLEAN DEFAULT false,
    "refundableFee" BOOLEAN DEFAULT false,
    "scalingPlan" BOOLEAN DEFAULT false,
    "accountType" TEXT,
    "affiliateUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashbackTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "transactionRef" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "status" "CashbackStatus" NOT NULL DEFAULT 'PENDING',
    "purchasedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashbackTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "platform" TEXT,
    "externalId" TEXT NOT NULL,
    "userEmail" TEXT,
    "amount" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "points" INTEGER NOT NULL DEFAULT 0,
    "purchaseAt" TIMESTAMP(3),
    "status" "AffiliateStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "cashbackTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "audienceSize" INTEGER,
    "referralCode" TEXT,
    "socialLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "status" "InfluencerStatus" NOT NULL DEFAULT 'PENDING',
    "preferredCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataIssueReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "planId" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DataIssueStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataIssueReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "CompanyPlan_companyId_idx" ON "CompanyPlan"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CashbackTransaction_transactionRef_key" ON "CashbackTransaction"("transactionRef");

-- CreateIndex
CREATE INDEX "CashbackTransaction_companyId_idx" ON "CashbackTransaction"("companyId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_userId_idx" ON "CashbackTransaction"("userId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_status_idx" ON "CashbackTransaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateTransaction_externalId_key" ON "AffiliateTransaction"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateTransaction_cashbackTransactionId_key" ON "AffiliateTransaction"("cashbackTransactionId");

-- CreateIndex
CREATE INDEX "AffiliateTransaction_status_idx" ON "AffiliateTransaction"("status");

-- CreateIndex
CREATE INDEX "AffiliateTransaction_companyId_idx" ON "AffiliateTransaction"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_companyId_key" ON "Favorite"("userId", "companyId");

-- CreateIndex
CREATE INDEX "ClickEvent_companyId_idx" ON "ClickEvent"("companyId");

-- CreateIndex
CREATE INDEX "ClickEvent_userId_idx" ON "ClickEvent"("userId");

-- CreateIndex
CREATE INDEX "PriceHistory_planId_recordedAt_idx" ON "PriceHistory"("planId", "recordedAt");

-- CreateIndex
CREATE INDEX "Review_companyId_idx" ON "Review"("companyId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "FaqItem_companyId_order_idx" ON "FaqItem"("companyId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerProfile_userId_key" ON "InfluencerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerProfile_referralCode_key" ON "InfluencerProfile"("referralCode");

-- CreateIndex
CREATE INDEX "InfluencerProfile_status_idx" ON "InfluencerProfile"("status");

-- CreateIndex
CREATE INDEX "DataIssueReport_companyId_idx" ON "DataIssueReport"("companyId");

-- CreateIndex
CREATE INDEX "DataIssueReport_planId_idx" ON "DataIssueReport"("planId");

-- CreateIndex
CREATE INDEX "DataIssueReport_userId_idx" ON "DataIssueReport"("userId");

-- CreateIndex
CREATE INDEX "DataIssueReport_status_idx" ON "DataIssueReport"("status");

-- AddForeignKey
ALTER TABLE "CompanyPlan" ADD CONSTRAINT "CompanyPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbackTransaction" ADD CONSTRAINT "CashbackTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbackTransaction" ADD CONSTRAINT "CashbackTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateTransaction" ADD CONSTRAINT "AffiliateTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateTransaction" ADD CONSTRAINT "AffiliateTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateTransaction" ADD CONSTRAINT "AffiliateTransaction_cashbackTransactionId_fkey" FOREIGN KEY ("cashbackTransactionId") REFERENCES "CashbackTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CompanyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataIssueReport" ADD CONSTRAINT "DataIssueReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataIssueReport" ADD CONSTRAINT "DataIssueReport_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CompanyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataIssueReport" ADD CONSTRAINT "DataIssueReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
