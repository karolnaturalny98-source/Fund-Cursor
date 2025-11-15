"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { SurfaceCard } from "@/components/layout/surface-card";
import { EvervaultCard } from "@/components/ui/evervault-card";

interface LiveCashbackBannerProps {
  amount: number;
  stats: { label: string; value: string }[];
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function LiveCashbackBanner({ amount, stats }: LiveCashbackBannerProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const previous = useRef(amount);

  useEffect(() => {
    const startValue = previous.current;
    const target = amount;
    previous.current = target;
    const duration = 2000;
    let raf: number;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(startValue + (target - startValue) * progress);
      setDisplayAmount(value);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [amount]);

  return (
    <SurfaceCard
      variant="glass"
      padding="lg"
      className="flex flex-col items-center gap-8 border border-white/10 bg-[#050505] text-white"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Live cashback</p>
        <motion.div
          key={displayAmount}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-5xl font-semibold"
        >
          {formatter.format(displayAmount)}
        </motion.div>
        <p className="text-sm text-white/60">Zweryfikowane wypłaty zgłoszone przez społeczność FundedRank</p>
      </div>
      <div className="relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <EvervaultCard text="FR" className="h-full w-full" />
      </div>
      <div className="grid w-full gap-4 text-center sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
