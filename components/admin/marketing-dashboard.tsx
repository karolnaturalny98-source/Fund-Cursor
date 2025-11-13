"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Calendar,
  Check,
  Flame,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

import type { MarketingSpotlight, MarketingSpotlightSection } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SectionCard } from "./section-card";

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  rating: number | null;
}

interface MarketingDashboardProps {
  section: MarketingSpotlightSection | null;
  companies: CompanyOption[];
  defaultSlug: string;
}

const numericString0to100 = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "Podaj liczbę.",
  })
  .refine((value) => value === "" || (Number(value) >= 0 && Number(value) <= 100), {
    message: "Wartość musi być w zakresie 0-100.",
  });

const ratingString = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "Podaj liczbę.",
  })
  .refine((value) => value === "" || (Number(value) >= 0 && Number(value) <= 5), {
    message: "Zakres oceny to 0-5.",
  });

const ratingCountString = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[0-9]+$/.test(value), {
    message: "Podaj liczbę całkowitą.",
  });

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "Podaj poprawny adres URL (http/https).",
  });

const formSchema = z.object({
  title: z.string().trim().min(3, "Tytuł musi mieć co najmniej 3 znaki.").max(80, "Maksymalnie 80 znaków."),
  headline: z.string().trim().max(160, "Maksymalnie 160 znaków.").optional(),
  badgeLabel: z.string().trim().max(32, "Maksymalnie 32 znaki.").optional(),
  badgeTone: z.string().trim().max(32, "Maksymalnie 32 znaki.").optional(),
  discountValue: numericString0to100.optional(),
  rating: ratingString.optional(),
  ratingCount: ratingCountString.optional(),
  ctaLabel: z.string().trim().max(60, "Maksymalnie 60 znaków.").optional(),
  ctaUrl: optionalUrl.optional(),
  imageUrl: optionalUrl.optional(),
  companyId: z.string().trim().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toISOString(value: string | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function sanitizeString(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function MarketingDashboard({ section, companies, defaultSlug }: MarketingDashboardProps) {
  const router = useRouter();
  const [spotlights, setSpotlights] = useState<MarketingSpotlight[]>(() =>
    [...(section?.spotlights ?? [])].sort((a, b) => a.order - b.order),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingSpotlight | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MarketingSpotlight | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    setSpotlights([...(section?.spotlights ?? [])].sort((a, b) => a.order - b.order));
  }, [section?.spotlights]);

  const hasSection = Boolean(section);

  const sectionId = section?.id;

  const defaultFormValues = useMemo<FormValues>(
    () => ({
      title: "",
      headline: "",
      badgeLabel: "",
      badgeTone: "pink",
      discountValue: "",
      rating: "",
      ratingCount: "",
      ctaLabel: "Sprawdź ofertę",
      ctaUrl: "",
      imageUrl: "",
      companyId: "",
      startsAt: (() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
      })(),
      endsAt: "",
      isActive: true,
    }),
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const resetForm = useCallback(
    (data?: Partial<FormValues>) => {
      form.reset({
        ...defaultFormValues,
        ...data,
      });
    },
    [form, defaultFormValues],
  );

  const openCreateDialog = () => {
    setEditing(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (spotlight: MarketingSpotlight) => {
    setEditing(spotlight);
    resetForm({
      title: spotlight.title,
      headline: spotlight.headline ?? "",
      badgeLabel: spotlight.badgeLabel ?? "",
      badgeTone: spotlight.badgeTone ?? "pink",
      discountValue: spotlight.discountValue !== null && spotlight.discountValue !== undefined ? String(spotlight.discountValue) : "",
      rating: spotlight.rating !== null && spotlight.rating !== undefined ? String(spotlight.rating) : "",
      ratingCount:
        spotlight.ratingCount !== null && spotlight.ratingCount !== undefined ? String(spotlight.ratingCount) : "",
      ctaLabel: spotlight.ctaLabel ?? "",
      ctaUrl: spotlight.ctaUrl ?? "",
      imageUrl: spotlight.imageUrl ?? "",
      companyId: spotlight.companyId ?? "",
      startsAt: toDateTimeLocal(spotlight.startsAt),
      endsAt: toDateTimeLocal(spotlight.endsAt),
      isActive: spotlight.isActive,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditing(null);
      form.reset(defaultFormValues);
    }, 150);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!hasSection) {
      alert("Sekcja marketingowa nie jest dostępna.");
      return;
    }

    const payload = {
      sectionId,
      sectionSlug: sectionId ? undefined : defaultSlug,
      title: values.title.trim(),
      headline: sanitizeString(values.headline),
      badgeLabel: sanitizeString(values.badgeLabel),
      badgeTone: sanitizeString(values.badgeTone),
      discountValue:
        values.discountValue && values.discountValue.trim() !== ""
          ? Number(values.discountValue.trim())
          : null,
      rating:
        values.rating && values.rating.trim() !== "" ? Number(values.rating.trim()) : null,
      ratingCount:
        values.ratingCount && values.ratingCount.trim() !== ""
          ? Number(values.ratingCount.trim())
          : null,
      ctaLabel: sanitizeString(values.ctaLabel),
      ctaUrl: sanitizeString(values.ctaUrl),
      imageUrl: sanitizeString(values.imageUrl),
      companyId:
        values.companyId && values.companyId.trim().length > 0 ? values.companyId.trim() : null,
      isActive: values.isActive ?? true,
      startsAt: toISOString(values.startsAt),
      endsAt: toISOString(values.endsAt),
    };

    if (
      payload.discountValue !== null &&
      (Number.isNaN(payload.discountValue) || payload.discountValue < 0 || payload.discountValue > 100)
    ) {
      form.setError("discountValue", { message: "Wartość musi być w zakresie 0-100." });
      return;
    }

    if (
      payload.rating !== null &&
      (Number.isNaN(payload.rating) || payload.rating < 0 || payload.rating > 5)
    ) {
      form.setError("rating", { message: "Zakres oceny to 0-5." });
      return;
    }

    if (payload.ratingCount !== null && Number.isNaN(payload.ratingCount)) {
      form.setError("ratingCount", { message: "Podaj liczbę całkowitą." });
      return;
    }

    if (payload.startsAt && payload.endsAt) {
      const start = new Date(payload.startsAt);
      const end = new Date(payload.endsAt);
      if (start > end) {
        form.setError("endsAt", { message: "Data zakończenia musi być późniejsza niż start." });
        return;
      }
    }

    setIsSaving(true);

    try {
      const url = editing
        ? `/api/admin/marketing/spotlights/${editing.id}`
        : "/api/admin/marketing/spotlights";
      const method = editing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Wystąpił błąd podczas zapisu.");
      }

      const result = (await response.json()) as { data: MarketingSpotlight };
      const updatedSpotlight = result.data;

      setSpotlights((prev) => {
        if (editing) {
          const next = prev.map((item) => (item.id === editing.id ? updatedSpotlight : item));
          return [...next].sort((a, b) => a.order - b.order);
        }
        return [...prev, updatedSpotlight].sort((a, b) => a.order - b.order);
      });

      closeDialog();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Nie udało się zapisać spotlightu.");
    } finally {
      setIsSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/admin/marketing/spotlights/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Nie udało się usunąć spotlightu.");
      }

      setSpotlights((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Nie udało się usunąć spotlightu.");
    }
  };

  const reorderSpotlights = async (
    nextOrder: MarketingSpotlight[],
    previousOrder?: MarketingSpotlight[],
  ) => {
    if (!hasSection) return;
    setIsReordering(true);

    try {
      const response = await fetch("/api/admin/marketing/spotlights/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          sectionSlug: sectionId ? undefined : defaultSlug,
          items: nextOrder.map((item, index) => ({ id: item.id, order: index })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Nie udało się zapisać kolejności.");
      }

      setSpotlights(nextOrder.map((item, index) => ({ ...item, order: index })));
      router.refresh();
    } catch (error) {
      console.error(error);
      if (previousOrder) {
        setSpotlights(previousOrder);
      }
      alert(error instanceof Error ? error.message : "Nie udało się zapisać kolejności.");
    } finally {
      setIsReordering(false);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setSpotlights((prev) => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) {
        return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      const ordered = next.map((spotlight, order) => ({ ...spotlight, order }));
      void reorderSpotlights(ordered, prev);
      return ordered;
    });
  };

  const refreshFromServer = async () => {
    if (!hasSection) return;

    try {
      const response = await fetch(
        `/api/admin/marketing/spotlights?section=${section?.slug ?? defaultSlug}`,
      );
      if (!response.ok) {
        throw new Error("Nie udało się odświeżyć danych.");
      }
      const payload = (await response.json()) as {
        data: MarketingSpotlight[];
      };
      setSpotlights((payload.data ?? []).sort((a, b) => a.order - b.order));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Nie udało się odświeżyć spotlightów.");
    }
  };

  if (!hasSection) {
    return (
      <div className="flex h-full items-center justify-center px-[clamp(1.6rem,3.2vw,2.4rem)] py-[clamp(2.5rem,4vw,3.4rem)]">
        <SectionCard
          title="Marketing"
          description="Nie udało się znaleźć sekcji marketingowej. Upewnij się, że migracje bazy danych zostały zastosowane poprawnie."
          className="w-full max-w-[clamp(24rem,58vw,34rem)] text-center"
        >
          <p className="fluid-copy text-muted-foreground">
            Spróbuj ponownie po odświeżeniu danych lub skontaktuj się z zespołem technicznym.
          </p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[clamp(1.5rem,2.4vw,2.1rem)] pb-[clamp(2.6rem,4vw,3.4rem)]">
      <div className="flex flex-wrap items-start justify-between gap-[clamp(0.85rem,1.3vw,1.1rem)]">
        <div className="flex flex-col gap-[clamp(0.45rem,0.7vw,0.6rem)]">
          <div className="flex items-center gap-[clamp(0.55rem,0.85vw,0.75rem)]">
            <Flame className="h-[clamp(1.5rem,0.6vw+1.3rem,1.75rem)] w-[clamp(1.5rem,0.6vw+1.3rem,1.75rem)] text-primary" />
            <h1 className="fluid-h2 font-semibold text-foreground">Oferty marketingowe</h1>
          </div>
          <p className="max-w-2xl fluid-copy text-muted-foreground">
            Zarządzaj karuzelą ofert specjalnych wyświetlaną na stronie głównej.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.75rem)]">
          <Button
            variant="outline"
            className="fluid-button-sm"
            onClick={() => void refreshFromServer()}
            disabled={isReordering}
          >
            <RefreshCcw
              className={cn(
                "h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]",
                isReordering && "animate-spin"
              )}
            />
            Odśwież
          </Button>
          <Button className="fluid-button-sm" onClick={openCreateDialog}>
            <Plus className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
            Dodaj spotlight
          </Button>
        </div>
      </div>

      <SectionCard
        className="bg-card/66"
        title={`Sekcja: ${section?.title ?? "Brak sekcji"}`}
        description={`Łącznie ${spotlights.length} elementów. Pierwsze trzy są widoczne na mniejszych ekranach.`}
      >
        {spotlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[clamp(0.65rem,0.95vw,0.8rem)] rounded-2xl border border-dashed border-border/50 bg-muted/30 px-[clamp(1.6rem,2.5vw,2.1rem)] py-[clamp(2.1rem,3.1vw,2.7rem)] text-center">
            <p className="fluid-copy text-muted-foreground">
              Brak skonfigurowanych spotlightów. Dodaj pierwszy element, aby sekcja pojawiła się na stronie głównej.
            </p>
          </div>
        ) : (
          <Table className="min-w-[clamp(56rem,78vw,70rem)] text-[clamp(0.9rem,0.3vw+0.82rem,1.02rem)] leading-[clamp(1.4rem,0.45vw+1.25rem,1.6rem)]">
            <TableHeader>
              <TableRow className="border-border/60 bg-card/55">
                <TableHead className="w-[clamp(4.25rem,6vw,5.5rem)] px-[clamp(0.85rem,1.2vw,1.1rem)] text-left text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
                  Kolejność
                </TableHead>
                <TableHead className="px-[clamp(0.85rem,1.2vw,1.1rem)] text-left text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
                  Oferta
                </TableHead>
                <TableHead className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] text-left text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75 md:table-cell">
                  Firma
                </TableHead>
                <TableHead className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] text-center text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75 md:table-cell">
                  Zniżka
                </TableHead>
                <TableHead className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] text-center text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75 md:table-cell">
                  Ocena
                </TableHead>
                <TableHead className="px-[clamp(0.85rem,1.2vw,1.1rem)] text-center text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
                  Status
                </TableHead>
                <TableHead className="px-[clamp(0.85rem,1.2vw,1.1rem)] text-right text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
                  Akcje
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border/50">
              {spotlights.map((spotlight, index) => (
                <TableRow
                  key={spotlight.id}
                  className="border-border/50 transition-colors hover:bg-accent/40"
                >
                  <TableCell className="align-top px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                    <div className="flex items-start gap-[clamp(0.55rem,0.85vw,0.75rem)] text-muted-foreground">
                      <span className="text-[clamp(1rem,0.45vw+0.9rem,1.15rem)] font-semibold text-foreground">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[clamp(2.1rem,1.6vw+1.7rem,2.4rem)] w-[clamp(2.1rem,1.6vw+1.7rem,2.4rem)] rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0 || isReordering}
                          aria-label="Przesuń w górę"
                        >
                          <ArrowUp className="h-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)] w-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[clamp(2.1rem,1.6vw+1.7rem,2.4rem)] w-[clamp(2.1rem,1.6vw+1.7rem,2.4rem)] rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => moveItem(index, 1)}
                          disabled={index === spotlights.length - 1 || isReordering}
                          aria-label="Przesuń w dół"
                        >
                          <ArrowDown className="h-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)] w-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)]" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[clamp(14rem,24vw,18rem)] px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                    <div className="flex flex-col gap-[clamp(0.4rem,0.6vw,0.5rem)]">
                      <div className="flex flex-wrap items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
                        {spotlight.badgeLabel && (
                          <Badge variant="outline" className="fluid-badge bg-primary/10 text-primary">
                            {spotlight.badgeLabel}
                          </Badge>
                        )}
                        {!spotlight.isActive && (
                          <Badge variant="outline" className="fluid-badge bg-muted/60 text-muted-foreground">
                            Wstrzymane
                          </Badge>
                        )}
                      </div>
                      <p className="text-[clamp(0.98rem,0.45vw+0.88rem,1.15rem)] font-semibold leading-tight text-foreground">
                        {spotlight.title}
                      </p>
                      {spotlight.headline && (
                        <p className="fluid-caption text-muted-foreground line-clamp-1">
                          {spotlight.headline}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] align-top md:table-cell">
                    {spotlight.company ? (
                      <div className="flex flex-col gap-[clamp(0.25rem,0.4vw,0.35rem)]">
                        <span className="text-[clamp(0.92rem,0.4vw+0.82rem,1.05rem)] font-medium text-foreground">
                          {spotlight.company.name}
                        </span>
                        <span className="text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] text-muted-foreground">
                          {spotlight.company.slug}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] text-muted-foreground">
                        Brak powiązania
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-center align-top md:table-cell">
                    {spotlight.discountValue !== null && spotlight.discountValue !== undefined ? (
                      <span className="text-[clamp(0.95rem,0.35vw+0.88rem,1.1rem)] font-semibold text-primary">
                        {spotlight.discountValue}%
                      </span>
                    ) : (
                      <span className="text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-center align-top md:table-cell">
                    {spotlight.rating !== null && spotlight.rating !== undefined ? (
                      <div className="flex items-center justify-center gap-[clamp(0.35rem,0.5vw,0.45rem)] text-[clamp(0.92rem,0.4vw+0.82rem,1.05rem)] font-semibold text-foreground">
                        <BadgeCheck className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] text-primary" />
                        <span>{spotlight.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-center align-top">
                    <div className="flex flex-col items-center gap-[clamp(0.45rem,0.65vw,0.55rem)] text-muted-foreground">
                      <div
                        className={cn(
                          "flex items-center gap-[clamp(0.35rem,0.55vw,0.45rem)] rounded-full px-[clamp(0.65rem,0.95vw,0.8rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] font-semibold",
                          spotlight.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-border/60 text-muted-foreground"
                        )}
                      >
                        {spotlight.isActive ? (
                          <>
                            <Check className="h-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)] w-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)]" />
                            Aktywny
                          </>
                        ) : (
                          <>
                            <X className="h-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)] w-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)]" />
                            Nieaktywny
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.45rem)] text-[clamp(0.75rem,0.3vw+0.7rem,0.85rem)] text-muted-foreground/80">
                        <Calendar className="h-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)] w-[clamp(0.95rem,0.35vw+0.88rem,1.05rem)]" />
                        <span>
                          {spotlight.startsAt
                            ? new Date(spotlight.startsAt).toLocaleDateString("pl-PL", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "Natychmiast"}
                          {" — "}
                          {spotlight.endsAt
                            ? new Date(spotlight.endsAt).toLocaleDateString("pl-PL", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "Brak limitu"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-[clamp(0.85rem,1.2vw,1.1rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-right align-top">
                    <div className="flex justify-end gap-[clamp(0.45rem,0.7vw,0.6rem)]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-[clamp(2.35rem,1.8vw+1.85rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.85rem,2.7rem)] rounded-full hover:text-foreground"
                        onClick={() => openEditDialog(spotlight)}
                        aria-label="Edytuj spotlight"
                      >
                        <Pencil className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-[clamp(2.35rem,1.8vw+1.85rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.85rem,2.7rem)] rounded-full text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(spotlight)}
                        aria-label="Usuń spotlight"
                      >
                        <Trash2 className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto px-[clamp(1.4rem,2.6vw,2rem)] py-[clamp(1.6rem,2.8vw,2.2rem)]">
          <DialogHeader className="space-y-[clamp(0.65rem,0.95vw,0.85rem)]">
            <DialogTitle className="fluid-h2 text-foreground">
              {editing ? "Edytuj spotlight" : "Dodaj spotlight"}
            </DialogTitle>
            <DialogDescription className="fluid-copy text-muted-foreground">
              Uzupełnij informacje, aby wyróżniona oferta pojawiła się w sekcji marketingowej na
              stronie głównej.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-[clamp(1.1rem,1.7vw,1.5rem)]"
              onSubmit={onSubmit}
            >
              <div className="grid gap-[clamp(1.1rem,1.7vw,1.5rem)] md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)] md:col-span-2">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Tytuł
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="np. Listopadowa promocja Alpha Capital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)] md:col-span-2">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Opis (opcjonalnie)
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Krótka zajawka widoczna pod tytułem." rows={3} {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Maksymalnie 160 znaków.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Powiązana firma
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                        value={field.value && field.value.length > 0 ? field.value : "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz firmę (opcjonalnie)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Brak powiązania</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                              {company.rating ? ` • ${company.rating.toFixed(1)}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Jeśli wybierzesz firmę, jej nazwa i logo pojawią się na karcie.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeLabel"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Badge
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="np. 15% OFF" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Krótka etykieta wyróżniająca promocję.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeTone"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Kolor badge
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="np. pink, violet, emerald" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Zdefiniuj nazwę odcienia zgodną z tokenami Tailwind.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Zniżka (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} step={1} placeholder="np. 20" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Liczba od 0 do 100. Pozostaw puste, jeśli nie dotyczy.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Ocena
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={5} step={0.1} placeholder="np. 4.5" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Wartość w skali 0-5.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ratingCount"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Liczba opinii
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={1} placeholder="np. 120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaLabel"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Tekst przycisku
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="np. Sprawdź ofertę" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)] md:col-span-2">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Link CTA
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)] md:col-span-2">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Obraz (opcjonalnie)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Adres do grafiki w tle karty (opcjonalnie).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Start publikacji
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Moment, od którego oferta staje się widoczna.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem className="space-y-[clamp(0.45rem,0.65vw,0.55rem)]">
                      <FormLabel className="fluid-copy font-semibold text-foreground">
                        Koniec publikacji
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription className="fluid-caption text-muted-foreground">
                        Pozostaw puste, jeśli oferta ma być stała.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-[clamp(1.1rem,1.6vw,1.4rem)] py-[clamp(1rem,1.4vw,1.2rem)]">
                      <div className="space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
                        <FormLabel className="fluid-copy font-semibold text-foreground">
                          Widoczność
                        </FormLabel>
                        <FormDescription className="fluid-caption text-muted-foreground">
                          Wstrzymane oferty nie będą widoczne, ale zachowają kolejkowanie.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="fluid-button-sm"
                  onClick={closeDialog}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSaving} className="fluid-button-sm">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Zapisz
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md px-[clamp(1.3rem,2.2vw,1.8rem)] py-[clamp(1.4rem,2.4vw,2rem)]">
          <DialogHeader className="space-y-[clamp(0.55rem,0.85vw,0.75rem)]">
            <DialogTitle className="fluid-h2 text-foreground">Usuń spotlight</DialogTitle>
            <DialogDescription className="fluid-copy text-muted-foreground">
              Czy na pewno chcesz usunąć spotlight <strong>{deleteTarget?.title}</strong>? Tej akcji
              nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="fluid-button-sm" onClick={() => setDeleteTarget(null)}>
              Anuluj
            </Button>
            <Button variant="destructive" className="fluid-button-sm" onClick={() => void handleDelete()}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


