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

## Etap 3 – Nowa Strona Główna (one-page core pod konwersję)

CEL:
Strona główna ma stać się głównym narzędziem dla tradera, łącząc:
- wyszukiwarkę prop firm,
- multi-ranking (oparty o logikę z istniejącej strony /rankingi),
- sekcję Top Cashback,
- krótki teaser porównywarki,
- mini-edukację,
- nowo dodane elementy (firmy, opinie, analizy).

### 3.1 Wyszukiwarka w hero
- duża wyszukiwarka firm (input + szybkie filtry)
- CTA do rankingów i cashbacku
- reużycie istniejącego hooka/endpointów do wyszukiwania (jeśli istnieją)

### 3.2 Sekcja multi-ranking
- baza danych i logika rankingów **ma być reużyta z istniejącej strony `/rankingi`**
- należy wyodrębnić komponent np. `components/ranking/RankingTable.tsx`
- multi-ranking ma działać jako:
  - 5 zakładek: Top, Opinie, Cashback, Cena, Wypłaty
  - dynamiczne przełączanie trybu (props mode/variant)
  - wersja na stronie głównej: limit 10 wyników, uproszczone filtry

### 3.3 Sekcja Top Cashback
- kafelki z 3–6 najlepszymi ofertami cashback
- CTA: „Przejdź z kodem”
- dane z istniejącego modelu cashback / firmy

### 3.4 Teaser porównywarki (strona /analizy)

- Mała sekcja na stronie głównej, np. „Porównaj 2–3 prop firmy jednocześnie”.
- Prosty widżet pokazujący mini-porównanie (np. 2 najpopularniejszych firm: payout, cena, max DD).
- Główne CTA ma prowadzić do istniejącej pełnej strony analizy / porównywarki, np.: `/analizy` (lub inny aktualny route dla porównywarki).

Pełna porównywarka z wykresami i szczegółami pozostaje na osobnej stronie (`/analizy`),
nie przenosimy jej na stronę główną.


### 3.5 Mini-edukacja (4 punkty)
- krótkie kafelki typu: „Prawdziwe dane”, „Zweryfikowane opinie” itd.
- zero długich tekstów

### 3.6 Sekcja “Niedawno dodane”
- ostatnie firmy, opinie i analizy (3–9 elementów)
- używa istniejących endpointów

### 3.7 Stylizacja
- oparta na Aurora Layout (z Etapu 2)
- wizualnie inspirowana Aceternity UI (bez dodawania nowego frameworka)
- wyłącznie shadcn/ui + Tailwind

### 3.8 Ograniczenia Etapu 3
- NIE przebudowujemy jeszcze strony `/rankingi`
- NIE ruszamy pełnej porównywarki
- NIE ruszamy wewnętrznych stron firm
- skupiamy się tylko na `/` i komponentach współdzielonych

#### Aktualizacja – 2025-11-14
- Strona główna została przebudowana zgodnie z one-page core: nowy `HomeHero` z wyszukiwarką i CTA, sekcja multi-rankingów (`HomeRankingSection`) oparta o wspólny komponent tabów, sekcja Top Cashback, teaser porównywarki oraz mini-edukacja i lista niedawno dodanych firm/opinii.
- Wyodrębniono komponent `RankingTabsSection` oraz helpery `buildRankingTabs` / `getHomeRankingTabs`, które są wykorzystywane zarówno na `/` (limit 10), jak i na `/rankingi` (wersja „full”).
- Dodano komponenty `HomeCompareTeaser`, `HomeEducationGrid` i `HomeRecentSection`, które korzystają z istniejących danych (`getHomeRanking`, `getRecentPublicReviews`, `getRecentCompanies`).
- Etap 3.2 dołożył silniejsze CTA afiliacyjne (multi-ranking, Top Cashback, niedawno dodane firmy), trzeci przycisk hero (do `/analizy`), microcopy o cashbacku oraz sekcję `HomeMarketingSpotlights` bazującą na panelu admina.

---

