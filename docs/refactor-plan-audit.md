## Podsumowanie
Wariant zabezpieczeń z Etapu 1 jest wdrożony – `/api/cashback`, `/api/admin/newsletter` oraz limity na newsletter/kliknięcia/zgłoszenia działają w kodzie (`app/api/cashback/route.ts:1`, `app/api/admin/newsletter/route.ts:1`, `app/api/newsletter/route.ts:1`, `app/api/report/route.ts:1`, `app/api/clicks/route.ts:1`), ale brak dodatkowych honeypotów i brak limitów dla `/api/shop/purchase` oznacza otwarte zadania bezpieczeństwa. Layout publiczny został przeniesiony do `app/(site)/layout.tsx:1`, natomiast porównywarka firm (`components/analysis/analysis-layout.tsx:28`) nadal uruchamia własną instancję `Aurora`, co chwilowo niweluje część korzyści wydajnościowych. Etap 3 (landing + `/firmy`) i Etap 5 (porównywarka) są zgodne z planem – sekcje są odświeżone i wielokrotne komponenty zostały wyciągnięte do `components/home/*` i `components/companies/*`. Etap 4 (profil firmy) jest modularny, lecz dane są nadal renderowane w całości i sekcja opinii nie ma paginacji (`components/companies/company-reviews-section.tsx:27`, `lib/queries/companies.ts:122`). Etap 5A (panel) zatrzymał się w połowie – strona `/panel` używa hooków (`app/panel/page.tsx:1`), ale globalny `UserPanel` nadal pobiera dane ręcznie (`components/panels/user-panel.tsx:187`). System stylów otrzymał `tailwind.config.ts:1` i `glass-premium` (`app/globals.css:320`), jednak tracker `docs/FLUID_SPACING_ROLLOUT.md:7` pokazuje, że większość modułów wciąż posiada ręczne `clamp`/`space-y`, więc rollout jest w toku. Etap 7 (SSR/paginacja dla admin/newsletter i ciężkich zapytań) i Etap 8 (redesign UI) nie zostały rozpoczęte. Dokumenty audytowe w `docs/*.md` nie odzwierciedlają obecnego stanu – raporty nadal wymieniają naprawione luki, a refactor-plan zakłada, że overlay panelu korzysta z nowych hooków, co nie jest prawdą.

## Status etapów z refactor-plan
| Etap | Zakres | Status | Dowody w kodzie | Uwagi |
| --- | --- | --- | --- | --- |
| 1. Bezpieczeństwo API | Cashback + newsletter + rate limiting | PARTIAL | `app/api/cashback/route.ts:1`, `app/api/admin/cashback/manual/route.ts:1`, `app/api/admin/newsletter/route.ts:1`, `app/api/newsletter/route.ts:1`, `lib/rate-limit.ts:1` | Limity działają na newsletter/kliknięcia/zgłoszenia, ale brak dodatkowych honeypotów/Redis (otwarty punkt w planie) oraz brak limitu dla `/api/shop/purchase` (`app/api/shop/purchase/route.ts:1`). |
| 2. Layouty i Aurora | Jedna instancja tła dla publicznych stron | PARTIAL | `app/(site)/layout.tsx:1` | Layout `(site)` renderuje aurorę raz, lecz `components/analysis/analysis-layout.tsx:28` wciąż ładuje osobne `Aurora`, więc porównywarka produkuje dwa WebGL. |
| 3. Strona główna + lista firm | One-page core + compact `/firmy` | DONE | `app/(site)/page.tsx:1`, `components/home/home-hero.tsx:1`, `components/home/home-ranking-section.tsx:1`, `app/(site)/firmy/page.tsx:1`, `components/companies/companies-page-client.tsx:1`, `components/companies/company-directory-row.tsx:1` | Wszystkie sekcje opisane w planie istnieją, multi-ranking korzysta z `RankingTabsSection`, a lista firm została przebudowana na układ tabelaryczny. |
| 4. Strona firmy | Modularizacja + lazy/paginacja | PARTIAL | `app/(site)/firmy/[slug]/page.tsx:1`, `components/companies/company-header-section.tsx:1`, `components/companies/company-reviews-section.tsx:1`, `lib/queries/companies.ts:122` | Strona jest rozbita na sekcje, ale SSR nadal pobiera całe drzewo relacji i opinie nie są stronicowane (TODO w kodzie). |
| 5. Porównywarka `/analizy` | Hooki + modularne sekcje | DONE | `app/(site)/analizy/[...slugs]/page.tsx:1`, `components/analysis/analysis-layout.tsx:1`, `components/analysis/hooks/use-comparison-data.ts:1`, `components/analysis/hooks/use-comparison-charts.ts:1` | Dane są agregowane w hookach, wykresy są lazy-loadowane zgodnie z planem. |
| 5A. Panel użytkownika | Wspólne źródła danych dla `/panel` i overlay | PARTIAL | `app/panel/page.tsx:1`, `components/panels/hooks/use-user-summary.ts:1`, `components/panels/hooks/use-wallet-offers.ts:1`, `components/panels/hooks/use-user-disputes.ts:1`, `components/panels/user-panel.tsx:187` | Hooki istnieją i są używane przez stronę `/panel`, ale `UserPanel` nadal robi własne fetch’e i utrzymuje duplikaty stanów, mimo że plan twierdzi, że zostały zastąpione hookami. |
| 6. Tailwind/stylowanie | Konfiguracja + redukcja clampów | PARTIAL | `tailwind.config.ts:1`, `app/globals.css:1`, `components/layout/site-header.tsx:1`, `docs/FLUID_SPACING_ROLLOUT.md:7`, `components/companies/company-header-section.tsx:1` | Plik konfiguracyjny oraz klasy `glass-*` istnieją, ale tracker fluid spacing pokazuje większość modułów jako TODO i komponenty (np. company header) nadal mają ręczne `clamp`. |
| 7. Admin + wydajność | Newsletter SSR + przegląd ciężkich zapytań | TODO | `app/admin/(tabs)/newsletter/page.tsx:1`, `lib/queries/companies.ts:122`, `lib/queries/companies.ts:950` | Tab newsletter pozostaje w 100% kliencki z fetch loopem, a zapytania `getCompanyBySlug`/`getUserSummary` nadal pobierają komplet danych bez paginacji. |
| 8. UI redesign / registry | Nowe layouty inspirowane Aceternity | TODO | brak zmian w `components/home/*` poza etapem 3 | Sekcja pozostaje nienaruszona – brak nowych layoutów/bloków opisanych w planie. |

