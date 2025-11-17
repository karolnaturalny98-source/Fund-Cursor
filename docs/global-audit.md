# Globalny audyt repository Fund

## 1. Podsumowanie ogólne
- FundedRank to portal porównujący firmy prop tradingowe: rankingi, szczegóły firm, system cashback i sklep afiliacyjny.  
- Stack: Next.js 16 (App Router) + React 19, TypeScript (strict), Tailwind 4 z tokenami z `theme.css.md`, shadcn/Radix UI, Clerk do auth, Prisma/PostgreSQL, TipTap/Recharts/motion, lokalny rate limiter (`lib/rate-limit.ts`).  
- Kluczowe wnioski:  
  1. `tsc --noEmit` nadal przegrywa (lista w `bugs.md`), blokując CI.  
  2. Semantyka CTA/Badge/Linków jest niespójna (raport `agent-style-audit.md`) – linki udają przyciski, focusy nie są zgodne z ARIA.  
  3. Brak testów mimo skryptów; w repo nie ma `tests/unit`.  
  4. Placeholderowe treści (np. hero) i screenshoty w komponentach psują UX.  
  5. Rate limiting oparty na pamięci procesu nie skaluje się.

## 2. Architektura i struktura projektu
- App Router: `app/layout.tsx` wstrzykuje Clerk, ThemeProvider, CurrencyProvider i globalny panel. Grupy `(site)` i `(auth)` definiują layout marketingu vs auth.  
- Moduł admina ma osobny layout z kontrolą roli i sidebarem (`app/admin/layout.tsx`, `app/admin/(tabs)/layout.tsx`).  
- Komponenty są domenowe (`components/home`, `components/companies`, `components/affiliate`, `components/panels`, `components/admin`, `components/shop`).  
- `lib/` przechowuje narzędzia (auth, currency, compare) i ciężkie zapytania Prisma z cache’owaniem `unstable_cache`.  
- `app/api` zawiera REST-owe endpointy dla klików, newslettera, zgłoszeń, cashbacku, sklepu itd.  
- Prisma (`prisma/schema.prisma`) opisuje użytkowników, firmy, plany, transakcje cashback, afiliacje, recenzje, spory – wszystko współdzielone przez serwerowe queries i API.

## 3. Funkcjonalności biznesowe
- **Strona główna i rankingi**: `app/(site)/page.tsx` ładuje hero, rankingi, sekcje cashback i edukację; `app/(site)/rankingi/page.tsx` generuje wielowymiarowe rankingi z filtrami i metodologią.  
- **Lista firm**: `app/(site)/firmy/page.tsx` + `components/companies/companies-page-client.tsx` obsługują filtry, sortowania i quick preset-y.  
- **Strona firmy i porównanie**: dynamiczna trasa `[slug]` + `CompareProvider` synchronizują wybór firm (z localStorage/URL) i generują kartę porównania (`app/(site)/firmy/compare`).  
- **Opinie**: widok rankingów opinii oraz API do dodawania recenzji (walidacja Zod, rewalidacja).  
- **Cashback & Sklep**: `app/(site)/sklep` + API `/api/shop/purchase|confirm` zapisują transakcje afiliacyjne i generują link; `components/shop` obsługuje wybór firmy/planów.  
- **Panel użytkownika**: `app/panel/page.tsx` i slide-over `components/panels/user-panel.tsx` – statystyki, historia, redeem, disputes, influencer profile (hooki `use-user-summary`, `use-wallet-offers`).  
- **Panel admina**: layout z sidebarem, tabelami TanStack, formularzami RHF+Zod, endpointami `app/api/admin/*`.  
- **Marketing**: strony Affilacja, Baza wiedzy, Analizy, O nas z dedykowanymi komponentami.

