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
import { useState } from "react";

import { CurrencySwitcher } from "@/components/currency-switcher";
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, NavBody, Navbar } from "@/components/ui/resizable-navbar";
import { Button } from "@/components/ui/button";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { open } = useUserPanel();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string | undefined) ?? "user";
  const isAdmin = role === "admin";

  const navigation = mainNavigation.filter((link) => link.href !== "/admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar className="pointer-events-none !fixed inset-x-0 !top-4 z-50 flex justify-center px-4">
      <NavBody className="pointer-events-auto hidden w-full max-w-6xl items-center gap-4 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex dark:bg-black/70">
        <Link
          className="flex items-center gap-3 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70"
          href="/"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 via-sky-500 to-purple-600 text-base font-bold text-white shadow-[0_15px_40px_rgba(14,116,144,0.45)]">
            FR
          </span>
          Fund
        </Link>
        <div className="flex flex-1 items-center justify-center gap-1 text-white/70">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-all",
                  active
                    ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                    : "text-white/70 hover:text-white",
                )}
                href={item.href}
                prefetch={false}
              >
                {item.label}
                {active ? (
                  <span className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                ) : null}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <CurrencySwitcher layout="compact" />
          <Button
            variant="outline"
            className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/20"
            onClick={open}
          >
            Panel
          </Button>
          <SignedOut>
            <SignInButton>
              <Button className="rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 text-black shadow-[0_10px_40px_rgba(45,212,191,0.45)] hover:opacity-90">
                Zaloguj
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {isAdmin ? (
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-white/70 hover:text-white"
              >
                <Link href="/admin" prefetch={false}>
                  Admin
                </Link>
              </Button>
            ) : null}
            <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
          </SignedIn>
        </div>
      </NavBody>

      <MobileNav className="pointer-events-auto lg:hidden">
        <MobileNavHeader className="w-full rounded-[28px] border border-white/10 bg-black/70 px-4 py-3 text-white">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 via-cyan-400 to-purple-600 text-sm font-bold">
              FR
            </span>
            FundedRank
          </Link>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            />
          </div>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          className="mx-auto mt-3 w-full max-w-sm border border-white/10 bg-black/95 text-white"
        >
          <nav className="flex w-full flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 transition",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-white/10 text-white"
                    : "hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <CurrencySwitcher />
            <Button
              variant="outline"
              className="w-full rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                open();
                setMobileOpen(false);
              }}
            >
              Panel użytkownika
            </Button>
            <SignedOut>
              <SignInButton>
                <Button className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 text-black hover:opacity-90">
                  Zaloguj
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {isAdmin ? (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full rounded-full text-white/70 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/admin" prefetch={false}>
                    Panel admina
                  </Link>
                </Button>
              ) : null}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2">
                <span>Konto</span>
                <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
              </div>
            </SignedIn>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
