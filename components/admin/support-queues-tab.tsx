"use client";

import { SectionCard } from "./section-card";
import { AdminDisputesDashboard } from "./disputes-dashboard";
import type { DisputeCase, DisputeStatus } from "@/lib/types";

interface SupportQueuesTabProps {
  initialItems: DisputeCase[];
  initialTotals: Record<DisputeStatus, number>;
  initialNextCursor: string | null;
  initialStatus: "ALL" | DisputeStatus;
  initialQuery: string;
}

export function SupportQueuesTab({
  initialItems,
  initialTotals,
  initialNextCursor,
  initialStatus,
  initialQuery,
}: SupportQueuesTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Kolejki sporów"
        description="Zarządzaj zgłoszeniami użytkowników, aktualizuj statusy i dokumentuj notatki kontaktowe."
      >
        <AdminDisputesDashboard
          initialItems={initialItems}
          initialTotals={initialTotals}
          initialNextCursor={initialNextCursor}
          initialStatus={initialStatus}
          initialQuery={initialQuery}
        />
      </SectionCard>
    </div>
  );
}


