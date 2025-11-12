import { ContentDashboard } from "@/components/admin/content-dashboard";
import { getAdminCompanies } from "@/lib/queries/companies";
import {
  getContentStats,
  getContentTimeSeries,
  getContentStatusDistribution,
  getTopCompanies,
} from "@/lib/queries/content-stats";

export default async function AdminContentPage() {
  const [
    companies,
    contentStats,
    contentTimeSeries,
    contentStatusDistribution,
    topCompanies,
  ] = await Promise.all([
    getAdminCompanies(),
    getContentStats(),
    getContentTimeSeries(30),
    getContentStatusDistribution(),
    getTopCompanies(5),
  ]);

  return (
    <ContentDashboard
      stats={contentStats}
      timeSeries={contentTimeSeries}
      statusDistribution={contentStatusDistribution}
      topCompanies={topCompanies}
      companies={companies}
    />
  );
}
