import type { DisputeStatus } from "@/lib/types";
import { getAdminDisputes } from "@/lib/queries/disputes";
import { SupportDashboard } from "@/components/admin/support-dashboard";
import {
  getSupportStats,
  getSupportTimeSeries,
  getSupportStatusDistribution,
  getTopDisputedCompanies,
} from "@/lib/queries/support-stats";

type DisputeStatusFilter = DisputeStatus | "ALL";

const STATUS_VALUES: DisputeStatus[] = [
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
];

function resolveStatus(value: string | undefined): {
  queryValue: DisputeStatusFilter;
  filterValue: DisputeStatus | undefined;
} {
  if (!value) {
    return { queryValue: "OPEN", filterValue: "OPEN" };
  }

  const upper = value.toUpperCase();
  if (upper === "ALL") {
    return { queryValue: "ALL", filterValue: undefined };
  }

  if (STATUS_VALUES.includes(upper as DisputeStatus)) {
    return { queryValue: upper as DisputeStatus, filterValue: upper as DisputeStatus };
  }

  return { queryValue: "OPEN", filterValue: "OPEN" };
}

interface AdminSupportPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminSupportPage({ searchParams }: AdminSupportPageProps) {
  const rawStatus = typeof searchParams?.status === "string" ? searchParams?.status : undefined;
  const rawQuery = typeof searchParams?.q === "string" ? searchParams?.q : "";

  const { queryValue, filterValue } = resolveStatus(rawStatus);

  const [
    disputesData,
    supportStats,
    supportTimeSeries,
    supportStatusDistribution,
    topCompanies,
  ] = await Promise.all([
    getAdminDisputes({
      status: filterValue ?? null,
      query: rawQuery || null,
    }),
    getSupportStats(),
    getSupportTimeSeries(30),
    getSupportStatusDistribution(),
    getTopDisputedCompanies(5),
  ]);

  return (
    <SupportDashboard
      stats={supportStats}
      timeSeries={supportTimeSeries}
      statusDistribution={supportStatusDistribution}
      topCompanies={topCompanies}
      initialDisputes={disputesData.items}
      initialTotals={disputesData.totals}
      initialNextCursor={disputesData.nextCursor}
      initialStatus={queryValue}
      initialQuery={rawQuery ?? ""}
    />
  );
}
