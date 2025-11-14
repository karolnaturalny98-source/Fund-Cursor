import { PlansShopList } from "@/components/companies/offers-tab-client";
import type { CompanyWithDetails } from "@/lib/types";

interface CompanyOffersSectionProps {
  company: CompanyWithDetails;
}

export function CompanyOffersSection({ company }: CompanyOffersSectionProps) {
  return (
    <section className="flex flex-col fluid-stack-lg">
      <PlansShopList company={company} />
    </section>
  );
}
