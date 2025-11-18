"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
  cashbackLabel: string;
  cashbackValue: number;
  planFrom: string;
  rank: number;
  angle: number;
  radius: number;
  highlight: string;
  tag?: string;
};

const RADAR_FIRMS: RadarFirm[] = [
  {
    id: 1,
    name: "Flash Funding",
    cashbackLabel: "3% cashback",
    cashbackValue: 3,
    planFrom: "Plan od 499 USD",
    rank: 1,
    angle: 12,
    radius: 88,
    highlight: "Instant funding bez limitu czasu",
    tag: "Instant",
  },
  {
    id: 2,
    name: "Elite Traders",
    cashbackLabel: "8% cashback",
    cashbackValue: 8,
    planFrom: "Plan od 250 USD",
    rank: 2,
    angle: 140,
    radius: 120,
    highlight: "Najwyższy cashback",
    tag: "Cashback max",
  },
  {
    id: 3,
    name: "Rapid Capital",
    cashbackLabel: "6% cashback",
    cashbackValue: 6,
    planFrom: "Plan od 299 USD",
    rank: 3,
    angle: 255,
    radius: 140,
    highlight: "Szybkie wypłaty 24h",
    tag: "24h payout",
  },
  {
    id: 4,
    name: "Nova Prop",
    cashbackLabel: "4% cashback",
    cashbackValue: 4,
    planFrom: "Plan od 199 USD",
    rank: 4,
    angle: 315,
    radius: 105,
    highlight: "2-step challenge",
    tag: "2-step",
  },
  {
    id: 5,
    name: "Core FX Labs",
    cashbackLabel: "5% cashback",
    cashbackValue: 5,
    planFrom: "Plan od 450 USD",
    rank: 5,
    angle: 70,
    radius: 155,
    highlight: "Top ocena społeczności",
    tag: "Community top",
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
                Twój skrót do{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-white to-cyan-200 bg-clip-text text-transparent">
                  najlepszych firm prop
                </span>
                .
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Porównujemy warunki planów, cashback i opinie traderów, żeby wybrać tylko realnych liderów
                rynku prop tradingu.
              </p>
            </div>

            <p className="text-sm font-medium text-white/70">
              {stats.join(" • ")}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex w-full flex-col gap-1">
                <Button
                  asChild
                  variant="primary"
                  className="w-full rounded-full sm:w-auto"
                >
                  <Link href="/rankingi">Zobacz ranking firm</Link>
                </Button>
                <p className="text-xs font-medium text-white/60">Na podstawie analizy z radaru AI</p>
              </div>
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
  const [isDesktop, setIsDesktop] = useState(false);
  const radarRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: radarRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const listener = () => setIsDesktop(mediaQuery.matches);
    listener();
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <motion.div
        ref={radarRef}
        style={{
          scale: isDesktop ? scale : 1,
          y: isDesktop ? translateY : 0,
        }}
        className="relative w-full max-w-sm will-change-transform"
      >
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#041b1b]/80 via-[#030c16]/80 to-[#020205] p-6 shadow-[0_40px_80px_rgba(6,182,212,0.25)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {[0.7, 0.85, 1].map((scaleValue, index) => (
              <div
                key={`ring-${index}`}
                className="absolute left-1/2 top-1/2 h-[82%] w-[82%] rounded-full border border-white/12"
                style={{ transform: `translate(-50%, -50%) scale(${scaleValue})` }}
              />
            ))}
            <div className="absolute inset-x-1/2 h-full w-px -translate-x-1/2 bg-white/10 opacity-70" />
            <div className="absolute inset-y-1/2 h-px w-full -translate-y-1/2 bg-white/10 opacity-70" />
          </div>

          <div className="absolute left-6 top-6 flex max-w-[220px] flex-col gap-1 text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em]">
              AI Radar
            </span>
            <p className="text-xs">
              Każda kropka reprezentuje firmę prop – kolor i wielkość oznaczają jej ranking i cashback.
            </p>
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            <RadarCore />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              {RADAR_FIRMS.map((firm) => (
                <RadarPoint key={firm.id} firm={firm} />
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
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
  const visuals = getPointVisuals(firm.rank, firm.cashbackValue);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${visuals.sizeClass} ${visuals.backgroundClass} ${visuals.glowClass}`}
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
          <div className="mb-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${visuals.backgroundClass}`} />
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">#{firm.rank}</p>
          </div>
          <p className="text-sm font-semibold text-white">{firm.name}</p>
          <p className="text-xs text-white/70">{firm.cashbackLabel}</p>
          <p className="text-xs text-white/70">{firm.planFrom}</p>
          {firm.tag ? (
            <span
              className={`mt-2 inline-flex w-max items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${visuals.tagTextClass} ${visuals.tagBorderClass}`}
            >
              {firm.tag}
            </span>
          ) : null}
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

function getPointVisuals(rank: number, cashbackValue: number) {
  const sizeClass =
    rank === 1 ? "h-[22px] w-[22px]" : rank === 2 || rank === 3 ? "h-[15px] w-[15px]" : "h-[11px] w-[11px]";

  let backgroundClass = "bg-white/45";
  let glowClass = "shadow-[0_0_18px_rgba(255,255,255,0.35)]";
  let tagTextClass = "text-white/70";
  let tagBorderClass = "border-white/20";

  if (cashbackValue >= 7) {
    backgroundClass = "bg-gradient-to-br from-emerald-300 to-cyan-300";
    glowClass = "shadow-[0_0_40px_rgba(16,185,129,0.95)]";
    tagTextClass = "text-emerald-200";
    tagBorderClass = "border-emerald-300/40";
  } else if (cashbackValue >= 4) {
    backgroundClass = "bg-cyan-200";
    glowClass = "shadow-[0_0_25px_rgba(6,182,212,0.55)]";
    tagTextClass = "text-cyan-100";
    tagBorderClass = "border-cyan-200/40";
  }

  return {
    sizeClass,
    backgroundClass,
    glowClass,
    tagTextClass,
    tagBorderClass,
  };
}
