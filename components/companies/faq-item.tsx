"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
  companySlug: string;
  value: string;
}

export function FaqItem({ id, question, answer, companySlug, value }: FaqItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "group rounded-2xl border-gradient bg-gradient-card p-4 text-sm shadow-premium transition-all hover:border-gradient-premium hover:shadow-premium-lg",
        "border-b-0 data-[state=open]:border-gradient-premium"
      )}
    >
      <AccordionTrigger className="cursor-pointer list-none font-medium text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        <p className="pt-2">{answer}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
