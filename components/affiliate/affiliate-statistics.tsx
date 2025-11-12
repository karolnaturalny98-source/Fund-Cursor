"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFadeIn } from "@/lib/animations";

interface AffiliateStatisticsProps {
  approvedCount: number;
  pendingCount: number;
}

export function AffiliateStatistics({ approvedCount, pendingCount }: AffiliateStatisticsProps) {
  const statsAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <section className="container space-y-6 py-12">
      <div ref={statsAnim.ref} className={`rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-8 shadow-xs ${statsAnim.className}`}>
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Statystyki
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Program affilacyjny w liczbach
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Zatwierdzeni affilaci
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight text-primary">
                {approvedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                aktywnych affilatów w programie
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Oczekujące zgłoszenia
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight text-primary">
                {pendingCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                zgłoszeń w trakcie weryfikacji
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

