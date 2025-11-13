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
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] rounded-full"
        >
          <Menu className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
          <span className="sr-only">Otwórz menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[clamp(16rem,45vw,18rem)] p-0">
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