## Etap 4 – Strona firmy (`/firmy/[slug]`)
UWAGA:
Etap 4 dotyczy wyłącznie strony profilu firmy (`/firmy/[slug]`).
Porównywarka znajduje się w `/analizy` i jest osobnym etapem (Etap 5 A).

CEL:
Uproszczenie i zmodularyzowanie profilu firmy, żeby był:
- czytelny dla użytkownika,
- łatwy w utrzymaniu,
- gotowy pod dalsze rozwijanie.

### 4.1 Modularizacja

 - [x] Rozbić duży komponent strony firmy na mniejsze sekcje:
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
  - rozważyć opóźnione ładowanie cięższych modułów (np. wykresy payoutów).

### 4.2 Reużywalne komponenty

- [x] Wynieść powtarzające się elementy (karty planów, sekcje z zasadami itd.) do `components/companies/*`.
- [x] Ustandaryzować użycie komponentów shadcn/ui (Button, Tabs, Badge, Card itd.).

#### Aktualizacja – 2025-11-14
- Strona `/firmy/[slug]` korzysta teraz z modułów `CompanyHeaderSection`, `CompanyMetaSection`, `CompanyRulesSection`, `CompanyFaqSection`, `CompanyMediaSection`, `CompanyPlansSection`, `CompanyOffersSection`, `CompanyPayoutsSection` i `CompanyReviewsSection`, dzięki czemu każdy fragment można niezależnie rozwijać lub lazy‑loadować.
- Wyciągnięto logikę kart planów, wypłat i opinii do `components/companies/*`, a wcześniej wbudowane funkcje (`OverviewTab`, `PayoutsTab`, `ReviewsTab`) zostały zastąpione małymi komponentami serwerowymi korzystającymi ze wspólnych typów w `company-profile-types.ts`.
- `CompanyHeaderSection` obejmuje całą strefę hero (logo, CTA, PurchaseCard, social links), natomiast zakładki Tabs renderują dedykowane sekcje (plany, oferty, wypłaty, opinie) z jednolitymi komponentami shadcn/ui i przygotowanymi helperami do przyszłej paginacji/lazy loadingu.

## Etap 5 – Porównywarka (`/analizy`)

**CEL:**  
Zachować porównywarkę jako **osobne narzędzie** (1–3 firmy, wykresy, głębokie porównanie) oraz utrzymać ją w formie czytelnej, modularnej i wydajnej.

---

### 5.1 Struktura i UX

- [x] Jasny, dwustopniowy flow:
  1. **Wybierz 1–3 firmy**
  2. **Analiza / wykresy / porównanie**
- [x] Upewnić się, że CTA z homepage (sekcja „Teaser porównywarki”) kieruje dokładnie na `/analizy`.
- [x] Zachować obecną funkcjonalność, ale uporządkować ją pod kątem modularności i czytelności.

---

### 5.2 Modularność

- [x] Wydzielić logikę porównywania firm do dedykowanych hooków, np.:
  - `useComparisonData`
  - `useComparisonCharts`
- [x] Zoptymalizować ładowanie:
  - komponentów wykresów (lazy-loading),
  - cięższych danych analitycznych (SSR lub SSG, jeśli ma sens),
  - zapytań – unikać powielania fetchów.
- [x] Upewnić się, że struktura komponentów jest czytelna i możliwa do rozbudowy (np. dodanie nowych metryk w przyszłości).

#### Aktualizacja – 2025-11-14
- Dodano hooki `useComparisonData` i `useComparisonCharts`, które agregują metryki, statystyki opinii i dane wykresów – komponenty (dashboard, wykresy) otrzymują gotowe zbiory, dzięki czemu unikamy powielania obliczeń w wielu miejscach.
- `PriceComparisonChart` i `RatingTrendsChart` otrzymują przygotowane dane, a zakładki Tabs renderują sekcje dopiero po aktywacji, co ogranicza koszty hydratacji oraz pozwala łatwo rozszerzać moduły (plany, trading, opinie, wypłaty, profile).
- Widok `/analizy/[...slugs]` zachowuje flow 1) wybór firm → 2) analiza; header pokazuje podsumowanie firm i globalny skrót opinii, a wszystkie sekcje wykorzystują modularne komponenty gotowe pod dalsze rozbudowy (nowe metryki lub kolejne wykresy).

