"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const optionalUrl = z
  .string()
  .url({ message: "Podaj poprawny URL." })
  .or(z.literal(""))
  .optional();

const formSchema = z.object({
  name: z.string().min(2, "Nazwa jest wymagana."),
  slug: z
    .string()
    .min(2, "Slug jest wymagany.")
    .max(80, "Slug moze miec maksymalnie 80 znakow.")
    .regex(/^[a-z0-9-]+$/, "Uzyj maych liter, cyfr i myslnikow."),
  headline: z.string().max(160, "Nagowek moze miec maksymalnie 160 znakow.").optional(),
  logoUrl: optionalUrl,
  shortDescription: z
    .string()
    .max(220, "Opis moze miec maksymalnie 220 znakow.")
    .optional(),
  country: z.string().max(120, "Kraj moze miec maksymalnie 120 znakow.").optional(),
  foundedYear: z.string().optional(),
  websiteUrl: optionalUrl,
  discountCode: z
    .string()
    .max(50, "Kod moze miec maksymalnie 50 znakow.")
    .optional(),
  cashbackRate: z.string().optional(),
  payoutFrequency: z
    .string()
    .max(120, "Informacja moze miec maksymalnie 120 znakow.")
    .optional(),
  highlights: z.string().optional(),
  regulation: z.string().optional(),
  supportContact: z.string().optional(),
  socialsWebsite: optionalUrl,
  socialsTwitter: optionalUrl,
  socialsDiscord: optionalUrl,
  socialsYoutube: optionalUrl,
  paymentMethods: z.string().optional(),
  instruments: z.string().optional(),
  platforms: z.string().optional(),
  educationLinks: z.string().optional(),
  kycRequired: z.boolean().optional(),
  ceo: z.string().max(120, "CEO moze miec maksymalnie 120 znakow.").optional(),
  legalName: z.string().max(200, "Nazwa prawna moze miec maksymalnie 200 znakow.").optional(),
  headquartersAddress: z.string().max(300, "Adres moze miec maksymalnie 300 znakow.").optional(),
  foundersInfo: z.string().max(500, "Informacje o zalozcielach moga miec maksymalnie 500 znakow.").optional(),
  verificationStatus: z.enum(["VERIFIED", "PENDING", "UNVERIFIED"]).optional(),
  licenses: z.string().optional(),
  registryLinks: z.string().optional(),
  registryData: z.string().max(300, "Dane rejestrowe moga miec maksymalnie 300 znakow.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyFormProps {
  editSlug?: string;
  initialData?: {
    name: string;
    slug: string;
    headline?: string | null;
    logoUrl?: string | null;
    shortDescription?: string | null;
    country?: string | null;
    foundedYear?: number | null;
    websiteUrl?: string | null;
    discountCode?: string | null;
    cashbackRate?: number | null;
    payoutFrequency?: string | null;
    highlights?: string[];
    regulation?: string | null;
    supportContact?: string | null;
    socials?: Record<string, string> | null;
    paymentMethods?: string[];
    instruments?: string[];
    platforms?: string[];
    educationLinks?: string[];
    kycRequired?: boolean;
    ceo?: string | null;
    legalName?: string | null;
    headquartersAddress?: string | null;
    foundersInfo?: string | null;
    verificationStatus?: string | null;
    licenses?: string[];
    registryLinks?: string[];
    registryData?: string | null;
  };
  onSuccess?: () => void;
}

export function CreateCompanyForm({ editSlug, initialData, onSuccess }: CompanyFormProps = {}) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEditMode = Boolean(editSlug);

  const parseVerificationStatus = (
    status?: string | null,
  ): FormValues["verificationStatus"] => {
    if (status === "VERIFIED" || status === "PENDING" || status === "UNVERIFIED") {
      return status;
    }
    return undefined;
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      headline: initialData?.headline || "",
      logoUrl: initialData?.logoUrl || "",
      shortDescription: initialData?.shortDescription || "",
      country: initialData?.country || "",
      foundedYear: initialData?.foundedYear?.toString() || "",
      websiteUrl: initialData?.websiteUrl || "",
      discountCode: initialData?.discountCode || "",
      cashbackRate: initialData?.cashbackRate?.toString() || "",
      payoutFrequency: initialData?.payoutFrequency || "",
      highlights: initialData?.highlights?.join("\n") || "",
      regulation: initialData?.regulation || "",
      supportContact: initialData?.supportContact || "",
      socialsWebsite: initialData?.socials?.website || "",
      socialsTwitter: initialData?.socials?.twitter || "",
      socialsDiscord: initialData?.socials?.discord || "",
      socialsYoutube: initialData?.socials?.youtube || "",
      paymentMethods: initialData?.paymentMethods?.join("\n") || "",
      instruments: initialData?.instruments?.join("\n") || "",
      platforms: initialData?.platforms?.join("\n") || "",
      educationLinks: initialData?.educationLinks?.join("\n") || "",
      kycRequired: initialData?.kycRequired || false,
      ceo: initialData?.ceo || "",
      legalName: initialData?.legalName || "",
      headquartersAddress: initialData?.headquartersAddress || "",
      foundersInfo: initialData?.foundersInfo || "",
      verificationStatus: parseVerificationStatus(initialData?.verificationStatus),
      licenses: initialData?.licenses?.join("\n") || "",
      registryLinks: initialData?.registryLinks?.join("\n") || "",
      registryData: initialData?.registryData || "",
    },
  });

  // Reset form when initialData or editSlug changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        headline: initialData.headline || "",
        logoUrl: initialData.logoUrl || "",
        shortDescription: initialData.shortDescription || "",
        country: initialData.country || "",
        foundedYear: initialData.foundedYear?.toString() || "",
        websiteUrl: initialData.websiteUrl || "",
        discountCode: initialData.discountCode || "",
        cashbackRate: initialData.cashbackRate?.toString() || "",
        payoutFrequency: initialData.payoutFrequency || "",
        highlights: initialData.highlights?.join("\n") || "",
        regulation: initialData.regulation || "",
        supportContact: initialData.supportContact || "",
        socialsWebsite: initialData.socials?.website || "",
        socialsTwitter: initialData.socials?.twitter || "",
        socialsDiscord: initialData.socials?.discord || "",
        socialsYoutube: initialData.socials?.youtube || "",
        paymentMethods: initialData.paymentMethods?.join("\n") || "",
        instruments: initialData.instruments?.join("\n") || "",
        platforms: initialData.platforms?.join("\n") || "",
        educationLinks: initialData.educationLinks?.join("\n") || "",
        kycRequired: initialData.kycRequired || false,
        ceo: initialData.ceo || "",
        legalName: initialData.legalName || "",
        headquartersAddress: initialData.headquartersAddress || "",
        foundersInfo: initialData.foundersInfo || "",
        verificationStatus: parseVerificationStatus(initialData.verificationStatus),
        licenses: initialData.licenses?.join("\n") || "",
        registryLinks: initialData.registryLinks?.join("\n") || "",
        registryData: initialData.registryData || "",
      });
    }
  }, [initialData, editSlug, reset]);

  const onSubmit = async (values: FormValues) => {
    setServerMessage(null);

    const normalizeString = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };

    const parseList = (input?: string) =>
      input
        ?.split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

    const parseNumberField = (
      field: keyof FormValues,
      rawValue: string | undefined,
      options?: { min?: number; max?: number },
    ) => {
      const trimmed = rawValue?.trim();

      if (!trimmed) {
        return null;
      }

      const normalized = trimmed.replace(",", ".");
      const parsed = Number(normalized);

      if (Number.isNaN(parsed)) {
        setError(field, {
          type: "manual",
          message: "Podaj poprawna wartosc liczbowa.",
        });
        throw new Error("VALIDATION");
      }

      if (options?.min !== undefined && parsed < options.min) {
        setError(field, {
          type: "manual",
          message: `Wartosc musi byc >= ${options.min}.`,
        });
        throw new Error("VALIDATION");
      }

      if (options?.max !== undefined && parsed > options.max) {
        setError(field, {
          type: "manual",
          message: `Wartosc musi byc <= ${options.max}.`,
        });
        throw new Error("VALIDATION");
      }

      return parsed;
    };

    let foundedYear: number | null = null;
    let cashbackRate: number | null = null;

    try {
      foundedYear = parseNumberField("foundedYear", values.foundedYear, {
        min: 2000,
        max: 2100,
      });
      cashbackRate = parseNumberField("cashbackRate", values.cashbackRate, {
        min: 0,
        max: 100,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VALIDATION") {
        return;
      }
      throw error;
    }

    const highlights = parseList(values.highlights);
    const paymentMethods = parseList(values.paymentMethods);
    const instruments = parseList(values.instruments);
    const platforms = parseList(values.platforms);
    const educationLinks = parseList(values.educationLinks);
    const licenses = parseList(values.licenses);
    const registryLinks = parseList(values.registryLinks).filter((link) => {
      try {
        new URL(link);
        return true;
      } catch {
        return false;
      }
    });

    const socials = Object.fromEntries(
      Object.entries({
        website: normalizeString(values.socialsWebsite),
        twitter: normalizeString(values.socialsTwitter),
        discord: normalizeString(values.socialsDiscord),
        youtube: normalizeString(values.socialsYoutube),
      }).filter(([, value]) => Boolean(value)),
    );

    const payload = {
      name: normalizeString(values.name)!,
      slug: normalizeString(values.slug)!,
      headline: normalizeString(values.headline),
      logoUrl: normalizeString(values.logoUrl),
      shortDescription: normalizeString(values.shortDescription),
      country: normalizeString(values.country),
      foundedYear,
      websiteUrl: normalizeString(values.websiteUrl),
      discountCode: normalizeString(values.discountCode),
      cashbackRate,
      payoutFrequency: normalizeString(values.payoutFrequency),
      highlights,
      regulation: normalizeString(values.regulation),
      supportContact: normalizeString(values.supportContact),
      socials: Object.keys(socials).length ? socials : null,
      paymentMethods,
      instruments,
      platforms,
      educationLinks,
      kycRequired: Boolean(values.kycRequired),
      ceo: normalizeString(values.ceo),
      legalName: normalizeString(values.legalName),
      headquartersAddress: normalizeString(values.headquartersAddress),
      foundersInfo: normalizeString(values.foundersInfo),
      verificationStatus: values.verificationStatus || null,
      licenses,
      registryLinks,
      registryData: normalizeString(values.registryData),
    };

    try {
      const url = isEditMode ? `/api/admin/companies/${editSlug}` : "/api/admin/companies";
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
          text: data.error ?? `Nie udao sie ${isEditMode ? "zaktualizowac" : "dodac"} firmy.`,
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: `Firma zostaa ${isEditMode ? "zaktualizowana" : "dodana"}.`,
      });

      if (!isEditMode) {
        reset();
      }

      // Refresh server data
      router.refresh();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      setServerMessage({
        type: "error",
        text: "Wystapi nieoczekiwany bad. Sprobuj ponownie.",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.5rem,2.3vw,2rem)] shadow-xs backdrop-blur-[36px]!">
      <h2 className="font-semibold text-foreground fluid-h2">{isEditMode ? "Edytuj firme" : "Dodaj nowa firme"}</h2>
      <p className="mt-[clamp(0.35rem,0.6vw,0.5rem)] text-muted-foreground fluid-caption">
        {isEditMode 
          ? "Zaktualizuj informacje o firmie prop tradingowej."
          : "Uzupenij podstawowe informacje o firmie prop tradingowej. Szczegoy mozesz edytowac pozniej."}
      </p>

      <form className="mt-[clamp(1.5rem,2.2vw,2rem)] space-y-[clamp(1rem,1.6vw,1.4rem)]" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Nazwa" error={errors.name?.message}>
          <Input placeholder="FundedRank Prop" {...register("name")} />
        </Field>

        <Field label="Slug (adres URL)" error={errors.slug?.message}>
          <Input 
            placeholder="fundedrank-prop" 
            {...register("slug")} 
            disabled={isEditMode}
          />
          {isEditMode && (
            <span className="text-muted-foreground fluid-caption">Slug nie moze byc zmieniony po utworzeniu firmy.</span>
          )}
        </Field>

        <Field label="Nagowek" error={errors.headline?.message}>
          <Input placeholder="Dwustopniowe wyzwania z szybkimi wypatami" {...register("headline")} />
        </Field>

        <Field label="Logo (URL)" error={errors.logoUrl?.message}>
          <Input placeholder="https://.../logo.png" {...register("logoUrl")} />
        </Field>

        <Field
          label="Krotki opis"
          description="Widoczny na kartach i w rankingu (max 220 znakow)."
          error={errors.shortDescription?.message}
        >
          <Textarea
            placeholder="Prop firm nastawiona na szybkie wypaty i elastyczne zasady zarzadzania ryzykiem."
            {...register("shortDescription")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Kraj" error={errors.country?.message}>
            <Input placeholder="United States" {...register("country")} />
          </Field>
          <Field label="Rok zaozenia" error={errors.foundedYear?.message}>
            <Input placeholder="2021" {...register("foundedYear")} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Strona WWW" error={errors.websiteUrl?.message}>
            <Input placeholder="https://example.com" {...register("websiteUrl")} />
          </Field>
          <Field label="Kontakt" error={errors.supportContact?.message}>
            <Input placeholder="support@example.com" {...register("supportContact")} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Kod rabatowy" error={errors.discountCode?.message}>
            <Input placeholder="PROP10" {...register("discountCode")} />
          </Field>
          <Field label="Cashback %" error={errors.cashbackRate?.message}>
            <Input placeholder="5" {...register("cashbackRate")} />
          </Field>
        </div>

        <Field label="Czestotliwosc wypat" error={errors.payoutFrequency?.message}>
          <Input placeholder="Co 14 dni" {...register("payoutFrequency")} />
        </Field>

        <Field label="Regulacja" error={errors.regulation?.message}>
          <Input placeholder="NFA / FCA / inna" {...register("regulation")} />
        </Field>

        <Field
          label="Wyrozniki (po jednej pozycji w kazdej linii)"
          error={errors.highlights?.message}
        >
          <Textarea
            placeholder={`Szybkie wypaty\nMentoring traderow`}
            {...register("highlights")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Metody patnosci" error={errors.paymentMethods?.message}>
            <Textarea placeholder={`Karta\nPrzelew\nKryptowaluty`} rows={3} {...register("paymentMethods")} />
          </Field>
          <Field label="Platformy" error={errors.platforms?.message}>
            <Textarea placeholder={`MT4\nMT5\ncTrader`} rows={3} {...register("platforms")} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instrumenty" error={errors.instruments?.message}>
            <Textarea placeholder={`Forex\nIndeksy\nTowary`} rows={3} {...register("instruments")} />
          </Field>
          <Field label="Materiay edukacyjne" error={errors.educationLinks?.message}>
            <Textarea placeholder={`https://example.com/academy`} rows={3} {...register("educationLinks")} />
          </Field>
        </div>

        <div className="space-y-[clamp(0.45rem,0.7vw,0.6rem)]">
          <p className="font-semibold text-foreground fluid-copy">Linki spoecznosciowe</p>
          <div className="grid gap-[clamp(0.6rem,0.9vw,0.8rem)]">
            <Input placeholder="Website" {...register("socialsWebsite")} />
            <Input placeholder="Twitter" {...register("socialsTwitter")} />
            <Input placeholder="Discord" {...register("socialsDiscord")} />
            <Input placeholder="YouTube" {...register("socialsYoutube")} />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
          <h3 className="font-semibold text-foreground fluid-copy">Informacje o firmie</h3>
          
          <Field label="Nazwa prawna firmy" error={errors.legalName?.message}>
            <Input placeholder="FundedRank Prop Trading Ltd." {...register("legalName")} />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="CEO" error={errors.ceo?.message}>
              <Input placeholder="Jan Kowalski" {...register("ceo")} />
            </Field>
            <Field label="Status weryfikacji" error={errors.verificationStatus?.message}>
              <Controller
                name="verificationStatus"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-auto min-h-[2.75rem] w-full rounded-2xl border border-input bg-background px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.5rem,0.8vw,0.65rem)] fluid-caption ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Nie wybrano</option>
                    <option value="VERIFIED">Zweryfikowana</option>
                    <option value="PENDING">W trakcie weryfikacji</option>
                    <option value="UNVERIFIED">Niezweryfikowana</option>
                  </select>
                )}
              />
            </Field>
          </div>

          <Field label="Adres siedziby" error={errors.headquartersAddress?.message}>
            <Textarea
              placeholder="123 Main Street, New York, NY 10001, United States"
              rows={2}
              {...register("headquartersAddress")}
            />
          </Field>

          <Field
            label="Informacje o założycielach"
            description="Opis założycieli i historii firmy (max 500 znaków)."
            error={errors.foundersInfo?.message}
          >
            <Textarea
              placeholder="Firma założona w 2021 roku przez doświadczonych traderów..."
              rows={3}
              {...register("foundersInfo")}
            />
          </Field>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Weryfikacja prawna</h3>

          <Field
            label="Licencje i uprawnienia (po jednej pozycji w każdej linii)"
            description="Lista licencji, certyfikatów i uprawnień."
            error={errors.licenses?.message}
          >
            <Textarea
              placeholder={`FCA License\nNFA Registration`}
              rows={3}
              {...register("licenses")}
            />
          </Field>

          <Field
            label="Linki do rejestrów firm (po jednym URL w każdej linii)"
            description="Linki do oficjalnych rejestrów firm (np. KRS, Companies House)."
            error={errors.registryLinks?.message}
          >
            <Textarea
              placeholder={`https://example.com/registry/123456\nhttps://companieshouse.gov.uk/...`}
              rows={3}
              {...register("registryLinks")}
            />
          </Field>

          <Field
            label="Dane rejestrowe"
            description="Numery rejestrowe (KRS, NIP, VAT, itp.)."
            error={errors.registryData?.message}
          >
            <Input placeholder="KRS: 123456789, NIP: 9876543210" {...register("registryData")} />
          </Field>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center gap-2">
          <Controller
            name="kycRequired"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="kycRequired"
                checked={field.value === true}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true ? true : false);
                }}
              />
            )}
          />
        <label htmlFor="kycRequired" className="text-foreground fluid-copy">
            Wymagane potwierdzenie KYC
          </label>
        </div>

        {serverMessage ? (
          <Alert
            variant={serverMessage.type === "success" ? "default" : "destructive"}
            className={
              serverMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : ""
            }
          >
            <AlertDescription>{serverMessage.text}</AlertDescription>
          </Alert>
        ) : null}

        <Button className="w-full justify-center fluid-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zaktualizuj firme" : "Dodaj firme"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[clamp(0.35rem,0.6vw,0.5rem)] text-foreground fluid-caption">
      <span className="font-medium text-foreground fluid-copy">{label}</span>
      {description ? (
        <span className="text-muted-foreground fluid-caption">{description}</span>
      ) : null}
      {children}
      {error ? <span className="text-destructive fluid-caption">{error}</span> : null}
    </label>
  );
}
