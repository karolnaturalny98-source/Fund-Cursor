"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Edit2, Trash2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const optionalUrl = z
  .string()
  .url({ message: "Podaj poprawny URL." })
  .or(z.literal(""))
  .optional();

const formSchema = z.object({
  name: z.string().min(2, "Nazwa jest wymagana (min 2 znaki)."),
  role: z.string().min(1, "Rola jest wymagana.").max(100, "Rola może mieć maksymalnie 100 znaków."),
  linkedInUrl: optionalUrl,
  profileImageUrl: optionalUrl,
  level: z.string().regex(/^\d+$/, "Poziom musi być liczbą.").refine((val) => {
    const num = Number.parseInt(val, 10);
    return num >= 0 && num <= 10;
  }, "Poziom musi być między 0 a 10."),
  position: z.enum(["left", "right", "center"]).optional(),
  order: z.string().regex(/^\d+$/, "Kolejność musi być liczbą.").refine((val) => {
    const num = Number.parseInt(val, 10);
    return num >= 0;
  }, "Kolejność musi być >= 0."),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  linkedInUrl: string | null;
  profileImageUrl: string | null;
  level: number;
  position: string | null;
  order: number;
}

interface TeamManagementFormProps {
  companySlug: string;
}

export function TeamManagementForm({ companySlug }: TeamManagementFormProps) {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null);
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      linkedInUrl: "",
      profileImageUrl: "",
      level: "0",
      position: undefined,
      order: "0",
    },
  });

  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companySlug}/team`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać członków zespołu.");
      }
      const data = await response.json();
      setTeamMembers(data.data ?? []);
    } catch (error) {
      console.error(error);
      setServerMessage({
        type: "error",
        text: "Nie udało się pobrać członków zespołu.",
      });
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    void loadTeamMembers();
  }, [loadTeamMembers]);

  const onSubmit = async (values: FormValues) => {
    setServerMessage(null);

    const normalizeString = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };

    const payload = {
      name: normalizeString(values.name)!,
      role: normalizeString(values.role)!,
      linkedInUrl: normalizeString(values.linkedInUrl),
      profileImageUrl: normalizeString(values.profileImageUrl),
      level: Number.parseInt(values.level, 10),
      position: values.position || null,
      order: Number.parseInt(values.order, 10),
    };

    try {
      const url = editingMember
        ? `/api/admin/companies/${companySlug}/team/${editingMember}`
        : `/api/admin/companies/${companySlug}/team`;
      const method = editingMember ? "PATCH" : "POST";

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
          text: data.error ?? `Nie udało się ${editingMember ? "zaktualizować" : "dodać"} członka zespołu.`,
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: `Członek zespołu został ${editingMember ? "zaktualizowany" : "dodany"}.`,
      });

      reset();
      setEditingMember(null);
      await loadTeamMembers();
      router.refresh();
    } catch (error) {
      console.error(error);
      setServerMessage({
        type: "error",
        text: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member.id);
    setValue("name", member.name);
    setValue("role", member.role);
    setValue("linkedInUrl", member.linkedInUrl || "");
    setValue("profileImageUrl", member.profileImageUrl || "");
    setValue("level", member.level.toString());
    setValue("position", (member.position as "left" | "right" | "center") || undefined);
    setValue("order", member.order.toString());
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `/api/admin/companies/${companySlug}/team/${deleteDialog.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerMessage({
          type: "error",
          text: data?.error ?? "Nie udało się usunąć członka zespołu.",
        });
        return;
      }

      setDeleteDialog(null);
      await loadTeamMembers();
      router.refresh();
    } catch (error) {
      console.error(error);
      setServerMessage({
        type: "error",
        text: "Wystąpił błąd podczas usuwania członka zespołu.",
      });
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col fluid-stack-md">
      <div className="rounded-2xl border-gradient bg-gradient-card p-6 shadow-premium">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Zarządzanie zespołem</h3>
            <p className="text-sm text-muted-foreground">
              Dodaj i edytuj członków zespołu z ich danymi i pozycjami w hierarchii.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-stack-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Imię i nazwisko *</label>
              <Input placeholder="Jan Kowalski" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Rola *</label>
              <Input placeholder="CEO" {...register("role")} />
              {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Link do LinkedIn</label>
              <Input placeholder="https://linkedin.com/in/..." {...register("linkedInUrl")} />
              {errors.linkedInUrl && <p className="mt-1 text-xs text-destructive">{errors.linkedInUrl.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">URL zdjęcia profilowego</label>
              <Input placeholder="https://..." {...register("profileImageUrl")} />
              {errors.profileImageUrl && <p className="mt-1 text-xs text-destructive">{errors.profileImageUrl.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Poziom (0-10) *</label>
              <Input type="number" min="0" max="10" {...register("level")} />
              {errors.level && <p className="mt-1 text-xs text-destructive">{errors.level.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pozycja</label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Nie wybrano</option>
                    <option value="left">Lewo</option>
                    <option value="center">Środek</option>
                    <option value="right">Prawo</option>
                  </select>
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kolejność *</label>
              <Input type="number" min="0" {...register("order")} />
              {errors.order && <p className="mt-1 text-xs text-destructive">{errors.order.message}</p>}
            </div>
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="rounded-full">
              {isSubmitting ? "Zapisywanie..." : editingMember ? "Zaktualizuj" : "Dodaj członka"}
            </Button>
            {editingMember && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setEditingMember(null);
                }}
                className="rounded-full"
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </div>

      <Separator />

      <div className="flex flex-col fluid-stack-sm">
        <h4 className="text-base font-semibold">Członkowie zespołu ({teamMembers.length})</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Ładowanie...</p>
        ) : teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak członków zespołu.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="group relative overflow-hidden rounded-2xl border-gradient bg-gradient-card shadow-premium transition-all hover:border-gradient-premium hover:shadow-premium-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 rounded-full border-2 border-primary/20">
                      <AvatarImage src={member.profileImageUrl || undefined} alt={member.name} />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col fluid-stack-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Poziom: {member.level}</span>
                            {member.position && <span>• {member.position}</span>}
                            <span>• Kolejność: {member.order}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-destructive hover:text-destructive"
                            onClick={() => setDeleteDialog({ id: member.id, name: member.name })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {member.linkedInUrl && (
                        <a
                          href={member.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń członka zespołu</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć {deleteDialog?.name}? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="rounded-full">
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-full">
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


