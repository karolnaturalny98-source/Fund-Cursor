"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import {
  DollarSign,
  Users,
  FileText,
  HelpCircle,
  BookOpen,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Megaphone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSidebar } from "./admin-sidebar-context";

// Wrapper dla opcjonalnego contextu - pozwala używać sidebar poza providerem
function useAdminSidebarOptional() {
  try {
    return useAdminSidebar();
  } catch {
    return {
      collapsed: false,
      toggle: () => {},
      setCollapsed: () => {},
    };
  }
}

export interface AdminNavItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description?: string;
  badge?: number | string;
}

const ADMIN_SECTIONS: AdminNavItem[] = [
  {
    value: "overview",
    label: "Przegląd",
    icon: LayoutDashboard,
    href: "/admin/overview",
    description: "Główny dashboard z metrykami i aktywnością",
  },
  {
    value: "shop",
    label: "Sklep",
    icon: ShoppingBag,
    href: "/admin/shop",
    description: "Dashboard, analityka i zarządzanie zamówieniami",
  },
  {
    value: "cashback",
    label: "Cashback",
    icon: DollarSign,
    href: "/admin/cashback",
    description: "Import, kolejki i wypłaty",
  },
  {
    value: "community",
    label: "Społeczność",
    icon: Users,
    href: "/admin/community",
    description: "Influencerzy i moderacja treści",
  },
  {
    value: "content",
    label: "Treści",
    icon: FileText,
    href: "/admin/content",
    description: "Firmy, plany i FAQ",
  },
  {
    value: "marketing",
    label: "Marketing",
    icon: Megaphone,
    href: "/admin/marketing",
    description: "Sekcje promocyjne i oferty specjalne",
  },
  {
    value: "newsletter",
    label: "Newsletter",
    icon: Mail,
    href: "/admin/newsletter",
    description: "Zarządzanie subskrybentami newslettera",
  },
  {
    value: "support",
    label: "Wsparcie",
    icon: HelpCircle,
    href: "/admin/support",
    description: "Sprawy użytkowników i spory",
  },
  {
    value: "blog",
    label: "Blog",
    icon: BookOpen,
    href: "/admin/blog",
    description: "Zarządzanie artykułami i kategoriami",
  },
];

interface AdminSidebarProps {
  items?: AdminNavItem[];
  onNavigate?: () => void;
}

export function AdminSidebar({ items = ADMIN_SECTIONS, onNavigate }: AdminSidebarProps) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const active = segment ?? items[0]?.value ?? "shop";
  const sidebarContext = useAdminSidebarOptional();
  const collapsed = sidebarContext?.collapsed ?? false;
  const toggle = sidebarContext?.toggle ?? (() => {});

  const navItems = useMemo(() => items.map((item) => item.href), [items]);

  useEffect(() => {
    navItems.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        // Ignorujemy błędy prefetch
      }
    });
  }, [router, navItems]);

  const NavLink = ({ item }: { item: AdminNavItem }) => {
    const isActive = active === item.value;
    const Icon = item.icon;

    const handleClick = () => {
      onNavigate?.();
    };

    const linkContent = (
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "group relative flex items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] rounded-2xl px-[clamp(0.9rem,1.3vw,1.15rem)] py-[clamp(0.6rem,0.85vw,0.75rem)] text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)] font-medium transition-all duration-200",
          "hover:bg-accent/40 hover:shadow-xs",
          collapsed ? "justify-center" : "justify-start",
          isActive
            ? "bg-primary/10 text-primary shadow-xs border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon 
          className={cn(
            "h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] shrink-0 transition-all duration-200",
            isActive 
              ? "text-primary scale-110" 
              : "group-hover:scale-105 group-hover:text-foreground"
          )} 
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate font-medium text-[clamp(0.9rem,0.4vw+0.8rem,1rem)]">
              {item.label}
            </span>
            {item.badge !== undefined && item.badge !== null && (
              <Badge
                variant={isActive ? "default" : "outline-solid"}
                className={cn(
                  "ml-auto fluid-badge min-w-[clamp(1.75rem,2.4vw,2rem)] justify-center font-semibold transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-lg" />
        )}
        {isActive && !collapsed && (
          <div className="absolute inset-0 rounded-lg bg-primary/5 -z-10" />
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex flex-col fluid-stack-2xs">
                <p className="font-medium">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-border/50 bg-card/82 backdrop-blur-[36px]! transition-all duration-300 shadow-lg",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-[clamp(3.75rem,5vw,4.25rem)] items-center border-b border-border/50 px-[clamp(0.9rem,1.3vw,1.15rem)] bg-card/72 backdrop-blur-[36px]!">
        {!collapsed ? (
          <div className="flex flex-1 items-center gap-[clamp(0.55rem,0.85vw,0.8rem)]">
            <div className="flex h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/20 to-primary/10">
              <span className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-bold text-primary">
                A
              </span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[clamp(1rem,0.45vw+0.9rem,1.15rem)] font-semibold leading-none text-foreground">
                Panel admina
              </h2>
              <span className="mt-[clamp(0.2rem,0.35vw,0.3rem)] text-[clamp(0.8rem,0.33vw+0.7rem,0.9rem)] text-muted-foreground">
                FundedRank
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/20 to-primary/10">
              <span className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-bold text-primary">
                A
              </span>
            </div>
          </div>
        )}
        {sidebarContext && (
          <Button
            variant="ghost"
            size="icon"
            className="h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] rounded-full hover:bg-accent/50 transition-all duration-200"
            onClick={toggle}
            aria-label={collapsed ? "Rozwiń sidebar" : "Zwiń sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)] transition-transform duration-200" />
            ) : (
              <ChevronLeft className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)] transition-transform duration-200" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-[clamp(0.85rem,1.2vw,1.1rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="flex flex-col fluid-stack-xs">
          {items.map((item, index) => (
            <div key={item.value}>
              <NavLink item={item} />
              {index < items.length - 1 && !collapsed && (
                <div className="mx-[clamp(0.75rem,1.1vw,1rem)] my-[clamp(0.35rem,0.55vw,0.5rem)] h-px bg-border/30" />
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
