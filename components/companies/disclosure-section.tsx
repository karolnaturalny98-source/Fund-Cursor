"use client";

import { ExternalLink } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";

interface DisclosureSectionProps {
  companyName: string;
  tosUrl: string | null;
}

export function DisclosureSection({ companyName, tosUrl }: DisclosureSectionProps) {
  return (
    <section className="group relative space-y-4 overflow-hidden rounded-3xl border border-border/60 p-6 text-sm shadow-xs transition-all hover:border-primary/50 hover:shadow-md text-muted-foreground bg-card/72 backdrop-blur-[36px]!">
      <h2 className="text-lg font-semibold text-foreground">Disclosure i etyka</h2>
      <p>
        FundedRank dziala w modelu afiliacyjnym. Kiedy kupujesz plan {companyName} z naszym kodem,
        partner moze przekazac nam prowizje. Czescia tej prowizji dzielimy sie w formie punktow cashback.
        Nie wplywa to na cene, ktora placisz u partnera.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Kod i cashback aktywuja sie tylko wtedy, gdy uzyjesz wskazanego linku lub wpiszesz kod przy zakupie.</li>
        <li>Zapisujemy klikniecia i podstawowe dane techniczne, aby potwierdzic, ze zakup wyszedl od Ciebie.</li>
        <li>
          Prowadzimy niezalezny ranking. Wpisy i opinie sa moderowane, a partner nie ma wplywu na ocene redakcyjna.
        </li>
        <li>
          Warunki firmy moga sie zmieniac. Zawsze sprawdz najnowszy regulamin i zasady wyplat na stronie partnera.
        </li>
      </ul>
      {tosUrl ? (
        <p>
          Aktualny regulamin firmy znajdziesz tutaj: {" "}
          <a
            href={tosUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-3 py-1 font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs"
          >
            Terms of Service
            <PremiumIcon icon={ExternalLink} variant="glow" size="sm" hoverGlow />
          </a>
          .
        </p>
      ) : (
        <p>
          Partner nie udostepnil publicznego linku do regulaminu. W razie watpliwosci skontaktuj sie z ich supportem.
        </p>
      )}
      <p>
        Masz pytania albo wykryles blad w danych? Napisz do nas przez panel cashback lub na adres support@fundedrank.com.
      </p>
    </section>
  );
}
