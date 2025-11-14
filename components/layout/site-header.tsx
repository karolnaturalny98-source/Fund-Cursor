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
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link className="flex items-center gap-2 font-semibold text-foreground shrink-0" href="/">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm">
            FR
          </span>
          <span className="fluid-lead">
            Funded<span className="text-primary">Rank</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "fluid-pill transition-colors",
                pathname === item.href || pathname.startsWith(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center fluid-stack-xs md:flex shrink-0">
          <CurrencySwitcher layout="compact" />
          <Button variant="premium-outline" className="fluid-button-sm rounded-full" onClick={open}>
            Panel
          </Button>
          <SignedOut>
            <SignInButton>
              <Button variant="premium" className="fluid-button-sm rounded-full">Zaloguj</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {isAdmin ? (
              <Button
                asChild
                variant="ghost"
                className="fluid-button-sm rounded-full text-muted-foreground"
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
          <div className="container flex flex-col gap-4 py-4">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  className="fluid-pill w-full justify-start bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
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
                className="fluid-button-sm"
                onClick={() => {
                  open();
                  setMenuOpen(false);
                }}
              >
                Panel uzytkownika
              </Button>
              <SignedOut>
                <SignInButton>
                  <Button variant="premium" className="fluid-button-sm">Zaloguj</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                {isAdmin ? (
                  <Button
                    asChild
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    className="fluid-button-sm"
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
