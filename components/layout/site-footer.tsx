"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { socialLinks, contactLinks } from "@/lib/social-links";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

const footerNavigationLinks = [
  { label: "Rankingi", href: "/rankingi" },
  { label: "Firmy", href: "/firmy" },
  { label: "Affilacja", href: "/affilacja" },
  { label: "Baza wiedzy", href: "/baza-wiedzy" },
  { label: "O nas", href: "/o-nas" },
];

const legalLinks = [
  { label: "Regulamin", href: "/regulamin" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { label: "Program partnerski", href: "/affilacja" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę podać adres email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sukces!",
          description:
            data.message || "Dziękujemy za zapisanie się do newslettera!",
        });
        setEmail("");
      } else {
        toast({
          title: "Błąd",
          description: data.error || "Wystąpił błąd podczas zapisywania",
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Błąd",
        description: "Nie udało się połączyć z serwerem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white">
      <div className="w-full px-2 md:px-4 xl:px-0 fluid-section-lg">
        <div className="mx-auto flex max-w-screen-xl flex-col fluid-stack-xl">
        {/* Górna sekcja - Logo + Newsletter */}
        <div className="grid fluid-stack-lg lg:grid-cols-2 border-b border-border/40 pb-[clamp(1.5rem,2.2vw,2.5rem)]">
          {/* Logo i opis */}
          <div className="flex flex-col fluid-stack-sm">
            <Link href="/" className="inline-block">
              <Heading level={3} variant="section" className="text-white">
                Funded<span className="text-primary">Rank</span>
              </Heading>
            </Link>
            <Text variant="body" tone="muted" className="max-w-md">
              Twój kompas w świecie prop tradingu. Porównuj firmy, zbieraj
              cashback i wymieniaj punkty 1:1 na kolejne konta tradingowe.
            </Text>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col fluid-stack-sm">
            <div className="flex flex-col fluid-stack-xs">
              <Heading level={4} variant="subsection" className="text-white">
                Zapisz się do newslettera
              </Heading>
              <Text variant="caption" tone="muted">
                Otrzymuj informacje o najlepszych ofertach i promocjach firm
                prop tradingowych
              </Text>
            </div>
            <form onSubmit={handleSubmit} className="flex fluid-stack-xs">
              <Input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-[#080808] border-white/15 text-white placeholder:text-white/40 focus:border-white/40"
              />
              <Button type="submit" disabled={loading} variant="premium" className="rounded-full">
                {loading ? "Zapisuję..." : "Zapisz się"}
              </Button>
            </form>
          </div>
        </div>

        {/* Środkowa sekcja - Linki w 4 kolumnach */}
        <div className="grid fluid-stack-lg sm:grid-cols-2 lg:grid-cols-4 py-[clamp(1.5rem,2vw,2.5rem)]">
          {/* Nawigacja */}
          <div className="flex flex-col fluid-stack-sm">
            <Heading level={4} variant="subsection" className="text-white">
              Nawigacja
            </Heading>
            <ul className="flex flex-col fluid-stack-xs">
              {footerNavigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="fluid-copy text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prawne */}
          <div className="flex flex-col fluid-stack-sm">
            <Heading level={4} variant="subsection" className="text-white">
              Prawne
            </Heading>
            <ul className="flex flex-col fluid-stack-xs">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="fluid-copy text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div className="flex flex-col fluid-stack-sm">
            <Heading level={4} variant="subsection" className="text-white">
              Kontakt
            </Heading>
            <ul className="flex flex-col fluid-stack-xs">
              {contactLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)] fluid-copy text-muted-foreground hover:text-primary transition-colors"
                  >
                    <link.icon className="h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)]" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col fluid-stack-sm">
            <Heading level={4} variant="subsection" className="text-white">
              Śledź nas
            </Heading>
          <div className="flex flex-wrap fluid-stack-xs">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-[clamp(2.25rem,1.3vw+1.8rem,2.5rem)] w-[clamp(2.25rem,1.3vw+1.8rem,2.5rem)] items-center justify-center rounded-full border border-white/15 bg-[#0a0a0a] text-muted-foreground transition-all hover:border-white/40 hover:text-white hover:scale-110"
                >
                  <social.icon className="h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Dolna sekcja - Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-[clamp(1.25rem,1.8vw,1.75rem)] sm:flex-row sm:gap-6">
          <Text variant="caption" tone="muted" className="text-center sm:text-left">
            © {new Date().getFullYear()} FundedRank. Wszelkie prawa zastrzeżone.
          </Text>
          <div className="flex flex-wrap items-center justify-center fluid-stack-xs text-muted-foreground fluid-caption">
            {legalLinks.slice(0, 2).map((link) => (
              <Link
                key={`footer-bottom-${link.href}`}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
