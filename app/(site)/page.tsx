import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { TopCashbackSection } from "@/components/home/top-cashback-section";
import { HomeHero } from "@/components/home/home-hero";
import { HomeRankingSection } from "@/components/home/home-ranking-section";
import { HomeCompareTeaser } from "@/components/home/home-compare-teaser";
import { HomeEducationGrid } from "@/components/home/home-education-grid";
import { HomeRecentSection } from "@/components/home/home-recent-section";
import { HomeLatestCompanies } from "@/components/home/home-latest-companies";
import { parseCompareParam } from "@/lib/compare";
import { getHomepageMetrics, getRecentCompanies, getTopCashbackCompanies } from "@/lib/queries/companies";
import { getRecentPublicReviews } from "@/lib/queries/reviews";
import { getHomeRankingTabs } from "@/lib/queries/rankings";
import { getHomepageMarketingSection } from "@/lib/queries/marketing";
import { HomeMarketingSpotlights } from "@/components/home/home-marketing-spotlights";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selection = parseCompareParam(params.compare);

  const [
    metrics,
    rankingTabs,
    topCashbackCompanies,
    recentReviews,
    marketingSection,
    recentCompanies,
  ] = await Promise.all([
    getHomepageMetrics(),
    getHomeRankingTabs(10),
    getTopCashbackCompanies(6),
    getRecentPublicReviews(4),
    getHomepageMarketingSection(6),
    getRecentCompanies(6),
  ]);

  return (
    <CompareProvider initialSelection={selection}>
    <div className="relative min-h-screen bg-background">
        <div className="relative z-10 flex flex-col gap-[clamp(2rem,3vw,3.5rem)] py-[clamp(2rem,3vw,4rem)]">
          <HomeHero metrics={metrics} />
          <HomeRankingSection tabs={rankingTabs} />
          <TopCashbackSection companies={topCashbackCompanies} />
          <HomeMarketingSpotlights section={marketingSection} />
          <HomeLatestCompanies companies={recentCompanies} />
          <HomeCompareTeaser />
          <HomeEducationGrid />
          <HomeRecentSection reviews={recentReviews} />
        </div>
      </div>

      <CompareBar />
    </CompareProvider>
  );
}
