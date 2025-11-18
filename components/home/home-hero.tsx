"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { HomepageMetrics } from "@/lib/types";

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

type RadarFirm = {
  id: number;
  name: string;
  cashback: string;
  planFrom: string;
  rank: number;
  angle: number;
  radius: number;
  highlight: string;
};

const RADAR_FIRMS: RadarFirm[] = [
  {
    id: 1,
    name: "Flash Funding",
    cashback: "3% cashback",
    planFrom: "Plan od 499 USD",
    rank: 1,
    angle: 12,
    radius: 88,
    highlight: "Instant funding bez limitu czasu",
  },
  {
    id: 2,
    name: "Elite Traders",
    cashback: "8% cashback",
    planFrom: "Plan od 250 USD",
    rank: 2,
    angle: 140,
    radius: 120,
    highlight: "Najwyższy cashback",
  },
  {
    id: 3,
    name: "Rapid Capital",
    cashback: "6% cashback",
    planFrom: "Plan od 299 USD",
    rank: 3,
    angle: 255,
    radius: 140,
    highlight: "Szybkie wypłaty 24h",
  },
  {
    id: 4,
    name: "Nova Prop",
    cashback: "4% cashback",
    planFrom: "Plan od 199 USD",
    rank: 4,
    angle: 315,
    radius: 105,
    highlight: "2-step challenge",
  },
  {
    id: 5,
    name: "Core FX Labs",
    cashback: "5% cashback",
    planFrom: "Plan od 450 USD",
    rank: 5,
    angle: 70,
    radius: 155,
    highlight: "Top ocena społeczności",
  },
];

export function HomeHero({ metrics }: HomeHeroProps) {
  const stats = [
    `${Math.max(metrics.totalCompanies, 40)}+ firm w bazie`,
    `${Math.max(metrics.totalReviews, 800)}+ opinii`,
    "do 8% cashbacku",
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <Section
        size="lg"
        bleed
        className="relative isolate overflow-hidden bg-background px-0 py-16 sm:py-20"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6 text-white">
            <Badge variant="hero" className="w-fit gap-3 border-white/10 text-white/80">
              FUNDEDRANK
              <span className="h-1 w-1 rounded-full bg-emerald-400" aria-hidden="true" />
              LIVE
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Twój skrót do najlepszych firm prop.
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Porównujemy warunki planów, cashback i opinie traderów, żeby wybrać tylko realnych liderów
                rynku prop tradingu.
              </p>
            </div>

            <p className="text-sm font-medium text-white/60">
              {stats.join(" • ")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                asChild
                variant="primary"
                className="w-full rounded-full sm:w-auto"
              >
                <Link href="/rankingi">Zobacz ranking firm</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/affilacja">Program cashback</Link>
              </Button>
            </div>
          </div>

          <AITradingRadar />
        </div>
      </Section>
    </TooltipProvider>
  );
}

function AITradingRadar() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#041b1b]/80 via-[#030c16]/80 to-[#020205] p-6 shadow-[0_40px_80px_rgba(6,182,212,0.25)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={`ring-${index}`}
                className="absolute inset-0 rounded-[2.5rem] border border-white/5"
                style={{
                  inset: `${index * 8 + 8}px`,
                }}
              />
            ))}
            <div className="absolute inset-x-1/2 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-y-1/2 w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
            AI Radar
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            <RadarCore />
            {RADAR_FIRMS.map((firm) => (
              <RadarPoint key={firm.id} firm={firm} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarCore() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={`pulse-${index}`}
          className="absolute h-full w-full rounded-full border border-emerald-400/30"
          animate={{
            opacity: [0.9, 0.2, 0],
            scale: [0.6 + index * 0.1, 1.1 + index * 0.15, 1.2 + index * 0.2],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: index * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.div
        className="relative h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-300 to-cyan-400 shadow-[0_0_40px_rgba(16,185,129,0.7)]"
        animate={{
          scale: [0.95, 1, 0.97],
          rotate: [0, 5, -3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute h-20 w-20 rounded-full border border-emerald-400/30"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

function RadarPoint({ firm }: { firm: RadarFirm }) {
  const { x, y } = polarToCartesian(firm.angle, firm.radius);
  const highlightColor =
    firm.rank === 1 ? "bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.65)]" : "bg-white/70 shadow-[0_0_15px_rgba(255,255,255,0.35)]";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${highlightColor}`}
          style={{
            top: `calc(50% + ${y}px)`,
            left: `calc(50% + ${x}px)`,
          }}
          animate={{
            y: ["-4px", "4px", "-4px"],
          }}
          transition={{
            duration: 3.5 + firm.rank * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="sr-only">{firm.name}</span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="border border-white/20 bg-black/85 p-0 text-white"
      >
        <Card variant="ghost" className="border-white/15 bg-white/5 p-4 shadow-[0_20px_45px_rgba(7,89,133,0.35)]">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">#{firm.rank}</p>
          <p className="text-sm font-semibold text-white">{firm.name}</p>
          <p className="text-xs text-white/70">{firm.cashback}</p>
          <p className="text-xs text-white/70">{firm.planFrom}</p>
          <p className="text-xs text-white/60">{firm.highlight}</p>
        </Card>
      </TooltipContent>
    </Tooltip>
  );
}

function polarToCartesian(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;
  return { x, y };
}
