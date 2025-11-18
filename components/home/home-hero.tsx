"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { HomepageMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

type OrbitConfig = {
  id: number;
  size: number;
  duration: number;
  padding: number;
  borderStyle?: "dashed" | "solid";
};

type OrbitFirm = {
  id: number;
  name: string;
  cashback: string;
  planFrom: string;
  orbit: number;
  angle: number;
  initials: string;
  accent: string;
};

const ORBIT_CONFIGS: OrbitConfig[] = [
  { id: 1, size: 58, duration: 32, padding: 7, borderStyle: "dashed" },
  { id: 2, size: 78, duration: 42, padding: 6, borderStyle: "solid" },
  { id: 3, size: 96, duration: 54, padding: 5, borderStyle: "dashed" },
];

const ORBIT_FIRMS: OrbitFirm[] = [
  {
    id: 1,
    name: "Flash Funding",
    cashback: "3% cashback",
    planFrom: "Plan od 499 USD",
    orbit: 1,
    angle: 20,
    initials: "FF",
    accent: "from-emerald-300 to-cyan-300",
  },
  {
    id: 2,
    name: "Elite Traders",
    cashback: "8% cashback",
    planFrom: "Plan od 499 USD",
    orbit: 2,
    angle: 120,
    initials: "ET",
    accent: "from-cyan-300 to-sky-500",
  },
  {
    id: 3,
    name: "Rapid Capital",
    cashback: "6% cashback",
    planFrom: "Plan od 499 USD",
    orbit: 2,
    angle: 230,
    initials: "RC",
    accent: "from-emerald-200 to-emerald-400",
  },
  {
    id: 4,
    name: "Nova Prop",
    cashback: "4% cashback",
    planFrom: "Plan od 199 USD",
    orbit: 3,
    angle: 310,
    initials: "NP",
    accent: "from-cyan-200 to-emerald-200",
  },
  {
    id: 5,
    name: "Core FX Labs",
    cashback: "5% cashback",
    planFrom: "Plan od 349 USD",
    orbit: 3,
    angle: 45,
    initials: "CL",
    accent: "from-teal-200 to-emerald-300",
  },
  {
    id: 6,
    name: "Orbit Funding",
    cashback: "2% cashback",
    planFrom: "Plan od 149 USD",
    orbit: 1,
    angle: 200,
    initials: "OF",
    accent: "from-cyan-200 to-white",
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
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Twój skrót do najlepszych firm prop.
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Porównujemy warunki planów, cashback i opinie traderów, żeby wybrać tylko realnych liderów
                rynku prop tradingu.
              </p>
            </div>

            <p className="text-sm font-medium text-white/70">
              {stats.join(" • ")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                asChild
                size="lg"
                variant="primary"
                className="w-full bg-emerald-400 text-slate-950 shadow-[0_25px_80px_-30px_rgba(16,185,129,0.65)] transition-all hover:bg-emerald-300 sm:w-auto"
              >
                <Link href="/rankingi">Zobacz ranking firm</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/5 text-white/80 backdrop-blur md:w-auto"
              >
                <Link href="/affilacja">Program cashback</Link>
              </Button>
            </div>
          </div>

          <PropTradingPlanet />
        </div>
      </Section>
    </TooltipProvider>
  );
}

function PropTradingPlanet() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,#020205_0%,rgba(1,2,5,0.85)_55%,transparent_80%)]"
          aria-hidden="true"
        />
        <div className="relative h-full w-full">
          {ORBIT_CONFIGS.map((orbit) => (
            <div
              key={`ring-${orbit.id}`}
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border",
                orbit.id === 2 ? "border-white/15" : "border-white/10",
                orbit.borderStyle === "dashed" ? "border-dashed" : "border-solid",
              )}
              style={{
                width: `${orbit.size}%`,
                height: `${orbit.size}%`,
                opacity: orbit.id === 2 ? 0.25 : 0.18,
              }}
            />
          ))}

          <PlanetCore />

          {ORBIT_CONFIGS.map((orbit) => (
            <motion.div
              key={`orbit-${orbit.id}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: `${orbit.size}%`, height: `${orbit.size}%` }}
              animate={{ rotate: 360 }}
              transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative h-full w-full">
                {ORBIT_FIRMS.filter((firm) => firm.orbit === orbit.id).map((firm) => (
                  <OrbitFirmChip key={firm.id} firm={firm} orbitPadding={orbit.padding} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanetCore() {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 flex h-72 w-72 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,#00f5a0_0%,#00d9f5_45%,rgba(0,30,60,0.2)_100%)] blur-[2px]"
        animate={{
          scale: [0.98, 1.02, 0.99],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute h-80 w-80 rounded-full bg-emerald-400/15 blur-[140px]" />
      <div className="absolute h-96 w-96 rounded-full border border-cyan-200/10" />
      <motion.div
        className="relative h-48 w-48 rounded-full bg-[radial-gradient(circle,#0b1f29_0%,#07131a_65%,rgba(2,6,10,0.4)_100%)] shadow-[0_0_120px_rgba(0,214,255,0.25)]"
        animate={{
          scale: [0.96, 1, 0.97],
          rotate: [0, 6, -4, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute h-64 w-64 rounded-full border border-cyan-200/20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function OrbitFirmChip({ firm, orbitPadding }: { firm: OrbitFirm; orbitPadding: number }) {
  const radius = 50 - orbitPadding;
  const { x, y } = polarToCartesian(firm.angle, radius);
  const left = `${(50 + x).toFixed(2)}%`;
  const top = `${(50 + y).toFixed(2)}%`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left, top }}
          animate={{ y: ["-4px", "4px", "-4px"] }}
          transition={{ duration: 6 + firm.orbit, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white shadow-[0_20px_55px_rgba(1,3,12,0.75)] backdrop-blur-xl">
            <Avatar className="h-9 w-9 rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-transparent text-[0.7rem] font-semibold uppercase text-white/90 shadow-[0_0_20px_rgba(0,214,255,0.45)]">
              <AvatarFallback className={`bg-gradient-to-br ${firm.accent} text-[0.65rem] font-semibold uppercase text-slate-950`}>
                {firm.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-white">{firm.name}</span>
              <span className="text-[10px] text-emerald-200">{firm.cashback}</span>
            </div>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="max-w-xs border border-white/15 bg-slate-950/90 px-4 py-3 text-white shadow-[0_25px_65px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <p className="text-xs font-semibold text-white">{firm.name}</p>
        <p className="text-[11px] text-emerald-200">{firm.cashback}</p>
        <p className="text-[11px] text-white/70">{firm.planFrom}</p>
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
