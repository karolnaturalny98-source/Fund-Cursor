"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUserPanel } from "@/components/panels/user-panel-context";

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const NAV_ITEMS = [
  { name: "Rankingi", link: "/rankingi" },
  { name: "Firmy", link: "/firmy" },
  { name: "Analizy", link: "/analizy" },
  { name: "Opinie", link: "/opinie" },
];

export function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open: openUserPanel } = useUserPanel();

  return (
    <Navbar className="sticky inset-x-0 top-4 z-40 w-full px-4 text-white">
      <NavBody className="border border-white/10 bg-[#050505]/80 text-white shadow-none backdrop-blur">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Funded<span className="text-emerald-400">Rank</span>
        </Link>
        <NavItems
          items={NAV_ITEMS}
          className="[&_a]:text-white [&_a:hover]:text-emerald-300"
        />
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <NavbarButton variant="secondary" className="text-white">
                Zaloguj
              </NavbarButton>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NavbarButton
              as={Link}
              href="/panel"
              variant="secondary"
              className="bg-transparent text-white"
            >
              Panel
            </NavbarButton>
            <HoverBorderGradient
              as="button"
              containerClassName="rounded-full"
              className="bg-transparent px-4 py-2 text-sm text-white"
              onClick={openUserPanel}
            >
              Portfel
            </HoverBorderGradient>
            <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
          </SignedIn>
        </div>
      </NavBody>

      <MobileNav className="bg-[#050505]/90 text-white">
        <MobileNavHeader>
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Funded<span className="text-emerald-400">Rank</span>
          </Link>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="bg-[#050505] text-white"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg text-white/80"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4">
            <SignedOut>
              <SignInButton>
                <NavbarButton
                  variant="secondary"
                  className="w-full text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Zaloguj
                </NavbarButton>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <NavbarButton
                as={Link}
                href="/panel"
                variant="secondary"
                className="w-full bg-transparent text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Panel
              </NavbarButton>
              <HoverBorderGradient
                as="button"
                containerClassName="rounded-full w-full flex justify-center"
                className="bg-transparent px-4 py-2 text-sm text-white"
                onClick={() => {
                  openUserPanel();
                  setIsMobileMenuOpen(false);
                }}
              >
                Portfel
              </HoverBorderGradient>
              <div className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-2">
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
