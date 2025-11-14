"use client";

import { useCallback, useEffect, useState } from "react";

import type { DisputeCase, DisputeStatus } from "@/lib/types";

export type DisputeStatusFilter = DisputeStatus | "ALL";

export interface CreateDisputePayload {
  companyId: string;
  planId?: string;
  title: string;
  category: string;
  description: string;
  requestedAmount?: number | null;
  requestedCurrency?: string | null;
  evidenceLinks?: string[];
}

interface DisputesState {
  items: DisputeCase[];
  cursor: string | null;
  status: DisputeStatusFilter;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const defaultDisputesState: DisputesState = {
  items: [],
  cursor: null,
  status: "ALL",
  initialized: false,
  loading: false,
  error: null,
};

let disputesState: DisputesState = { ...defaultDisputesState };
let disputesPromise: Promise<void> | null = null;
const disputesListeners = new Set<(state: DisputesState) => void>();

function emitDisputesState(next: DisputesState) {
  disputesState = next;
  for (const listener of disputesListeners) {
    listener(next);
  }
}

function updateDisputesState(update: (prev: DisputesState) => DisputesState) {
  emitDisputesState(update(disputesState));
}

interface LoadDisputesOptions {
  reset?: boolean;
  status?: DisputeStatusFilter;
  limit?: number;
}

async function requestDisputes(options: LoadDisputesOptions = {}) {
  const { reset = false, status, limit = 20 } = options;

  if (disputesState.loading && disputesPromise) {
    return disputesPromise;
  }

  const snapshot = disputesState;

  if (!reset && !snapshot.cursor) {
    return Promise.resolve();
  }

  const targetStatus = status ?? snapshot.status;
  const cursorParam = reset ? null : snapshot.cursor;

  updateDisputesState((prev) => ({
    ...prev,
    loading: true,
    error: null,
    ...(reset
      ? { items: [], cursor: null, initialized: false }
      : {}),
    ...(status !== undefined ? { status } : {}),
  }));

  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));
  if (targetStatus !== "ALL") {
    searchParams.set("status", targetStatus);
  }
  if (cursorParam) {
    searchParams.set("cursor", cursorParam);
  }

  const url = searchParams.toString()
    ? `/api/user/disputes?${searchParams.toString()}`
    : "/api/user/disputes";

  const request = (async () => {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      let message = "Nie udało się pobrać zgłoszeń.";
      try {
        const body = (await response.clone().json()) as { error?: string };
        if (body?.error) {
          message = body.error;
        }
      } catch {
        // ignore JSON errors
      }
      throw new Error(message);
    }

    const payload = (await response.json()) as {
      items: DisputeCase[];
      nextCursor: string | null;
    };

    updateDisputesState((prev) => ({
      ...prev,
      items: reset ? payload.items : [...prev.items, ...payload.items],
      cursor: payload.nextCursor ?? null,
      initialized: true,
      loading: false,
    }));
  })()
    .catch((error: unknown) => {
      updateDisputesState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać zgłoszeń.",
      }));
      throw error;
    })
    .finally(() => {
      disputesPromise = null;
    });

  disputesPromise = request;
  return request;
}

export interface UseUserDisputesOptions {
  enabled?: boolean;
  pageSize?: number;
}

export function useUserDisputes(options: UseUserDisputesOptions = {}) {
  const { enabled = false, pageSize = 20 } = options;
  const [snapshot, setSnapshot] = useState<DisputesState>(disputesState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const listener = (state: DisputesState) => {
      setSnapshot(state);
    };
    disputesListeners.add(listener);
    return () => {
      disputesListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!snapshot.initialized && !snapshot.loading) {
      void requestDisputes({ reset: true, limit: pageSize });
    }
  }, [enabled, snapshot.initialized, snapshot.loading, pageSize]);

  const loadMore = useCallback(() => requestDisputes({ limit: pageSize }), [pageSize]);
  const reload = useCallback(() => requestDisputes({ reset: true, limit: pageSize }), [pageSize]);

  const setStatusFilter = useCallback(
    (next: DisputeStatusFilter) => {
      updateDisputesState(() => ({
        ...defaultDisputesState,
        status: next,
      }));
      return requestDisputes({ reset: true, status: next, limit: pageSize });
    },
    [pageSize],
  );

  const reset = useCallback(() => {
    updateDisputesState(() => ({ ...defaultDisputesState }));
  }, []);

  const createDispute = useCallback(
    async (payload: CreateDisputePayload) => {
      setSubmitting(true);
      try {
        const response = await fetch("/api/user/disputes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const body = (await response.json().catch(() => null)) as
          | DisputeCase
          | { error?: string }
          | null;

        if (!response.ok || !body || "error" in body) {
          const message =
            (body && "error" in body && body.error)
              ? body.error
              : "Nie udało się wysłać zgłoszenia.";
          throw new Error(message);
        }

        await setStatusFilter("OPEN");
        return { ok: true as const };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Nie udało się wysłać zgłoszenia.";
        return { ok: false as const, error: message };
      } finally {
        setSubmitting(false);
      }
    },
    [setStatusFilter],
  );

  return {
    disputes: snapshot.items,
    status: snapshot.status,
    initialized: snapshot.initialized,
    loading: snapshot.loading,
    error: snapshot.error,
    hasMore: Boolean(snapshot.cursor),
    loadMore,
    reload,
    setStatusFilter,
    reset,
    createDispute,
    submitting,
  };
}
