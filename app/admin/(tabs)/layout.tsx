import type { ReactNode } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSidebarMobile } from "@/components/admin/admin-sidebar-mobile";
import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context";
import { AdminContent } from "@/components/admin/admin-content";

interface AdminTabsLayoutProps {
  children: ReactNode;
}

export default function AdminTabsLayout({ children }: AdminTabsLayoutProps) {
  return (
    <AdminSidebarProvider>
      <div className="relative flex h-full overflow-hidden bg-background/80">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-40">
          <AdminSidebar />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-card/82 backdrop-blur-md supports-backdrop-filter:bg-background/60">
          <div className="container flex h-[clamp(3.75rem,5vw,4.25rem)] items-center justify-between gap-[clamp(0.75rem,1.2vw,1rem)]">
            <Link
              className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-semibold tracking-tight text-foreground"
              href="/admin"
            >
              Panel <span className="text-primary">Admina</span>
            </Link>
            <AdminSidebarMobile />
          </div>
        </div>

        {/* Main Content */}
        <AdminContent>{children}</AdminContent>
      </div>
    </AdminSidebarProvider>
  );
}

