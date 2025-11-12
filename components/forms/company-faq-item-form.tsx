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
    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Pytanie</span>
          <Input
            value={formState.question}
            onChange={(event) => updateField("question", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Odpowiedz</span>
          <Textarea
            rows={3}
            value={formState.answer}
            onChange={(event) => updateField("answer", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm max-w-[120px]">
          <span className="font-medium text-foreground">Kolejnosc</span>
          <Input
            type="number"
            min="0"
            value={formState.order}
            onChange={(event) => updateField("order", event.target.value)}
          />
        </label>
      </div>

      {feedback ? <p className="text-xs text-destructive">{feedback}</p> : null}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={handleSave}
        >
          Zapisz zmiany
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleDelete}
        >
          Usun
        </Button>
      </div>
    </div>
  );
}
