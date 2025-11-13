"use client";

import { SectionCard } from "./section-card";
import { InfluencerApplicationsPanel } from "./influencer-applications-panel";
import { ReviewModerationPanel } from "./review-moderation-panel";
import { DataIssueModerationPanel } from "./data-issue-moderation-panel";
import type { InfluencerProfileWithUser } from "@/lib/types";
import type { PendingReview } from "@/lib/queries/reviews";
import type { PendingDataIssue } from "@/lib/queries/data-issues";

interface CommunityQueuesTabProps {
  influencerProfiles: InfluencerProfileWithUser[];
  pendingReviews: PendingReview[];
  pendingIssues: PendingDataIssue[];
}

export function CommunityQueuesTab({
  influencerProfiles,
  pendingReviews,
  pendingIssues,
}: CommunityQueuesTabProps) {
  return (
    <div className="flex flex-col fluid-stack-lg">
      <SectionCard
        title="Zgłoszenia influencerów"
        description="Weryfikuj profile, ustawiaj kody polecające i oznaczaj status współpracy z twórcami."
      >
        <InfluencerApplicationsPanel profiles={influencerProfiles} />
      </SectionCard>

      <SectionCard
        title="Moderacja opinii"
        description="Zatwierdzaj lub odrzucaj recenzje zanim pojawią się na stronie firmy."
      >
        <ReviewModerationPanel reviews={pendingReviews} />
      </SectionCard>

      <SectionCard
        title="Zgłoszenia błędów danych"
        description="Przejrzyj uwagi użytkowników dotyczące opisów firm i planów, oznacz zgłoszenie jako rozwiązane lub odrzuć."
      >
        <DataIssueModerationPanel reports={pendingIssues} />
      </SectionCard>
    </div>
  );
}

