import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompanyHeroClient } from "@/components/companies/company-hero-client";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { CompareToggle } from "@/components/companies/compare-toggle";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Star } from "lucide-react";
import { CompanyInfoClient } from "@/components/companies/company-page-client";
import { SocialLinksClient } from "@/components/companies/social-links-client";
import { PurchaseCard } from "@/components/companies/purchase-card";
import type { CompanyPlan, CompanyWithDetails } from "@/lib/types";
import { getCountryFlag } from "@/lib/country";

type CompanySocialLink = {
  key: string;
  label: string;
  url: string;
};

interface CompanyHeaderSectionProps {
  company: CompanyWithDetails;
  defaultPlan: CompanyPlan | null;
  socialLinks: CompanySocialLink[];
  tosUrl: string | null;
}

export function CompanyHeaderSection({
  company,
  defaultPlan,
  socialLinks,
  tosUrl,
}: CompanyHeaderSectionProps) {
  return (
    <CompanyHeroClient>
      <div className="relative flex flex-col fluid-stack-lg">
        <div className="flex items-start gap-[clamp(0.75rem,1vw,1rem)]">
          {company.logoUrl ? (
            <Avatar className="h-[clamp(4rem,2.5vw+3.5rem,5rem)] w-[clamp(4rem,2.5vw+3.5rem,5rem)] rounded-2xl border-2 border-primary/20 shadow-md ring-2 ring-primary/10">
              <AvatarImage src={company.logoUrl} alt={company.name} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 fluid-copy font-semibold">
                {company.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <div className="flex flex-col fluid-stack-sm">
            <div className="flex flex-wrap items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <h1 className="fluid-h1 font-bold tracking-tight">{company.name}</h1>
              <FavoriteButton
                companyId={company.id}
                companySlug={company.slug}
                initialFavorite={company.viewerHasFavorite}
                size="icon"
              />
              <CompareToggle slug={company.slug} size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-[clamp(0.6rem,0.8vw,0.75rem)] fluid-caption text-muted-foreground">
              {company.rating ? (
                <PremiumBadge variant="glow" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] gap-[clamp(0.2rem,0.3vw,0.25rem)] bg-amber-500/10 ring-1 ring-amber-500/20">
                  <Star className="h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)] fill-amber-400 text-amber-400 drop-shadow-xs" />
                  {company.rating.toFixed(1)}
                </PremiumBadge>
              ) : null}
              {company.country ? (
                <span className="inline-flex items-center gap-[clamp(0.3rem,0.5vw,0.375rem)]">
                  <span className="fluid-copy">{getCountryFlag(company.country)}</span>
                  <span>{company.country}</span>
                </span>
              ) : null}
              {company.foundedYear ? (
                <span>Rok założenia: {company.foundedYear}</span>
              ) : null}
            </div>
          </div>
        </div>

        {(company.legalName || company.ceo || company.headquartersAddress || company.foundersInfo) && (
          <div className="flex flex-col fluid-stack-sm rounded-xl border border-border/40 bg-muted/20 p-[clamp(0.75rem,1vw,1rem)]">
            {company.legalName && (
              <div className="flex items-start gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-copy">
                <span className="text-muted-foreground">Nazwa prawna:</span>
                <span className="font-medium text-foreground">{company.legalName}</span>
              </div>
            )}
            {company.ceo && (
              <div className="flex items-start gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-copy">
                <span className="text-muted-foreground">CEO:</span>
                <span className="font-medium text-foreground">{company.ceo}</span>
              </div>
            )}
            {company.headquartersAddress && (
              <div className="flex items-start gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-copy">
                <span className="text-muted-foreground">Adres siedziby:</span>
                <span className="font-medium text-foreground">{company.headquartersAddress}</span>
              </div>
            )}
            {company.foundersInfo && (
              <div className="flex items-start gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-copy">
                <span className="text-muted-foreground">Założyciele:</span>
                <span className="font-medium text-foreground">{company.foundersInfo}</span>
              </div>
            )}
          </div>
        )}

        <CompanyInfoClient
          paymentMethods={company.paymentMethods}
          platforms={company.platforms}
          instruments={company.instruments}
        />

        <SocialLinksClient socialLinks={socialLinks} tosUrl={tosUrl} />
      </div>

      <PurchaseCard
        companySlug={company.slug}
        discountCode={company.discountCode}
        websiteUrl={company.websiteUrl}
        cashbackRate={company.cashbackRate}
        defaultPlan={defaultPlan}
        copyMetrics={company.copyMetrics}
      />
    </CompanyHeroClient>
  );
}
