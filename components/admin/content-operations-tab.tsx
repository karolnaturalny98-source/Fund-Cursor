"use client";

import { SectionCard } from "./section-card";
import { CreateCompanyForm } from "@/components/forms/company-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ContentOperationsTab() {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Dodaj treści"
        description="Twórz nowe firmy, plany i inne treści w systemie."
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="add-company" className="border-none">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-lg font-semibold">Dodaj nową firmę</h3>
                <p className="text-sm text-muted-foreground text-left">
                  Uzupełnij podstawowe dane, aby wprowadzić nowego providera do bazy FundedRank.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-6">
                <CreateCompanyForm />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SectionCard>
    </div>
  );
}


