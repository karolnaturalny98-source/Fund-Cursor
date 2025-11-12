"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "./section-card";
import { DataTable } from "./data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShopOrderItem } from "@/lib/queries/shop";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopOrdersTableProps {
  orders: ShopOrderItem[];
}

function formatDate(value: Date | string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return typeof value === "string" ? value : value.toISOString();
  }
}

export function ShopOrdersTable({ orders: initialOrders }: ShopOrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");

  const companies = useMemo(() => {
    const uniqueCompanies = Array.from(
      new Map(initialOrders.map((o) => [o.company.id, o.company])).values()
    );
    return uniqueCompanies;
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      if (companyFilter !== "ALL" && order.company.id !== companyFilter) {
        return false;
      }

      return true;
    });
  }, [initialOrders, statusFilter, companyFilter]);

  const columns: ColumnDef<ShopOrderItem>[] = useMemo(
    () => [
      {
        accessorKey: "userEmail",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div className="font-medium">{row.getValue("userEmail") || "—"}</div>;
        },
      },
      {
        accessorKey: "company.name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Firma
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{row.original.company.name}</div>;
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Cena
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div>
              {order.amount
                ? `${order.amount.toLocaleString("pl-PL")} ${order.currency ?? "USD"}`
                : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "points",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Cashback
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{row.getValue("points")} pkt</div>;
        },
      },
      {
        id: "commission",
        header: "Prowizja",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div>
              {order.plan?.affiliateCommission && order.amount
                ? `${((order.amount * order.plan.affiliateCommission) / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${order.currency ?? "USD"} (${order.plan.affiliateCommission}%)`
                : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant={
                status === "APPROVED"
                  ? "default"
                  : "outline-solid"
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 lg:px-3"
            >
              Data
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="text-xs text-muted-foreground">
              {formatDate(row.getValue("createdAt"))}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <SectionCard
      title="Historia zamówień"
      description="Wszystkie zamówienia ze sklepu z możliwością filtrowania i sortowania"
      headerActions={
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie statusy</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="REJECTED">REJECTED</SelectItem>
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Firma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie firmy</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="userEmail"
        searchPlaceholder="Szukaj po email, ID lub firmie..."
      />
    </SectionCard>
  );
}

