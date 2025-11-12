"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { CurrencySwitcher } from "@/components/currency-switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const { open } = useUserPanel();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string | undefined) ?? "user";
  const isAdmin = role === "admin";
  const navigation = mainNavigation.filter((link) => link.href !== "/admin");

  return (
    <header className="sticky top-0 z-40 glass-premium border-none">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link className="text-lg font-semibold text-foreground shrink-0" href="/">
          Funded<span className="text-primary">Rank</span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "rounded-full px-3 py-1 transition-colors hover:text-primary",
                pathname === item.href || pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/60",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex shrink-0">
          <CurrencySwitcher layout="compact" />
          <Button variant="premium-outline" className="rounded-full h-10 px-5 text-sm" onClick={open}>
            Panel
          </Button>
          <SignedOut>
            <SignInButton>
              <Button variant="premium" className="rounded-full h-10 px-5 text-sm">Zaloguj</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {isAdmin ? (
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-muted-foreground h-10 px-5 text-sm"
              >
                <Link href="/admin" prefetch={false}>
                  Admin
                </Link>
              </Button>
            ) : null}
            <UserButton />
          </SignedIn>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Otworz menu</span>
          </Button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-border/40 glass-premium md:hidden">
          <div className="container space-y-4 py-6">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-md px-2 py-2 hover:bg-muted"
                  href={item.href}
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <CurrencySwitcher />
              <Button
                variant="premium-outline"
                onClick={() => {
                  open();
                  setMenuOpen(false);
                }}
              >
                Panel uzytkownika
              </Button>
              <SignedOut>
                <SignInButton>
                  <Button variant="premium">Zaloguj</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                {isAdmin ? (
                  <Button
                    asChild
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                  >
                    <Link href="/admin" prefetch={false}>
                      Panel admina
                    </Link>
                  </Button>
                ) : null}
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}



