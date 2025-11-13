import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { HeroSection } from "@/components/home/hero-section";
import { RankingTabs } from "@/components/home/ranking-tabs";
import { CommunityHighlights } from "@/components/home/community-highlights";
import { InfluencerSpotlight } from "@/components/home/influencer-spotlight";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { KnowledgeGrid } from "@/components/home/knowledge-grid";
import { WalletCtaBanner } from "@/components/home/wallet-cta";
import { parseCompareParam } from "@/lib/compare";
import { AuroraWrapper } from "@/components/aurora-wrapper";
import { getHomeRanking, getHomepageMetrics, getTopCashbackCompanies } from "@/lib/queries/companies";
import { getRecentPublicReviews } from "@/lib/queries/reviews";
import { getApprovedInfluencers } from "@/lib/queries/influencers";
import { MarketingCarousel } from "@/components/home/marketing-carousel";
import { getHomepageMarketingSection } from "@/lib/queries/marketing";
import { TopCashbackSection } from "@/components/home/top-cashback-section";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selection = parseCompareParam(params.compare);

  const [metrics, ranking, reviews, influencers, marketingSection, topCashbackCompanies] = await Promise.all([
    getHomepageMetrics(),
    getHomeRanking(10),
    getRecentPublicReviews(6),
    getApprovedInfluencers(3),
    getHomepageMarketingSection(10),
    getTopCashbackCompanies(8),
  ]);

  return (
    <CompareProvider initialSelection={selection}>
      <div className="relative">
        {/* Aurora background from top to end of hero section */}
        <div className="fixed inset-0 -z-10 h-[150vh]">
          <AuroraWrapper
            colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
            blend={0.35}
            amplitude={0.7}
            speed={0.5}
          />
        </div>
        <div className="flex flex-col fluid-stack-xl pb-[clamp(2.5rem,3vw,3.5rem)]">
          <HeroSection metrics={metrics} />
          <TopCashbackSection companies={topCashbackCompanies} />
          <MarketingCarousel section={marketingSection} />
          <RankingTabs ranking={ranking} />
          <CommunityHighlights reviews={reviews} />
          <InfluencerSpotlight influencers={influencers} />
          <HowItWorksSection />
          <WalletCtaBanner />
          <KnowledgeGrid />
        </div>
      </div>

      <CompareBar />
    </CompareProvider>
  );
}
