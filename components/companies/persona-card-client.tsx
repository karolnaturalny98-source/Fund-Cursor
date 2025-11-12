"use client";

import Link from "next/link";
import { Zap, TrendingUp, Layers, Award, Gauge, Users, ExternalLink } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface PersonaCard {
  id: string;
  title: string;
  description: string;
  recommendations: string[];
  planName?: string | null;
  iconName: string;
  color: string;
}

interface PersonaCardClientProps {
  persona: PersonaCard;
}

export function PersonaCardClient({ persona }: PersonaCardClientProps) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    TrendingUp,
    Layers,
    Award,
    Gauge,
    Users,
  };
  const Icon = IconMap[persona.iconName] || Users;

  const colorClasses = {
    emerald: "hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-transparent",
    blue: "hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent",
    purple: "hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-transparent",
    amber: "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent",
    rose: "hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-transparent",
    sky: "hover:bg-gradient-to-r hover:from-sky-500/10 hover:to-transparent",
  };

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border-gradient bg-gradient-card shadow-premium transition-all duration-200 hover:border-gradient-premium hover:shadow-premium-lg",
        colorClasses[persona.color as keyof typeof colorClasses] || colorClasses.sky,
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/20">
            <PremiumIcon icon={Icon} variant="glow" size="md" hoverGlow />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight">{persona.title}</CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">{persona.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {persona.recommendations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {persona.recommendations.map((item) => (
              <PremiumBadge key={item} variant="outline" className="rounded-full text-xs font-semibold">
                {item}
              </PremiumBadge>
            ))}
          </div>
        ) : null}
      </CardContent>
      {persona.planName ? (
        <CardFooter className="pt-0">
          <div className="flex w-full items-center justify-between rounded-lg border-gradient bg-gradient-card px-3 py-2 shadow-premium">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Polecany plan</p>
              <p className="text-sm font-semibold text-foreground">{persona.planName}</p>
            </div>
            <Button size="sm" variant="premium-outline" asChild className="h-auto rounded-full p-0">
              <Link href="#challenges">
                <PremiumIcon icon={ExternalLink} variant="glow" size="sm" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

