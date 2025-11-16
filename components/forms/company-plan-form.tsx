"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Nazwa planu jest wymagana."),
  price: z.string().min(1, "Cena jest wymagana."),
  currency: z.string().min(1, "Waluta jest wymagana."),
  profitSplit: z.string().optional(),
  evaluationModel: z.enum(["one-step", "two-step", "instant-funding"]),
  description: z.string().optional(),
  features: z.string().optional(),
  maxDrawdown: z.string().optional(),
  maxDailyLoss: z.string().optional(),
  profitTarget: z.string().optional(),
  minTradingDays: z.string().optional(),
  payoutFirstAfterDays: z.string().optional(),
  payoutCycleDays: z.string().optional(),
  leverage: z.string().optional(),
  accountType: z.string().optional(),
  affiliateUrl: z
    .string()
    .url({ message: "Podaj poprawny URL." })
    .or(z.literal(""))
    .optional(),
  affiliateCommission: z.string().optional(),
  notes: z.string().optional(),
  trailingDrawdown: z.boolean().optional(),
  refundableFee: z.boolean().optional(),
  scalingPlan: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyPlanFormProps {
  companySlug: string;
  planId?: string;
  initialData?: {
    name: string;
    price: number;
    currency: string;
    profitSplit?: string | null;
    evaluationModel: string;
    description?: string | null;
    features?: string[];
    maxDrawdown?: number | null;
    maxDailyLoss?: number | null;
    profitTarget?: number | null;
    minTradingDays?: number | null;
    payoutFirstAfterDays?: number | null;
    payoutCycleDays?: number | null;
    leverage?: number | null;
    accountType?: string | null;
    affiliateUrl?: string | null;
    affiliateCommission?: number | null;
    notes?: string | null;
    trailingDrawdown?: boolean;
    refundableFee?: boolean;
    scalingPlan?: boolean;
  };
  onSuccess?: () => void;
}

