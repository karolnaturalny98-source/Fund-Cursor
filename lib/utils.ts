import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrackingParams {
  companySlug: string;
  planId?: string;
}

export function withTrackingParams(url: string, params: TrackingParams): string {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "fundedrank");
    parsed.searchParams.set("utm_campaign", params.companySlug);
    if (params.planId) {
      parsed.searchParams.set("utm_content", params.planId);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
