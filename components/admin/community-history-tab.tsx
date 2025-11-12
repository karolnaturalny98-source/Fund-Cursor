"use client";

import { SectionCard } from "./section-card";
import { CommunityHistoryPanel } from "./community-history-panel";
import type { Company } from "@/lib/types";

interface CommunityHistoryTabProps {
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

export function CommunityHistoryTab({ companies }: CommunityHistoryTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Historia i wyszukiwanie operacji społecznościowych"
        description="Przeglądaj i filtruj wszystkie operacje: zgłoszenia influencerów, opinie i błędy danych."
      >
        <CommunityHistoryPanel companies={companies} />
      </SectionCard>
    </div>
  );
}