## Audyty → Plan
### docs/current-architecture.md
- ✔ Problem z brakiem centralnego layoutu aurory został uwzględniony w Etapie 2 i większościowo rozwiązany (`app/(site)/layout.tsx:1`), choć porównywarka wymaga jeszcze usunięcia własnego `Aurora`.
- ✔ Ostrzeżenie o braku autoryzacji w panelu newslettera pokryto w Etapie 1 (teraz `assertAdminRequest` jest obecne w API).
- 🟡 Wniosek o monolitycznej stronie firmy jest zdezaktualizowany – kod jest modularny, lecz dokument nie został uaktualniony (`docs/current-architecture.md:35`).
- 🟡 Duplikacja logiki między `/panel` oraz globalnym panelem jest nadal aktualna; choć plan ma Etap 5A, overlay wciąż używa oddzielnych fetchy (`components/panels/user-panel.tsx:187`).
- 🟡 Uwaga o niespójnym spacingu (sekcje vs. własne kontenery) pozostaje prawdziwa – tracker fluid wskazuje wiele modułów jako TODO (`docs/FLUID_SPACING_ROLLOUT.md:7`).

### docs/styles-audit.md
- ✔ Brak `tailwind.config` i brak klasy `glass-premium` zostały rozwiązane (`tailwind.config.ts:1`, `app/globals.css:320`, `components/layout/site-header.tsx:1`), więc dokument wymaga aktualizacji.
- 🟡 Problem duplikowanych `AuroraWrapper` jest prawie usunięty, ale `components/analysis/analysis-layout.tsx:28` nadal renderuje własne tło.
- 🟡 Ostrzeżenia o ręcznych `px-[clamp(...)]` i `space-y-*` w dużych modułach pozostają aktualne (np. `components/companies/company-header-section.tsx:13`), mimo że plan ogłosił zakończenie Etapu 6.

### docs/data-api-audit.md
- ✔ Luki P1 dotyczące `/api/cashback` i `/api/admin/newsletter` są zaadresowane (Etap 1, `app/api/cashback/route.ts:1`, `app/api/admin/newsletter/[id]/route.ts:1`).
- 🟡 Audyt sygnalizuje ciężkie SSR w `getCompanyBySlug` i `getUserSummary` – plan ma Etap 7, ale kwerendy nadal ładują komplet danych (`lib/queries/companies.ts:122`, `lib/queries/companies.ts:950`).
- 🟡 Powielone fetch’e panelu użytkownika były wskazane w audycie; Etap 5A nie został ukończony (overlay nie używa hooków).
- 🟡 Sekcja o rate limitach wymienia również `/api/shop/purchase` (`docs/data-api-audit.md:57`), a plan ograniczył się do newslettera/kliknięć/zgłoszeń – endpoint sklepu nadal jest nielimitowany (`app/api/shop/purchase/route.ts:1`).
- ❌ Audytowa uwaga o niespójnej rewalidacji (np. mutacje newslettera) nie doczekała się pozycji w planie; mimo że część mutacji rewaliduje tag, nie ma ogólnego zadania porządkującego cache.

