"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, FolderTree, FileText } from "lucide-react";
import { Text } from "@/components/ui/text";

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
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="rounded-2xl border border-border/40 bg-background/60 p-5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <Text variant="caption" tone="muted" className="whitespace-nowrap">
              Wszystkie artykuły:
            </Text>
            <Text variant="body" weight="semibold" className="ml-1 text-foreground">
              {totalPosts}
            </Text>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/40 bg-background/60 p-5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <Text variant="caption" tone="muted" className="whitespace-nowrap">
              Opublikowane:
            </Text>
            <Text variant="body" weight="semibold" className="ml-1 text-foreground">
              {publishedPosts}
            </Text>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/40 bg-background/60 p-5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
        <div className="flex items-center gap-3">
          <FolderTree className="h-5 w-5 shrink-0 text-muted-foreground/70" />
          <div className="min-w-0 flex-1">
            <Text variant="caption" tone="muted" className="whitespace-nowrap">
              Kategorie:
            </Text>
            <Text variant="body" weight="semibold" className="ml-1 text-foreground">
              {categoriesCount}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
