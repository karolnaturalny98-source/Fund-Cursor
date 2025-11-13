"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Building2, MessageSquare, Award, Trophy, Medal, BarChart3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFadeIn, useStaggerAnimation } from "@/lib/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RankingsPageClientProps {
  filteredCompanies: number;
  totalCompanies: number;
  averageScore: number;
  totalNewReviews: number;
  totalReviews: number;
  topOverall: Array<{
    id: string;
    name: string;
    slug: string;
    scores: { overall: number };
    reviewCount: number;
    favoritesCount: number;
  }>;
  totalCompaniesCount: number;
  uniqueCountries: number;
  uniqueEvaluationModels: number;
  uniqueAccountTypes: number;
}

export function RankingsPageClient({
  filteredCompanies,
  totalCompanies,
  averageScore,
  totalNewReviews,
  totalReviews,
  topOverall,
  totalCompaniesCount: _totalCompaniesCount,
  uniqueCountries: _uniqueCountries,
  uniqueEvaluationModels: _uniqueEvaluationModels,
  uniqueAccountTypes: _uniqueAccountTypes,
}: RankingsPageClientProps) {
  const heroAnim = useFadeIn({ rootMargin: "-100px" });
  const badgeAnim = useFadeIn({ rootMargin: "-100px" });
  const titleAnim = useFadeIn({ rootMargin: "-100px" });
  const descriptionAnim = useFadeIn({ rootMargin: "-100px" });
  const buttonsAnim = useFadeIn({ rootMargin: "-50px" });
  const statsVisible = useStaggerAnimation(3, 100);

  return (
    <>
      <div ref={heroAnim.ref} className={`flex flex-col gap-4 ${heroAnim.className}`}>
        <div ref={badgeAnim.ref} className={badgeAnim.className}>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            Rankingi
          </Badge>
        </div>
        <div className="max-w-3xl space-y-3">
          <h1 ref={titleAnim.ref} className={`text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl ${titleAnim.className}`}>
            Kompletny ranking prop firm FundedRank
          </h1>
          <p ref={descriptionAnim.ref} className={`text-sm text-muted-foreground sm:text-base ${descriptionAnim.className}`}>
            Porownaj firmy z perspektywy warunkow handlowych, satysfakcji z
            wyplat, aktywnosci spolecznosci, cashbacku oraz dynamiki
            wzrostu. Jeden widok - wiele rankingow.
          </p>
        </div>
        <div ref={buttonsAnim.ref} className={`flex flex-wrap items-center gap-3 ${buttonsAnim.className}`}>
          <Button asChild variant="primary" className="group rounded-full px-6 transition-transform duration-300 hover:scale-105" size="lg">
            <Link href="/firmy" prefetch={false} className="flex items-center">
              Przejdz do listy firm
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="premium-outline" className="rounded-full px-6 transition-transform duration-300 hover:scale-105" size="lg">
            <Link href="/opinie" prefetch={false}>
              Zobacz opinie spolecznosci
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
        <StatCard
          title="Firm w zestawieniu"
          subtitle={`${totalCompanies.toLocaleString("pl-PL")} lacznie`}
          value={filteredCompanies.toLocaleString("pl-PL")}
          icon={Building2}
          isVisible={statsVisible[0]}
        />
        <StatCard
          title="Ocena ogolna"
          subtitle="Srednia wazona rankingu glownego"
          value={averageScore.toFixed(1)}
          emphasis="/ 100"
          icon={Award}
          isVisible={statsVisible[1]}
        />
        <StatCard
          title="Nowe opinie 30 dni"
          subtitle={`${totalReviews.toLocaleString("pl-PL")} opinii lacznie`}
          value={totalNewReviews.toLocaleString("pl-PL")}
          icon={MessageSquare}
          isVisible={statsVisible[2]}
        />
      </div>

      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">Liderzy rankingu ogolnego</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
            {topOverall.length > 0 ? (
              topOverall.map((company, index) => {
                const getPositionIcon = () => {
                  if (index === 0) return <Trophy className="h-4 w-4 text-amber-500" />;
                  if (index === 1) return <Medal className="h-4 w-4 text-slate-400" />;
                  if (index === 2) return <Medal className="h-4 w-4 text-amber-700" />;
                  return null;
                };
                const positionBadgeColor =
                  index === 0
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : index === 1
                      ? "bg-slate-400/10 text-slate-600 border-slate-400/30"
                      : index === 2
                        ? "bg-amber-700/10 text-amber-700 border-amber-700/30"
                        : "bg-muted text-muted-foreground";

                return (
                  <Card
                    key={company.id}
                    className="group relative overflow-hidden rounded-lg border border-border/40 bg-background/60 shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {getPositionIcon()}
                          <Badge variant="outline" className={`rounded-full text-xs font-semibold uppercase tracking-wide ${positionBadgeColor}`}>
                            #{index + 1}
                          </Badge>
                        </div>
                        <Badge variant="default" className="rounded-full px-2.5 py-0.5 text-xs">
                          {company.scores.overall.toFixed(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-semibold">
                        <Link
                          href={`/firmy/${company.slug}`}
                          prefetch={false}
                          className="transition-colors hover:text-primary"
                        >
                          {company.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 pt-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {company.reviewCount.toLocaleString("pl-PL")} opinii
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {company.favoritesCount.toLocaleString("pl-PL")} obserwujacych
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="sm:col-span-3">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Brak wynikow liderow dla wybranych filtrow. Zmien kryteria, aby zobaczyc firmy z najwyzszymi
                    ocenami.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({
  title,
  subtitle,
  value,
  emphasis,
  icon: Icon,
  isVisible = true,
}: {
  title: string;
  subtitle: string;
  value: number | string;
  emphasis?: string;
  icon: React.ComponentType<{ className?: string }>;
  isVisible?: boolean;
}) {
  return (
    <Card className={`group relative overflow-hidden rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! p-2.5 shadow-xs transition-all duration-300 hover:border-border/60 hover:bg-card/66 hover:scale-[1.02] hover:-translate-y-0.5 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-primary" />
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{title}:</span>
            <span className="text-xs font-semibold text-foreground">
              {value}
              {emphasis && <span className="text-muted-foreground/80 font-normal"> {emphasis}</span>}
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/60 leading-tight ml-0">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function RankingsMethodologyClient({
  totalCompanies,
  totalReviews,
  uniqueCountries,
  uniqueEvaluationModels,
  uniqueAccountTypes,
}: {
  totalCompanies: number;
  totalReviews: number;
  uniqueCountries: number;
  uniqueEvaluationModels: number;
  uniqueAccountTypes: number;
}) {
  const numberFormatter = new Intl.NumberFormat("pl-PL");

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Metodologia rankingu
          </h2>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          FundedRank scala recenzje spolecznosci, parametry planow oraz
          sygnaly cashback i klikniec partnerskich. Aktualizujemy dataset
          kazdej nocy, aby ranking reagowal na zmiany reputacji i aktywnosci
          firm. Punkty normalizujemy wzgledem liderow, zeby mniejsze marki
          mogly pokazac swoje mocne strony.
        </p>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Zrodla danych
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-semibold text-foreground">
                {numberFormatter.format(totalCompanies)} firm,{" "}
                {numberFormatter.format(totalReviews)} opinii,{" "}
                {numberFormatter.format(uniqueCountries)} krajow
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Modele i konta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-semibold text-foreground">
                {numberFormatter.format(uniqueEvaluationModels)} model(e) oceny i{" "}
                {numberFormatter.format(uniqueAccountTypes)} typ(y) kont
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 sm:col-span-2 lg:col-span-1">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Wagi filarow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground">
                Ogolny wynik: warunki 25%, wyplaty 20%, spolecznosc 20%,
                cashback 15%, wzrost 20%. Trend wzrostu oceniamy na podstawie
                klikniec, nowych opinii i obserwacji profilu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
            <Info className="h-4 w-4" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground">FAQ</h3>
        </div>
        <Accordion type="single" collapsible className="grid gap-4 md:grid-cols-2">
          <AccordionItem value="faq-1" className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! px-6 shadow-xs">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
              Jak czesto odswiezacie dane?
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-sm text-muted-foreground">
                Recenzje i klikniecia aktualizujemy co noc. Transakcje
                cashback i raporty wyplat spinamy w tygodniowe batchowanie.
                Ostatnia data generacji widnieje w badge &quot;Dane odswiezone&quot;
                nad tabelami.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2" className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! px-6 shadow-xs">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
              Co robi filtr &quot;Min. opinii&quot;?
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-sm text-muted-foreground">
                Pozwala ograniczyc wynik do firm z co najmniej zadana liczba
                recenzji. Dzieki temu latwiej porownac stabilne marki, gdy
                zalezy Ci na duzej probie opinii.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3" className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! px-6 shadow-xs md:col-span-2">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
              Czy planujecie dodatkowe filtry?
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-sm text-muted-foreground">
                Na roadmapie mamy filtry dla wsparcia jezykowego,
                ograniczen geograficznych oraz maksymalnego profitu.
                Mozesz zglaszac swoje potrzeby przez formularz feedbacku na
                stronie glownej.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}

