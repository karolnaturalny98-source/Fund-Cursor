"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingCompanySnapshot, RankingTabId } from "@/lib/types/rankings";

interface RankingsExportButtonProps {
  companies: RankingCompanySnapshot[];
  activeTab: RankingTabId;
}

export function RankingsExportButton({
  companies,
  activeTab,
}: RankingsExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "Pozycja",
      "Nazwa firmy",
      "Ocena ogólna",
      "Ocena warunków",
      "Ocena wypłat",
      "Ocena społeczności",
      "Ocena cashback",
      "Ocena wzrostu",
      "Średnia ocena",
      "Liczba opinii",
      "Liczba obserwujących",
      "Kraj",
      "Cashback (%)",
      "Kod zniżkowy",
    ];

    const rows = companies.map((company, index) => [
      index + 1,
      company.name,
      company.scores.overall.toFixed(1),
      company.scores.conditions.toFixed(1),
      company.scores.payouts.toFixed(1),
      company.scores.community.toFixed(1),
      company.scores.cashback.toFixed(1),
      company.scores.growth.toFixed(1),
      company.averageRating?.toFixed(2) || "-",
      company.reviewCount,
      company.favoritesCount,
      company.country || "-",
      company.cashbackRate?.toFixed(1) || "-",
      company.discountCode || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `rankingi-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`);
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
      className="fluid-button-sm gap-[clamp(0.45rem,0.8vw,0.7rem)] rounded-full"
    >
      <Download className="h-[clamp(0.85rem,0.4vw+0.75rem,1rem)] w-[clamp(0.85rem,0.4vw+0.75rem,1rem)]" />
      Eksportuj CSV
    </Button>
  );
}

