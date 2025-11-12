"use client";

import { SectionCard } from "./section-card";
import { CashbackHistoryPanel } from "./cashback-history-panel";
import type { Company } from "@/lib/types";

interface CashbackHistoryTabProps {
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

export function CashbackHistoryTab({ companies }: CashbackHistoryTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Historia i wyszukiwanie operacji cashback"
        description="Przeglądaj i filtruj wszystkie operacje cashback: transakcje, wnioski, ręczne przyznania i importy afiliacyjne."
      >
        <CashbackHistoryPanel companies={companies} />
      </SectionCard>
    </div>
  );
}


