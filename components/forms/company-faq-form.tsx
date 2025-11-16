"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CompanyFaqFormProps {
  companySlug: string;
}

export function CompanyFaqForm({ companySlug }: CompanyFaqFormProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order) || 0,
    };

    const response = await fetch(`/api/admin/companies/${companySlug}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setFeedback("Nie udalo sie dodac pytania. Sprobuj ponownie.");
      return;
    }

    setQuestion("");
    setAnswer("");
    setOrder("0");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-background/80 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs backdrop-blur-[24px]!">
      <p className="font-semibold text-foreground fluid-copy">Dodaj pytanie FAQ</p>
      <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)]">
        <label className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Pytanie</span>
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Jak dziala refundacja?"
            required
            className="h-auto min-h-[clamp(2.5rem,3vw,2.75rem)] rounded-full px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption"
          />
        </label>
        <label className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Odpowiedz</span>
          <Textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Po pierwszej wyplacie oplata challenge jest zwracana."
            rows={3}
            required
            className="rounded-2xl border-border/60 bg-card/80 px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] fluid-caption shadow-xs"
          />
        </label>
        <label className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)] text-foreground fluid-caption">
          <span className="font-medium text-foreground fluid-copy">Kolejnosc</span>
          <Input
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            placeholder="0"
            type="number"
            min="0"
            className="h-auto min-h-[clamp(2.5rem,3vw,2.75rem)] rounded-full px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption"
          />
        </label>
      </div>
      {feedback ? <p className="text-destructive fluid-caption">{feedback}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie..." : "Dodaj pytanie"}
      </Button>
    </form>
  );
}
