import { ShieldCheck, Users2, Coins, BarChart3 } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { Text } from "@/components/ui/text";

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
    title: "Jak działa cashback?",
    description: "Kupujesz konto z naszego linka, my dostajemy prowizję, a część oddajemy Ci jako cashback.",
  },
  {
    icon: BarChart3,
    title: "Porównania i analizy",
    description: "Wykresy, rankingi i filtry, aby szybko wybrać firmę pod styl tradingu.",
  },
];

export function HomeEducationGrid() {
  return (
    <Section size="lg" stack="lg">
      <SectionHeader
        eyebrow="Dlaczego FundedRank?"
        title="Zaufany partner w wyborze prop firmy"
        description="Kondensujemy dane o regulaminach, cashbacku i opiniach, aby łatwiej i szybciej wybrać odpowiednią prop firmę."
      />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {POINTS.map((point) => (
          <SurfaceCard key={point.title} variant="muted" padding="md" className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <point.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text variant="body" weight="semibold" className="text-foreground">
                {point.title}
              </Text>
              <Text variant="body" tone="muted">
                {point.description}
              </Text>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </Section>
  );
}
