"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChecklistItemClient } from "@/components/companies/company-page-client";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import React from "react";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  recommended: boolean;
  iconName: "Shield" | "Layers" | "FileText" | "Clock" | "BookOpen" | "LifeBuoy";
};

interface ChecklistSectionProps {
  checklist: ChecklistItem[];
}

export function ChecklistSection({ checklist }: ChecklistSectionProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  if (checklist.length === 0) {
    return null;
  }

  const recommendedCount = checklist.filter((item) => item.recommended).length;

  return (
    <section ref={sectionAnim.ref} className={cn("space-y-3", sectionAnim.className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold sm:text-xl">Lista kontrolna przed startem</h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Upewnij się, że jesteś przygotowany przed rozpoczęciem wyzwania.
          </p>
          <Badge variant="outline" className="text-[10px] font-normal border-border/40 bg-muted/20">
            {recommendedCount}/{checklist.length} zalecane
          </Badge>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {checklist.map((item) => (
          <ChecklistItemClient key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

