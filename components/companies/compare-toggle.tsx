"use client";

import { Button } from "@/components/ui/button";
import { useCompare } from "@/components/companies/compare-context";

interface CompareToggleProps {
  slug: string;
  className?: string;
  size?: "default" | "sm" | "icon";
}

export function CompareToggle({ slug, className, size = "sm" }: CompareToggleProps) {
  const { isSelected, toggle, canAddMore, selection, maxItems } = useCompare();
  const selected = isSelected(slug);
  const disabled = !selected && !canAddMore;

  const label = selected
    ? "W porównaniu"
    : disabled
      ? `Limit ${maxItems}`
      : selection.length
        ? "Dodaj do porównania"
        : "Porównaj";

  return (
    <Button
      type="button"
      size={size === "icon" ? "icon" : size}
      variant={selected ? "secondary" : "outline-solid"}
      className={className}
      onClick={() => toggle(slug)}
      disabled={disabled}
    >
      {size === "icon" ? "Por" : label}
    </Button>
  );
}
