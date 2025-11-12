"use client";

import { useEffect } from "react";

/**
 * Blokuje przewijanie `body`/`html` podczas przebywania w panelu admina,
 * dzięki czemu działają wyłącznie wbudowane paski przewijania w layoucie.
 */
export function AdminScrollLock() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyHeight = document.body.style.height;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.height = previousBodyHeight;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.height = previousHtmlHeight;
    };
  }, []);

  return null;
}


