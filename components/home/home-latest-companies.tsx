import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import type { RecentCompanySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HomeLatestCompaniesProps {
  companies: RecentCompanySummary[];
}

export function HomeLatestCompanies({ companies }: HomeLatestCompaniesProps) {
  if (!companies.length) {
    return null;
  }

  const latestCompanies = companies.slice(0, 6);
  const totalNew = companies.length;

  return (
    <Section size="lg" stack="lg" className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Niedawno dodane firmy"
        title="Poznaj najnowsze prop firmy w bazie"
        description={`Śledzimy świeże listingi – w ostatnich dniach dodaliśmy ${totalNew} firm z aktywnym cashbackiem.`}
      />

      <MarqueeCards companies={latestCompanies} />
    </Section>
  );
}

function MarqueeCards({ companies }: { companies: RecentCompanySummary[] }) {
  const ageFormatter = companies.map((company) => ({
    ...company,
    age: getRelativeAge(company.createdAt),
  }));
  const repeated = [...ageFormatter, ...ageFormatter];

  return (
    <>
      <div className="relative hidden w-full overflow-hidden rounded-[32px] border border-white/15 bg-black/70 p-4 lg:block">
        <div
          className="latest-cards-marquee flex min-w-[200%] gap-4"
          style={{ animationDuration: `${Math.max(30, companies.length * 6)}s` }}
        >
          {repeated.map((company, index) => (
            <LatestCard key={`${company.id}-${index}`} company={company} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {ageFormatter.map((company) => (
          <LatestCard key={company.id} company={company} fullWidth />
        ))}
      </div>
    </>
  );
}

function LatestCard({
  company,
  fullWidth = false,
}: {
  company: RecentCompanySummary & { age: AgeLabel };
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-[220px] flex-shrink-0 rounded-2xl border border-white/15 bg-black/85 p-4 text-white shadow-[0_0_20px_rgba(0,0,0,0.4)] transition hover:border-primary/40",
        fullWidth && "w-full",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{company.age.label}</p>
      <p className="mt-1 text-base font-semibold">{company.name}</p>
      <p className="mt-1 text-sm text-white/65 line-clamp-2">
        {company.shortDescription ?? "Świeżo dodane – sprawdź warunki i cashback."}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
        <span>{company.cashbackRate ? `${company.cashbackRate}% cashback` : "Cashback wkrótce"}</span>
        <span>{company.rating ? `${company.rating.toFixed(1)} ★` : "Brak ocen"}</span>
      </div>
      <Link
        href={`/firmy/${company.slug}`}
        prefetch={false}
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Zobacz
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

interface AgeLabel {
  days: number;
  label: string;
}

function getRelativeAge(dateString: string): AgeLabel {
  const createdAt = new Date(dateString);
  const diffMs = Date.now() - createdAt.getTime();
  const days = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const formatter = new Intl.RelativeTimeFormat("pl", { numeric: "auto" });
  let label: string;

  if (days === 0) {
    label = "Dziś";
  } else if (days === 1) {
    label = "Wczoraj";
  } else if (days < 7) {
    label = formatter.format(-days, "day");
  } else {
    label = formatter.format(-Math.round(days / 7), "week");
  }

  return { days, label };
}

function getDotTone(days: number) {
  if (days <= 2) {
    return "bg-emerald-400";
  }
  if (days <= 6) {
    return "bg-amber-300";
  }
  return "bg-white/30";
}
