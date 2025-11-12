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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-xl border border-border/60 bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px]">
          <CardHeader>
            <CardTitle>Marketing</CardTitle>
            <CardDescription>
              Nie udało się znaleźć sekcji marketingowej. Upewnij się, że migracje bazy danych
              zostały zastosowane poprawnie.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            Oferty marketingowe
          </h1>
          <p className="text-sm text-muted-foreground">
            Zarządzaj karuzelą ofert specjalnych wyświetlaną na stronie głównej.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refreshFromServer()} disabled={isReordering}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", isReordering && "animate-spin")} />
            Odśwież
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj spotlight
          </Button>
        </div>
      </div>

      <Card className="border border-border/60 bg-[rgba(11,13,16,0.66)] !backdrop-blur-[36px]">
        <CardHeader>
          <CardTitle>Sekcja: {section?.title}</CardTitle>
          <CardDescription>
            Łącznie {spotlights.length} elementów. Pierwsze trzy są widoczne na mniejszych ekranach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {spotlights.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Brak skonfigurowanych spotlightów. Dodaj pierwszy element, aby sekcja pojawiła się na
              stronie głównej.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Kolejność</TableHead>
                    <TableHead>Oferta</TableHead>
                    <TableHead className="hidden md:table-cell">Firma</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Zniżka</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Ocena</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spotlights.map((spotlight, index) => (
                    <TableRow key={spotlight.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{index + 1}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0 || isReordering}
                              aria-label="Przesuń w górę"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveItem(index, 1)}
                              disabled={index === spotlights.length - 1 || isReordering}
                              aria-label="Przesuń w dół"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {spotlight.badgeLabel && (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {spotlight.badgeLabel}
                              </Badge>
                            )}
                            {!spotlight.isActive && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                Wstrzymane
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-foreground">{spotlight.title}</p>
                          {spotlight.headline && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {spotlight.headline}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {spotlight.company ? (
                          <div className="flex flex-col text-sm">
                            <span className="font-medium text-foreground">{spotlight.company.name}</span>
                            <span className="text-xs text-muted-foreground">{spotlight.company.slug}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Brak powiązania</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {spotlight.discountValue !== null && spotlight.discountValue !== undefined ? (
                          <span className="text-sm font-semibold text-primary">
                            {spotlight.discountValue}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {spotlight.rating !== null && spotlight.rating !== undefined ? (
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <BadgeCheck className="h-4 w-4 text-primary" />
                            <span>{spotlight.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                          <div
                            className={cn(
                              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              spotlight.isActive ? "bg-emerald-100 text-emerald-700" : "bg-border text-muted-foreground",
                            )}
                          >
                            {spotlight.isActive ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Aktywny
                              </>
                            ) : (
                              <>
                                <X className="h-3.5 w-3.5" />
                                Nieaktywny
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="h-3 w-3" />
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(spotlight)}
                            aria-label="Edytuj spotlight"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(spotlight)}
                            aria-label="Usuń spotlight"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edytuj spotlight" : "Dodaj spotlight"}</DialogTitle>
            <DialogDescription>
              Uzupełnij informacje, aby wyróżniona oferta pojawiła się w sekcji marketingowej na
              stronie głównej.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tytuł</FormLabel>
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Opis (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Krótka zajawka widoczna pod tytułem." rows={3} {...field} />
                      </FormControl>
                      <FormDescription>Maksymalnie 160 znaków.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Powiązana firma</FormLabel>
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
                      <FormDescription>
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
                    <FormItem>
                      <FormLabel>Badge</FormLabel>
                      <FormControl>
                        <Input placeholder="np. 15% OFF" {...field} />
                      </FormControl>
                      <FormDescription>Krótka etykieta wyróżniająca promocję.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeTone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor badge</FormLabel>
                      <FormControl>
                        <Input placeholder="np. pink, violet, emerald" {...field} />
                      </FormControl>
                      <FormDescription>Zdefiniuj nazwę odcienia zgodną z tokenami Tailwind.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zniżka (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} step={1} placeholder="np. 20" {...field} />
                      </FormControl>
                      <FormDescription>Liczba od 0 do 100. Pozostaw puste, jeśli nie dotyczy.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocena</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={5} step={0.1} placeholder="np. 4.5" {...field} />
                      </FormControl>
                      <FormDescription>Wartość w skali 0-5.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ratingCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liczba opinii</FormLabel>
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
                    <FormItem>
                      <FormLabel>Tekst przycisku</FormLabel>
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Link CTA</FormLabel>
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Obraz (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>Adres do grafiki w tle karty (opcjonalnie).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start publikacji</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>Moment, od którego oferta staje się widoczna.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Koniec publikacji</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>Pozostaw puste, jeśli oferta ma być stała.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Widoczność</FormLabel>
                        <FormDescription>
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
                <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSaving}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Usuń spotlight</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć spotlight <strong>{deleteTarget?.title}</strong>? Tej akcji
              nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


