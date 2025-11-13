"use client";

import { SectionCard } from "./section-card";
import { CompanyManagementPanel } from "./company-management-panel";
import type { AdminCompany } from "@/lib/queries/companies";

interface ContentManagementTabProps {
  companies: AdminCompany[];
}

export function ContentManagementTab({ companies }: ContentManagementTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Zarządzanie firmami"
        description="Dodawaj plany kont, aktualizuj kluczowe parametry i utrzymuj FAQ w porządku."
      >
        <CompanyManagementPanel companies={companies} />
      </SectionCard>
    </div>
  );
}


