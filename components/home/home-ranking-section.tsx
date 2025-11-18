import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Surface } from "@/components/ui/surface";
import { RankingTabsSection } from "@/components/rankings/ranking-tabs-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeRankingTab } from "@/lib/types/rankings";

interface HomeRankingSectionProps {
  tabs: HomeRankingTab[];
}

export function HomeRankingSection({ tabs }: HomeRankingSectionProps) {
  if (!tabs.length) {
    return null;
  }

  return (
    <Section size="lg" className="relative">
      <div className="flex w-full flex-col gap-6">
        <Surface
          variant="panel"
          padding="lg"
          className="relative flex flex-col gap-6 rounded-3xl border border-white/15 bg-gradient-to-br from-black/70 via-black/60 to-black/40"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center">
            <div className="space-y-4">
              <SectionHeader
                align="start"
                eyebrow="Rankingi FundedRank"
                title="Wybierz firme i odbierz cashback"
                description="Porownujemy firmy prop z perspektywy wyplat, kosztu startu i aktywnosci spolecznosci. Algorytm laczy dane API, recenzje i nasze negocjacje cashbacku, aby pokazac tylko realnych liderow."
              />

              <div className="flex flex-wrap gap-2 text-[13px] uppercase tracking-[0.2em] text-white/40">
                <span className="rounded-full border border-white/15 px-3 py-1">
                  Aktualizacja co 24h
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1">
                  Cashback verified
                </span>
              </div>
            </div>

            <ul className="grid gap-4 text-sm text-white/80 sm:grid-cols-2">
              <SellingPoint
                icon={ShieldCheck}
                title="Zweryfikowane firmy"
                description="Kazdy lider ma aktualny audyt i kod potwierdzony bezposrednio w panelu partnera."
              />
              <SellingPoint
                icon={Sparkles}
                title="Negocjowane cashbacki"
                description="Zwroty sa wyzsze niz publiczne promocje - naliczamy je na podstawie historii klikniec."
              />
              <SellingPoint
                icon={CheckCircle2}
                title="Dane co 24h"
                description="Laczymy oceny traderow, API firm i nasze rejestry wyplat, aby oddzielic hype od faktow."
              />
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-white/75">
              Kliknij w dowolna firme, aby aktywowac kod i przypisac cashback do swojego konta FundedRank. Brak sponsorowanych miejsc.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/rankingi"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "primary", size: "sm" }),
                  "rounded-full px-6 text-base font-semibold",
                )}
              >
                Zobacz ranking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/rankingi#metodologia"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10",
                )}
              >
                Metodologia
              </Link>
            </div>
          </div>
        </Surface>

        <Surface
          variant="glass"
          padding="lg"
          className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5"
        >
          <RankingTabsSection tabs={tabs} variant="home" />
        </Surface>
      </div>
    </Section>
  );
}

function SellingPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <div className="space-y-0.5">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-white/70">{description}</p>
      </div>
    </li>
  );
}
