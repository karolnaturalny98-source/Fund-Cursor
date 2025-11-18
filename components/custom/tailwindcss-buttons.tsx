"use client";
import React from "react";
import { Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";

export const ButtonsCard = ({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[var(--surface-base)] text-white transition duration-200 hover:border-white/25",
      className
    )}
  >
      <div className="absolute inset-0 bg-dot-white/[0.08]" />
      <Clipboard className="absolute right-2 top-2 hidden h-4 w-4 text-white/60 transition duration-200 group-hover/btn:block" />
      <div className="relative z-40">{children}</div>
    </div>
  );
};
