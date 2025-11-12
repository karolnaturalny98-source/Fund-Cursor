"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CompanyCommission,
  CompanyInstrumentGroup,
  CompanyLeverageTier,
  CompanyRules,
} from "@/lib/types";

const instrumentsSchema = z.object({
  title: z.string().min(2, "Nazwa jest wymagana."),
  description: z.string().max(200).optional(),
  instruments: z.string().optional(),
});

const leverageSchema = z.object({
  label: z.string().min(2, "Nazwa segmentu jest wymagana."),
  accountSize: z.string().max(80).optional(),
  maxLeverage: z.string().optional(),
  notes: z.string().max(200).optional(),
});

const commissionSchema = z.object({
  market: z.string().min(2, "Nazwa rynku jest wymagana."),
  value: z.string().min(1, "Wartosc prowizji jest wymagana."),
  notes: z.string().max(200).optional(),
});

const formSchema = z.object({
  instrumentGroups: z.array(instrumentsSchema),
  leverageTiers: z.array(leverageSchema),
  commissions: z.array(commissionSchema),
  allowedRules: z.string().optional(),
  restrictedRules: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyTradingProfileFormProps {
  companySlug: string;
  instrumentGroups: CompanyInstrumentGroup[];
  leverageTiers: CompanyLeverageTier[];
  tradingCommissions: CompanyCommission[];
  firmRules: CompanyRules;
  showSections?: ("instrumentGroups" | "leverageTiers" | "commissions" | "firmRules")[];
}

export function CompanyTradingProfileForm({
  companySlug,
  instrumentGroups,
  leverageTiers,
  tradingCommissions,
  firmRules,
  showSections,
}: CompanyTradingProfileFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const includeInstrumentGroups = !showSections || showSections.includes("instrumentGroups");
  const includeLeverageTiers = !showSections || showSections.includes("leverageTiers");
  const includeCommissions = !showSections || showSections.includes("commissions");
  const includeFirmRules = !showSections || showSections.includes("firmRules");

  const defaultInstrumentGroups =
    instrumentGroups.length > 0
      ? instrumentGroups.map((group) => ({
          title: group.title,
          description: group.description ?? "",
          instruments: group.instruments.join("\n"),
        }))
      : includeInstrumentGroups
        ? [
            {
              title: "",
              description: "",
              instruments: "",
            },
          ]
        : [];

  const defaultLeverageTiers =
    leverageTiers.length > 0
      ? leverageTiers.map((tier) => ({
          label: tier.label,
          accountSize: tier.accountSize ?? "",
          maxLeverage: tier.maxLeverage ? tier.maxLeverage.toString() : "",
          notes: tier.notes ?? "",
        }))
      : includeLeverageTiers
        ? [
            {
              label: "",
              accountSize: "",
              maxLeverage: "",
              notes: "",
            },
          ]
        : [];

  const defaultCommissions =
    tradingCommissions.length > 0
      ? tradingCommissions.map((commission) => ({
          market: commission.market,
          value: commission.value,
          notes: commission.notes ?? "",
        }))
      : includeCommissions
        ? [
            {
              market: "",
              value: "",
              notes: "",
            },
          ]
        : [];

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instrumentGroups: defaultInstrumentGroups,
      leverageTiers: defaultLeverageTiers,
      commissions: defaultCommissions,
      allowedRules: firmRules.allowed.join("\n"),
      restrictedRules: firmRules.restricted.join("\n"),
    },
  });

  const instrumentsArray = useFieldArray({ control, name: "instrumentGroups" });
  const leverageArray = useFieldArray({ control, name: "leverageTiers" });
  const commissionArray = useFieldArray({ control, name: "commissions" });

  const onSubmit = async (values: FormValues) => {
    setServerMessage(null);

    const payload: {
      instrumentGroups?: Array<{
        title: string;
        description: string | null;
        instruments: string[];
      }>;
      leverageTiers?: Array<{
        label: string;
        accountSize: string | null;
        maxLeverage: number | null;
        notes: string | null;
      }>;
      tradingCommissions?: Array<{
        market: string;
        value: string;
        notes: string | null;
      }>;
      firmRules?: {
        allowed: string[];
        restricted: string[];
      };
    } = {};

    if (includeInstrumentGroups) {
      payload.instrumentGroups = values.instrumentGroups
        .map((group) => ({
          title: group.title.trim(),
          description: group.description?.trim() || null,
          instruments: (group.instruments ?? "")
            .split("\n")
            .map((entry) => entry.trim())
            .filter(Boolean),
        }))
        .filter((group) => group.title.length);
    }

    if (includeLeverageTiers) {
      payload.leverageTiers = values.leverageTiers
        .map((tier) => ({
          label: tier.label.trim(),
          accountSize: tier.accountSize?.trim() || null,
          maxLeverage: parseLeverage(tier.maxLeverage),
          notes: tier.notes?.trim() || null,
        }))
        .filter((tier) => tier.label.length);
    }

    if (includeCommissions) {
      payload.tradingCommissions = values.commissions
        .map((commission) => ({
          market: commission.market.trim(),
          value: commission.value.trim(),
          notes: commission.notes?.trim() || null,
        }))
        .filter((commission) => commission.market.length && commission.value.length);
    }

    if (includeFirmRules) {
      payload.firmRules = {
        allowed: parseRules(values.allowedRules),
        restricted: parseRules(values.restrictedRules),
      };
    }

    try {
      const response = await fetch(`/api/admin/companies/${companySlug}/trading-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setServerMessage({
          type: "error",
          text: data.error ?? "Could not save trading profile.",
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: "Profil tradingowy zaktualizowany.",
      });
      router.refresh();
      reset(values);
    } catch (error) {
      console.error("Trading profile save error:", error);
      setServerMessage({
        type: "error",
        text: "Wystapil blad podczas zapisu.",
      });
    }
  };

  const shouldShow = (section: "instrumentGroups" | "leverageTiers" | "commissions" | "firmRules") => {
    return !showSections || showSections.includes(section);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {shouldShow("instrumentGroups") && (
      <div className="space-y-4">
        <header className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Instrumenty i aktywa</h4>
          <p className="text-xs text-muted-foreground">
            Dodaj sekcje z opisem klas aktywow oraz przykladami instrumentow oferowanych przez firme.
          </p>
        </header>

        <div className="space-y-4">
          {instrumentsArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border bg-muted/20 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`instrument-${index}-title`}>
                    Nazwa sekcji
                  </label>
                  <Input id={`instrument-${index}-title`} {...register(`instrumentGroups.${index}.title`)} />
                  {errors.instrumentGroups?.[index]?.title ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.instrumentGroups[index]?.title?.message}</p>
                  ) : null}
                </div>
                <div>
                  <label
                    className="text-xs font-semibold text-muted-foreground"
                    htmlFor={`instrument-${index}-description`}
                  >
                    Opis (opcjonalnie)
                  </label>
                  <Input id={`instrument-${index}-description`} {...register(`instrumentGroups.${index}.description`)} />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor={`instrument-${index}-items`}>
                  Instrumenty (po jednym w wierszu)
                </label>
                <Textarea id={`instrument-${index}-items`} rows={4} {...register(`instrumentGroups.${index}.instruments`)} />
              </div>
              {instrumentsArray.fields.length > 1 ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => instrumentsArray.remove(index)}
                    className="text-xs text-rose-600"
                  >
                    Usun sekcje
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => instrumentsArray.append({ title: "", description: "", instruments: "" })}
        >
          Dodaj sekcje
        </Button>
      </div>
      )}

      {shouldShow("leverageTiers") && (
      <div className="space-y-4">
        <header className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Segmenty dzwigni</h4>
          <p className="text-xs text-muted-foreground">
            Opisz segmenty kont wraz z limitami dzwigni oraz dodatkowymi notatkami.
          </p>
        </header>

        <div className="space-y-4">
          {leverageArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border bg-muted/20 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`leverage-${index}-label`}>
                    Nazwa segmentu
                  </label>
                  <Input id={`leverage-${index}-label`} {...register(`leverageTiers.${index}.label`)} />
                  {errors.leverageTiers?.[index]?.label ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.leverageTiers[index]?.label?.message}</p>
                  ) : null}
                </div>
                <div>
                  <label
                    className="text-xs font-semibold text-muted-foreground"
                    htmlFor={`leverage-${index}-account`}
                  >
                    Rozmiar konta / plan
                  </label>
                  <Input id={`leverage-${index}-account`} {...register(`leverageTiers.${index}.accountSize`)} />
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`leverage-${index}-max`}>
                    Max dzwignia (np. 50)
                  </label>
                  <Input id={`leverage-${index}-max`} {...register(`leverageTiers.${index}.maxLeverage`)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`leverage-${index}-notes`}>
                    Notatki (opcjonalnie)
                  </label>
                  <Input id={`leverage-${index}-notes`} {...register(`leverageTiers.${index}.notes`)} />
                </div>
              </div>
              {leverageArray.fields.length > 1 ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => leverageArray.remove(index)}
                    className="text-xs text-rose-600"
                  >
                    Usun segment
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            leverageArray.append({
              label: "",
              accountSize: "",
              maxLeverage: "",
              notes: "",
            })
          }
        >
          Dodaj segment
        </Button>
      </div>
      )}

      {shouldShow("commissions") && (
      <div className="space-y-4">
        <header className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prowizje</h4>
          <p className="text-xs text-muted-foreground">
            Opisz prowizje lub oplaty handlowe dla poszczegolnych rynkow.
          </p>
        </header>

        <div className="space-y-4">
          {commissionArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border bg-muted/20 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`commission-${index}-market`}>
                    Rynek / klasa aktywow
                  </label>
                  <Input id={`commission-${index}-market`} {...register(`commissions.${index}.market`)} />
                  {errors.commissions?.[index]?.market ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.commissions[index]?.market?.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor={`commission-${index}-value`}>
                    Wartosc prowizji
                  </label>
                  <Input id={`commission-${index}-value`} {...register(`commissions.${index}.value`)} />
                  {errors.commissions?.[index]?.value ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.commissions[index]?.value?.message}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor={`commission-${index}-notes`}>
                  Notatki (opcjonalnie)
                </label>
                <Input id={`commission-${index}-notes`} {...register(`commissions.${index}.notes`)} />
              </div>
              {commissionArray.fields.length > 1 ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => commissionArray.remove(index)}
                    className="text-xs text-rose-600"
                  >
                    Usun wpis
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => commissionArray.append({ market: "", value: "", notes: "" })}
        >
          Dodaj wpis
        </Button>
      </div>
      )}

      {shouldShow("firmRules") && (
      <div className="space-y-4">
        <header className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Zasady firmy</h4>
          <p className="text-xs text-muted-foreground">
            Wypisz zasady dozwolone i zabronione (po jednym punkcie na wiersz). Lista pojawi sie w zakladce Overview.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="allowed-rules">
              Dozwolone
            </label>
            <Textarea id="allowed-rules" rows={6} {...register("allowedRules")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="restricted-rules">
              Zabronione
            </label>
            <Textarea id="restricted-rules" rows={6} {...register("restrictedRules")} />
          </div>
        </div>
      </div>
      )}

      {serverMessage ? (
        <p className={`text-sm ${serverMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
          {serverMessage.text}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz profil tradingowy"}
        </Button>
      </div>
    </form>
  );
}

function parseRules(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseLeverage(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(",", ".");

  if (!normalized.length) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
