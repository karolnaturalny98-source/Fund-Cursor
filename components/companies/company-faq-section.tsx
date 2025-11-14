import { Info } from "lucide-react";

import { CompanyFaqTabs } from "@/components/companies/company-faq-tabs";
import type { CompanyWithDetails } from "@/lib/types";

interface CompanyFaqSectionProps {
  companySlug: string;
  faqs: CompanyWithDetails["faqs"];
}

export function CompanyFaqSection({ companySlug, faqs }: CompanyFaqSectionProps) {
  if (!faqs?.length) {
    return null;
  }

  return (
    <section className="flex flex-col fluid-stack-md">
      <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
        <Info className="h-[clamp(1.1rem,0.6vw+1rem,1.25rem)] w-[clamp(1.1rem,0.6vw+1rem,1.25rem)] text-primary" />
        <h2 className="fluid-h2 font-semibold">FAQ w kontekście</h2>
      </div>
      <CompanyFaqTabs faqs={faqs} companySlug={companySlug} />
    </section>
  );
}
