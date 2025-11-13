"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { InfluencerProfileWithUser } from "@/lib/types";

interface ApprovedInfluencersPanelProps {
  profiles: InfluencerProfileWithUser[];
}

function formatDate(value: Date | string) {
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return typeof value === "string" ? value : value.toISOString();
  }
}

export function ApprovedInfluencersPanel({
  profiles,
}: ApprovedInfluencersPanelProps) {
  const columns: ColumnDef<InfluencerProfileWithUser>[] = useMemo(
    () => [
      {
        accessorKey: "user.displayName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Influencer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const profile = row.original;
          return (
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
              <span
                className={cn(
                  "mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}
              >
                Zatwierdzony
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "handle",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Profil
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const profile = row.original;
          return (
            <div className="flex flex-col fluid-stack-xs">
              <p className="font-mono text-xs text-muted-foreground">{profile.handle}</p>
              {profile.socialLinks.length > 0 ? (
                <ul className="flex flex-col fluid-stack-xs text-xs text-primary">
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
            </div>
          );
        },
      },
      {
        accessorKey: "audienceSize",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Zasięg
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const audienceSize = row.getValue("audienceSize") as number | null;
          return (
            <div className="text-xs text-muted-foreground">
              {audienceSize ? `${audienceSize.toLocaleString("pl-PL")} osób` : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "contactEmail",
        header: "Kontakt",
        cell: ({ row }) => {
          const contactEmail = row.getValue("contactEmail") as string | null;
          return (
            <div className="text-xs text-muted-foreground">{contactEmail ?? "—"}</div>
          );
        },
      },
      {
        id: "preferredCompanies",
        header: "Preferencje",
        cell: ({ row }) => {
          const profile = row.original;
          return (
            <div className="text-xs text-muted-foreground">
              {profile.preferredCompanies.length
                ? profile.preferredCompanies.join(", ")
                : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "referralCode",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Kod polecający
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const referralCode = row.getValue("referralCode") as string | null;
          return referralCode ? (
            <span className="font-mono text-xs font-semibold text-primary">
              {referralCode}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Notatka",
        cell: ({ row }) => {
          const notes = row.getValue("notes") as string | null;
          return notes ? (
            <p className="text-xs text-muted-foreground max-w-[200px] truncate">{notes}</p>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Data zatwierdzenia
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="text-xs text-muted-foreground">
              {formatDate(row.getValue("updatedAt"))}
            </div>
          );
        },
      },
    ],
    []
  );

  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Brak zatwierdzonych influencerów.
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={profiles}
      searchKey="user.displayName"
      searchPlaceholder="Szukaj po nazwie, email, handle lub kodzie polecającym..."
    />
  );
}

