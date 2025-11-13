"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, FolderTree, FileText } from "lucide-react";

interface BlogStatisticsProps {
  totalPosts: number;
  publishedPosts: number;
  categoriesCount: number;
}

export function BlogStatistics({
  totalPosts,
  publishedPosts,
  categoriesCount,
}: BlogStatisticsProps) {
  return (
    <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] sm:grid-cols-3">
      <Card className="rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.85rem,1.2vw,1rem)] shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)]">
          <FileText className="h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)] shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground fluid-caption whitespace-nowrap">Wszystkie artykuły:</span>
            <span className="ml-[clamp(0.3rem,0.45vw,0.4rem)] font-semibold text-foreground fluid-copy">{totalPosts}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.85rem,1.2vw,1rem)] shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)]">
          <BookOpen className="h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)] shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground fluid-caption whitespace-nowrap">Opublikowane:</span>
            <span className="ml-[clamp(0.3rem,0.45vw,0.4rem)] font-semibold text-foreground fluid-copy">{publishedPosts}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.85rem,1.2vw,1rem)] shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)]">
          <FolderTree className="h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)] shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground fluid-caption whitespace-nowrap">Kategorie:</span>
            <span className="ml-[clamp(0.3rem,0.45vw,0.4rem)] font-semibold text-foreground fluid-copy">{categoriesCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

