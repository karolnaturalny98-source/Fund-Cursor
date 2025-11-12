"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  companySlug: string;
  companyId: string;
  initialFavorite: boolean;
  size?: "default" | "icon";
  className?: string;
}

export function FavoriteButton({
  companySlug,
  companyId,
  initialFavorite,
  size = "default",
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, setIsPending] = useState(false);

  async function toggleFavorite() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companySlug }),
      });

      if (response.status === 401) {
        const redirect = encodeURIComponent(`/firmy/${companySlug}`);
        window.location.href = `/sign-in?redirect_url=${redirect}`;
        return;
      }

      if (!response.ok) {
        console.error("Favorite toggle failed", await response.text());
        return;
      }

      const payload: { status: "added" | "removed" } = await response.json();
      const nextState = payload.status === "added";
      setIsFavorite(nextState);

      const eventPayload = JSON.stringify({
        companySlug,
        companyId,
        source: nextState ? "add_favorite" : "remove_favorite",
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/clicks", eventPayload);
      } else {
        fetch("/api/clicks", {
          method: "POST",
          body: eventPayload,
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch(() => {
          // best-effort tracking
        });
      }
    } catch (error) {
      console.error("Favorite toggle error", error);
    } finally {
      setIsPending(false);
    }
  }

  const icon = (
    <Heart
      className={isFavorite ? "h-4 w-4 fill-rose-500 text-rose-500" : "h-4 w-4"}
    />
  );

  if (size === "icon") {
    return (
      <Button
        aria-pressed={isFavorite}
        className={className}
        disabled={isPending}
        onClick={toggleFavorite}
        size="icon"
        type="button"
        variant={isFavorite ? "secondary" : "outline-solid"}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
      aria-pressed={isFavorite}
      className={className}
      disabled={isPending}
      onClick={toggleFavorite}
      type="button"
      variant={isFavorite ? "secondary" : "outline-solid"}
    >
      {icon}
      <span className="ml-2 text-sm">
        {isFavorite ? "Ulubiona" : "Dodaj do ulubionych"}
      </span>
    </Button>
  );
}
