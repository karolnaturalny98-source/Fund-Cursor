import type { ReactNode } from "react";

import { AuroraWrapper } from "@/components/aurora-wrapper";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 h-[150vh]">
        <AuroraWrapper
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
        />
      </div>
      <div className="relative z-0 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