---

## Etap 5 A – Panel użytkownika i UserPanel

### 5.1 A Wspólne źródła danych
- [x] Wyekstrahować hooki:
  - `useUserSummary`
  - `useWalletOffers`
  - `useUserDisputes`
- [x] Nie dublować fetch’y – współdzielić logikę między `/panel` i globalnym `UserPanel`.

### 5.2 UX A
- [x] Upewnić się, że:
  - główne akcje cashback (redeem, historia) są zrozumiałe i spójne,
  - overlay `UserPanel` nie konkuruje z pełną stroną `/panel` (przemyśleć restrukturyzację).

#### Aktualizacja – 2025-11-14
- Uporządkowano źródła danych panelu poprzez hooki `useUserSummary`, `useWalletOffers` i `useUserDisputes`, które cache’ują odpowiedzi `/api/user/summary`, `/api/wallet/offers` oraz `/api/user/disputes` – teraz `/panel` i globalny `UserPanel` odczytują je z jednej warstwy i nie dublują fetchy.
- Strona `/panel` inicjuje widoki także z parametru `?view=`, a zakładki korzystają z nowych hooków zamiast własnych stanów, dzięki czemu `RedeemSection`/`DisputesSection` odświeżają dane jednym wywołaniem.
- Overlay `UserPanel` pełni rolę „szybkiego podglądu”: korzysta z tych samych hooków, tab „Saldo” został przemianowany na „Przegląd”, a w sekcji CTA pojawiły się jasne przyciski „Wymień punkty” / „Zgłoszenia” prowadzące bezpośrednio do `/panel?view=…`.

---

## Etap 6 – Stylowanie i Tailwind

### 6.1 `tailwind.config.ts`
- [x] Wprowadzić plik `tailwind.config.ts`:
  - przenieść tam kolory,
  - zdefiniować podstawowe font-size, spacing, radius,
  - odwzorować najważniejsze tokens z `globals.css`.
- [x] Stopniowo używać `theme(...)` zamiast surowych wartości.

### 6.2 Naprawa brakujących klas
- [x] Dodać definicję `.glass-premium` (i ewentualnie innych brakujących utili) tak, aby `SiteHeader` i `SiteFooter` renderowały efekty zgodnie z projektem.

### 6.3 Redukcja duplikatów
- [x] Zmapować gradienty, cienie, glass efekty na 2–3 główne utilsy.
- [x] Usunąć/lub zastąpić ręczne `px-[clamp(...)]`, gdzie istnieją `fluid-*`.

#### Aktualizacja – 2025-11-14
- Dodano `tailwind.config.ts`, który odwzorowuje paletę, spacing (`fluid-section-*`, `fluid-stack-*`), typografię (`fluid-h*`, `fluid-copy`), promienie i animacje; `theme()` może być teraz używane w utilach zamiast ręcznych wartości.
- W `app/globals.css` rozbudowano system glass o trzy podstawowe klasy (`glass-card`, `glass-panel`, `glass-premium`) oraz nowe utilsy (`fluid-pill`, `fluid-table-head`, `fluid-table-cell`, `fluid-icon-sm`), a `SiteHeader`/`SiteFooter` korzystają z `glass-premium`, dzięki czemu odzyskały efekt szklanego panelu.
- Sekcja rankingu na stronie głównej oraz pozostałe pigułki CTA korzystają z nowych utili zamiast powtarzania `px-[clamp(...)]`, co porządkuje spacing w tabeli i badge’ach; dokumentacja `fluid` została uzupełniona o nowe wpisy.
- Wyrównano zmienne kolorystyczne do standardowego schematu shadcn (light/dark), więc przyszłe motywy z registry/tweakcn można wklejać bez zmian, a nasze własne efekty (`surface-glass`, `shadow-soft/strong`) bazują na pochodnych tych samych tokenów.

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
