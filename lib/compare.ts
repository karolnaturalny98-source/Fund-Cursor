export const MAX_COMPARE_ITEMS = 3;

export function parseCompareParam(
  input: string | string[] | undefined,
): string[] {
  const raw = Array.isArray(input) ? input[0] : input;
  if (!raw) {
    return [];
  }

  const unique = new Set<string>();
  raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .forEach((slug) => {
      if (unique.size < MAX_COMPARE_ITEMS) {
        unique.add(slug);
      }
    });

  return Array.from(unique);
}

export const COMPANY_COMPARE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--blue-500))",
  "hsl(var(--orange-500))",
] as const;

export function getCompareColor(index: number) {
  if (index < 0 || Number.isNaN(index)) {
    return COMPANY_COMPARE_COLORS[0];
  }
  return COMPANY_COMPARE_COLORS[index % COMPANY_COMPARE_COLORS.length];
}
