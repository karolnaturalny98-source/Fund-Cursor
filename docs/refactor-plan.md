# FundedRank – Refactor Plan (Option A – Full App)

Plan dotyczy pełnego, rozbudowanego produktu. Celem jest:
- zachowanie wszystkich istniejących obszarów funkcjonalnych,
- poprawa bezpieczeństwa,
- uproszczenie UX (szczególnie landing),
- uporządkowanie layoutów i stylów,
- poprawa wydajności.

---

## Etap 1 – Bezpieczeństwo API (P1)

### 1.1 `/api/cashback`
- [ ] Ograniczyć możliwość tworzenia cashbacków:
  - `status` nie powinien być parametrem od użytkownika – zawsze `PENDING` dla zwykłych userów.
  - kwota cashbacku powinna być walidowana względem realnego zdarzenia (np. zamówienia) – jeśli to wymaga większej zmiany, wprowadzić przynajmniej:
    - rolę admin (`assertAdminRequest`) dla manualnych transakcji,
    - twardy limit maksymalnej liczby punktów per request.
- [ ] Wydzielić ewentualnie osobny endpoint adminowski (np. `/api/admin/cashback/manual`) i tam pozwolić na status/kwoty.
- [ ] Dodać logikę audytu (logowanie kto i kiedy tworzy manualne cashbacki).

### 1.2 `/api/admin/newsletter` i `/api/admin/newsletter/[id]`
- [ ] Dodać `assertAdminRequest` lub równoważny mechanizm dla wszystkich metod.
- [ ] Upewnić się, że lista subskrybentów, edycja i kasowanie są dostępne tylko dla adminów.
- [ ] Po każdej mutacji dodać rewalidację (tag/path).

### 1.3 Rate limiting i ochrona przed spamem
- [ ] Dodać rate limiting do:
  - `/api/newsletter`
  - `/api/report`
  - `/api/clicks`
- [ ] Rozważyć prostą ochronę przed spamem (np. honeypot, opóźnienia).

#### Aktualizacja – 2025-11-14
- `/api/cashback` przyjmuje teraz jedynie `companySlug`, `transactionRef`, `points` (limit 5 000) i `notes`. Status jest zawsze ustawiany na `PENDING`, a po utworzeniu transakcji odświeżany jest tag `cashback-{user}`. Utworzono również administacyjny endpoint `POST /api/admin/cashback/manual`, w którym admin może wskazać użytkownika (ID/clerkId/email), firmę, status i liczbę punktów (z limitem 100 000). Każda manualna operacja jest logowana.
- Endpointy admina do newslettera (`/api/admin/newsletter` oraz `/api/admin/newsletter/[id]`) korzystają z `assertAdminRequest`. Mutacje (PATCH/DELETE) wywołują `revalidateTag("admin-newsletter")`, więc panel widzi aktualne dane.
- `/api/newsletter`, `/api/report` i `/api/clicks` posiadają prosty limiter w pamięci (odpowiednio: 5 zgłoszeń / 10 min na IP+email, 5 zgłoszeń / 10 min na IP, 40 kliknięć / min na IP). Przy przekroczeniu zwracany jest `429` z nagłówkiem `Retry-After`.
- Otwarte zadanie w tej sekcji: wdrożenie dodatkowych honeypotów lub bardziej trwałego mechanizmu (np. redis) zgodnie z punktem 1.3.

---

## Etap 2 – Layouty i Aurora

### 2.1 Wspólny layout publiczny
- [ ] Stworzyć `app/(site)/layout.tsx`, który:
  - wstrzykuje `AuroraWrapper` tylko raz,
  - zapewnia wspólny container/spacing,
  - renderuje `SiteHeader` / `SiteFooter` (lub używa root layoutu).
- [ ] Przenieść publiczne strony (`/`, `/rankingi`, `/firmy`, `/opinie`, `/analizy`, `/affilacja`, `/sklep`, `/baza-wiedzy`, `/o-nas`) do segmentu `(site)` jeśli ma to sens.

### 2.2 Uporządkowanie `AuroraWrapper`
- [ ] Usunąć duplikowane instancje aurory z poszczególnych stron.
- [ ] Ustandaryzować parametry (colorStops, blend mode) w jednym miejscu.
- [ ] Zadbać o wydajność WebGL (jedna instancja, brak wycieków).

#### Aktualizacja – 2025-11-14
- Utworzono `app/(site)/layout.tsx`, który renderuje wspólny `AuroraWrapper` oraz owija wszystkie publiczne route'y (landing, rankingi, firmy, opinie, analizy, affilacja, sklep, baza wiedzy, o nas).
- Całe drzewo stron publicznych zostało przeniesione do grupy `(site)`, a lokalne instancje aurory zostały usunięte z poszczególnych plików (`/firmy`, `/firmy/[slug]`, `/rankingi`, `/opinie`, `/analizy`, `/affilacja`, `/sklep`, `/baza-wiedzy`, `/o-nas`).
- Dzięki layoutowi tło WebGL jest renderowane jednokrotnie, co upraszcza kontrolę wydajności i eliminuję duplikaty.

---

## Etap 3 – Strona główna / One-Page Core

