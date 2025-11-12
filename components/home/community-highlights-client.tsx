"use client";

import { Star } from "lucide-react";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";

interface RatingBadgeClientProps {
  rating: number;
}

export function RatingBadgeClient({ rating }: RatingBadgeClientProps) {
  return (
    <PremiumBadge variant="glow" className="rounded-full px-3 py-1 text-sm font-semibold">
      <PremiumIcon icon={Star} variant="glow" size="sm" className="mr-2" />
      {rating.toFixed(1)}
    </PremiumBadge>
  );
}
