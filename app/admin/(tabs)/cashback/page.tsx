import { CashbackDashboard } from "@/components/admin/cashback-dashboard";
import { getCompanies } from "@/lib/queries/companies";
import {
  getAffiliateQueue,
  getApprovedAffiliateTransactionsForVerification,
} from "@/lib/queries/affiliates";
import {
  getRedeemQueue,
  getManualPendingCashbackQueue,
} from "@/lib/queries/transactions";
import {
  getCashbackStats,
  getCashbackTimeSeries,
  getCashbackStatusDistribution,
  getCashbackTopCompanies,
} from "@/lib/queries/cashback-stats";

export default async function AdminCashbackPage() {
  const [
    companies,
    affiliateQueue,
    verificationQueue,
    redeemQueue,
    manualPendingQueue,
    stats,
    timeSeries,
    statusDistribution,
    topCompanies,
  ] = await Promise.all([
    getCompanies(),
    getAffiliateQueue(30),
    getApprovedAffiliateTransactionsForVerification(30),
    getRedeemQueue(30),
    getManualPendingCashbackQueue(30),
    getCashbackStats(),
    getCashbackTimeSeries(30),
    getCashbackStatusDistribution(),
    getCashbackTopCompanies(5),
  ]);

  const companyOptions = companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
  }));

  return (
    <CashbackDashboard
      stats={stats}
      timeSeries={timeSeries}
      statusDistribution={statusDistribution}
      topCompanies={topCompanies}
      redeemQueue={redeemQueue}
      affiliateQueue={affiliateQueue}
      verificationQueue={verificationQueue}
      manualPendingQueue={manualPendingQueue}
      companies={companyOptions}
    />
  );
}

