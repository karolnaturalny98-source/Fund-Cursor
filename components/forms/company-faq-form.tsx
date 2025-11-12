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
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-background p-4">
      <p className="text-sm font-semibold text-foreground">Dodaj pytanie FAQ</p>
      <div className="grid gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Pytanie</span>
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Jak dziala refundacja?"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Odpowiedz</span>
          <Textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Po pierwszej wyplacie oplata challenge jest zwracana."
            rows={3}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Kolejnosc</span>
          <Input
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            placeholder="0"
            type="number"
            min="0"
          />
        </label>
      </div>
      {feedback ? <p className="text-xs text-destructive">{feedback}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie..." : "Dodaj pytanie"}
      </Button>
    </form>
  );
}
