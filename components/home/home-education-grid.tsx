import { ShieldCheck, Users2, Coins, BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/layout/section";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Zweryfikowane dane",
    description: "Monitorujemy regulaminy, zmiany payoutów i historie cen planów.",
  },
  {
    icon: Users2,
    title: "Opinie traderów",
    description: "Tylko potwierdzone recenzje + możliwość raportowania nieścisłości.",
  },
  {
    icon: Coins,
    title: "Cashback z naszej prowizji",
    description: "Dzielenie się prowizją 1:1 – więcej środków na kolejne wyzwania.",
  },
  {
    icon: BarChart3,
    title: "Porównania i analizy",
    description: "Wykresy, rankingi i filtry, aby szybko wybrać firmę pod styl tradingu.",
  },
];

export function HomeEducationGrid() {
  return (
    <Section size="lg" className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Dlaczego FundedRank?</p>
        <h2 className="fluid-h2 font-semibold text-foreground">Zaufany partner w wyborze prop firmy</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {POINTS.map((point) => (
          <Card key={point.title} className="border border-border/40 bg-background/60">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <point.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
