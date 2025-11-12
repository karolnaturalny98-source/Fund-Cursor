"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShopRevenueStats } from "@/lib/queries/shop";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Percent,
  Clock,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

interface ShopStatisticsProps {
  stats: ShopRevenueStats;
}

export function ShopStatistics({ stats }: ShopStatisticsProps) {
  return (
    <div className="space-y-6">
      {/* Główne metryki */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold tracking-tight">
              ${stats.revenue.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Łączny przychód ze wszystkich zamówień
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Koszty cashbacku
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <div className="flex flex-col">
              <p className="text-2xl font-semibold tracking-tight">
                {stats.costs.toLocaleString("pl-PL")} pkt
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                ${stats.costs.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Suma punktów cashback z zatwierdzonych (1 pkt = $1)
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Zarobek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-semibold tracking-tight">
              ${stats.profit.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue - Koszty - Prowizja
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold tracking-tight">
              {stats.totalOrders}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.approvedOrders} zatwierdzone, {stats.pendingOrders} oczekujące, {stats.rejectedOrders} odrzucone
          </p>
        </CardContent>
      </Card>
      </div>

      {/* Nowe KPI - Conversion i Performance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.conversionRate.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zamówienia / Kliknięcia
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Średnia wartość zamówienia (AOV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                ${stats.averageOrderValue.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue / Zatwierdzone zamówienia
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wskaźnik zatwierdzeń
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.approvalRate.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zatwierdzone / Wszystkie zamówienia
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wskaźnik odrzuceń
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.rejectionRate.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Odrzucone / Wszystkie zamówienia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Średnie wartości i aktywność */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Średni cashback na zamówienie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                ${stats.averageCashbackPerOrder.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Koszty / Zatwierdzone zamówienia
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Średnia prowizja na zamówienie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                ${stats.averageCommissionPerOrder.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Prowizja łączna / Zatwierdzone zamówienia
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktywni użytkownicy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.activeUsers}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unikalni użytkownicy z zamówieniami
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue per Click (RPC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                ${stats.revenuePerClick.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue / Wszystkie kliknięcia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI i marże */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.roi.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Zarobek / Koszty) × 100
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marża zysku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-500" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.profitMargin.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Zarobek / Revenue) × 100
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wskaźnik cashbacku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.cashbackRate.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Koszty / Revenue) × 100
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wskaźnik prowizji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.commissionRate.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Prowizja / Revenue) × 100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Czas zatwierdzenia */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Średni czas zatwierdzenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold tracking-tight">
                {stats.averageTimeToApproval.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Średni czas od utworzenia do zatwierdzenia
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
