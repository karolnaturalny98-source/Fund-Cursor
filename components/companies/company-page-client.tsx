"use client";

import Link from "next/link";
import { Receipt, Layers, Gauge, ExternalLink, Sparkles, Shield, FileText, Clock, BookOpen, LifeBuoy, Check, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface CompanyInfoClientProps {
  paymentMethods: string[];
  platforms: string[];
  instruments: string[];
}

export function CompanyInfoClient({ paymentMethods, platforms, instruments }: CompanyInfoClientProps) {
  if (!paymentMethods.length && !platforms.length && !instruments.length) {
    return null;
  }

  return (
    <Card className="rounded-2xl border border-border/60 p-4 shadow-xs bg-card/72">
      <div className="grid gap-3 sm:grid-cols-3">
        {paymentMethods.length ? (
          <div className="flex items-center gap-2">
            <PremiumIcon icon={Receipt} variant="glow" size="default" />
            <PremiumBadge variant="outline" className="text-xs">
              Płatności: {paymentMethods.join(", ")}
            </PremiumBadge>
          </div>
        ) : null}
        {platforms.length ? (
          <div className="flex items-center gap-2">
            <PremiumIcon icon={Layers} variant="glow" size="default" />
            <PremiumBadge variant="outline" className="text-xs">
              Platformy: {platforms.join(", ")}
            </PremiumBadge>
          </div>
        ) : null}
        {instruments.length ? (
          <div className="flex items-center gap-2">
            <PremiumIcon icon={Gauge} variant="glow" size="default" />
            <PremiumBadge variant="outline" className="text-xs">
              Instrumenty: {instruments.join(", ")}
            </PremiumBadge>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

interface ChecklistItemClientProps {
  item: {
    id: string;
    title: string;
    description: string;
    recommended: boolean;
    iconName: string;
  };
}

export function ChecklistItemClient({ item }: ChecklistItemClientProps) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield,
    Layers,
    FileText,
    Clock,
    BookOpen,
    LifeBuoy,
  };
  const Icon = IconMap[item.iconName] || Check;

  return (
    <Card className="group rounded-lg border border-border/40 shadow-xs transition-all bg-background/60 hover:border-border/60 hover:bg-card/48">
      <CardContent className="flex items-start gap-2.5 p-3">
        <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold text-foreground leading-tight">{item.title}</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ResourceCardClientProps {
  link: string;
  resourceType: { label: string; iconName: string };
  index: number;
}

export function ResourceCardClient({ link, resourceType, index }: ResourceCardClientProps) {
  const formatLinkLabel = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const IconMap: Record<string, LucideIcon> = {
    BookOpen,
    FileText,
    ExternalLink,
  };
  const ResourceIcon = IconMap[resourceType.iconName] || ExternalLink;

  return (
    <Card className="group rounded-2xl border border-border/60 shadow-xs transition-all hover:border-primary/50 hover:shadow-md bg-card/72">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
            <ResourceIcon className="h-5 w-5" />
          </div>
          <PremiumBadge variant="outline" className="rounded-full text-xs font-semibold">
            {resourceType.label}
          </PremiumBadge>
        </div>
        <CardTitle className="text-sm font-semibold">Zasób #{index + 1}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">{formatLinkLabel(link)}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button variant="premium-outline" size="sm" className="w-full rounded-full" asChild>
          <Link href={link} target="_blank" rel="noreferrer">
            Otwórz materiał
            <PremiumIcon icon={ExternalLink} variant="glow" size="sm" className="ml-2" hoverGlow />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface DefaultPlanCardClientProps {
  planName: string;
  cashbackRate: number | null;
}

export function DefaultPlanCardClient({ planName, cashbackRate }: DefaultPlanCardClientProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/60 shadow-xs transition-all hover:border-primary/50 hover:shadow-md bg-card/72">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 text-primary transition-colors group-hover:bg-primary/30">
            <PremiumIcon icon={Sparkles} variant="glow" size="md" hoverGlow />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">Skrót ofertowy</CardTitle>
            <CardDescription className="mt-1 text-sm leading-relaxed">
              Popularny plan <span className="font-semibold text-foreground">{planName}</span> z cashbackiem do{" "}
              {cashbackRate ?? 0} pkt.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button size="sm" variant="premium" className="w-full rounded-full" asChild>
          <Link href="#offers">Zobacz wszystkie oferty</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface RulesGridClientProps {
  rows: Array<{
    label: string;
    value: string;
    iconName: string;
  }>;
}

export function RulesGridClient({ rows }: RulesGridClientProps) {
  const IconMap: Record<string, LucideIcon> = {
    Shield,
    LifeBuoy,
    TrendingUp,
    BookOpen,
    Receipt,
    Gauge,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => {
        const Icon = IconMap[row.iconName] || ExternalLink;
        return (
          <Card
            key={row.label}
            className="group rounded-2xl border border-border/60 shadow-xs transition-all hover:border-primary/50 hover:shadow-md bg-card/72"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                <PremiumIcon icon={Icon} variant="glow" size="md" hoverGlow />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <CardDescription className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </CardDescription>
                <CardTitle className="text-sm font-semibold leading-relaxed text-foreground">{row.value}</CardTitle>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

