"use client";

import { useFadeIn } from "@/lib/animations";

interface CompanyHeroClientProps {
  children: React.ReactNode;
}

export function CompanyHeroClient({ children }: CompanyHeroClientProps) {
  const heroAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <header
      ref={heroAnim.ref}
      className={`relative grid gap-8 overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-8 shadow-xs lg:grid-cols-[minmax(0,1fr)_340px] ${heroAnim.className}`}
    >
      {/* Subtle background pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      {children}
    </header>
  );
}

