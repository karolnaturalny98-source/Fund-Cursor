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
    <div className="container space-y-8 py-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div ref={badgeAnim.ref} className={badgeAnim.className}>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              Sklep
            </Badge>
          </div>
          <div className="max-w-3xl">
            <h1 ref={titleAnim.ref} className={`text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl ${titleAnim.className}`}>
              Wybierz konto prop trading
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! p-4 shadow-xs transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <div className="text-xs text-muted-foreground">Firm</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! p-4 shadow-xs transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
            <div className="text-2xl font-bold">{totalPlans}</div>
            <div className="text-xs text-muted-foreground">Planów</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! p-4 shadow-xs transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
            <div className="text-2xl font-bold">{avgCashback}%</div>
            <div className="text-xs text-muted-foreground">Śr. cashback</div>
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

        <TabsContent value={activeTab} className="mt-6">
          <Card className="border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Wybierz firmę</CardTitle>
              <CardDescription>
                Wybierz firmę, której konto chcesz zakupić
              </CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card className="border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Wybierz plan</CardTitle>
              <CardDescription>
                Wybierz plan konta, który Cię interesuje
              </CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card className="border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Kup teraz</CardTitle>
              <CardDescription>
                Wypełnij formularz, aby otrzymać link afiliacyjny
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShopPurchaseForm
                company={selectedCompany}
                plan={selectedPlan}
                userId={userId}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
