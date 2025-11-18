"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { CheckCircle2 } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import IntegrationsSection from "@/components/integrations-5";
import type { HomeRankingCompany } from "@/lib/queries/companies";
import { cn } from "@/lib/utils";

interface HomeCompareTeaserProps {
  companies: HomeRankingCompany[];
}

export function HomeCompareTeaser({ companies }: HomeCompareTeaserProps) {
  if (!companies || companies.length < 2) {
    return null;
  }

  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const canAnalyze = selected.length >= 2;
  const maxSelections = 3;

  const isSelected = useCallback(
    (slug: string) => selected.includes(slug),
    [selected],
  );

  const toggle = useCallback(
    (slug: string) => {
      setSelected((prev) => {
        if (prev.includes(slug)) {
          return prev.filter((item) => item !== slug);
        }
        if (prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, slug];
      });
    },
    [maxSelections],
  );

  const analyzeLabel = useMemo(() => {
    if (!selected.length) {
      return "Wybierz firmy";
    }
    if (selected.length < 2) {
      return "Wybierz min. 2 firmy";
    }
    return `Analizuj (${selected.length})`;
  }, [selected.length]);

  const handleAnalyze = () => {
    if (selected.length < 2) {
      return;
    }
    router.push(`/analizy/${selected.join("/")}`);
  };

  const logoSelection = companies.slice(0, 10);

  return (
    <Section size="lg" stack="lg" className="flex flex-col items-center gap-6">
      <SectionHeader
        eyebrow="Porównywarka"
        title="Złóż idealny zestaw firm w 30 sekund"
        description="Wybierz 2–3 firmy, zobacz różnice w ratingach i cashbacku, a następnie przenieś porównanie do pełnej analizy."
      />

      <IntegrationsSection logos={{ companies: companies.slice(0, 8) }} />

      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Wybrane: {selected.length} / {maxSelections}
        </p>
        <div className="flex flex-wrap justify-center gap-4 rounded-3xl border border-white/10 bg-black/60 px-6 py-3">
          {logoSelection.map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => toggle(company.slug)}
              disabled={!isSelected(company.slug) && selected.length >= maxSelections}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/80 text-xs font-semibold uppercase text-white transition hover:border-white",
                isSelected(company.slug) && "border-primary/60 bg-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.35)]",
                !isSelected(company.slug) && selected.length >= maxSelections && "opacity-40 cursor-not-allowed",
              )}
            >
              {company.logoUrl ? (
                <Image src={company.logoUrl} alt={company.name} width={40} height={40} className="h-9 w-9 rounded-full object-contain" />
              ) : (
                getInitials(company.name)
              )}
              {isSelected(company.slug) ? (
                <span className="absolute -bottom-2 text-[10px] uppercase tracking-[0.3em] text-primary">
                  {selected.indexOf(company.slug) + 1}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className={cn(
          "inline-flex min-w-[200px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white",
          canAnalyze ? "hover:bg-white/20" : "cursor-not-allowed opacity-50",
        )}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {analyzeLabel}
      </button>
    </Section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