export function CreateCompanyPlanForm({
  companySlug,
  planId,
  initialData,
  onSuccess,
}: CompanyPlanFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEditMode = Boolean(planId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price?.toString() || "",
      currency: initialData?.currency || "USD",
      profitSplit: initialData?.profitSplit || "",
      evaluationModel: (initialData?.evaluationModel as "one-step" | "two-step" | "instant-funding") || "two-step",
      description: initialData?.description || "",
      features: initialData?.features?.join("\n") || "",
      maxDrawdown: initialData?.maxDrawdown?.toString() || "",
      maxDailyLoss: initialData?.maxDailyLoss?.toString() || "",
      profitTarget: initialData?.profitTarget?.toString() || "",
      minTradingDays: initialData?.minTradingDays?.toString() || "",
      payoutFirstAfterDays: initialData?.payoutFirstAfterDays?.toString() || "",
      payoutCycleDays: initialData?.payoutCycleDays?.toString() || "",
      leverage: initialData?.leverage?.toString() || "",
      accountType: initialData?.accountType || "evaluation",
      affiliateUrl: initialData?.affiliateUrl || "",
      affiliateCommission: initialData?.affiliateCommission?.toString() || "",
      notes: initialData?.notes || "",
      trailingDrawdown: initialData?.trailingDrawdown || false,
      refundableFee: initialData?.refundableFee || false,
      scalingPlan: initialData?.scalingPlan || false,
    },
  });

  const normalizeString = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  const parseNumber = (
    field: keyof FormValues,
    value: string | undefined,
    options?: { min?: number },
  ) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed.replace(",", "."));
    if (Number.isNaN(parsed)) {
      setError(field, {
        type: "manual",
        message: "Podaj poprawną wartość liczbową.",
      });
      throw new Error("VALIDATION");
    }

    if (options?.min !== undefined && parsed < options.min) {
      setError(field, {
        type: "manual",
        message: `Wartość musi być ≥ ${options.min}.`,
      });
      throw new Error("VALIDATION");
    }

    return parsed;
  };

  const parseInteger = (
    field: keyof FormValues,
    value: string | undefined,
    options?: { min?: number },
  ) => {
    const numeric = parseNumber(field, value, options);
    return numeric === null ? null : Math.round(numeric);
  };

  const onSubmit = async (values: FormValues) => {
    setServerMessage(null);

    let price: number;
    let maxDrawdown: number | null = null;
    let maxDailyLoss: number | null = null;
    let profitTarget: number | null = null;
    let minTradingDays: number | null = null;
    let payoutFirstAfterDays: number | null = null;
    let payoutCycleDays: number | null = null;
    let leverage: number | null = null;

    try {
      price = parseNumber("price", values.price, { min: 1 }) ?? 0;
      maxDrawdown = parseNumber("maxDrawdown", values.maxDrawdown, {
        min: 0,
      });
      maxDailyLoss = parseNumber("maxDailyLoss", values.maxDailyLoss, {
        min: 0,
      });
      profitTarget = parseNumber("profitTarget", values.profitTarget, {
        min: 0,
      });
      minTradingDays = parseInteger(
        "minTradingDays",
        values.minTradingDays,
        { min: 0 },
      );
      payoutFirstAfterDays = parseInteger(
        "payoutFirstAfterDays",
        values.payoutFirstAfterDays,
        { min: 0 },
      );
      payoutCycleDays = parseInteger(
        "payoutCycleDays",
        values.payoutCycleDays,
        { min: 0 },
      );
      leverage = parseInteger("leverage", values.leverage, { min: 1 });
    } catch (error) {
      if (error instanceof Error && error.message === "VALIDATION") {
        return;
      }
      throw error;
    }

    const features = normalizeString(values.features)
      ? values.features!
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const payload = {
      name: values.name.trim(),
      price,
      currency: values.currency.trim().toUpperCase(),
      profitSplit: normalizeString(values.profitSplit),
      evaluationModel: values.evaluationModel,
      description: normalizeString(values.description),
      features,
      maxDrawdown,
      maxDailyLoss,
      profitTarget,
      minTradingDays,
      payoutFirstAfterDays,
      payoutCycleDays,
      leverage,
      accountType: normalizeString(values.accountType),
      affiliateUrl: normalizeString(values.affiliateUrl),
      affiliateCommission: parseNumber("affiliateCommission", values.affiliateCommission),
      notes: normalizeString(values.notes),
      trailingDrawdown: Boolean(values.trailingDrawdown),
      refundableFee: Boolean(values.refundableFee),
      scalingPlan: Boolean(values.scalingPlan),
    };

    try {
      const url = isEditMode 
        ? `/api/admin/companies/${companySlug}/plans/${planId}`
        : `/api/admin/companies/${companySlug}/plans`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerMessage({
          type: "error",
          text: data.error ?? `Nie udało się ${isEditMode ? "zaktualizować" : "dodać"} planu.`,
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: `Plan został ${isEditMode ? "zaktualizowany" : "dodany"}.`,
      });

      if (!isEditMode) {
        reset({
          name: "",
          price: "",
          currency: payload.currency,
          profitSplit: "",
          evaluationModel: values.evaluationModel,
          description: "",
          features: "",
          maxDrawdown: "",
          maxDailyLoss: "",
          profitTarget: "",
          minTradingDays: "",
          payoutFirstAfterDays: "",
          payoutCycleDays: "",
          leverage: "",
          accountType: payload.accountType ?? "evaluation",
          affiliateUrl: "",
          affiliateCommission: "",
          notes: "",
          trailingDrawdown: Boolean(values.trailingDrawdown),
          refundableFee: Boolean(values.refundableFee),
          scalingPlan: Boolean(values.scalingPlan),
        });
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      setServerMessage({
        type: "error",
        text: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    }
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card/82 p-[clamp(1rem,1.5vw,1.5rem)] fluid-stack-md">
      <h3 className="fluid-eyebrow font-semibold text-muted-foreground">
        {isEditMode ? "Edytuj plan" : "Dodaj plan"}
      </h3>
      <form className="mt-[clamp(0.75rem,1vw,1rem)] flex flex-col fluid-stack-md" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Nazwa planu" error={errors.name?.message}>
          <Input placeholder="Account 50K" {...register("name")} />
        </Field>

        <div className="grid fluid-stack-sm md:grid-cols-3">
          <Field label="Cena" error={errors.price?.message}>
            <Input placeholder="249" {...register("price")} />
          </Field>
          <Field label="Waluta" error={errors.currency?.message}>
            <Input placeholder="USD" {...register("currency")} />
          </Field>
          <Field label="Profit split" error={errors.profitSplit?.message}>
            <Input placeholder="80/20" {...register("profitSplit")} />
          </Field>
        </div>

        <div className="grid fluid-stack-sm md:grid-cols-2">
          <Field label="Max drawdown" error={errors.maxDrawdown?.message}>
            <Input placeholder="5000" {...register("maxDrawdown")} />
          </Field>
          <Field label="Max daily loss" error={errors.maxDailyLoss?.message}>
            <Input placeholder="2500" {...register("maxDailyLoss")} />
          </Field>
        </div>

        <div className="grid fluid-stack-sm md:grid-cols-3">
          <Field label="Profit target" error={errors.profitTarget?.message}>
            <Input placeholder="5000" {...register("profitTarget")} />
          </Field>
          <Field label="Min dni handlu" error={errors.minTradingDays?.message}>
            <Input placeholder="5" {...register("minTradingDays")} />
          </Field>
          <Field label="Dźwignia" error={errors.leverage?.message}>
            <Input placeholder="100" {...register("leverage")} />
          </Field>
        </div>

        <div className="grid fluid-stack-sm md:grid-cols-2">
          <Field
            label="Pierwsza wypłata po (dni)"
            error={errors.payoutFirstAfterDays?.message}
          >
            <Input placeholder="30" {...register("payoutFirstAfterDays")} />
          </Field>
          <Field label="Cykl wypłat (dni)" error={errors.payoutCycleDays?.message}>
            <Input placeholder="14" {...register("payoutCycleDays")} />
          </Field>
        </div>

        <Field label="Typ konta" error={errors.accountType?.message}>
          <Input placeholder="evaluation / instant / funded" {...register("accountType")} />
        </Field>

        <Field label="Link afiliacyjny" error={errors.affiliateUrl?.message}>
          <Input placeholder="https://partner.com/checkout" {...register("affiliateUrl")} />
        </Field>
        <Field label="Prowizja afiliacyjna (%)" error={errors.affiliateCommission?.message}>
          <Input 
            type="number" 
            step="0.01" 
            min="0" 
            max="100" 
            placeholder="5.00" 
            {...register("affiliateCommission")} 
          />
          <p className="fluid-caption text-muted-foreground mt-[clamp(0.2rem,0.3vw,0.25rem)]">
            Procent prowizji, który otrzymujemy od partnera za przekierowanie klienta
          </p>
        </Field>

        <Field label="Opis" error={errors.description?.message}>
          <Textarea
            placeholder="Dwustopniowe wyzwanie z limitem dziennej straty 5%."
            {...register("description")}
          />
        </Field>

        <Field label="Cechy (każda w nowej linii)" error={errors.features?.message}>
          <Textarea
            placeholder={`Wypłaty w 24h\nBrak ograniczeń w weekend`}
            {...register("features")}
          />
        </Field>

        <Field label="Notatki" error={errors.notes?.message}>
          <Textarea placeholder="Dodatkowe informacje" rows={2} {...register("notes")} />
        </Field>

        <div className="grid fluid-stack-sm sm:grid-cols-3">
          <Controller
            name="trailingDrawdown"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox
                  id="trailingDrawdown"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <label htmlFor="trailingDrawdown" className="cursor-pointer">
                  Trailing drawdown
                </label>
              </div>
            )}
          />
          <Controller
            name="refundableFee"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox
                  id="refundableFee"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <label htmlFor="refundableFee" className="cursor-pointer">
                  Refundacja opłaty
                </label>
              </div>
            )}
          />
          <Controller
            name="scalingPlan"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox
                  id="scalingPlan"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <label htmlFor="scalingPlan" className="cursor-pointer">
                  Program scaling
                </label>
              </div>
            )}
          />
        </div>

        <Field label="Model oceny" error={errors.evaluationModel?.message}>
          <Controller
            name="evaluationModel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring">
                  <SelectValue placeholder="Wybierz model oceny" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-step">1-etapowe wyzwanie</SelectItem>
                  <SelectItem value="two-step">2-etapowe wyzwanie</SelectItem>
                  <SelectItem value="instant-funding">Instant funding</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {serverMessage ? (
          <div
            className={`rounded-lg border p-[clamp(0.6rem,0.8vw,0.75rem)] fluid-caption ${
              serverMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {serverMessage.text}
          </div>
        ) : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zaktualizuj plan" : "Dodaj plan"}
        </Button>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  layout?: "stack" | "inline";
};

function Field({ label, error, description, children, layout = "stack" }: FieldProps) {
  return (
    <label
      className={cn(
        "flex gap-2 text-sm text-foreground",
        layout === "inline" ? "flex-col sm:flex-row sm:items-center sm:gap-4" : "flex-col",
      )}
    >
      <div className="flex flex-col gap-1 text-foreground">
        <span className="font-semibold">{label}</span>
        {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
      </div>
      <div className="flex flex-col gap-1">
        {children}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </label>
  );
}
