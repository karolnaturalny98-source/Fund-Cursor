import { CommunityDashboard } from "@/components/admin/community-dashboard";
import { getInfluencerProfiles, getApprovedInfluencerProfiles } from "@/lib/queries/influencers";
import { getPendingReviews } from "@/lib/queries/reviews";
import { getPendingDataIssues } from "@/lib/queries/data-issues";
import { getCompanies } from "@/lib/queries/companies";
import {
  getCommunityStats,
  getCommunityTimeSeries,
  getCommunityStatusDistribution,
  getTopInfluencers,
} from "@/lib/queries/community-stats";

export default async function AdminCommunityPage() {
  const [
    influencerProfiles,
    approvedInfluencerProfiles,
    pendingReviews,
    pendingIssues,
    companies,
    stats,
    timeSeries,
    statusDistribution,
    topInfluencers,
  ] = await Promise.all([
    getInfluencerProfiles(50),
    getApprovedInfluencerProfiles(50),
    getPendingReviews(20),
    getPendingDataIssues(25),
    getCompanies(),
    getCommunityStats(),
    getCommunityTimeSeries(30),
    getCommunityStatusDistribution(),
    getTopInfluencers(5),
  ]);

  const companyOptions = companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
  }));

  return (
    <CommunityDashboard
      stats={stats}
      timeSeries={timeSeries}
      statusDistribution={statusDistribution}
      topInfluencers={topInfluencers}
      influencerProfiles={influencerProfiles}
      approvedInfluencerProfiles={approvedInfluencerProfiles}
      pendingReviews={pendingReviews}
      pendingIssues={pendingIssues}
      companies={companyOptions}
    />
  );
}
