"use client";

import Image from "next/image";
import React, { useRef, useState, type MouseEvent } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

interface AnimatedTooltipItem {
  id: number;
  name: string;
  designation: string;
  image: string;
}

interface AnimatedTooltipProps {
  items: AnimatedTooltipItem[];
  className?: string;
}

export const AnimatedTooltip = ({ items, className }: AnimatedTooltipProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const target = event.currentTarget;
      if (!target) {
        return;
      }
      const halfWidth = target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  return (
    <div className={cn("flex items-center", className)}>
      {items.map((item, index) => (
        <div
          className={cn(
            "group relative",
            index === 0 ? "ml-0" : "-ml-8",
          )}
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2 text-xs text-white/90 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.6)] backdrop-blur-md"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="relative z-30 text-base font-semibold text-white">
                  {item.name}
                </div>
                <div className="text-xs text-white/75">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative h-16 w-16 overflow-hidden rounded-[32%] border border-white/20 bg-white/[0.04]">
            <Image
              onMouseMove={handleMouseMove}
              alt={item.name}
              className="h-full w-full object-cover object-center"
              src={item.image}
              width={64}
              height={64}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
