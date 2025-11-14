import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { CommunityHighlights } from "@/components/home/community-highlights";
import { InfluencerSpotlight } from "@/components/home/influencer-spotlight";
import { KnowledgeGrid } from "@/components/home/knowledge-grid";
import { TopCashbackSection } from "@/components/home/top-cashback-section";
import { HomeHero } from "@/components/home/home-hero";
import { HomeRankingSection } from "@/components/home/home-ranking-section";
import { HomeCompareTeaser } from "@/components/home/home-compare-teaser";
import { HomeEducationGrid } from "@/components/home/home-education-grid";
import { HomeRecentSection } from "@/components/home/home-recent-section";
import { parseCompareParam } from "@/lib/compare";
import { getHomeRanking, getHomepageMetrics, getRecentCompanies, getTopCashbackCompanies } from "@/lib/queries/companies";
import { getRecentPublicReviews } from "@/lib/queries/reviews";
import { getApprovedInfluencers } from "@/lib/queries/influencers";
import { getHomeRankingTabs } from "@/lib/queries/rankings";

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
    influencers,
    homeRanking,
    recentCompanies,
  ] = await Promise.all([
    getHomepageMetrics(),
    getHomeRankingTabs(10),
    getTopCashbackCompanies(6),
    getRecentPublicReviews(4),
    getApprovedInfluencers(3),
    getHomeRanking(4),
    getRecentCompanies(6),
  ]);

  const compareCompanies = homeRanking.topRated.slice(0, 2);

  return (
    <CompareProvider initialSelection={selection}>
      <div className="relative bg-background">
        <div className="flex flex-col fluid-stack-xl pb-[clamp(2.5rem,3vw,3.5rem)]">
          <HomeHero metrics={metrics} />
          <HomeRankingSection tabs={rankingTabs} />
          <TopCashbackSection companies={topCashbackCompanies} />
          <HomeCompareTeaser companies={compareCompanies} />
          <HomeEducationGrid />
          <HomeRecentSection companies={recentCompanies} reviews={recentReviews} />
          <CommunityHighlights reviews={recentReviews} />
          <InfluencerSpotlight influencers={influencers} />
          <KnowledgeGrid />
        </div>
      </div>

      <CompareBar />
    </CompareProvider>
  );
}
