"use client";

import { useState, useMemo } from "react";
import { ShopCompanyCards } from "./shop-company-cards";
import { ShopPlanCard } from "./shop-plan-card";
import { ShopPurchaseForm } from "./shop-purchase-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFadeIn } from "@/lib/animations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyWithPlans } from "@/lib/queries/companies";
import { TrendingUp, Star } from "lucide-react";
import { Section } from "@/components/layout/section";

interface ShopPageClientProps {
  companies: CompanyWithPlans[];
  userId: string | null;
}

export function ShopPageClient({ companies, userId }: ShopPageClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Animations
  const badgeAnim = useFadeIn({ rootMargin: "-100px" });
  const titleAnim = useFadeIn({ rootMargin: "-100px" });

  const selectedCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) ?? null;
  }, [companies, selectedCompanyId]);

  const selectedPlan = useMemo(() => {
    if (!selectedCompany) return null;
    return selectedCompany.plans.find((p) => p.id === selectedPlanId) ?? null;
  }, [selectedCompany, selectedPlanId]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedPlanId("");
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const totalPlans = companies.reduce((sum, c) => sum + c.plans.length, 0);
  const avgCashback = useMemo(() => {
    const companiesWithCashback = companies.filter((c) => (c.cashbackRate ?? 0) > 0);
    if (companiesWithCashback.length === 0) return 0;
    const sum = companiesWithCashback.reduce((acc, c) => acc + (c.cashbackRate ?? 0), 0);
    return Math.round(sum / companiesWithCashback.length);
  }, [companies]);

  // Filter companies by tab
  const filteredCompanies = useMemo(() => {
    if (activeTab === "highest-cashback") {
      return [...companies]
        .filter((c) => (c.cashbackRate ?? 0) > 0)
        .sort((a, b) => (b.cashbackRate ?? 0) - (a.cashbackRate ?? 0));
    } else if (activeTab === "popular") {
      return [...companies].sort((a, b) => {
        const aRating = typeof a.rating === "number" ? a.rating : 0;
        const bRating = typeof b.rating === "number" ? b.rating : 0;
        return bRating - aRating;
      });
    }
    return companies;
  }, [companies, activeTab]);

  return (
    <Section size="lg" className="flex flex-col fluid-stack-xl">
      {/* Hero Section */}
      <div className="flex flex-col fluid-stack-lg">
        <div className="flex flex-col items-center fluid-stack-md text-center">
          <div ref={badgeAnim.ref} className={badgeAnim.className}>
            <Badge variant="outline" className="w-fit rounded-full fluid-badge uppercase tracking-[0.2em]">
              Sklep
            </Badge>
          </div>
          <div className="max-w-3xl">
            <h1
              ref={titleAnim.ref}
              className={`text-foreground ${titleAnim.className} fluid-h1 font-bold tracking-tight`}
            >
              Wybierz konto prop trading
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto grid max-w-3xl grid-cols-3 fluid-stack-sm">
          <div className="rounded-2xl border border-border/40 bg-background/60 fluid-card-pad-md shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
            <div className="font-semibold text-foreground fluid-h2">{totalCompanies}</div>
            <div className="text-muted-foreground fluid-caption">Firm</div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/60 fluid-card-pad-md shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
            <div className="font-semibold text-foreground fluid-h2">{totalPlans}</div>
            <div className="text-muted-foreground fluid-caption">Planów</div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/60 fluid-card-pad-md shadow-xs transition-all hover:border-border/60 hover:bg-card/66 backdrop-blur-[36px]!">
            <div className="font-semibold text-primary fluid-h2">{avgCashback}%</div>
            <div className="text-muted-foreground fluid-caption">Śr. cashback</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs for Company Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Wszystkie firmy</TabsTrigger>
          <TabsTrigger value="highest-cashback">
            <TrendingUp className="mr-2 h-4 w-4" />
            Najwyższy cashback
          </TabsTrigger>
          <TabsTrigger value="popular">
            <Star className="mr-2 h-4 w-4" />
            Najpopularniejsze
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 lg:mt-8">
          <Card className="border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="font-semibold text-foreground fluid-copy">Wybierz firmę</CardTitle>
              <CardDescription className="fluid-caption">
                Wybierz firmę, której konto chcesz zakupić
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ShopCompanyCards
                companies={filteredCompanies}
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={handleCompanyChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plans Section */}
      {selectedCompany && (
        <>
          <Separator />
          <Card className="border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="font-semibold text-foreground fluid-copy">Wybierz plan</CardTitle>
              <CardDescription className="fluid-caption">
                Wybierz plan konta, który Cię interesuje
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCompany.plans.map((plan) => (
                  <ShopPlanCard
                    key={plan.id}
                    plan={plan}
                    company={selectedCompany}
                    isSelected={plan.id === selectedPlanId}
                    onSelect={() => handlePlanChange(plan.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Purchase Form */}
      {selectedPlan && selectedCompany && (
        <>
          <Separator />
          <Card className="border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="font-semibold text-foreground fluid-copy">Kup teraz</CardTitle>
              <CardDescription className="fluid-caption">
                Wypełnij formularz, aby otrzymać link afiliacyjny
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ShopPurchaseForm
                company={selectedCompany}
                plan={selectedPlan}
                userId={userId}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Section>
  );
}
