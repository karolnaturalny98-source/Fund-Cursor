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
      className="flex-1 flex flex-col overflow-hidden transition-all duration-300 bg-transparent"
      style={{ paddingLeft }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="container space-y-8 py-6 sm:py-8 lg:py-10 lg:px-8">
          {/* Mobile spacing */}
          <div className="lg:hidden h-16" />

          <div className="space-y-6">
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
                  <BreadcrumbPage className="text-foreground font-medium">
                    Panel administratora
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <header className="space-y-3 border-b border-border/50 pb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Panel administratora
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
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
