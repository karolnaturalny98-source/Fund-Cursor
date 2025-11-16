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

export function FaqItem({ id: _id, question, answer, companySlug: _companySlug, value }: FaqItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "group rounded-2xl border border-border/50 bg-gradient-card p-4 text-sm shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)] transition-all",
        "border-b-0 data-[state=open]:border-primary/50"
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
