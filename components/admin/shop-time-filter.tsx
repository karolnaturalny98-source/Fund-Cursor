"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimePeriod =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

interface ShopTimeFilterProps {
  onPeriodChange: (period: TimePeriod, range?: TimeRange) => void;
  selectedPeriod?: TimePeriod;
  customRange?: TimeRange;
}

export function ShopTimeFilter({
  onPeriodChange,
  selectedPeriod = "last30days",
  customRange,
}: ShopTimeFilterProps) {
  const handlePeriodSelect = (value: string) => {
    const period = value as TimePeriod;
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (period) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last30days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (customRange) {
          onPeriodChange("custom", customRange);
        }
        return;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
    }

    onPeriodChange(period, { startDate, endDate });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Okres:</label>
          <Select value={selectedPeriod} onValueChange={handlePeriodSelect}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Dziś</SelectItem>
              <SelectItem value="yesterday">Wczoraj</SelectItem>
              <SelectItem value="last7days">Ostatnie 7 dni</SelectItem>
              <SelectItem value="last30days">Ostatnie 30 dni</SelectItem>
              <SelectItem value="thisMonth">Ten miesiąc</SelectItem>
              <SelectItem value="lastMonth">Poprzedni miesiąc</SelectItem>
              <SelectItem value="thisQuarter">Ten kwartał</SelectItem>
              <SelectItem value="thisYear">Ten rok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

