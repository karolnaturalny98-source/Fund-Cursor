"use client";

import { SectionCard } from "./section-card";
import { ApprovedInfluencersPanel } from "./approved-influencers-panel";
import type { InfluencerProfileWithUser } from "@/lib/types";

interface CommunityInfluencersTabProps {
  profiles: InfluencerProfileWithUser[];
}

export function CommunityInfluencersTab({
  profiles,
}: CommunityInfluencersTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Zatwierdzeni influencerzy"
        description="Przeglądaj listę zatwierdzonych influencerów, którzy mają aktywny kod polecający."
      >
        <ApprovedInfluencersPanel profiles={profiles} />
      </SectionCard>
    </div>
  );
}


