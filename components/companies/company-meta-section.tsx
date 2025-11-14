import { OverviewQuickStats } from "@/components/companies/overview-quick-stats";
import { TechnicalDetailsTabsCard } from "@/components/companies/technical-details-tabs-card";
import { TeamHistoryTabsCard } from "@/components/companies/team-history-tabs-card";
import { ChecklistSection } from "@/components/companies/checklist-section";
import { Separator } from "@/components/ui/separator";
import type { CompanyWithDetails } from "@/lib/types";
import type { CompanyChecklistItem } from "@/components/companies/company-profile-types";

interface CompanyMetaSectionProps {
  company: CompanyWithDetails;
  checklist: CompanyChecklistItem[];
}

export function CompanyMetaSection({ company, checklist }: CompanyMetaSectionProps) {
  return (
    <section className="flex flex-col fluid-stack-lg">
      <OverviewQuickStats company={company} />
      <Separator className="bg-border/40" />
      <TechnicalDetailsTabsCard company={company} />
      <Separator className="bg-border/40" />
      <TeamHistoryTabsCard company={company} />
      <Separator className="bg-border/40" />
      <ChecklistSection checklist={checklist} />
    </section>
  );
}