### 3.1 Projekt UX
- [ ] Na podstawie aktualnego `app/page.tsx` i audytu przygotować docelowy layout:
  - Hero: search, metryki, krótki opis.
  - Ranking (multi-tabs): Ogólny / Opinie / Cashback / Oferty / Payouty.
  - Filtry nad rankingiem (model, cashback, kraj, itd.).
  - Sekcja Top Cashback.
  - Sekcja ofert/karuzela (MarketingSpotlight).
  - Sekcja społeczności (opinie, influencerzy).
  - Sekcja “Jak to działa” (3 kroki).
  - Sekcja CTA / newsletter.

### 3.2 Implementacja
- [ ] Wyodrębnić sekcje do osobnych komponentów w `components/home/*`:
  - `HomeHero`
  - `HomeRankingSection`
  - `HomeTopCashbackSection`
  - `HomeDealsSection`
  - `HomeCommunitySection`
  - `HomeHowItWorks`
  - `HomeNewsletterSection`
- [ ] Upewnić się, że:
  - korzystają ze wspólnego layoutu/Section,
  - używają komponentów shadcn/ui.

---

## Etap 4 – Strona firmy (`/firmy/[slug]`)

### 4.1 Modularizacja
- [ ] Rozbić gigantyczny komponent na mniejsze:
  - `CompanyHeaderSection`
  - `CompanyPlansSection`
  - `CompanyPayoutsSection`
  - `CompanyRulesSection`
  - `CompanyMediaSection`
  - `CompanyReviewsSection`
  - `CompanyFaqSection`
  - `CompanyMetaSection` (timeline, certyfikaty, team)
- [ ] Zostawić SSR, ale:
  - rozważyć paginację recenzji,
  - opóźnione ładowanie cięższych modułów (np. wykresy payoutów).

### 4.2 Reużywalne komponenty
- [ ] Zidentyfikować powtarzające się karty (np. plan, payout, FAQ) i przenieść do `components/companies/*`.
- [ ] Ustandaryzować użycie Button, Badge, Tabs, itd. z shadcn.

---

## Etap 5 – Panel użytkownika i UserPanel

### 5.1 Wspólne źródła danych
- [ ] Wyekstrahować hooki:
  - `useUserSummary`
  - `useWalletOffers`
  - `useUserDisputes`
- [ ] Nie dublować fetch’y – współdzielić logikę między `/panel` i globalnym `UserPanel`.

### 5.2 UX
- [ ] Upewnić się, że:
  - główne akcje cashback (redeem, historia) są zrozumiałe i spójne,
  - overlay `UserPanel` nie konkuruje z pełną stroną `/panel` (przemyśleć restrukturyzację).

---

## Etap 6 – Stylowanie i Tailwind

### 6.1 `tailwind.config.ts`
- [ ] Wprowadzić plik `tailwind.config.ts`:
  - przenieść tam kolory,
  - zdefiniować podstawowe font-size, spacing, radius,
  - odwzorować najważniejsze tokens z `globals.css`.
- [ ] Stopniowo używać `theme(...)` zamiast surowych wartości.

### 6.2 Naprawa brakujących klas
- [ ] Dodać definicję `.glass-premium` (i ewentualnie innych brakujących utili) tak, aby `SiteHeader` i `SiteFooter` renderowały efekty zgodnie z projektem.

### 6.3 Redukcja duplikatów
- [ ] Zmapować gradienty, cienie, glass efekty na 2–3 główne utilsy.
- [ ] Usunąć/lub zastąpić ręczne `px-[clamp(...)]`, gdzie istnieją `fluid-*`.

---

## Etap 7 – Admin + wydajność

### 7.1 Newsletter admin
- [ ] Po zabezpieczeniu endpointów:
  - rozważyć SSR/Server Components dla listy subskrybentów,
  - dodać paginację i/lub lazy loading.

### 7.2 Zapytania ciężkie
- [ ] Przejrzeć:
  - `getCompanyBySlug`
  - `getUserSummary`
- [ ] Dodać paginację tam, gdzie ładowane są duże zbiory (np. recenzje, transakcje).

---

## Priorytety

- **P1 (najpierw)**:
  - bezpieczeństwo API (cashback, newsletter),
  - minimalne poprawki stylów uniemożliwiających poprawne renderowanie (np. brakujące klasy).

- **P2**:
  - wspólny layout aurory,
  - one-page homepage,
  - modularizacja strony firmy,
  - panel vs UserPanel.

- **P3**:
  - tailwind.config,
  - porządki w stylach,
  - optymalizacje admina i wydajności.

---

## Etap 8 – UI redesign (Aceternity / registry-based)

- [ ] Wybrać docelowy styl (1–2 layouty z Aceternity jako baza).
- [ ] Przeprojektować:
  - sekcję Hero na stronie głównej,
  - sekcję rankingu,
  - sekcję Top Cashback,
  - kluczowe CTA i kartę firmy.

Zasady:
- używać shadcn/ui + Tailwind (bez nowych frameworków),
- traktować komponenty z rejestrów (Aceternity, itp.) jako design pattern,
- dostosować do istniejącego theme (colors, radius, cienie, fluid spacing),
- nie zmieniać logiki biznesowej, tylko prezentację.
