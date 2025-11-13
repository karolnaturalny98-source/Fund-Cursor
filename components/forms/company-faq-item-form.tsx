"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CompanyFaqItemFormProps {
  companySlug: string;
  faqId: string;
  question: string;
  answer: string;
  order: number;
}

export function CompanyFaqItemForm({
  companySlug,
  faqId,
  question,
  answer,
  order,
}: CompanyFaqItemFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    question,
    answer,
    order: order.toString(),
  });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateField = (key: "question" | "answer" | "order", value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setFeedback(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/companies/${companySlug}/faqs/${faqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formState.question.trim(),
          answer: formState.answer.trim(),
          order: Number(formState.order) || 0,
        }),
      });

      if (!response.ok) {
        setFeedback("Nie udalo sie zapisac zmian.");
        return;
      }

      router.refresh();
    });
  };

  const handleDelete = () => {
    setFeedback(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/companies/${companySlug}/faqs/${faqId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setFeedback("Nie udalo sie usunac pytania.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-muted/20 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs backdrop-blur-[16px]!">
      <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] sm:grid-cols-[minmax(0,1fr)]">
        <label className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Pytanie</span>
          <Input
            value={formState.question}
            onChange={(event) => updateField("question", event.target.value)}
            className="h-auto min-h-[clamp(2.5rem,3vw,2.75rem)] rounded-full px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption"
          />
        </label>
        <label className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Odpowiedz</span>
          <Textarea
            rows={3}
            value={formState.answer}
            onChange={(event) => updateField("answer", event.target.value)}
            className="rounded-2xl border-border/60 bg-card/80 px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] fluid-caption shadow-xs"
          />
        </label>
        <label className="flex max-w-[120px] flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Kolejnosc</span>
          <Input
            type="number"
            min="0"
            value={formState.order}
            onChange={(event) => updateField("order", event.target.value)}
            className="h-auto min-h-[clamp(2.25rem,2.8vw,2.5rem)] rounded-full px-[clamp(0.75rem,1.1vw,0.95rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] fluid-caption"
          />
        </label>
      </div>

      {feedback ? <p className="text-destructive fluid-caption">{feedback}</p> : null}

      <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.6rem)]">
        <Button
          size="sm"
          disabled={isPending}
          onClick={handleSave}
          className="fluid-button-sm"
        >
          Zapisz zmiany
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleDelete}
          className="fluid-button-sm"
        >
          Usun
        </Button>
      </div>
    </div>
  );
}
