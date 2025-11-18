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
  direction: 1 | -1;
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
  tag?: string;
};

const ORBIT_CONFIGS: OrbitConfig[] = [
  { id: 1, size: 75, duration: 22, padding: 7, direction: 1, borderStyle: "dashed" },
  { id: 2, size: 90, duration: 38, padding: 6, direction: -1, borderStyle: "solid" },
  { id: 3, size: 100, duration: 30, padding: 5, direction: 1, borderStyle: "dashed" },
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
    tag: "Instant funding",
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
    tag: "Cashback max",
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
    tag: "24h payout",
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
    tag: "2-step",
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
    tag: "Community top",
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
    tag: "1-step",
  },
];

const ORBIT_RING_STYLES = [
  { id: "inner", scale: "scale-75", border: "border-white/10" },
  { id: "middle", scale: "scale-90", border: "border-white/7" },
  { id: "outer", scale: "scale-100", border: "border-white/5" },
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
                Twój skrót do{" "}
                <span className="bg-gradient-to-r from-white via-emerald-100/80 to-cyan-100/90 bg-clip-text text-transparent">
                  najlepszych
                </span>{" "}
                firm prop.
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Porównujemy warunki planów, cashback i opinie traderów, żeby wybrać tylko realnych liderów
                rynku prop tradingu.
              </p>
            </div>

            <p className="text-sm font-medium text-white/80">
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
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="relative h-full w-full rounded-[3rem] bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_70%)]">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-2/5 w-2/5 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_80%)]" />
          </div>

          <div className="absolute inset-0">
            {ORBIT_RING_STYLES.map((ring) => (
              <div
                key={ring.id}
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full rounded-full border border-white/10 origin-center",
                  ring.scale,
                  ring.border,
                )}
              />
            ))}
          </div>

          {ORBIT_CONFIGS.map((orbit) => (
            <motion.div
              key={`orbit-${orbit.id}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: `${orbit.size}%`, height: `${orbit.size}%` }}
              animate={{ rotate: orbit.direction === -1 ? -360 : 360 }}
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
          animate={{ y: ["-2px", "2px", "-2px"], x: ["-1px", "1px", "-1px"] }}
          transition={{ duration: 7 + firm.orbit, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.15 }}
        >
          <Avatar className="h-11 w-11 rounded-full border border-white/40 bg-transparent text-[0.8rem] font-semibold uppercase text-black/80 shadow-[0_0_12px_rgba(0,0,0,0.7)]">
            <AvatarFallback className={cn("bg-gradient-to-br text-[0.75rem] font-semibold uppercase text-black/80", firm.accent)}>
              {firm.initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="max-w-xs border border-white/15 bg-[#03060a]/90 px-4 py-3 text-white shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Prop firma</p>
        <p className="text-sm font-semibold text-white">{firm.name}</p>
        <p className="text-[11px] text-emerald-200">{firm.cashback}</p>
        <p className="text-[11px] text-white/70">{firm.planFrom}</p>
        {firm.tag ? <p className="text-[11px] text-white/50">{firm.tag}</p> : null}
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