### docs/audit-summary.md
- ✔ Pozycje 1 i 2 (cashback + newsletter API) są zamknięte dzięki Etapowi 1 (`docs/audit-summary.md:21-29` vs. `app/api/cashback/route.ts:1` i `app/api/admin/newsletter/[id]/route.ts:1`).
- 🟡 Pozycja 3 (kliencka zakładka newsletter) jest nadal aktualna – UI nie został przepisany (`app/admin/(tabs)/newsletter/page.tsx:1`).
- 🟡 Pozycja 4 (monolit `/firmy/[slug]`) jest tylko częściowo rozwiązana: struktura jest modularna, ale brak paginacji i lazy-loading (TODO w kodzie).
- 🟡 Pozycja 5 (powielona aurora) powraca na stronie analizy, więc dokument powinien podkreślać konieczność usunięcia dodatkowego `Aurora`.
- 🟡 Pozycja 6 (duplikacja panel vs overlay) trwa – plan wymaga kontynuacji Etapu 5A.
- ✔ Pozycje 7–9 (glass-premium, tailwind config) są naprawione – dokument można zaktualizować, aby skupić się na pozostałych problemach.
- 🟡 Pozycja 10 (brak konsekwentnego `Section`) jest nadal prawdziwa; wiele stron ma ręczne kontenery (`app/(site)/rankingi/page.tsx:33`).

## Plan → Kod
- **Etap 1.1 – `/api/cashback`** – endpoint wymusza status `PENDING`, limit punktów i loguje manualne operacje (`app/api/cashback/route.ts:1`, `app/api/admin/cashback/manual/route.ts:1`). Wciąż brak honeypotów lub dodatkowego audytu na `/api/shop/*`.
- **Etap 1.2 – Newsletter admin** – `assertAdminRequest` zabezpiecza wszystkie metody (`app/api/admin/newsletter/route.ts:1`, `app/api/admin/newsletter/[id]/route.ts:1`), ale obsługa błędów zwraca HTTP 500 zamiast 401/403 przy braku roli, więc UX wymaga poprawy.
- **Etap 1.3 – Rate limiting** – `lib/rate-limit.ts:1` zapewnia limit w pamięci dla newslettera/kliknięć/zgłoszeń, ale nie obejmuje `/api/shop/purchase` i nie jest współdzielony między instancjami (ogłoszone w planie jako praca przyszła).
- **Etap 2 – Layout `(site)`** – centralny layout istnieje (`app/(site)/layout.tsx:1`), lecz `components/analysis/analysis-layout.tsx:28` nadal importuje `Aurora`, przez co porównywarka ma dwie nakładające się instancje.
- **Etap 3 – Landing/`/firmy`** – wszystkie sekcje (wyszukiwarka, multi-ranking, Top Cashback, teaser porównywarki, edukacja, nowo dodane, marketing spotlights) znajdują się w `components/home/*` i używają nowych helperów (`app/(site)/page.tsx:1`, `components/home/home-ranking-section.tsx:1`); `/firmy` korzysta z `CompaniesPageClient`.
- **Etap 4 – `/firmy/[slug]`** – moduły są rozbite (`components/companies/*`), ale wciąż pobieramy 20 opinii i wszystkie relacje w jednym zapytaniu (`lib/queries/companies.ts:122`), a TODO o paginacji opinii jest niezaadresowane (`components/companies/company-reviews-section.tsx:27`).
- **Etap 5 – Porównywarka** – `useComparisonData` i `useComparisonCharts` obsługują przetwarzanie danych (`components/analysis/hooks/use-comparison-data.ts:1`), a tabs ładują zawartość lazy; ten etap jest w kodzie.
- **Etap 5A – Panel** – `/panel` używa hooków (`app/panel/page.tsx:24`), ale `components/panels/user-panel.tsx:187` nadal wykonuje własne fetch’e do `/api/wallet/*` i `/api/user/disputes`, więc planowe „wspólne źródła” nie są wdrożone.
- **Etap 6 – Stylowanie** – `tailwind.config.ts:1` odzwierciedla tokeny, `app/globals.css` ma `glass-premium`, lecz według `docs/FLUID_SPACING_ROLLOUT.md:7` duża część modułów (Companies, Company detail, Affiliate, Admin, UI primitives) wciąż ma status TODO/In Progress.
- **Etap 7 – Admin + wydajność** – brak zmian w UI newslettera (`app/admin/(tabs)/newsletter/page.tsx:1`) ani optymalizacji `getCompanyBySlug`/`getUserSummary` (`lib/queries/companies.ts:122`, `lib/queries/companies.ts:950`).
- **Etap 8 – UI redesign** – brak pracy w repo (żadne nowe layouty/registry-bloki nie zostały zmergowane).

