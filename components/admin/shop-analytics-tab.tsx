"use client";

import { ClickAnalyticsDashboard } from "./click-analytics-dashboard";
import type { ClickAnalyticsResult } from "@/lib/queries/analytics";

interface ShopAnalyticsTabProps {
  clickAnalytics: ClickAnalyticsResult;
}

export function ShopAnalyticsTab({ clickAnalytics }: ShopAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <ClickAnalyticsDashboard data={clickAnalytics} />
    </div>
  );
}


