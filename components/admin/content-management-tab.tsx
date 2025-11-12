"use client";

import { SectionCard } from "./section-card";
import { CompanyManagementPanel } from "./company-management-panel";
import type { CompanyWithPlans } from "@/lib/queries/companies";

interface ContentManagementTabProps {
  companies: CompanyWithPlans[];
}

export function ContentManagementTab({ companies }: ContentManagementTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Zarządzanie firmami"
        description="Dodawaj plany kont, aktualizuj kluczowe parametry i utrzymuj FAQ w porządku."
      >
        <CompanyManagementPanel companies={companies} />
      </SectionCard>
    </div>
  );
}

