"use client";

import { Suspense, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAdminSidebar } from "./admin-sidebar-context";
import { AdminTabLoading } from "./admin-tab-loading";

interface AdminContentProps {
  children: ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  const { collapsed } = useAdminSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const paddingLeft = isDesktop ? (collapsed ? "64px" : "256px") : "0";

  return (
    <main
      className="flex-1 flex flex-col overflow-hidden transition-all duration-300 bg-transparent pl-[var(--padding-left)]"
      style={{ "--padding-left": paddingLeft } as React.CSSProperties}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="container space-y-[clamp(1.5rem,2.3vw,2.1rem)] px-[clamp(1rem,3vw,2.5rem)] py-[clamp(2.25rem,3.5vw,3rem)] lg:px-[clamp(1.5rem,2.5vw,2.5rem)]">
          {/* Mobile spacing */}
          <div className="lg:hidden h-[clamp(3.75rem,5vw,4.25rem)]" />

          <div className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    asChild
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Link href="/">Strona główna</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-semibold tracking-tight">
                    Panel administratora
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <header className="space-y-[clamp(0.85rem,1.2vw,1.1rem)] border-b border-border/50 pb-[clamp(1.25rem,1.9vw,1.7rem)]">
              <div className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                <h1 className="fluid-h1 font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Panel administratora
                </h1>
                <p className="max-w-2xl fluid-copy text-muted-foreground leading-relaxed">
                  Zarządzaj rankiem, cashbackiem oraz treściami FundedRank z wykorzystaniem nawigacji bocznej.
                </p>
              </div>
            </header>

            <Suspense fallback={<AdminTabLoading message="Ładujemy widok zakładki..." />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