## 4. UI/UX i design
- Globalne kolory i spacing: Tailwind 4 + `theme.css.md` -> `fluid-*` utility, `Section`/`Surface` zapewniają spójny layout.  
- Nawigacja marketingowa (`SiteNavbar`) używa Aceternity `resizable-navbar`; animacja zwęża NavBody do ~40% przy scrollu, co może łamać layout na mniejszych ekranach zanim zadziała breakpoint.  
- CTA są rozproszone: Linki stylowane jako `button` (rankingi, hero), `Badge/PremiumBadge` są klikane jako `div` – brak roli/focus (zgłoszone w `agent-style-audit.md`).  
- Panel użytkownika i admin korzystają z Radix/Sheet/Tabs, ale zawierają wiele nieaktywnych funkcji (np. spory).  
- Placeholderowe dane (lista `PEOPLE` w hero) i screenshoty w katalogu `components/layout` obniżają wizerunek.  
- Tabele admina ostrzegają, że brak wirtualizacji przy >100 wierszach może spowolnić UI.

## 5. Notatki vs. rzeczywistość
- `docs/progress-log.md` odwołuje się do `docs/ui-style-guide.md`, którego brak – dokumentacja stylu nie istnieje mimo wzmianki o „strict UI rules”.  
- `agent-style-audit.md` zidentyfikował problematyczne CTA i chipy; kod nadal je zawiera, więc rekomendacje nie wdrożone.  
- `Compo.md` i `mpcser.md` to surowe notatki/instrukcje – trzeba traktować jako inspiracje, nie źródło prawdy.  
- `bugs.md` to aktualna lista krytycznych błędów kompilacji; żadna pozycja nie została odhaczona.  
- Hero w `components/home/home-hero.tsx` wciąż używa postaci fikcyjnych (Tyler Durden), co kłóci się z profesjonalnymi notatkami.

## 6. Jakość kodu i dług techniczny
- TypeScript nie przechodzi przez `tsc --noEmit` (13 błędów opisanych w `bugs.md`).  
- Brak testów (unit/E2E) mimo skryptów; katalog `tests/` nie istnieje.  
- Semantyka linków/CTA: `buttonVariants` stosowane do `<Link>`, `Badge` renderuje `div` z `onClick` – problemy a11y i focus.  
- `HoverBorderGradient` ma niekompatybilne typy (użycie z `href` generuje błędy).  
- `lib/rate-limit.ts` przechowuje liczniki w `Map` w pamięci procesu, więc ochrona znika przy wielu instancjach lub restarcie.  
- Panel użytkownika zawiera nieużywane stany (`disputes`, `offersError`) i liczne `TODO`, co utrudnia utrzymanie.  
- W repo znajdują się pliki graficzne w katalogach komponentów oraz placeholderowe treści – należy je przenieść lub usunąć.

## 7. Propozycje usprawnień
1. **Naprawić kompilację TS** – rozszerzyć typy firm/plansów (`CompanyWithDetails`), poprawić komponenty bazowe (Badge, Surface, HoverBorderGradient, Heading) zgodnie z `bugs.md`.  
2. **Ustandaryzować CTA i filtry** – wdrożyć zalecenia `agent-style-audit.md`: Link ≠ Button, dodać role/focus, usunąć `fluid-button` z badge/chipów; rozważyć dedykowane warianty w `Button`.  
3. **Uzupełnić dane / lokalizację** – zastąpić placeholdery (PEOPLE, screenshoty) rzeczywistymi zasobami i przenieść pliki PNG do `public/`.  
4. **Wdrożyć testy** – zacząć od parserów filtrów (`parseModelParam`, `parseFilters`), modułów API (shop purchase, wallet redeem) oraz hooków panelu; zintegrować z CI.  
5. **Wzmocnić rate limiting i caching** – użyć współdzielonego storage (np. Redis) zamiast `Map`; rozważyć rewalidację `unstable_cache` po mutacjach.  
6. **Uprościć panel usera** – usunąć martwy kod w `components/panels/user-panel.tsx`, domknąć obsługę ofert/sporów i zapewnić testy hooków global state.  
7. **Odświeżyć dokumentację** – przywrócić `docs/ui-style-guide.md` albo zaktualizować `progress-log`, aby odzwierciedlał obecny system designu i ustalał zasady (tokeny, CTA, spacing).
