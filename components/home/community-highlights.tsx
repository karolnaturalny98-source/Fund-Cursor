import type { ReviewHighlight } from "@/lib/types";
import { CommunityHighlightsAnimated } from "./community-highlights-animated";

export function CommunityHighlights({ reviews }: { reviews: ReviewHighlight[] }) {
  return <CommunityHighlightsAnimated reviews={reviews} />;
}
