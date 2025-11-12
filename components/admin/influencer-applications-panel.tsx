"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { InfluencerProfileWithUser, InfluencerStatus } from "@/lib/types";

interface InfluencerApplicationsPanelProps {
  profiles: InfluencerProfileWithUser[];
}

const STATUS_LABELS: Record<InfluencerStatus, string> = {
  PENDING: "W trakcie weryfikacji",
  APPROVED: "Zatwierdzony",
  REJECTED: "Odrzucony",
};

const STATUS_BADGE: Record<InfluencerStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export function InfluencerApplicationsPanel({
  profiles,
}: InfluencerApplicationsPanelProps) {
  const router = useRouter();
  const [rows, setRows] = useState<InfluencerProfileWithUser[]>(profiles);
  const [referralDraft, setReferralDraft] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Filtruj tylko profile ze statusem PENDING
    const pendingProfiles = profiles.filter((p) => p.status === "PENDING");
    setRows(pendingProfiles);
    setReferralDraft(
      pendingProfiles.reduce<Record<string, string>>((acc, profile) => {
        acc[profile.id] = profile.referralCode ?? "";
        return acc;
      }, {}),
    );
    setNotesDraft(
      pendingProfiles.reduce<Record<string, string>>((acc, profile) => {
        acc[profile.id] = profile.notes ?? "";
        return acc;
      }, {}),
    );
  }, [profiles]);

  const pendingCount = useMemo(() => rows.length, [rows]);

  const handleUpdate = (id: string, payload: Record<string, unknown>) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      setCurrentActionId(id);
      try {
        const response = await fetch(`/api/admin/influencers/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 409) {
            setError("Kod polecający jest już używany przez innego influencera.");
          } else {
            const body = await response.json().catch(() => null);
            const message =
              typeof body?.error === "string"
                ? body.error
                : "Nie udało się zaktualizować profilu.";
            setError(message);
          }
          return;
        }

        const body = (await response.json()) as { data?: InfluencerProfileWithUser };
        if (body?.data) {
          // Jeśli status został zmieniony na APPROVED, usuń z listy
          if (body.data.status === "APPROVED") {
            setRows((prev) => prev.filter((row) => row.id !== id));
            setReferralDraft((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setNotesDraft((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setMessage("Influencer został zatwierdzony i przeniesiony do listy zatwierdzonych.");
            router.refresh();
          } else {
            setRows((prev) =>
              prev.map((row) => (row.id === id ? body.data! : row)),
            );
            setReferralDraft((prev) => ({
              ...prev,
              [id]: body.data?.referralCode ?? "",
            }));
            setNotesDraft((prev) => ({
              ...prev,
              [id]: body.data?.notes ?? "",
            }));
            setMessage("Zapisano zmiany. Odśwież tabelę, aby zobaczyć aktualne dane.");
          }
        }
      } catch (updateError) {
        console.error("influencer update error", updateError);
        setError("Wystąpił błąd podczas zapisu.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleStatus = (id: string, status: InfluencerStatus) => {
    const payload: Record<string, unknown> = { status };
    const referral = referralDraft[id]?.trim();
    if (referral) {
      payload.referralCode = referral;
    }
    const notes = notesDraft[id]?.trim();
    if (notes) {
      payload.notes = notes;
    }
    handleUpdate(id, payload);
  };

  const handleSaveDetails = (id: string) => {
    const payload: Record<string, unknown> = {};
    payload.referralCode = referralDraft[id]?.trim() || null;
    payload.notes = notesDraft[id]?.trim() || null;
    handleUpdate(id, payload);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;

    startTransition(async () => {
      setCurrentActionId(deleteDialog);
      try {
        const response = await fetch(`/api/admin/influencers/${deleteDialog}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć profilu influencera.");
          setCurrentActionId(null);
          return;
        }

        setDeleteDialog(null);
        setRows((prev) => prev.filter((row) => row.id !== deleteDialog));
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania profilu.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  if (pendingCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Brak zgłoszeń influencerów.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">Influencer</th>
              <th className="px-3 py-2">Profil</th>
              <th className="px-3 py-2">Zasięg</th>
              <th className="px-3 py-2">Kontakt</th>
              <th className="px-3 py-2">Preferencje</th>
              <th className="px-3 py-2">Kod polecający</th>
              <th className="px-3 py-2">Notatka</th>
              <th className="px-3 py-2 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {rows.map((profile) => (
              <tr key={profile.id} className="align-top">
                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {profile.user?.displayName ?? profile.user?.clerkId ?? "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile.user?.email ?? "brak email"}
                    </span>
                    <span className="mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {profile.platform}
                    </span>
                    <span className={cn("mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[profile.status])}>
                      {STATUS_LABELS[profile.status]}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 space-y-1">
                  <p className="font-mono text-xs text-muted-foreground">{profile.handle}</p>
                  {profile.socialLinks.length ? (
                    <ul className="space-y-1 text-xs text-primary">
                      {profile.socialLinks.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            className="hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {profile.bio ? (
                    <p className="text-xs text-muted-foreground">{profile.bio}</p>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {profile.audienceSize ? `${profile.audienceSize.toLocaleString("pl-PL")} osób` : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {profile.contactEmail ?? "—"}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {profile.preferredCompanies.length
                    ? profile.preferredCompanies.join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-3">
                  <Input
                    value={referralDraft[profile.id] ?? ""}
                    placeholder="np. FUNDED10"
                    onChange={(event) =>
                      setReferralDraft((prev) => ({
                        ...prev,
                        [profile.id]: event.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </td>
                <td className="px-3 py-3">
                  <Textarea
                    value={notesDraft[profile.id] ?? ""}
                    onChange={(event) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [profile.id]: event.target.value,
                      }))
                    }
                    rows={3}
                    className="min-w-[200px]"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-2 text-xs">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleSaveDetails(profile.id)}
                    >
                      Zapisz kod/notatkę
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "PENDING")}
                    >
                      Oznacz jako pending
                    </Button>
                    <Button
                      size="sm"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "APPROVED")}
                    >
                      Zatwierdź
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "REJECTED")}
                    >
                      Odrzuć
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => setDeleteDialog(profile.id)}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń profil influencera</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć ten profil influencera? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
