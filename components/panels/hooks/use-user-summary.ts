"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  CashbackSummary,
  Company,
  InfluencerProfile,
  WalletTransaction,
} from "@/lib/types";

export interface UserSummaryPayload {
  summary: CashbackSummary;
  favorites: Company[];
  recentTransactions: WalletTransaction[];
  influencerProfile: InfluencerProfile | null;
}

type AsyncState = "idle" | "loading" | "success" | "error";

interface SummaryState {
  status: AsyncState;
  data: UserSummaryPayload | null;
  error: string | null;
}

const defaultSummary: CashbackSummary = {
  pending: 0,
  approved: 0,
  redeemed: 0,
  available: 0,
};

let summaryState: SummaryState = {
  status: "idle",
  data: null,
  error: null,
};

let summaryPromise: Promise<UserSummaryPayload> | null = null;
const summaryListeners = new Set<(state: SummaryState) => void>();

function emitSummaryState(next: SummaryState) {
  summaryState = next;
  for (const listener of summaryListeners) {
    listener(next);
  }
}

async function requestUserSummary(force = false) {
  if (!force) {
    if (summaryState.status === "success" && summaryState.data) {
      return summaryState.data;
    }

    if (summaryState.status === "loading" && summaryPromise) {
      return summaryPromise;
    }
  }

  const nextState: SummaryState = {
    status: "loading",
    data: summaryState.data,
    error: null,
  };
  emitSummaryState(nextState);

  const request = fetch("/api/user/summary", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Brak uprawnień. Zaloguj się ponownie."
            : "Nie udało się pobrać danych użytkownika.",
        );
      }

      return (await response.json()) as UserSummaryPayload;
    })
    .then((payload) => {
      summaryPromise = null;
      emitSummaryState({ status: "success", data: payload, error: null });
      return payload;
    })
    .catch((error: unknown) => {
      summaryPromise = null;
      emitSummaryState({
        status: "error",
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Wystąpił nieznany błąd.",
      });
      throw error;
    });

  summaryPromise = request;
  return request;
}

export interface UseUserSummaryOptions {
  enabled?: boolean;
}

export function useUserSummary(options: UseUserSummaryOptions = {}) {
  const [snapshot, setSnapshot] = useState<SummaryState>(summaryState);
  const enabled = options.enabled ?? true;

  useEffect(() => {
    summaryListeners.add(setSnapshot);
    return () => {
      summaryListeners.delete(setSnapshot);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void requestUserSummary();
  }, [enabled]);

  const refresh = useCallback((force = false) => requestUserSummary(force), []);

  const clear = useCallback(() => {
    emitSummaryState({ status: "idle", data: null, error: null });
  }, []);

  const data = snapshot.data;

  return {
    data,
    status: snapshot.status,
    error: snapshot.error,
    summary: data?.summary ?? defaultSummary,
    favorites: data?.favorites ?? [],
    recentTransactions: data?.recentTransactions ?? [],
    influencerProfile: data?.influencerProfile ?? null,
    refresh,
    clear,
  };
}
