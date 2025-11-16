"use client";

import { SectionCard } from "./section-card";
import { CreateCompanyForm } from "@/components/forms/company-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
                <Heading level={3} variant="subsection">
                  Dodaj nową firmę
                </Heading>
                <Text variant="caption" tone="muted" align="start">
                  Uzupełnij podstawowe dane, aby wprowadzić nowego providera do bazy FundedRank.
                </Text>
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
