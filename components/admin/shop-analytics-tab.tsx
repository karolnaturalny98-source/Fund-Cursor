"use client";

import { ClickAnalyticsDashboard } from "./click-analytics-dashboard";
import type { ClickAnalyticsResult } from "@/lib/queries/analytics";

interface ShopAnalyticsTabProps {
  clickAnalytics: ClickAnalyticsResult;
}

export function ShopAnalyticsTab({ clickAnalytics }: ShopAnalyticsTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <ClickAnalyticsDashboard data={clickAnalytics} />
    </div>
  );
}



