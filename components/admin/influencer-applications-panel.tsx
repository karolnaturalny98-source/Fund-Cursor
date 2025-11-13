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
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-[clamp(1.25rem,1.8vw,1.6rem)] text-center text-muted-foreground fluid-copy">
        Brak zgłoszeń influencerów.
      </div>
    );
  }

  return (
    <div className="flex flex-col fluid-stack-md">
      {error ? (
        <p className="rounded-2xl border border-destructive/50 bg-destructive/10 px-[clamp(0.75rem,1vw,0.9rem)] py-[clamp(0.6rem,0.8vw,0.7rem)] text-destructive fluid-caption">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-[clamp(0.75rem,1vw,0.9rem)] py-[clamp(0.6rem,0.8vw,0.7rem)] text-emerald-600 fluid-caption dark:text-emerald-400">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
        <table className="min-w-full divide-y divide-border text-left">
          <thead>
            <tr className="text-muted-foreground fluid-eyebrow">
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Influencer</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Profil</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Zasięg</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Kontakt</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Preferencje</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Kod polecający</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)]">Notatka</th>
              <th className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.6rem,0.9vw,0.8rem)] text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {rows.map((profile) => (
              <tr key={profile.id} className="align-top">
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                  <div className="flex flex-col gap-[clamp(0.35rem,0.5vw,0.45rem)]">
                    <span className="font-medium text-foreground fluid-copy">
                      {profile.user?.displayName ?? profile.user?.clerkId ?? "Unknown"}
                    </span>
                    <span className="text-muted-foreground fluid-caption">
                      {profile.user?.email ?? "brak email"}
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-muted/40 px-[clamp(0.6rem,0.9vw,0.8rem)] py-[clamp(0.25rem,0.4vw,0.35rem)] font-semibold uppercase tracking-[0.2em] text-muted-foreground fluid-caption">
                      {profile.platform}
                    </span>
                    <span className={cn("inline-flex w-fit rounded-full px-[clamp(0.6rem,0.9vw,0.8rem)] py-[clamp(0.25rem,0.4vw,0.35rem)] font-semibold fluid-caption", STATUS_BADGE[profile.status])}>
                      {STATUS_LABELS[profile.status]}
                    </span>
                  </div>
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] flex flex-col fluid-stack-xs">
                  <p className="font-mono text-muted-foreground fluid-caption">{profile.handle}</p>
                  {profile.socialLinks.length ? (
                    <ul className="flex flex-col fluid-stack-xs text-primary fluid-caption">
                      {profile.socialLinks.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            className="transition-colors hover:text-primary/80 hover:underline"
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
                    <p className="text-muted-foreground fluid-caption">{profile.bio}</p>
                  ) : null}
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-muted-foreground fluid-caption">
                  {profile.audienceSize ? `${profile.audienceSize.toLocaleString("pl-PL")} osób` : "—"}
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-muted-foreground fluid-caption">
                  {profile.contactEmail ?? "—"}
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] text-muted-foreground fluid-caption">
                  {profile.preferredCompanies.length
                    ? profile.preferredCompanies.join(", ")
                    : "—"}
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                  <Input
                    value={referralDraft[profile.id] ?? ""}
                    placeholder="np. FUNDED10"
                    onChange={(event) =>
                      setReferralDraft((prev) => ({
                        ...prev,
                        [profile.id]: event.target.value,
                      }))
                    }
                    className="h-auto min-h-[clamp(2.5rem,3vw,2.75rem)] rounded-full px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption"
                  />
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                  <Textarea
                    value={notesDraft[profile.id] ?? ""}
                    onChange={(event) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [profile.id]: event.target.value,
                      }))
                    }
                    rows={3}
                    className="min-w-[200px] rounded-2xl border-border/60 bg-card/80 px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] fluid-caption shadow-xs"
                  />
                </td>
                <td className="px-[clamp(0.75rem,1.2vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)]">
                  <div className="flex flex-col gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleSaveDetails(profile.id)}
                      className="fluid-button-sm justify-center"
                    >
                      Zapisz kod/notatkę
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "PENDING")}
                      className="fluid-button-sm justify-center"
                    >
                      Oznacz jako pending
                    </Button>
                    <Button
                      size="sm"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "APPROVED")}
                      className="fluid-button-sm justify-center"
                    >
                      Zatwierdź
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => handleStatus(profile.id, "REJECTED")}
                      className="fluid-button-sm justify-center"
                    >
                      Odrzuć
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending && currentActionId === profile.id}
                      onClick={() => setDeleteDialog(profile.id)}
                      className="mt-[clamp(0.35rem,0.5vw,0.45rem)] fluid-button-sm justify-center"
                    >
                      <Trash2 className="mr-2 h-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)] w-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)]" />
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
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending} className="fluid-button-sm">
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="fluid-button-sm">
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

