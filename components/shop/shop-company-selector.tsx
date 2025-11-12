"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompanyWithPlans } from "@/lib/queries/companies";

interface ShopCompanySelectorProps {
  companies: CompanyWithPlans[];
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
}

export function ShopCompanySelector({
  companies,
  selectedCompanyId,
  onCompanyChange,
}: ShopCompanySelectorProps) {
  return (
    <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Wybierz firmę..." />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
