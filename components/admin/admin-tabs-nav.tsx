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
        className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)] bg-transparent p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
      className={cn(
        "group relative inline-flex min-w-[clamp(7.5rem,12vw,9.5rem)] items-start justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)] rounded-full border px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.55rem,0.8vw,0.75rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all",
        "border-transparent bg-muted/30 text-muted-foreground",
        "data-[state=inactive]:hover:border-primary/40 data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:shadow-[0_30px_65px_-40px_rgba(15,23,42,0.45)]",
        "data-[state=active]:border-primary/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]"
      )}
          >
            <div className="flex w-full items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
              <span className="font-medium text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)]">{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <Badge
                  variant="outline"
                  className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] min-w-[clamp(1.5rem,2.2vw,1.9rem)] justify-center font-semibold group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary"
                >
                  {tab.badge}
                </Badge>
              )}
            </div>
            {tab.description ? (
              <span className="fluid-caption text-muted-foreground group-data-[state=active]:text-primary/80">
                {tab.description}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