## Brakujące elementy (ważne z audytu, brak w planie/kodzie)
- **Rate limiting dla sklepu** – Audyt danych wskazuje, że `/api/shop/purchase` powinno być chronione przed spamem (`docs/data-api-audit.md:57`), lecz plan nie zawiera takiego zadania i kod nie posiada żadnych limiterów (`app/api/shop/purchase/route.ts:1`).
- **Rewalidacja po mutacjach** – Audyt zwraca uwagę na niespójne `revalidatePath`/`revalidateTag` (np. dla newslettera i cashbacku), a w planie brak osobnego zadania porządkującego tę kwestię (mutacje newslettera rewalidują tylko tag admina).
- **Dokumentacja luczek** – `docs/current-architecture.md` i `docs/audit-summary.md` wciąż raportują monolityczną stronę firmy i brak autoryzacji newslettera, przez co plan nie odnotowuje, że te zadania są już zamknięte.

## Zadania dodatkowe (zidentyfikowane w kodzie)
- **Podwójna aurora w analizach** – `components/analysis/analysis-layout.tsx:28` importuje `Aurora` mimo że layout `(site)` już renderuje `AuroraWrapper`, co oznacza dwa WebGL równocześnie i zaprzepaszcza część zysku Etapu 2.
- **Limiter w pamięci** – `lib/rate-limit.ts:1` trzyma licznik w globalnym Mapie; w środowisku wieloserwerowym limitery będą niezależne na każdej instancji. Plan wspomina o potencjalnym Redisie, ale brak zadania technicznego ani implementacji.
- **Obsługa błędów admin newslettera** – `app/api/admin/newsletter/route.ts:1` i `app/api/admin/newsletter/[id]/route.ts:1` zwracają HTTP 500 przy braku autoryzacji, co przeczy oczekiwanemu 401/403 i utrudnia diagnozowanie problemów.
- **Tracker fluid spacing** – `docs/FLUID_SPACING_ROLLOUT.md:7` ujawnia, że większość modułów publicznych, adminowych i UI primitives nie została przeniesiona na nowe utilsy mimo że Etap 6 w planie jest oznaczony jako wykonany.

## Rekomendacje aktualizacji refactor-plan
1. **Urealnić Etap 5A** – dopisać zadanie migracji `components/panels/user-panel.tsx` na `useUserSummary`/`useWalletOffers`/`useUserDisputes` i usunąć z planu/`docs/changes-log.md:41` informację, że overlay już korzysta z hooków.
2. **Dodać limitery dla sklepu** – w sekcji 1.3 lub osobnym etapie ująć rate limiting / honeypot dla `/api/shop/purchase` i `/api/shop/confirm`, bo audyt danych nadal wskazuje ten wektor.
3. **Rozszerzyć Etap 2** – dodać kontrolę, aby komponenty stron (np. `AnalysisLayout`) nie renderowały własnych instancji `Aurora`, oraz dopisać test/ci checklistę, która wychwyci podobne regresje.
4. **Zaktualizować Etap 6** – zamiast oznaczać całość jako ukończoną, pozostawić otwarte zadania dla pozycji wymienionych w `docs/FLUID_SPACING_ROLLOUT.md:7` (Companies, Company detail, Affiliate, Admin, UI primitives) wraz z kryteriami akceptacji.
5. **Wprowadzić zadanie dot. rewalidacji/cache** – audyt danych odnotował niespójności; plan powinien zawierać krok przeglądu `revalidateTag`/`revalidatePath` po każdej mutacji newslettera, cashbacku i sklepu.
6. **Aktualizacja dokumentacji audytowej** – dopisać do `docs/audit-summary.md` oraz `docs/current-architecture.md` sekcję „Status 2025-11”, aby czytelnik nie odnosił wrażenia, że P1 (cashback/newsletter) nadal są otwarte.
