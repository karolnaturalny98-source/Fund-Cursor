-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "AffiliateTransaction" ADD COLUMN     "source" TEXT,
ADD COLUMN     "userConfirmed" BOOLEAN;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "ceo" TEXT,
ADD COLUMN     "foundersInfo" TEXT,
ADD COLUMN     "headquartersAddress" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "licenses" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "registryData" TEXT,
ADD COLUMN     "registryLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verificationStatus" TEXT;

-- AlterTable
ALTER TABLE "CompanyPlan" ADD COLUMN     "affiliateCommission" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "linkedInUrl" TEXT,
    "profileImageUrl" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "position" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyTimeline" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCertification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "description" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "issuedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMedia" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRankingHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyRankingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImageUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostCategory" (
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostCategory_pkey" PRIMARY KEY ("postId","categoryId")
);

-- CreateTable
CREATE TABLE "MarketingSpotlightSection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "emoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSpotlightSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingSpotlight" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "headline" TEXT,
    "badgeLabel" TEXT,
    "badgeTone" TEXT,
    "discountValue" INTEGER,
    "rating" DECIMAL(2,1),
    "ratingCount" INTEGER,
    "ctaLabel" TEXT DEFAULT 'Sprawdź ofertę',
    "ctaUrl" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSpotlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_companyId_idx" ON "TeamMember"("companyId");

-- CreateIndex
CREATE INDEX "CompanyTimeline_companyId_idx" ON "CompanyTimeline"("companyId");

-- CreateIndex
CREATE INDEX "CompanyCertification_companyId_idx" ON "CompanyCertification"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMedia_companyId_idx" ON "CompanyMedia"("companyId");

-- CreateIndex
CREATE INDEX "CompanyRankingHistory_companyId_idx" ON "CompanyRankingHistory"("companyId");

-- CreateIndex
CREATE INDEX "CompanyRankingHistory_recordedAt_idx" ON "CompanyRankingHistory"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_order_idx" ON "BlogCategory"("order");

-- CreateIndex
CREATE INDEX "BlogPostCategory_categoryId_idx" ON "BlogPostCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingSpotlightSection_slug_key" ON "MarketingSpotlightSection"("slug");

-- CreateIndex
CREATE INDEX "MarketingSpotlight_sectionId_order_idx" ON "MarketingSpotlight"("sectionId", "order");

-- CreateIndex
CREATE INDEX "MarketingSpotlight_companyId_idx" ON "MarketingSpotlight"("companyId");

-- CreateIndex
CREATE INDEX "MarketingSpotlight_isActive_idx" ON "MarketingSpotlight"("isActive");

-- CreateIndex
CREATE INDEX "MarketingSpotlight_startsAt_idx" ON "MarketingSpotlight"("startsAt");

-- CreateIndex
CREATE INDEX "MarketingSpotlight_endsAt_idx" ON "MarketingSpotlight"("endsAt");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyTimeline" ADD CONSTRAINT "CompanyTimeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCertification" ADD CONSTRAINT "CompanyCertification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMedia" ADD CONSTRAINT "CompanyMedia_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRankingHistory" ADD CONSTRAINT "CompanyRankingHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSpotlight" ADD CONSTRAINT "MarketingSpotlight_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MarketingSpotlightSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSpotlight" ADD CONSTRAINT "MarketingSpotlight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
