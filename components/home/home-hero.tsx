"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { Section } from "@/components/layout/section";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Input } from "@/components/ui/input";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import type { HomepageMetrics } from "@/lib/types";

const heroHeadlineWords = [
  "Zbuduj",
  "przewagę",
  "prop",
  "z",
  "FundedRank.",
];

const traderSpotlight = [
  {
    id: 1,
    name: "Ola K.",
    designation: "Top 1% payout",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: 2,
    name: "Marek H.",
    designation: "FTMO funded",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: 3,
    name: "Sara W.",
    designation: "Cashback 4.5k$",
    image: "https://images.unsplash.com/photo-1544396821-d7b6b8ca9870?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: 4,
    name: "Leo T.",
    designation: "MyFundedFX",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=60",
  },
];

const payoutLog = [
  { firm: "MyFundedFX", amount: "$8.2k", trader: "Maja.fx", status: "cashback 6%", time: "2 min temu" },
  { firm: "Alpha Capital", amount: "$5.7k", trader: "BartekTrader", status: "payout + kod -12%", time: "14 min temu" },
  { firm: "Smart Prop", amount: "$3.1k", trader: "NeonEdge", status: "instant payout", time: "27 min temu" },
  { firm: "FundedNext", amount: "$12.4k", trader: "AsiaQuant", status: "cashback 8%", time: "1 h temu" },
];

const promoCards = [
  {
    label: "Nowy drop",
    title: "Kody -15% na 4 firmy",
    description: "Wskoczyły świeże kupony w MFF, Alpha, Funding Pips oraz The Funded Trader.",
    href: "/rankingi",
  },
  {
    label: "Rankingi live",
    title: "TOP prop do skalowania",
    description: "Monitorujemy płynność i liczbę dispute'ów – ranking zmienia się co kilka godzin.",
    href: "/rankingi",
  },
];

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

