import type { ReactNode } from "react";

import { SiteNavbar } from "@/components/layout/site-navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
