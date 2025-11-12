"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MAX_COMPARE_ITEMS, parseCompareParam } from "@/lib/compare";

interface CompareContextValue {
  selection: string[];
  toggle: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
  canAddMore: boolean;
  maxItems: number;
}

const STORAGE_KEY = "fundedrank:compare";

const CompareContext = createContext<CompareContextValue | null>(null);

interface CompareProviderProps {
  initialSelection?: string[];
  children: React.ReactNode;
}

export function CompareProvider({
  initialSelection = [],
  children,
}: CompareProviderProps) {
  const [selection, setSelection] = useState<string[]>(() =>
    initialSelection.slice(0, MAX_COMPARE_ITEMS),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setSelection((prev) => {
      if (prev.length) {
        return prev;
      }

      const params = new URLSearchParams(window.location.search);
      const fromParams = parseCompareParam(params.get("compare") ?? undefined);
      if (fromParams.length) {
        return fromParams.slice(0, MAX_COMPARE_ITEMS);
      }

      try {
        const stored = JSON.parse(
          window.localStorage.getItem(STORAGE_KEY) ?? "[]",
        );
        if (Array.isArray(stored) && stored.every((item) => typeof item === "string")) {
          return stored.slice(0, MAX_COMPARE_ITEMS);
        }
      } catch {
        // ignore localStorage errors
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (selection.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore localStorage errors
    }

    const params = new URLSearchParams(window.location.search);
    if (selection.length) {
      params.set("compare", selection.join(","));
    } else {
      params.delete("compare");
    }
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, "", newUrl);
  }, [selection]);

  const toggle = useCallback((slug: string) => {
    setSelection((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, slug];
    });
  }, []);

  const clear = useCallback(() => {
    setSelection([]);
  }, []);

  const isSelected = useCallback(
    (slug: string) => selection.includes(slug),
    [selection],
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      selection,
      toggle,
      clear,
      isSelected,
      canAddMore: selection.length < MAX_COMPARE_ITEMS,
      maxItems: MAX_COMPARE_ITEMS,
    }),
    [clear, isSelected, selection, toggle],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
