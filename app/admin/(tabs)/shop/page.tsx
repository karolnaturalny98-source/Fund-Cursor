import { ShopDashboard } from "@/components/admin/shop-dashboard";
import {
  getShopRevenueStats,
  getShopTopCompanies,
  getShopTopPlans,
  getShopOrdersHistory,
} from "@/lib/queries/shop";
import { getClickAnalytics } from "@/lib/queries/analytics";

export default async function AdminShopPage() {
  const [stats, topCompanies, topPlans, recentOrders, clickAnalytics] = await Promise.all([
    getShopRevenueStats(),
    getShopTopCompanies(10),
    getShopTopPlans(10),
    getShopOrdersHistory({ limit: 50 }),
    getClickAnalytics(),
  ]);

  return (
    <ShopDashboard
      stats={stats}
      topCompanies={topCompanies}
      topPlans={topPlans}
      recentOrders={recentOrders}
      clickAnalytics={clickAnalytics}
    />
  );
}
