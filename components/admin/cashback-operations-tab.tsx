"use client";

import { SectionCard } from "./section-card";
import { AffiliateImportForm } from "./affiliate-import-form";
import { ManualCashbackForm } from "./manual-cashback-form";
import type { Company } from "@/lib/types";

interface CashbackOperationsTabProps {
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

export function CashbackOperationsTab({ companies }: CashbackOperationsTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Import transakcji afiliacyjnych"
        description="Dodaj rekord zewnętrznej sieci afiliacyjnej, aby rozpocząć proces weryfikacji cashbacku."
      >
        <AffiliateImportForm companies={companies} />
      </SectionCard>

      <SectionCard
        title="Ręczne przyznawanie punktów"
        description="Dodaj punkty cashback użytkownikowi, gdy chcesz uwzględnić zakup ręcznie lub przyznać bonus."
      >
        <ManualCashbackForm companies={companies} />
      </SectionCard>
    </div>
  );
}



