"use client";

import { SectionCard } from "./section-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ContentHistoryTab() {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Historia zmian treści"
        description="Przeglądaj historię zmian w firmach, planach i innych treściach."
      >
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Historia zmian</CardTitle>
            <CardDescription>
              Historia zmian w treściach będzie dostępna w przyszłej wersji.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Historia zmian treści jest obecnie w przygotowaniu.
            </div>
          </CardContent>
        </Card>
      </SectionCard>
    </div>
  );
}