export function HomeHero({ metrics }: HomeHeroProps) {
  const router = useRouter();
  const stats = [
    {
      label: "Firm w bazie",
      value: `${metrics.totalCompanies.toLocaleString("pl-PL")}+`,
      description: "Kompletne profile, filtry i aktualizacje",
    },
    {
      label: "Wypłacony cashback",
      value: `$${metrics.totalCashbackPaid.toLocaleString("en-US")}`,
      description: "Zweryfikowane wypłaty dla traderów społeczności",
    },
    {
      label: "Zweryfikowane opinie",
      value: metrics.totalReviews.toLocaleString("pl-PL"),
      description: "Moderowane wpisy od realnych użytkowników",
    },
    {
      label: "Średnia ocena",
      value: metrics.avgRating.toFixed(1),
      description: "Live sentyment społeczności",
    },
  ];

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get("search") as string)?.trim();
    const params = new URLSearchParams();
    if (query) {
      params.set("search", query);
    }
    router.push(`/firmy${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <Section size="lg" bleed className="relative px-0 py-0">
      <div className="relative w-full min-h-screen overflow-hidden rounded-none border-y border-white/5 bg-[#050505]">
        <BackgroundGrid />
        <div className="container flex min-h-[calc(100vh-4rem)] flex-col gap-12 px-4 py-16 sm:px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="flex flex-col text-white fluid-stack-2xl">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-white/70">
                FundedRank
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Live
              </div>
              <div className="fluid-stack-lg">
                <h1 className="fluid-h1 font-semibold leading-tight">
                  {heroHeadlineWords.map((word, index) => (
                    <AnimatedWord key={word} word={word} delay={index * 0.08} />
                  ))}
                  <span className="inline-flex translate-y-1 rounded-2xl border border-white/15 px-3 py-1 text-sm uppercase tracking-[0.35em] text-white/80">
                    Cashback
                  </span>
                </h1>
              <p className="max-w-2xl fluid-copy text-white/70">
                Porównuj warunki, poluj na promocje i śledź status wypłat w jednym panelu.
                Nasze rankingi, logi wypłat i dane marketingowe są aktualizowane każdego dnia.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-[#060910] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] fluid-stack-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                <Search className="h-4 w-4 text-emerald-400" />
                Szukaj firmy po nazwie
              </div>
              <form onSubmit={handleSearch} role="search" className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#05080e] p-3 sm:flex-row sm:items-center">
                <Input
                  name="search"
                  placeholder="np. Funding Pips, Alpha Capital, Smart Prop"
                  aria-label="Szukaj firmy"
                  className="flex-1 rounded-xl border border-white/5 bg-transparent px-4 text-base text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-emerald-400 to-sky-500 p-[1px] text-sm font-semibold transition hover:-translate-y-0.5"
                >
                  <span className="inline-flex h-full w-full items-center justify-center rounded-[calc(0.85rem-1px)] bg-black px-5 py-2 text-white">
                    Szukaj
                  </span>
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#050910] px-4 py-2">
                <AnimatedTooltip items={traderSpotlight} />
                <div className="text-sm text-white/70">
                  {metrics.totalReviews.toLocaleString("pl-PL")} traderów zaufało FundedRank
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                Nowe cashbacki co tydzień
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <CTAButton href="/rankingi">
                Zobacz rankingi
                <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <CTAButton href="/sklep">Kup konto z cashbackiem</CTAButton>
              <CTAButton href="/analizy" variant="ghost">
                Porównaj firmy
              </CTAButton>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <HeroStat key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          <HeroMedia metrics={metrics} />
        </div>
      </div>
    </div>
  </Section>
  );
}

function HeroMedia({ metrics }: HomeHeroProps) {
  return (
    <div className="relative flex h-full flex-col gap-6 text-white">
      <LiveLogCard metrics={metrics} />

      <div className="grid gap-5 lg:grid-cols-2">
        {promoCards.map((card) => (
          <PromoCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

interface LiveLogCardProps {
  metrics: HomepageMetrics;
}

function LiveLogCard({ metrics }: LiveLogCardProps) {
  return (
    <div className="relative flex flex-col gap-6 rounded-[36px] border border-white/15 bg-[#04070f] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
      <Icon className="absolute -left-4 -top-4 h-5 w-5 text-emerald-300" />
      <Icon className="absolute -right-4 -top-4 h-5 w-5 text-sky-300" />
      <Icon className="absolute -left-4 -bottom-4 h-5 w-5 text-sky-300" />
      <Icon className="absolute -right-4 -bottom-4 h-5 w-5 text-emerald-300" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/60">
        <span>Live log wypłat</span>
        <span className="text-white/50">syncing</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Zweryfikowane cashbacki</p>
          <p className="text-4xl font-semibold text-white">
            ${metrics.totalCashbackPaid.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-white/60">Suma zgłoszona przez społeczność FundedRank</p>
        </div>
        <div className="relative h-44 w-full">
          <EvervaultCard text="FR" className="h-full w-full" />
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <div className="flex flex-col gap-3">
        {payoutLog.map((entry) => (
          <div key={entry.trader} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-white">
            <div>
              <p className="font-semibold">{entry.firm}</p>
              <p className="text-xs text-white/60">{entry.status}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold text-emerald-300">{entry.amount}</p>
              <p className="text-xs text-white/50">
                {entry.trader} • {entry.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PromoCardProps {
  label: string;
  title: string;
  description: string;
  href: string;
}

function PromoCard({ label, title, description, href }: PromoCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.45)]">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">{label}</p>
      <div className="mt-4 space-y-3">
        <p className="text-xl font-semibold text-white">{title}</p>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <Link
        href={href}
        prefetch={false}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:gap-3"
      >
        Otwórz dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
}

function CTAButton({ href, children, variant = "solid" }: CTAButtonProps) {
  if (variant === "ghost") {
    return (
      <Link
        href={href}
        prefetch={false}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-emerald-400 to-sky-500 p-[1px] text-sm font-semibold transition hover:-translate-y-0.5"
    >
      <span className="inline-flex h-full w-full items-center justify-center rounded-[calc(1rem-1px)] bg-black px-5 py-3 text-white">
        {children}
      </span>
    </Link>
  );
}

interface HeroStatProps {
  label: string;
  value: string;
  description: string;
}

function HeroStat({ label, value, description }: HeroStatProps) {
  return (
    <div className="flex flex-col fluid-stack-xs rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-white/80">
      <p className="text-xs uppercase tracking-[0.4em] text-white/50">{label}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}

function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="mr-2 inline-block"
    >
      {word}
    </motion.span>
  );
}

function BackgroundGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-y-0 left-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-y-0 right-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(73,132,232,0.23),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.13),_transparent_60%)]" />
    </div>
  );
}
