"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { Section } from "@/components/layout/section";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { SparklesCore } from "@/components/ui/sparkles";
import { Badge } from "@/components/ui/badge";
import type { HomepageMetrics } from "@/lib/types";

const SEARCH_PLACEHOLDERS = [
  "np. Funding Pips",
  "Alpha Capital",
  "Smart Prop",
  "The Funded Trader",
];

const HERO_WORDS = [
  { text: "Twój" },
  { text: "kompas" },
  { text: "w" },
  { text: "prop" },
  { text: "tradingu.", className: "text-emerald-400" },
];

const PEOPLE = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Soap Developer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
  },
  {
    id: 6,
    name: "Dora",
    designation: "The Explorer",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
  },
];

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

export function HomeHero({ metrics }: HomeHeroProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    },
    [],
  );

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const query = searchValue.trim();
      if (!query) return;
      const params = new URLSearchParams();
      params.set("search", query);
      router.push(`/firmy?${params.toString()}`);
      setSearchValue("");
    },
    [router, searchValue],
  );

  return (
    <Section size="lg" bleed className="relative px-0 py-[clamp(2rem,3vw,3.5rem)]">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-4 text-white">
        <div className="relative flex flex-col items-center gap-12">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-full max-w-4xl -translate-x-1/2">
            <div className="relative h-full w-full">
              <div className="absolute left-1/2 top-0 h-[2px] w-4/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <div className="absolute left-1/2 top-1 h-[4px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm" />
              <SparklesCore
                background="transparent"
                minSize={0.5}
                maxSize={1.2}
                particleDensity={900}
                particleColor="#C0E7FF"
                className="absolute top-[18px] h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-transparent" />
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <Badge variant="hero" className="w-fit gap-3 border-white/10 text-white/80">
              FundedRank
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Live
            </Badge>
            <div className="space-y-4">
              <TypewriterEffectSmooth
                words={HERO_WORDS}
                className="text-white"
                cursorClassName="bg-emerald-400"
              />
              <p className="max-w-2xl text-base text-white/70">
                Porównuj firmy prop, poluj na cashback i przechodź od razu do kont dostosowanych
                pod Twój styl tradingu. Wszystkie dane — ceny, opinie i promocje — aktualizowane na bieżąco.
              </p>
            </div>
            <PlaceholdersAndVanishInput
              placeholders={SEARCH_PLACEHOLDERS}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
            <div className="flex flex-wrap gap-4">
              <HoverBorderGradient
                as={Link}
                href="/rankingi"
                className="text-white text-sm"
                containerClassName="rounded-full"
              >
                Zobacz ranking
              </HoverBorderGradient>
              <Badge
                asChild
                variant="hero"
                className="rounded-full border-white/15 px-6 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                <Link href="/affilacja">Program cashback</Link>
              </Badge>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-6">
                <AnimatedTooltip items={PEOPLE} />
                <div className="flex items-center gap-2 pl-5">
                  {[...Array(5)].map((_, index) => (
                    <span key={`star-${index}`} className="text-emerald-300 text-xl">★</span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/70">
                Trusted by {metrics.totalReviews.toLocaleString("pl-PL")}+ traderów
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
