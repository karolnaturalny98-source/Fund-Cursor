"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar, type AdminNavItem } from "./admin-sidebar";
import { AdminSidebarProvider } from "./admin-sidebar-context";

interface AdminSidebarMobileProps {
  items?: AdminNavItem[];
}

export function AdminSidebarMobile({ items }: AdminSidebarMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Otwórz menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Nawigacja panelu admina</SheetTitle>
        </SheetHeader>
        <AdminSidebarProvider>
          <div className="h-full">
            <AdminSidebar items={items} onNavigate={() => setOpen(false)} />
          </div>
        </AdminSidebarProvider>
      </SheetContent>
    </Sheet>
  );
}
