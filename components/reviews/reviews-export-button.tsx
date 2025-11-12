"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewsRankingItem } from "@/lib/queries/reviews";

interface ReviewsExportButtonProps {
  items: ReviewsRankingItem[];
}

export function ReviewsExportButton({
  items,
}: ReviewsExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "Pozycja",
      "Nazwa firmy",
      "Liczba opinii",
      "Średnia ocena",
      "Warunki",
      "Obsługa",
      "Doświadczenie",
      "Wypłaty",
      "Nowe opinie 30d",
      "Trend 30d (%)",
      "Obserwujący",
      "Cashback (%)",
      "Kod zniżkowy",
    ];

    const rows = items.map((item, index) => {
      const trend = item.trendRatio * 100;
      const trendFormatted = Number.isFinite(trend) && Math.abs(trend) >= 0.5
        ? `${trend > 0 ? "+" : ""}${trend.toFixed(0)}%`
        : "Stabilnie";

      return [
        index + 1,
        item.companyName,
        item.totalReviews,
        item.averageRating?.toFixed(2) || "-",
        item.categories.tradingConditions?.toFixed(1) || "-",
        item.categories.customerSupport?.toFixed(1) || "-",
        item.categories.userExperience?.toFixed(1) || "-",
        item.categories.payoutExperience?.toFixed(1) || "-",
        item.newReviews30d,
        trendFormatted,
        item.favoritesCount,
        item.cashbackRate?.toFixed(1) || "-",
        item.discountCode || "-",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `ranking-opinii-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={exportToCSV}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Eksportuj CSV
    </Button>
  );
}

