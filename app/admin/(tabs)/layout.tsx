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
      <div className="relative flex h-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-40">
          <AdminSidebar />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-[rgba(8,10,13,0.82)] backdrop-blur-sm supports-backdrop-filter:bg-[rgba(12,14,18,0.6)]">
          <div className="container flex h-16 items-center justify-between">
            <Link className="text-lg font-semibold text-foreground" href="/admin">
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

