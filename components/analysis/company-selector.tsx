"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  rating?: number | null;
  country?: string | null;
}

interface CompanySelectorProps {
  companies: CompanyOption[];
  initialSelection?: string[];
}

const MAX_SELECTION = 3;

export function CompanySelector({ companies, initialSelection = [] }: CompanySelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    initialSelection.slice(0, MAX_SELECTION)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }

    const query = searchQuery.toLowerCase();
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.slug.toLowerCase().includes(query) ||
        company.country?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const handleToggle = useCallback((slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= MAX_SELECTION) {
        return prev;
      }
      return [...prev, slug];
    });
  }, []);

  const handleRemove = useCallback((slug: string) => {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }, []);

  const handleClear = useCallback(() => {
    setSelected([]);
  }, []);

  const handleStartAnalysis = useCallback(() => {
    if (selected.length === 0) {
      return;
    }
    router.push(`/analizy/${selected.join("/")}`);
  }, [selected, router]);

  const selectedCompanies = useMemo(() => {
    return companies.filter((c) => selected.includes(c.slug));
  }, [companies, selected]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Szukaj firm po nazwie, slug lub kraju..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-2xl border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]!"
        />
      </div>

      {/* Selected Companies */}
      {selected.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Wybrane firmy ({selected.length}/{MAX_SELECTION})
            </h3>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Wyczyść wszystkie
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCompanies.map((company) => (
              <Card
                key={company.slug}
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <CardContent className="p-4">
                  <button
                    onClick={() => handleRemove(company.slug)}
                    className="absolute right-2 top-2 rounded-full p-1 hover:bg-destructive/10"
                    aria-label="Usuń"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>

                  <div className="flex items-start gap-3">
                    {company.logoUrl ? (
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={company.logoUrl} alt={company.name} />
                        <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-xs font-semibold">
                          {company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-xs font-semibold">
                          {company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold leading-tight">
                        {company.name}
                      </h4>
                      {company.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            ⭐ {company.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {company.country && (
                        <Badge variant="outline" className="text-xs">
                          {company.country}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleStartAnalysis}
            disabled={selected.length === 0}
            size="lg"
            className="w-full"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Rozpocznij analizę ({selected.length})
          </Button>
        </div>
      )}

      {/* Company List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Dostępne firmy ({filteredCompanies.length})
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const isSelected = selected.includes(company.slug);
            const canSelect = !isSelected && selected.length < MAX_SELECTION;

            return (
              <button
                key={company.slug}
                onClick={() => handleToggle(company.slug)}
                disabled={!isSelected && !canSelect}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-4 text-left transition-all shadow-xs",
                  "hover:border-primary/50 hover:shadow-md",
                  isSelected && "border-primary/50 bg-primary/5",
                  !isSelected && !canSelect && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {company.logoUrl ? (
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={company.logoUrl} alt={company.name} />
                      <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-xs font-semibold">
                        {company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-xs font-semibold">
                        {company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium leading-tight group-hover:text-primary">
                      {company.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {company.rating && (
                        <span>⭐ {company.rating.toFixed(1)}</span>
                      )}
                      {company.country && (
                        <Badge variant="outline" className="text-xs">
                          {company.country}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p>Nie znaleziono firm pasujących do wyszukiwania.</p>
          </div>
        )}
      </div>
    </div>
  );
}

