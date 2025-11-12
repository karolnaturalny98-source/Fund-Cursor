"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminSidebarContextType {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggle = () => {
    setCollapsedState((prev) => !prev);
  };

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
  };

  return (
    <AdminSidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (context === undefined) {
    throw new Error("useAdminSidebar must be used within AdminSidebarProvider");
  }
  return context;
}
