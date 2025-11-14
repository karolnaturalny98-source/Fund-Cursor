"use client";

import { useCallback, useEffect, useState } from "react";

import type { RedeemCompanyOffer } from "@/lib/types";

type AsyncState = "idle" | "loading" | "success" | "error";

interface WalletOffersState {
  status: AsyncState;
  data: RedeemCompanyOffer[] | null;
  error: string | null;
}

let offersState: WalletOffersState = {
  status: "idle",
  data: null,
  error: null,
};

let offersPromise: Promise<RedeemCompanyOffer[]> | null = null;
const offersListeners = new Set<(state: WalletOffersState) => void>();

function emitOffersState(next: WalletOffersState) {
  offersState = next;
  for (const listener of offersListeners) {
    listener(next);
  }
}

async function requestWalletOffers(force = false) {
  if (!force) {
    if (offersState.status === "success") {
      return offersState.data;
    }

    if (offersState.status === "loading" && offersPromise) {
      return offersPromise;
    }
  }

  const nextState: WalletOffersState = {
    status: "loading",
    data: offersState.data,
    error: null,
  };
  emitOffersState(nextState);

  const request = fetch("/api/wallet/offers", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy ofert.");
      }
      const body = (await response.json()) as { data?: RedeemCompanyOffer[] };
      return body?.data ?? [];
    })
    .then((payload) => {
      offersPromise = null;
      emitOffersState({ status: "success", data: payload, error: null });
      return payload;
    })
    .catch((error: unknown) => {
      offersPromise = null;
      emitOffersState({
        status: "error",
        data: null,
        error:
          error instanceof Error ? error.message : "Nie udało się pobrać listy ofert.",
      });
      throw error;
    });

  offersPromise = request;
  return request;
}

export interface UseWalletOffersOptions {
  enabled?: boolean;
}

export function useWalletOffers(options: UseWalletOffersOptions = {}) {
  const [snapshot, setSnapshot] = useState<WalletOffersState>(offersState);
  const enabled = options.enabled ?? false;

  useEffect(() => {
    offersListeners.add(setSnapshot);
    return () => {
      offersListeners.delete(setSnapshot);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void requestWalletOffers();
  }, [enabled]);

  const load = useCallback((force = false) => requestWalletOffers(force), []);

  const reset = useCallback(() => {
    emitOffersState({ status: "idle", data: null, error: null });
  }, []);

  return {
    offers: snapshot.data,
    status: snapshot.status,
    error: snapshot.error,
    load,
    reset,
  };
}
