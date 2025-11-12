"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutRow {
  id: string;
  name: string;
  evaluationModel: string;
  firstPayout: string;
  cycle: string;
  profitSplit: string | null;
  notes: string | null;
  isFastest: boolean;
}

interface PayoutsTableProps {
  rows: PayoutRow[];
}

const renderModelLabel = (model: string): string => {
  const labels: Record<string, string> = {
    "one-step": "One-Step",
    "two-step": "Two-Step",
    "instant-funding": "Instant Funding",
  };
  return labels[model] ?? model;
};

export function PayoutsTable({ rows }: PayoutsTableProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  const columns: ColumnDef<PayoutRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Plan
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground">{row.original.name}</span>
              <Badge variant="outline" className="w-fit text-xs">
                {renderModelLabel(row.original.evaluationModel)}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "firstPayout",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Pierwsza wypłata
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isFastest = row.original.isFastest;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{row.original.firstPayout}</span>
              {isFastest && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        Najszybszy
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Najszybsza pierwsza wypłata w ofercie</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const daysA = rowA.original.firstPayout.match(/(\d+)/)?.[1] ?? "999";
          const daysB = rowB.original.firstPayout.match(/(\d+)/)?.[1] ?? "999";
          return parseInt(daysA, 10) - parseInt(daysB, 10);
        },
      },
      {
        accessorKey: "cycle",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Cykl wypłat
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <span className="text-sm text-muted-foreground">{row.original.cycle}</span>;
        },
        sortingFn: (rowA, rowB) => {
          const daysA = rowA.original.cycle.match(/(\d+)/)?.[1] ?? "999";
          const daysB = rowB.original.cycle.match(/(\d+)/)?.[1] ?? "999";
          return parseInt(daysA, 10) - parseInt(daysB, 10);
        },
      },
      {
        accessorKey: "profitSplit",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Profit split
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium text-foreground">
                    {row.original.profitSplit ?? "?"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Udział w zyskach dla tradera</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        sortingFn: (rowA, rowB) => {
          const splitA = rowA.original.profitSplit?.match(/(\d+)/)?.[1] ?? "0";
          const splitB = rowB.original.profitSplit?.match(/(\d+)/)?.[1] ?? "0";
          return parseInt(splitA, 10) - parseInt(splitB, 10);
        },
      },
      {
        accessorKey: "notes",
        header: "Notatki",
        cell: ({ row }) => {
          return (
            <span className="text-xs text-muted-foreground">{row.original.notes ?? "-"}</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div ref={sectionAnim.ref} className={cn("space-y-4", sectionAnim.className)}>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchPlaceholder="Szukaj planu..."
      />
    </div>
  );
}

