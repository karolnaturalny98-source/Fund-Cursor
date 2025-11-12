"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";

export function KnowledgeGridButtonClient() {
  return (
    <Button
      variant="premium-outline"
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
    >
      Czytaj wkrótce
      <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" hoverGlow />
    </Button>
  );
}
