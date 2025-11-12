import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UserPanel } from "@/components/panels/user-panel";
import { UserPanelProvider } from "@/components/panels/user-panel-context";
import { CurrencyProvider } from "@/app/providers/currency-provider";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FundedRank | Ranking firm prop i cashback",
  description:
    "Porownuj firmy prop tradingowe, zbieraj cashback i zarzadzaj swoim portfelem nagrod w jednym miejscu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/admin"
      afterSignUpUrl="/admin"
    >
      <html lang="pl" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased`}
        >
          <CurrencyProvider>
            <UserPanelProvider>
              <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <UserPanel />
              <Toaster />
            </UserPanelProvider>
          </CurrencyProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
