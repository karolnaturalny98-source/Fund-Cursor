"use client";

import { Layers, Gauge, Receipt, Shield, Check, CircleSlash, TrendingUp, BarChart3, Search } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import React, { useMemo, useState } from "react";

interface AccordionItemClientProps {
  value: string;
  iconName: string;
  label: string;
  count: number;
  children: React.ReactNode;
}

export function AccordionItemClient({ value, iconName, label, count, children }: AccordionItemClientProps) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Layers,
    Gauge,
    Receipt,
    Shield,
  };
  const Icon = IconMap[iconName] || Layers;

  return (
    <AccordionItem
      value={value}
      className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
            <PremiumIcon icon={Icon} variant="glow" size="md" hoverGlow />
          </div>
          <div className="flex-1 text-left">
            <span className="font-semibold">{label}</span>
            <PremiumBadge variant="glow" className="ml-2 rounded-full text-xs font-semibold">
              {count}
            </PremiumBadge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

interface InstrumentGroupCardProps {
  title: string;
  description?: string | null;
  instruments: string[];
}

// Helper function to categorize instruments
function getInstrumentCategory(instrument: string): { category: string; color: string; icon: React.ComponentType<{ className?: string }> } {
  const lower = instrument.toLowerCase();
  
  if (lower.includes("forex") || lower.includes("fx") || lower.includes("eur") || lower.includes("usd") || lower.includes("gbp")) {
    return { category: "Forex", color: "bg-blue-500/10 text-blue-700 border-blue-500/20", icon: TrendingUp };
  }
  if (lower.includes("crypto") || lower.includes("btc") || lower.includes("eth") || lower.includes("bitcoin")) {
    return { category: "Crypto", color: "bg-amber-500/10 text-amber-700 border-amber-500/20", icon: BarChart3 };
  }
  if (lower.includes("stock") || lower.includes("equity") || lower.includes("index")) {
    return { category: "Stocks", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", icon: Layers };
  }
  if (lower.includes("commodity") || lower.includes("gold") || lower.includes("oil") || lower.includes("silver")) {
    return { category: "Commodities", color: "bg-purple-500/10 text-purple-700 border-purple-500/20", icon: Gauge };
  }
  
  return { category: "Other", color: "bg-muted text-muted-foreground border-border/60", icon: Check };
}

export function InstrumentGroupCard({ title, description, instruments }: InstrumentGroupCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  const sectionScrollAnim = useScrollAnimation({ threshold: 0.1 });
  const staggerItems = useStaggerAnimation(instruments.length, 50);
  
  const filteredInstruments = useMemo(() => {
    if (!searchQuery.trim()) return instruments;
    const query = searchQuery.toLowerCase();
    return instruments.filter((item) => item.toLowerCase().includes(query));
  }, [instruments, searchQuery]);

  const categorizedInstruments = useMemo(() => {
    const categories: Record<string, string[]> = {};
    filteredInstruments.forEach((instrument) => {
      const { category } = getInstrumentCategory(instrument);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(instrument);
    });
    return categories;
  }, [filteredInstruments]);

  const totalInstruments = instruments.length;
  const visibleInstruments = filteredInstruments.length;

  // Trigger stagger when section is visible
  const visibleStaggerItems = sectionScrollAnim.isVisible ? staggerItems : new Array(instruments.length).fill(true);

  return (
    <Card 
      ref={(node) => {
        sectionAnim.ref.current = node;
        sectionScrollAnim.ref.current = node;
      }}
      className={`rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md ${sectionAnim.className}`}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-1 text-xs text-muted-foreground">{description}</CardDescription>
            ) : null}
          </div>
          <Badge variant="outline" className="shrink-0 text-xs font-semibold">
            {totalInstruments}
          </Badge>
        </div>
        
        {/* Search */}
        {totalInstruments > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj instrumentu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! pl-9 pr-3 text-xs shadow-xs"
            />
          </div>
        )}
        
        {/* Progress bar showing availability */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dostępność</span>
            <span className="font-medium text-foreground">{visibleInstruments}/{totalInstruments}</span>
          </div>
          <Progress value={(visibleInstruments / totalInstruments) * 100} className="h-1.5" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {Object.keys(categorizedInstruments).length > 0 ? (
          Object.entries(categorizedInstruments).map(([category, items]) => {
            const { color, icon: Icon } = getInstrumentCategory(items[0]);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md border p-1 ${color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{category}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => {
                    const itemAnim = visibleStaggerItems[index] || false;
                    const { color: itemColor } = getInstrumentCategory(item);
                    return (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2.5 py-1.5 text-xs transition-all hover:border-primary/30 hover:bg-card/72 ${
                          itemAnim ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                        style={{
                          "--delay": `${index * 50}ms`,
                        } as React.CSSProperties}
                        className="transition-all duration-300 delay-[var(--delay)]"
                      >
                        <PremiumIcon icon={Check} variant="glow" size="sm" className="h-3 w-3 shrink-0 text-primary" />
                        <span className="flex-1 text-muted-foreground">{item}</span>
                        <Badge variant="outline" className={`${itemColor} border text-[10px] font-normal px-1.5 py-0`}>
                          {category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center text-xs text-muted-foreground">
            Brak instrumentów pasujących do wyszukiwania.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CommissionCardProps {
  market: string;
  value: string;
  notes?: string | null;
}

export function CommissionCard({ market, value, notes }: CommissionCardProps) {
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  
  // Extract numeric value from string (e.g., "0.5 pips" -> 0.5)
  const numericValue = useMemo(() => {
    const match = value.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }, [value]);

  return (
    <Card 
      ref={sectionAnim.ref}
      className={`rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md ${sectionAnim.className}`}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold">{market}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
            {value}
          </Badge>
        </div>
      </CardHeader>
      {notes ? (
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 text-xs text-muted-foreground">
            {notes}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

interface RulesCardProps {
  type: "allowed" | "restricted";
  rules: string[];
}

export function RulesCard({ type, rules }: RulesCardProps) {
  const Icon = type === "allowed" ? Check : CircleSlash;
  const isAllowed = type === "allowed";
  
  return (
    <Card className={`rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs ${isAllowed ? "border-emerald-500/20 bg-emerald-500/10" : "border-rose-500/20 bg-rose-500/10"}`}>
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className={`flex items-center gap-2 text-sm font-semibold ${isAllowed ? "text-emerald-700" : "text-rose-700"}`}>
          <PremiumIcon icon={Icon} variant={isAllowed ? "glow" : "default"} size="md" />
          {isAllowed ? "Dozwolone" : "Zabronione"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rules.length > 0 ? (
          <ul className={`space-y-1.5 text-xs ${isAllowed ? "text-emerald-700" : "text-rose-700"}`}>
            {rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <PremiumIcon icon={Icon} variant={isAllowed ? "glow" : "default"} size="sm" className="mt-0.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isAllowed ? "Brak zdefiniowanych zasad." : "Brak ograniczeń."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

