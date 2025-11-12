import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getCompaniesForAnalysis,
  getCompaniesPriceHistory,
  getCompaniesRatingHistory,
  getCompaniesReviewStatistics,
  getCompaniesComparisonMetrics,
} from "@/lib/queries/analysis";
import { AnalysisLayout } from "@/components/analysis/analysis-layout";
import { AnalysisLayoutSkeleton } from "@/components/analysis/loading-skeleton";

interface AnalysisPageProps {
  params: Promise<{
    slugs: string[];
  }>;
}

export async function generateMetadata({ params }: AnalysisPageProps): Promise<Metadata> {
  const { slugs } = await params;

  if (!slugs || slugs.length === 0 || slugs.length > 3) {
    return {
      title: "Analiza firm | FundedRank",
    };
  }

  try {
    const companies = await getCompaniesForAnalysis(slugs);
    const companyNames = companies.map((c) => c.name).join(" vs ");

    return {
      title: `Analiza: ${companyNames} | FundedRank`,
      description: `Szczegółowe porównanie firm: ${companyNames}. Ceny, warunki handlowe, opinie i więcej.`,
    };
  } catch {
    return {
      title: "Analiza firm | FundedRank",
    };
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { slugs } = await params;

  // Validate slugs
  if (!slugs || slugs.length === 0 || slugs.length > 3) {
    notFound();
  }

  try {
    // First, fetch companies
    const companies = await getCompaniesForAnalysis(slugs);
    
    // Get company IDs for additional data
    const companyIds = companies.map((c) => c.id);

    // Fetch additional data with company IDs in parallel
    const [priceHistory, ratingHistory, reviewStats, comparisonMetrics] =
      await Promise.all([
        getCompaniesPriceHistory(companyIds),
        getCompaniesRatingHistory(companyIds),
        getCompaniesReviewStatistics(companyIds),
        getCompaniesComparisonMetrics(companyIds),
      ]);

    return (
      <AnalysisLayout
        companies={companies}
        priceHistory={priceHistory}
        ratingHistory={ratingHistory}
        reviewStatistics={reviewStats}
        comparisonMetrics={comparisonMetrics}
      />
    );
  } catch (error) {
    console.error("Error loading analysis:", error);
    notFound();
  }
}

