"use client";

import { useMemo, useState } from "react";
import { Shield, Check, CircleSlash, Search, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Using simple state for collapsible instead of Collapsible component
import { PremiumIcon } from "@/components/custom/premium-icon";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import { ChevronDown } from "lucide-react";

interface RulesSectionProps {
  allowed: string[];
  restricted: string[];
}

const CHART_COLORS = {
  allowed: "hsl(var(--emerald-500))",
  restricted: "hsl(var(--rose-500))",
};

export function RulesSection({ allowed, restricted }: RulesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAllowed, setExpandedAllowed] = useState(true);
  const [expandedRestricted, setExpandedRestricted] = useState(true);
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  const sectionScrollAnim = useScrollAnimation({ threshold: 0.1 });
  const staggerItems = useStaggerAnimation(allowed.length + restricted.length, 30);

  const filteredAllowed = useMemo(() => {
    if (!searchQuery.trim()) return allowed;
    const query = searchQuery.toLowerCase();
    return allowed.filter((rule) => rule.toLowerCase().includes(query));
  }, [allowed, searchQuery]);

  const filteredRestricted = useMemo(() => {
    if (!searchQuery.trim()) return restricted;
    const query = searchQuery.toLowerCase();
    return restricted.filter((rule) => rule.toLowerCase().includes(query));
  }, [restricted, searchQuery]);

  const pieChartData = useMemo(() => {
    return [
      {
        name: "Dozwolone",
        value: allowed.length,
        fill: CHART_COLORS.allowed,
      },
      {
        name: "Zabronione",
        value: restricted.length,
        fill: CHART_COLORS.restricted,
      },
    ];
  }, [allowed.length, restricted.length]);

  const visibleStaggerItems = sectionScrollAnim.isVisible ? staggerItems : new Array(allowed.length + restricted.length).fill(true);

  const totalRules = allowed.length + restricted.length;

  return (
    <div 
      ref={(node) => {
        sectionAnim.ref.current = node;
        sectionScrollAnim.ref.current = node;
      }} 
      className={`space-y-6 ${sectionAnim.className}`}
    >
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Wszystkie zasady</p>
              <p className="text-2xl font-semibold">{totalRules}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dozwolone</p>
              <p className="text-2xl font-semibold text-emerald-600">{allowed.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Zabronione</p>
              <p className="text-2xl font-semibold text-rose-600">{restricted.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {totalRules > 0 && (
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Rozkład zasad
            </CardTitle>
            <CardDescription className="text-xs">
              Proporcje dozwolonych i zabronionych zasad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                allowed: {
                  label: "Dozwolone",
                  color: CHART_COLORS.allowed,
                },
                restricted: {
                  label: "Zabronione",
                  color: CHART_COLORS.restricted,
                },
              }}
              className="h-[250px] w-full"
            >
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {totalRules > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj w zasadach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! pl-9 pr-3 text-xs shadow-xs"
          />
        </div>
      )}

      {/* Rules Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Allowed Rules */}
        <Card className={`rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md border-emerald-500/20 bg-emerald-500/10`}>
          <CardHeader 
            className="cursor-pointer space-y-2 pb-3"
            onClick={() => setExpandedAllowed(!expandedAllowed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-emerald-700">
                <PremiumIcon icon={Check} variant="glow" size="md" />
                Dozwolone
                <Badge variant="outline" className="ml-2 text-xs font-semibold bg-emerald-500/20 text-emerald-700">
                  {allowed.length}
                </Badge>
              </CardTitle>
              <ChevronDown className={`h-4 w-4 text-emerald-700 transition-transform ${expandedAllowed ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
          {expandedAllowed && (
            <CardContent className="space-y-2 pt-0">
              {filteredAllowed.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-emerald-700">
                  {filteredAllowed.map((rule, index) => {
                    const itemAnim = visibleStaggerItems[index] || false;
                    return (
                      <li
                        key={rule}
                        className={`flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 transition-all ${
                          itemAnim ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        }`}
                        style={{
                          transitionDelay: `${index * 30}ms`,
                          transitionDuration: "300ms",
                        }}
                      >
                        <PremiumIcon icon={Check} variant="glow" size="sm" className="mt-0.5 shrink-0 h-3 w-3" />
                        <span className="flex-1">{rule}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {searchQuery.trim() ? "Brak wyników dla wyszukiwania." : "Brak zdefiniowanych zasad."}
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Restricted Rules */}
        <Card className={`rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md border-rose-500/20 bg-rose-500/10`}>
          <CardHeader 
            className="cursor-pointer space-y-2 pb-3"
            onClick={() => setExpandedRestricted(!expandedRestricted)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-rose-700">
                <PremiumIcon icon={CircleSlash} variant="default" size="md" />
                Zabronione
                <Badge variant="outline" className="ml-2 text-xs font-semibold bg-rose-500/20 text-rose-700">
                  {restricted.length}
                </Badge>
              </CardTitle>
              <ChevronDown className={`h-4 w-4 text-rose-700 transition-transform ${expandedRestricted ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
          {expandedRestricted && (
            <CardContent className="space-y-2 pt-0">
              {filteredRestricted.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-rose-700">
                  {filteredRestricted.map((rule, index) => {
                    const itemAnim = visibleStaggerItems[allowed.length + index] || false;
                    return (
                      <li
                        key={rule}
                        className={`flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2 transition-all ${
                          itemAnim ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        }`}
                        style={{
                          transitionDelay: `${(allowed.length + index) * 30}ms`,
                          transitionDuration: "300ms",
                        }}
                      >
                        <PremiumIcon icon={CircleSlash} variant="default" size="sm" className="mt-0.5 shrink-0 h-3 w-3" />
                        <span className="flex-1">{rule}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {searchQuery.trim() ? "Brak wyników dla wyszukiwania." : "Brak ograniczeń."}
                </p>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

