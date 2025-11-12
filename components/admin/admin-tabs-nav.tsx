"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdminTabDefinition {
  value: string;
  label: string;
  href: string;
  description?: string;
  badge?: number | string;
}

interface AdminTabsNavProps {
  tabs: AdminTabDefinition[];
}

export function AdminTabsNav({ tabs }: AdminTabsNavProps) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const active = segment ?? tabs[0]?.value ?? "shop";

  const tabHrefs = useMemo(() => tabs.map((tab) => tab.href), [tabs]);

  useEffect(() => {
    tabHrefs.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        // Ignorujemy błędy prefetch (np. przy braku cache) – taby i tak załadują się przez Suspense.
      }
    });
  }, [router, tabHrefs]);

  return (
    <Tabs
      value={active}
      onValueChange={(next) => {
        if (next === active) {
          return;
        }

        const target = tabs.find((tab) => tab.value === next);
        if (target) {
          router.push(target.href);
        }
      }}
      className="w-full"
    >
      <TabsList
        aria-label="Zakładki panelu administratora"
        className="flex flex-wrap gap-2 bg-transparent p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "group relative inline-flex min-w-[130px] items-start justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-medium">{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 px-1.5 text-xs font-semibold group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary"
                >
                  {tab.badge}
                </Badge>
              )}
            </div>
            {tab.description ? (
              <span className="text-xs text-muted-foreground group-data-[state=active]:text-primary/80">
                {tab.description}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
