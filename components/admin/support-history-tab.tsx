"use client";

import { SectionCard } from "./section-card";
import { AdminDisputesDashboard } from "./disputes-dashboard";
import type { DisputeCase, DisputeStatus } from "@/lib/types";

interface SupportHistoryTabProps {
  initialItems: DisputeCase[];
  initialTotals: Record<DisputeStatus, number>;
  initialNextCursor: string | null;
  initialQuery: string;
}

export function SupportHistoryTab({
  initialItems,
  initialTotals,
  initialNextCursor,
  initialQuery,
}: SupportHistoryTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Historia sporów"
        description="Przeglądaj wszystkie spory w systemie z możliwością filtrowania i wyszukiwania."
      >
        <AdminDisputesDashboard
          initialItems={initialItems}
          initialTotals={initialTotals}
          initialNextCursor={initialNextCursor}
          initialStatus="ALL"
          initialQuery={initialQuery}
        />
      </SectionCard>
    </div>
  );
}


