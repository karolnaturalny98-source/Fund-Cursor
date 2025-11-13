"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";

import { CreateCompanyForm } from "@/components/forms/company-form";
import { CreateCompanyPlanForm } from "@/components/forms/company-plan-form";
import { CompanyFaqForm } from "@/components/forms/company-faq-form";
import { CompanyFaqItemForm } from "@/components/forms/company-faq-item-form";
import { CompanyTradingProfileForm } from "@/components/forms/company-trading-profile-form";
import { TeamManagementForm } from "@/components/admin/team-management-form";
import { CompanyTimelineForm } from "@/components/admin/company-timeline-form";
import { CompanyCertificationsForm } from "@/components/admin/company-certifications-form";
import { CompanyMediaForm } from "@/components/admin/company-media-form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminCompany } from "@/lib/queries/companies";

interface CompanyManagementPanelProps {
  companies: AdminCompany[];
}

export function CompanyManagementPanel({ companies }: CompanyManagementPanelProps) {
  const router = useRouter();
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<{ companySlug: string; planId: string } | null>(null);
  const [deleteCompanyDialog, setDeleteCompanyDialog] = useState<{ slug: string; name: string } | null>(null);
  const [deletePlanDialog, setDeletePlanDialog] = useState<{ companySlug: string; planId: string; planName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formKeys, setFormKeys] = useState<Record<string, number>>({});
  
  // Persist tab state per company using localStorage
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load saved tab states from localStorage
    const saved = localStorage.getItem("admin-company-tabs");
    if (saved) {
      try {
        setActiveTabs(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Create form keys based on company data hash to force remount when data changes
  const companyDataHashes = useMemo(() => {
    const hashes: Record<string, string> = {};
    companies.forEach((company) => {
      // Create a hash of all company data to detect changes
      hashes[company.slug] = JSON.stringify({
        name: company.name,
        slug: company.slug,
        headline: company.headline,
        logoUrl: company.logoUrl,
        shortDescription: company.shortDescription,
        country: company.country,
        foundedYear: company.foundedYear,
        websiteUrl: company.websiteUrl,
        discountCode: company.discountCode,
        cashbackRate: company.cashbackRate,
        payoutFrequency: company.payoutFrequency,
        highlights: company.highlights,
        regulation: company.regulation,
        supportContact: company.supportContact,
        socials: company.socials,
        paymentMethods: company.paymentMethods,
        instruments: company.instruments,
        platforms: company.platforms,
        educationLinks: company.educationLinks,
        kycRequired: company.kycRequired,
        ceo: company.ceo,
        legalName: company.legalName,
        headquartersAddress: company.headquartersAddress,
        foundersInfo: company.foundersInfo,
        verificationStatus: company.verificationStatus,
        licenses: company.licenses,
        registryLinks: company.registryLinks,
        registryData: company.registryData,
      });
    });
    return hashes;
  }, [companies]);
  
  const getTabValue = (companySlug: string) => {
    return activeTabs[companySlug] || "plans";
  };
  
  const setTabValue = (companySlug: string, value: string) => {
    const updated = { ...activeTabs, [companySlug]: value };
    setActiveTabs(updated);
    localStorage.setItem("admin-company-tabs", JSON.stringify(updated));
  };

  const handleDeleteCompany = () => {
    if (!deleteCompanyDialog) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/companies/${deleteCompanyDialog.slug}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć firmy.");
          return;
        }

        setDeleteCompanyDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania firmy.");
      }
    });
  };

  const handleDeletePlan = () => {
    if (!deletePlanDialog) return;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/companies/${deletePlanDialog.companySlug}/plans/${deletePlanDialog.planId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć planu.");
          return;
        }

        setDeletePlanDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania planu.");
      }
    });
  };

  const _company = companies.find((c) => c.slug === editingCompany);

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Brak firm w bazie. Dodaj pierwszą firmę, aby rozpocząć konfigurację treści.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {companies.map((company) => (
            <AccordionItem key={company.id} value={company.id}>
              <AccordionTrigger className="text-left">
                <div className="flex flex-col gap-1 items-start">
                  <span className="font-semibold">{company.name}</span>
                  <span className="text-xs text-muted-foreground">/{company.slug}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col fluid-stack-lg pt-[clamp(1rem,1.5vw,1.25rem)]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">Kraj: {company.country ?? "brak danych"}</Badge>
                      <Badge variant="outline">Cashback: {company.cashbackRate ?? 0} pkt</Badge>
                      <Badge variant="outline">Rating: {company.rating ?? "n/d"}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCompany(editingCompany === company.slug ? null : company.slug)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {editingCompany === company.slug ? "Anuluj edycję" : "Edytuj firmę"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteCompanyDialog({ slug: company.slug, name: company.name })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń
                      </Button>
                    </div>
                  </div>

                  {editingCompany === company.slug && (
                    <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
                      <CardContent className="pt-6">
                        <CreateCompanyForm
                          key={`${company.slug}-${companyDataHashes[company.slug] || formKeys[company.slug] || 0}`}
                          editSlug={company.slug}
                          initialData={{
                            name: company.name,
                            slug: company.slug,
                            headline: company.headline,
                            logoUrl: company.logoUrl,
                            shortDescription: company.shortDescription,
                            country: company.country,
                            foundedYear: company.foundedYear,
                            websiteUrl: company.websiteUrl,
                            discountCode: company.discountCode,
                            cashbackRate: company.cashbackRate,
                            payoutFrequency: company.payoutFrequency,
                            highlights: company.highlights,
                            regulation: company.regulation,
                            supportContact: company.supportContact,
                            socials: company.socials as Record<string, string> | null | undefined,
                            paymentMethods: company.paymentMethods,
                            instruments: company.instruments,
                            platforms: company.platforms,
                            educationLinks: company.educationLinks,
                            kycRequired: company.kycRequired,
                            ceo: company.ceo,
                            legalName: company.legalName,
                            headquartersAddress: company.headquartersAddress,
                            foundersInfo: company.foundersInfo,
                            verificationStatus: company.verificationStatus,
                            licenses: company.licenses,
                            registryLinks: company.registryLinks,
                            registryData: company.registryData
                              ? typeof company.registryData === "string"
                                ? company.registryData
                                : JSON.stringify(company.registryData)
                              : null,
                          }}
                          onSuccess={async () => {
                            // Close form first
                            setEditingCompany(null);
                            // Refresh server data
                            router.refresh();
                            // Small delay to ensure refresh completes, then update form key
                            setTimeout(() => {
                              setFormKeys((prev) => ({
                                ...prev,
                                [company.slug]: (prev[company.slug] || 0) + 1,
                              }));
                            }, 100);
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  <Tabs 
                    value={getTabValue(company.slug)} 
                    onValueChange={(value) => setTabValue(company.slug, value)}
                    className="w-full"
                  >
                    <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
                      <TabsTrigger
                        value="plans"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Dodaj plan
                      </TabsTrigger>
                      <TabsTrigger
                        value="trading"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Profil tradingowy
                      </TabsTrigger>
                      <TabsTrigger
                        value="leverage"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Segmenty dźwigni
                      </TabsTrigger>
                      <TabsTrigger
                        value="commissions"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Prowizje
                      </TabsTrigger>
                      <TabsTrigger
                        value="faq"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        FAQ firmy
                      </TabsTrigger>
                      <TabsTrigger
                        value="team"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Zespół
                      </TabsTrigger>
                      <TabsTrigger
                        value="timeline"
                        className={cn(
                          "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Historia firmy
                      </TabsTrigger>
                      <TabsTrigger
                        value="certifications"
                        className={cn(
                          "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Certyfikaty
                      </TabsTrigger>
                      <TabsTrigger
                        value="media"
                        className={cn(
                          "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                          "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                          "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
                        )}
                      >
                        Media i prasa
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="plans">
                      <div className="flex flex-col fluid-stack-sm">
                        {company.plans.length ? (
                          <div className="flex flex-col fluid-stack-sm">
                            {company.plans.map((planItem) => (
                              <Card key={planItem.id} className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
                                <CardContent className="pt-4">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">{planItem.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {planItem.evaluationModel === "instant-funding"
                                          ? "Instant funding"
                                          : planItem.evaluationModel === "one-step"
                                          ? "1-etapowe wyzwanie"
                                          : "2-etapowe wyzwanie"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-right text-sm font-semibold text-foreground">
                                        {formatCurrency(planItem.price, planItem.currency)}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setEditingPlan(
                                            editingPlan?.planId === planItem.id
                                              ? null
                                              : { companySlug: company.slug, planId: planItem.id },
                                          )
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setDeletePlanDialog({
                                            companySlug: company.slug,
                                            planId: planItem.id,
                                            planName: planItem.name,
                                          })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  <dl className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    <div>
                                      <dt className="font-semibold text-foreground">Profit split</dt>
                                      <dd>{planItem.profitSplit ?? "n/d"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-semibold text-foreground">Max drawdown</dt>
                                      <dd>
                                        {typeof planItem.maxDrawdown === "number"
                                          ? planItem.maxDrawdown.toLocaleString("pl-PL")
                                          : "n/d"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-semibold text-foreground">Minimalne dni</dt>
                                      <dd>{planItem.minTradingDays ?? "n/d"}</dd>
                                    </div>
                                  </dl>
                                  {planItem.features.length ? (
                                    <p className="mt-2 text-xs text-muted-foreground">{planItem.features.join(", ")}</p>
                                  ) : null}
                                  {editingPlan?.planId === planItem.id && (
                                    <div className="mt-4 pt-4 border-t">
                                      <CreateCompanyPlanForm
                                        companySlug={company.slug}
                                        planId={planItem.id}
                                        initialData={{
                                          name: planItem.name,
                                          price: planItem.price,
                                          currency: planItem.currency,
                                          profitSplit: planItem.profitSplit,
                                          evaluationModel: planItem.evaluationModel,
                                          description: planItem.description,
                                          features: planItem.features,
                                          maxDrawdown: planItem.maxDrawdown,
                                          maxDailyLoss: planItem.maxDailyLoss,
                                          profitTarget: planItem.profitTarget,
                                          minTradingDays: planItem.minTradingDays,
                                          payoutFirstAfterDays: planItem.payoutFirstAfterDays,
                                          payoutCycleDays: planItem.payoutCycleDays,
                                          leverage: planItem.leverage,
                                          accountType: planItem.accountType,
                                          affiliateUrl: planItem.affiliateUrl,
                                          notes: planItem.notes,
                                          trailingDrawdown: planItem.trailingDrawdown ?? undefined,
                                          refundableFee: planItem.refundableFee ?? undefined,
                                          scalingPlan: planItem.scalingPlan ?? undefined,
                                        }}
                                        onSuccess={() => {
                                          setEditingPlan(null);
                                          router.refresh();
                                        }}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border/60 bg-muted/40 p-4">
                            Brak planów. Dodaj pierwszy plan, aby firma pojawiła się w rankingu.
                          </p>
                        )}
                        <CreateCompanyPlanForm companySlug={company.slug} />
                      </div>
                    </TabsContent>

                    <TabsContent value="trading">
                      <CompanyTradingProfileForm
                        companySlug={company.slug}
                        instrumentGroups={company.instrumentGroups}
                        leverageTiers={company.leverageTiers}
                        tradingCommissions={company.tradingCommissions}
                        firmRules={company.firmRules}
                        showSections={["instrumentGroups", "firmRules"]}
                      />
                    </TabsContent>

                    <TabsContent value="leverage">
                      <CompanyTradingProfileForm
                        companySlug={company.slug}
                        instrumentGroups={company.instrumentGroups}
                        leverageTiers={company.leverageTiers}
                        tradingCommissions={company.tradingCommissions}
                        firmRules={company.firmRules}
                        showSections={["leverageTiers"]}
                      />
                    </TabsContent>

                    <TabsContent value="commissions">
                      <CompanyTradingProfileForm
                        companySlug={company.slug}
                        instrumentGroups={company.instrumentGroups}
                        leverageTiers={company.leverageTiers}
                        tradingCommissions={company.tradingCommissions}
                        firmRules={company.firmRules}
                        showSections={["commissions"]}
                      />
                    </TabsContent>

                    <TabsContent value="faq">
                      <div className="flex flex-col fluid-stack-sm">
                        {company.faqs.length ? (
                          <div className="flex flex-col fluid-stack-sm">
                            {company.faqs.map((faq) => (
                              <CompanyFaqItemForm
                                key={faq.id}
                                companySlug={company.slug}
                                faqId={faq.id}
                                question={faq.question}
                                answer={faq.answer}
                                order={faq.order}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border/60 bg-muted/40 p-4">
                            Brak pytań FAQ. Dodaj wpisy, aby odpowiedzieć na najczęstsze wątpliwości.
                          </p>
                        )}
                        <CompanyFaqForm companySlug={company.slug} />
                      </div>
                    </TabsContent>

                    <TabsContent value="team">
                      <TeamManagementForm companySlug={company.slug} />
                    </TabsContent>

                    <TabsContent value="timeline">
                      <CompanyTimelineForm companySlug={company.slug} />
                    </TabsContent>

                    <TabsContent value="certifications">
                      <CompanyCertificationsForm companySlug={company.slug} />
                    </TabsContent>

                    <TabsContent value="media">
                      <CompanyMediaForm companySlug={company.slug} />
                    </TabsContent>
                  </Tabs>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Delete Company Dialog */}
      <Dialog open={Boolean(deleteCompanyDialog)} onOpenChange={(open) => !open && setDeleteCompanyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń firmę</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć firmę <strong>{deleteCompanyDialog?.name}</strong>? Ta operacja jest
              nieodwracalna. Firma nie może być usunięta, jeśli ma zatwierdzone lub zrealizowane transakcje cashback.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCompanyDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Dialog */}
      <Dialog open={Boolean(deletePlanDialog)} onOpenChange={(open) => !open && setDeletePlanDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń plan</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć plan <strong>{deletePlanDialog?.planName}</strong>? Ta operacja jest
              nieodwracalna. Plan nie może być usunięty, jeśli ma aktywne spory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePlanDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("pl-PL")} ${currency.toUpperCase()}`;
  }
}

