"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/layout/section";
import { useFadeIn } from "@/lib/animations";

interface AffiliateStatisticsProps {
  approvedCount: number;
  pendingCount: number;
}

export function AffiliateStatistics({ approvedCount, pendingCount }: AffiliateStatisticsProps) {
  const statsAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <Section size="lg" className="flex flex-col fluid-stack-xl">
      <div
        ref={statsAnim.ref}
        className={`rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.75rem,2.5vw,2.2rem)] shadow-xs backdrop-blur-[36px]! ${statsAnim.className}`}
      >
        <div className="mb-[clamp(1.25rem,1.8vw,1.6rem)] flex flex-col fluid-stack-sm">
          <p className="font-semibold uppercase tracking-[0.28em] text-primary fluid-eyebrow">
            Statystyki
          </p>
          <h2 className="font-semibold text-foreground fluid-h2">
            Program affilacyjny w liczbach
          </h2>
        </div>
        <div className="grid gap-[clamp(1rem,1.5vw,1.35rem)] md:grid-cols-2">
          <Card className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
                <div className="rounded-lg bg-primary/10 p-[clamp(0.6rem,0.85vw,0.75rem)]">
                  <svg className="h-[clamp(1.2rem,0.5vw+1rem,1.4rem)] w-[clamp(1.2rem,0.5vw+1rem,1.4rem)] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="font-medium text-muted-foreground fluid-caption">
                  Zatwierdzeni affilaci
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[clamp(2rem,2.6vw,2.4rem)] font-semibold tracking-tight text-primary">
                {approvedCount}
              </p>
              <p className="mt-[clamp(0.35rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption">
                aktywnych affilatów w programie
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
                <div className="rounded-lg bg-primary/10 p-[clamp(0.6rem,0.85vw,0.75rem)]">
                  <svg className="h-[clamp(1.2rem,0.5vw+1rem,1.4rem)] w-[clamp(1.2rem,0.5vw+1rem,1.4rem)] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="font-medium text-muted-foreground fluid-caption">
                  Oczekujące zgłoszenia
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[clamp(2rem,2.6vw,2.4rem)] font-semibold tracking-tight text-primary">
                {pendingCount}
              </p>
              <p className="mt-[clamp(0.35rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption">
                zgłoszeń w trakcie weryfikacji
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

