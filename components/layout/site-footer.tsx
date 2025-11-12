"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { socialLinks, contactLinks } from "@/lib/social-links";

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
    } catch (error) {
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
    <footer className="border-t border-border/40 bg-[rgba(10,12,15,0.72)] backdrop-blur-md">
      <div className="w-full px-6 py-12">
        <div className="mx-auto max-w-7xl">
        {/* Górna sekcja - Logo + Newsletter */}
        <div className="grid gap-8 lg:grid-cols-2 pb-8 border-b border-border/40">
          {/* Logo i opis */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-foreground">
                Funded<span className="text-primary">Rank</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Twój kompas w świecie prop tradingu. Porównuj firmy, zbieraj
              cashback i wymieniaj punkty 1:1 na kolejne konta tradingowe.
            </p>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Zapisz się do newslettera
              </h3>
              <p className="text-xs text-muted-foreground">
                Otrzymuj informacje o najlepszych ofertach i promocjach firm
                prop tradingowych
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-[rgba(13,15,19,0.54)] border-border/60 focus:border-primary backdrop-blur-[36px]!"
              />
              <Button
                type="submit"
                disabled={loading}
                variant="premium"
                className="rounded-full px-6"
              >
                {loading ? "Zapisuję..." : "Zapisz się"}
              </Button>
            </form>
          </div>
        </div>

        {/* Środkowa sekcja - Linki w 4 kolumnach */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 py-8">
          {/* Nawigacja */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Nawigacja</h4>
            <ul className="space-y-2">
              {footerNavigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prawne */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Prawne</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Kontakt</h4>
            <ul className="space-y-2">
              {contactLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Śledź nas
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/20 backdrop-blur-[36px]! text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-110"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Dolna sekcja - Copyright */}
        <div className="pt-8 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FundedRank. Wszelkie prawa
            zastrzeżone.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
