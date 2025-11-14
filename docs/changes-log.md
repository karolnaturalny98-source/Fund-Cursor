# Changes Log

## 2025-11-14 – Etap 1: API security
- Uszczelniono `/api/cashback`: zwykli użytkownicy mogą jedynie zgłosić transakcję PENDING z limitem 5 000 punktów, a po utworzeniu rewalidowany jest tag punktów.
- Dodano admin endpoint `POST /api/admin/cashback/manual`, który pozwala administratorowi na tworzenie manualnych cashbacków (status, punkty, wskazanie użytkownika) oraz loguje operację.
- Wszystkie endpointy newslettera po stronie admina korzystają teraz z `assertAdminRequest`, a mutacje rewalidują tag `admin-newsletter`.

## 2025-11-14 – Etap 1.3 i Etap 2
- `/api/newsletter`, `/api/report` oraz `/api/clicks` mają proste ograniczenia zapytań oparte o IP (i email dla newslettera); przekroczenie limitu zwraca `429` z nagłówkiem `Retry-After`.
- Stworzono `app/(site)/layout.tsx` z jedną instancją `AuroraWrapper` i przeniesiono landing, rankingi, firmy (wraz z `[slug]` i `compare`), opinie, analizy, affilację, sklep, bazę wiedzy oraz stronę „O nas” do grupy `(site)`.
- Usunięto lokalne kopie aurory z każdej strony publicznej, dzięki czemu tło WebGL renderuje się tylko raz i nie duplikuje kosztownych efektów.

## 2025-11-14 – Rename (marketing) → (site)
- Zmieniono nazwę route group z `(marketing)` na `(site)` bez wpływu na publiczne URL-e.
- Zaktualizowano dokumentację (`agents.md`, `docs/refactor-plan.md`) oraz wpisy o layoutach tak, aby nowa grupa była opisana jako segment publiczny aplikacji.

## 2025-11-14 – Etap 3: nowa strona główna / one-page core
- Stworzono nowy `HomeHero` z wyszukiwarką, CTA i kartami metryk oraz przeniesiono sekcję multi-rankingów do `HomeRankingSection`.
- Dodano komponent `RankingTabsSection` i helpery `buildRankingTabs`/`getHomeRankingTabs`, wykorzystywane jednocześnie przez `/` i `/rankingi`.
- Rozbudowano stronę o teaser porównywarki (`HomeCompareTeaser`), mini-edukację (`HomeEducationGrid`) oraz sekcję „Niedawno dodane” łączącą nowe firmy i opinie.
- Zachowano sekcję Top Cashback oraz dodano `HomeMarketingSpotlights` i `HomeLatestCompanies`, a blok opinii pokazuje tylko 3 najnowsze recenzje.
- Usunięto stare komponenty landingowe (`HeroSection`, `RankingTabs`, `MarketingCarousel`, `HowItWorksSection`, `WalletCtaBanner`), aby z repozytorium zniknęły nieużywane sekcje.

## 2025-11-14 – Etap 3.2: UX/CRO pod afiliację
- W sekcjach multi-rankingu i Top Cashback dodano wyraźne CTA „Przejdź z kodem”/„Odbierz cashback” oraz microcopy tłumaczące mechanizm cashbacku.
- „Niedawno dodane firmy” i hero zawierają dodatkowe przyciski (w tym link do `/analizy`), a „Ostatnie opinie” zyskały odnośnik do `/opinie`.
- Mini-edukacja ma kafelek „Jak działa cashback?”, a nowa karuzela `HomeMarketingSpotlights` pokazuje badge, zniżki, oceny i CTA spójne z panelem admina.

## 2025-11-14 – Etap 4: Strona firmy (`/firmy/[slug]`)
- Rozbito monolit strony firmy na moduły: `CompanyHeaderSection`, `CompanyMetaSection`, `CompanyRulesSection`, `CompanyFaqSection`, `CompanyMediaSection`, `CompanyPlansSection`, `CompanyOffersSection`, `CompanyPayoutsSection` i `CompanyReviewsSection`, które są ładowane w zakładkach App Routera.
- Cała logika hero (logo, ulubione, Compare, PurchaseCard, social links) znajduje się w `CompanyHeaderSection`, a zakładka „Przegląd” korzysta z meta/rules/FAQ/media sekcji, co ułatwia dalsze prace nad SSR i lazy loadingiem.
- Wyciągnięto wspólne typy (`company-profile-types.ts`) i helpery, usunięto nadmiarowy kod z `page.tsx`, a karta ofert/planów i wypłaty korzystają teraz z małych komponentów serwerowych.

## 2025-11-14 – Etap 5: Porównywarka (`/analizy`)
- Dodano hooki `useComparisonData` i `useComparisonCharts`, które agregują metryki i dane wykresów dla całej analizy; dzięki temu `AnalysisLayout`, `MetricsDashboard` i wykresy korzystają z jednej warstwy pochodnych danych zamiast obliczać je wielokrotnie.
- `PriceComparisonChart` i `RatingTrendsChart` przyjmują gotowe zestawy danych, a zakładki Tabs renderują swoje sekcje dopiero po aktywacji, co ogranicza koszt hydratacji (wykresy i ciężkie komponenty nie ładują się dopóki użytkownik ich nie potrzebuje).
- Karta nagłówka pokazuje teraz streszczenie firm (logo, rating, kraj, highlighty) oraz globalne statystyki opinii, a sekcja przeglądu korzysta z tych samych danych także w zakładkach „Plany” i „Przegląd”.
- `MetricsDashboard` nie polega już na globalnej zmiennej `companies`; wszystkie dane (łącznie z kartami regulacyjnymi) przekazywane są poprzez nowe hooki, co rozwiązuje runtime'owy ReferenceError „companies is not defined”.
