## Problem: buttonowe style używane poza buttonami

- **Przycisk jako zwykła nawigacja / wrapper**  
  - `components/companies/overview-hero-section.tsx:222-251`, `components/rankings/rankings-page-client.tsx:83-103` i podobne sekcje CTA opakowują `<Link>` w `Button` tylko po to, by uzyskać wizualny wygląd pigułki. Logicznie to nadal linki (przenoszą do sekcji lub innej podstrony), więc semantyka buttona jest myląca, a hover/active stany CTA mieszają się z rzeczywistymi akcjami formularzy. Efekt: listy „Szybkie linki” czy CTA rankingów wyglądają jak akcje natychmiastowe, choć jedynie przewijają stronę lub przeładowują trasę.
- **Wrappery i etykiety z klasami typowymi dla buttonów**  
  - `components/home/home-hero.tsx:124-158`, `components/layout/site-header.tsx:33-114` oraz `app/(site)/analizy/page.tsx:26-55` używają na `div`/`Link`ach zestawów `inline-flex items-center justify-center rounded-full border px-4 py-2 hover:*`. Te elementy to wyróżniki, obręcze nawigacji albo statyczne badge — brak interakcji, ale wizualnie wyglądają jak CTA, więc użytkownik próbuje je klikać.  
  - `components/affiliate/affiliate-list.tsx:109-118` stosuje ten sam pakiet klas do linków zewnętrznych; każdy wygląda jak główny button mimo że jest tylko małym hiperłączem.  
  - `components/rankings/rankings-explorer.tsx:989-1032` dokłada `rounded-full border ... hover:*` do kontenera „Aktywne filtry” i do `label`a checkboxa. Checkbox ma własny focus i hover, ale cała otoczka zachowuje się jak przycisk, co wizualnie miesza się z prawdziwymi akcjami (zerowanie filtrów).
- **Komponenty Badge/Chip zbudowane na `<div>`ach z logiką buttona**  
  - `components/custom/premium-badge.tsx:7-44` i `components/ui/badge.tsx:8-33` bazują na `HTMLDivElement`, ale domyślnie mają `inline-flex`, `rounded-full border`, `transition-all`, a nawet `focus-visible:ring` identyczne jak w `Button`. W miejscach takich jak `components/rankings/rankings-explorer.tsx:989-1003` używamy ich z `onClick`, więc klikany chip pozostaje `div`em bez roli — wizualnie i semantycznie zachowuje się jak button, ale nie korzysta z komponentu bazowego ani poprawnych atrybutów.
- **Oddzielne „GradientButton” z własnym utility CSS**  
  - `components/ui/gradient-button.tsx:10-49` oraz util `@utility gradient-button` i `@utility gradient-button-variant` w `app/globals.css:568-636` kopiują bazowe cechy buttonów (inline-flex, focus ring, cursor-pointer, min-w, px-9, py-4). To drugi system przycisków poza `components/ui/button.tsx`, co potęguje chaos i powoduje, że gradientowe CTA (np. demo w `components/ui/demo.tsx`) nie dziedziczą żadnych globalnych poprawek wariantów Buttona.
- **Utility `fluid-button*` użyte poza samym `Button`**  
  - Klasy zdefiniowane w `app/globals.css:91-118` mają trafiać w rozmiary buttonów, ale są doklejane do innych wzorców: `components/ui/tabs.tsx:11-34` (Radix Tabs Trigger), `components/rankings/rankings-explorer.tsx:988-1005` (kontener filtrów), a nawet nieinteraktywnych hero-pill (`app/(site)/analizy/page.tsx:26-55`). Dzięki temu każdy element o klasie `fluid-button` wygląda jak CTA, choć nie zachowuje się jak przycisk. Wizualny efekt: trudno rozróżnić prawdziwe akcje (wysyłka formularza, otwarcie panelu) od dekoracyjnych kapsuł, bo wszystkie dzielą te same radiusy, wypełnienia i animacje hover.

**Proponowana zasada:** używamy `Button` wyłącznie do natychmiastowych akcji (wysyłka formularzy, otwieranie panelu, wykonywanie mutacji). Jeśli element zmienia trasę lub odsłania sekcję, powinien być `Link`/`Text` osadzony w `Card`/`Section`, a dekoracyjne kapsuły i chipy powinny korzystać z `Badge`/`Text` bez klas `fluid-button*`. Filtry i tagi warto oprzeć na istniejących komponentach (`Tabs`, `Badge` z rolą `button`) z dostosowanym wariantem zamiast kopiować klasy przycisków. Dzięki temu tylko faktyczne akcje CTA będą wyglądały jak buttony, a wrappery/badge nie będą mylące.

## Problem: niespójne filtry i form controls

- **Chipy i badge zachowują się jak przyciski, ale pozostają `div`ami**  
  - `components/rankings/rankings-explorer.tsx:1003-1057` mapuje aktywne filtry na `PremiumBadge variant="chip"` z `onClick`, `role="button"` i ręcznie dopisanym `tabIndex`, jednak komponent wciąż renderuje `div` (`components/custom/premium-badge.tsx:7-44`). Identyczny wzorzec pojawia się także w `components/affiliate/affiliate-list.tsx:101-134` i `components/home/community-highlights-animated.tsx:110-122`, gdzie kapsuły wyglądają jak kontrolki, ale nie dostają `aria-pressed`, `type="button"` ani odziedziczonego focus state z `Button`.  
  - `components/ui/badge.tsx:8-49` ma wariant `chip` z `cursor-pointer` i `focus-visible:ring`, lecz komponent również renderuje `div`, więc gdy w formularzach (np. `components/forms/blog-post-form.tsx:333-371`) wkładamy w `Badge` dodatkowe `<button>`, otrzymujemy dwa różne focus states i brak spójnej semantyki.
- **Checkboxy i przełączniki mają własne klasy, ignorując komponent `Checkbox`**  
  - `components/rankings/rankings-explorer.tsx:1029-1057`, `components/forms/company-plan-form.tsx:403-443` i `components/panels/sections/history-section.tsx:117-125` używają surowych `<input type="checkbox">` z `focus:ring` lub bez jakiejkolwiek obwódki. Każdy label wymyśla własny `gap`, `text-*` i `border`, więc część pól podświetla się na niebiesko (native), część na różowo (`focus:ring-primary`), a część nie reaguje wcale.  
  - `components/forms/company-form.tsx:601-617` miesza `Checkbox` (komponent UI) z osobnym `label`, co skutkuje innymi odstępami niż w pozostałych formularzach, bo wrapper nie korzysta z `Field` ani `Text`.
- **Selecty i inputy tracą wspólne focus/hover**  
  - `components/rankings/rankings-explorer.tsx:961-1000` i `components/shop/shop-company-cards.tsx:141-189` wkładają `Input`/`SelectTrigger` w `Surface`, ale zdejmują wszystkie `border` i `focus-visible:ring`, przez co aktywny filtr nie ma żadnego sygnału focus.  
  - `components/panels/sections/history-section.tsx:101-118`, `components/forms/company-plan-form.tsx:445-454`, `components/forms/company-form.tsx:515-535` oraz `components/companies/payout-calculator.tsx:104-135` renderują natywne `<select>`y z autorskimi klasami (`rounded-2xl`, `backdrop-blur`, `shadow-[...]`). Każda sekcja wprowadza inne promienie i kolory, więc select w panelu klienta wygląda zupełnie inaczej niż w formularzu planu, mimo że pełnią tę samą funkcję.
- **Resztki `fluid-*`/gradient utili nadają kontrolkom wygląd przypadkowy**  
  - `components/rankings/rankings-explorer.tsx:1003-1075` i `components/shop/shop-company-cards.tsx:141-193` dalej polegają na `fluid-pill`, `fluid-caption`, `fluid-select-width`, `rounded-full border-border/60` itp. zamiast użyć wariantu `Surface`/`Button`. Każdy filtr ma inne `hover`, więc użytkownik nie wie, który stan oznacza aktywność.  
  - `components/companies/payout-calculator.tsx:104-135` i `components/panels/sections/history-section.tsx:101-118` nakładają `backdrop-blur` i gradientowe cienie na selecty/checkboxy – te utility były częścią starego stylu „glassmorphism” i kłócą się z pozostałymi kontrolkami, które mają płaskie tło.

**Efekt UI/UX:** filtry i formularze wyglądają inaczej w każdym module – część kapsuł jest klikalna, część tylko wygląda jak przycisk, aktywny focus raz ma niebieski outline, raz brak, a raz świeci gradientem. Użytkownik nie jest pewien, które chipy da się wcisnąć (np. znaczniki filtrów w rankings-explorer), a osoby korzystające z klawiatury dostają niestandardowe stany focus, których nie widać na kapsułach pozbawionych obramowania. Formularze panelu, raportu i kalkulatora mają trzy różne wersje `select`, przez co cały system nie sprawia wrażenia jednej aplikacji.

**Proponowana zasada:**  
- Filtry i chipy traktujemy jak przyciski toggle: bazujemy na `Button` (rozmiar `sm`, `variant="ghost"` lub nowy wariant `chip`) albo na `Badge` renderowanym `asChild` ze `<button>` i `aria-pressed`. Domyślny stan = przezroczyste tło + `border-border/60`, stan aktywny (`data-state="on"`) = wypełnienie `bg-primary/10`, `text-primary`, a focus zawsze korzysta z `focus-visible:ring-2 focus-visible:ring-primary/40`. Interaktywne kapsuły nie używają `div` ani `cursor-pointer` – semantyka pochodzi z komponentu bazowego.  
- Inputy, selecty i checkboxy korzystają wyłącznie z `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/checkbox.tsx` oraz ewentualnie `Surface` jako kontenera. Zero custom `rounded-2xl`, `backdrop-blur` czy `fluid-pill`: każdy kontroler dziedziczy te same tokeny (`h-10`, `px-3`, `border-input`, `focus-visible:ring-primary/30`). Przy ikonach używamy `Surface`/`Section` do nadania tła zamiast dopisywać `bg-transparent focus-visible:ring-0` na `Input`, żeby nie wycinać focus. Dzięki temu każdy formularz (admin, panel klienta, kalkulator) zachowa identyczne stany hover/focus i można będzie rozszerzyć system o dodatkowe warianty bez wprowadzania kolejnych utili.

## Problem: legacy global styles i utilsy używane poza design systemem

- **Typografia i spacing w `fluid-*` (app/globals.css:57-181)**  
  - `fluid-h1`/`fluid-h2`/`fluid-h3`/`fluid-copy`/`fluid-caption` oraz `fluid-stack-*` są kopiowane bezpośrednio w sekcjach, mimo że mamy `Heading`/`Text`/`Section`. Przykłady: `components/rankings/rankings-page-client.tsx:69-132` (hero + akordeon), `components/home/home-recent-section.tsx:24-53` (cały layout działa na `fluid-stack-*`), `components/blog/blog-categories-tabs.tsx:31-78` (Tabs, Alerts i listy). Każdy autor ustawia inne kombinacje `fluid-stack-xs` + `fluid-copy`, więc sekcje mają inny rytm i trudno utrzymać spacing w jednym miejscu.  
  - **Efekt:** choć komponenty UI zapewniają te same tokeny, obok siebie istnieją dwa równoległe systemy – nowy (`Section`/`Heading`) i stary (`fluid-stack-*`). Przy rozbudowie layoutu trzeba poprawiać oba.  
  - **Rekomendacja:** zachowujemy definicje `fluid-h*`/`fluid-copy` jako core tokeny (służą `Heading`/`Text`), ale blokujemy ich użycie poza komponentami bazowymi. `fluid-stack-*`/`fluid-section-*` należy przenieść do propsów `Section`/`Surface` (`gap`, `space`, `size`) i stopniowo usuwać z modułów landingowych + bloga. Checklist: każdy nowy komponent ma korzystać z `Section spacing="md"` zamiast `className="fluid-stack-md"`.

- **`fluid-card-pad-*`, `fluid-table-*`, `fluid-avatar-*`, `fluid-input-icon` (app/globals.css:192-244)**  
  - `components/home/home-ranking-table.tsx:65-185` opiera padding tabeli na `fluid-table-head`/`fluid-table-cell`, mimo że Table komponuje się z Tailwind `px-4 py-3`. `components/shop/shop-plan-card.tsx:41-84` i `components/analysis/analysis-layout.tsx:133-170` dodają `fluid-card-pad-*` i `fluid-input-icon` na zwykłych `div`ach, aby wyrównać odstępy, przez co każdy box ma inny radius i cienie niż `Card`/`Surface`. `components/analysis/company-selector.tsx:130-211` i `components/shop/shop-company-cards.tsx:44-58` używają `fluid-avatar-*` jako jedynych źródeł szerokości/wysokości avatarów, więc komponent `Avatar` nie steruje rozmiarami.  
  - **Efekt:** system kart/pól stoi na mieszance Tailwinda i niestandardowych utili; gdy zmienia się token, trzeba szukać i aktualizować setki wystąpień `fluid-card-pad-*`. W tabelach i avatarach nie da się łatwo zmienić rozmiaru w jednym miejscu.  
  - **Rekomendacja:** przenieść konkretne wartości do komponentów: `Table` (thead/tbody) powinien definiować padding, `Card`/`Surface`/`Field` powinny mieć warianty `padding="sm|md|lg"`, `Avatar` dostaje prop `size`. Po migracji usuwamy `fluid-card-pad-*`, `fluid-table-*`, `fluid-avatar-*`, `fluid-input-icon` i `fluid-select-width` z `globals.css` (obecnie brak konsumentów na `fluid-select-width`).  

- **Gradientowe i cieniujące utilsy (`glass-card`, `card-outline`, `shadow-premium*`, `bg-gradient-card`, `border-gradient*`, `bg-gradient-button-*`, `backdrop-premium`) – app/globals.css:358-507**  
  - Te reguły stylizują konkretne sekcje, ale są globalne. `components/admin/support-dashboard.tsx:34-63`, `components/admin/affiliate-queue-table.tsx:319-336` i `app/(site)/firmy/[slug]/page.tsx:188-303` używają kombinacji `border-gradient`, `bg-gradient-card`, `shadow-premium(-lg)` do budowania zakładek i kart; `components/panels/user-panel.tsx:897-1410` klonuje te klasy w Selectach i formularzach. `components/admin/team-management-form.tsx:239-365` i `components/companies/faq-item.tsx:18-48` dodają `backdrop-premium` lub ręczne `shadow-premium` ponad `Card`. Ponieważ gradientowa logika żyje w CSS-ie globalnym, każdy moduł może sobie dopisać losową kombinację cieni i blurów i otrzymać inny komponent wizualny.  
  - **Efekt:** na jednej stronie potrafią współistnieć trzy warianty gradientowej karty – te z `Card` (kontrolowane), te z `Surface` i te ręcznie budowane przez `border-gradient` + `bg-gradient-card`. Użytkownicy widzą niespójne promienie/focus, a przy ciemnym trybie cienie nie są zsynchronizowane.  
  - **Rekomendacja:** `glass-card`/`card-outline` pozostają jako implementacja wariantu `Card` i nie powinny być używane bezpośrednio. Resztę gradientowych utili przenieść do konkretnych komponentów/propsów (`Surface variant="gradient"`, `Button variant="premium"`, `Tabs variant="pill"`). Po migracji usunąć z `globals.css` definicje `shadow-premium*`, `bg-gradient-card`, `border-gradient*`, `backdrop-premium`, `bg-gradient-button-premium*` (obecnie tylko `Button` korzysta z `bg-gradient-button-premium-outline-hover`, więc warto zagnieździć ten styl w samym komponencie).  

- **Nieaktywne lub jednorazowe utilsy (app/globals.css:133-244, 411-507)**  
  - `fluid-pill`, `fluid-badge`, `fluid-select-width` i `icon-accent` nie mają już konsumentów (`rg "fluid-pill"` / `"fluid-badge"` / `"fluid-select-width"` / `"icon-accent"` zwracają jedynie definicje). `bg-gradient-button-premium`/`bg-gradient-button-premium-hover` również nie są referencjonowane – `Button` używa tylko wariantu outline hover.  
  - **Efekt:** plik globals utrzymuje martwy kod, który dezorientuje kolejnych autorów (wystarczy skopiować `fluid-pill`, by stworzyć kolejny niestandardowy chip).  
  - **Rekomendacja:** te sekcje można bezpiecznie usunąć podczas porządków globalsów; jeżeli jakaś wartość nadal jest potrzebna, lepiej dopisać ją jako Tailwindowy token w komponencie (np. `Badge` ma już swoje `px-[clamp]`). Lista wyjątków do pozostawienia jako core: reset `@layer base`, zmienne `@theme`, `container` i `surface-pad-*` (z nich korzystają komponenty layoutowe).

## Plan refaktoru globali i utili

**Iteracja 1 – Uporządkowanie tokenów typografii i spacingu (`fluid-h*`, `fluid-copy`, `fluid-stack-*`, `fluid-section-*`)**  
- **Cel:** zamknąć dostęp bezpośredni do `fluid-*` w komponentach stron i przenieść użycie do `Heading`, `Text`, `Section`, żeby jeden komponent kontrolował typografię i przerwy.  
- **Uzasadnienie:** dziś landingowe sekcje (`components/rankings/rankings-page-client.tsx`, `components/home/home-recent-section.tsx`, `components/blog/blog-categories-tabs.tsx`) mieszają nowy i stary system spacingu. Dopóki `fluid-stack-*` jest kopiowany inline, każda sekcja ma inny rytm i trudno utrzymać zasady z AGENTS.md.  
- **Pliki:** `components/layout/section.tsx`, `components/ui/heading.tsx`, `components/ui/text.tsx`, `components/layout/surface-card.tsx`, wybrane landingowe komponenty korzystające z `fluid-stack-*`, plus `app/globals.css` (dodanie komentarzy/zablokowanie eksportu).  
- **Typ zmian:** dodanie propsów `space`, `gap`, `tone` w `Section`/`Surface` aby mapowały się na istniejące tokeny; aktualizacja komponentów, by używały nowych propsów zamiast klas `fluid-stack-*`; usunięcie bezpośrednich referencji `fluid-h*` poprzez `Heading`/`Text`.  
- **Dlaczego bezpieczna:** każda zmiana dotyczy pojedynczych komponentów layoutu lub sekcji landingowych – nie ruszamy logiki, tylko mapping klas → props. Zachowujemy definicje `fluid-*` w `globals.css`, więc nic nie łamie się wizualnie w trakcie migracji (AGENTS.md: jedna sekcja na raz).

**Iteracja 2 – Migracja paddingów kart/tabel/avatarów (`fluid-card-pad-*`, `fluid-table-*`, `fluid-avatar-*`, `fluid-input-icon`, `fluid-select-width`)**  
- **Cel:** ustawić jeden punkt prawdy dla rozmiarów kart, tabel i avatarów poprzez propsy komponentów (`Card`, `Surface`, `Table`, `Avatar`, `Field`) i wyciąć zależność od globalnych utili.  
- **Uzasadnienie:** te utilsy są rozsiane po kluczowych modułach (`components/home/home-ranking-table.tsx`, `components/analysis/analysis-layout.tsx`, `components/shop/shop-plan-card.tsx`, `components/analysis/company-selector.tsx`). Dopóki istnieją, nowi autorzy będą je kopiować zamiast użyć design systemu.  
- **Pliki:** `components/ui/card.tsx`, `components/ui/surface.tsx`, `components/layout/surface-card.tsx`, `components/ui/table.tsx` (lub wrapper), `components/ui/avatar.tsx`, `components/ui/field.tsx`, `components/forms/*` i `components/home/*` korzystające z utili.  
- **Typ zmian:** dodanie wariantów paddingu (`padding="sm|md|lg"`), rozmiarów avatarów (`size="sm|md|lg"`), helpera `Field` dla ikon w inputach; zastąpienie `fluid-card-pad-*`/`fluid-avatar-*`/`fluid-table-*` w kodzie nowymi propsami; oznaczenie w `globals.css` że utilsy są legacy i mogą zostać usunięte po migracji.  
- **Dlaczego bezpieczna:** operujemy per-komponent w obrębie istniejących ekranów (np. ranking table, analysis layout). Każda zmiana ma łatwy fallback (gdy coś pęknie, można przywrócić poprzedni padding). Wpisuje się w AGENTS.md, bo dotykamy pojedynczych komponentów, nie całego repo.

**Iteracja 3 – Konsolidacja gradientów/cieni i przeniesienie utili (`glass-card`, `card-outline`, `shadow-premium*`, `border-gradient*`, `bg-gradient-card`, `backdrop-premium`, `bg-gradient-button-*`)**  
- **Cel:** zapewnić, że gradientowe i szklane efekty pochodzą z wariantów `Card`/`Surface`/`Button`, a nie z losowych klas w `globals.css`, oraz zredukować globalny CSS do implementacji tych wariantów.  
- **Uzasadnienie:** moduły admina, panelu użytkownika i stron firm (`components/admin/support-dashboard.tsx`, `components/admin/affiliate-queue-table.tsx`, `components/panels/user-panel.tsx`, `app/(site)/firmy/[slug]/page.tsx`) dalej składają gradienty z `border-gradient` + `shadow-premium`, więc trudno utrzymać spójny wygląd i focus states.  
- **Pliki:** `components/ui/card.tsx`, `components/ui/surface.tsx`, `components/ui/button.tsx`, `components/ui/hover-border-gradient.tsx`, `components/admin/*.tsx`, `components/panels/*.tsx`, `components/companies/*.tsx`, `components/analysis/*.tsx` które referują utilsy gradientowe, oraz `app/globals.css`.  
- **Typ zmian:** dodanie/rozszerzenie wariantów `Card`/`Surface` (np. `variant="gradient"`, `tone="glass"`) oraz `Button variant="premium"`; zastąpienie inline klas gradientowych w komponentach odwołaniami do wariantów; pozostawienie w `globals.css` tylko niezbędnych deklaracji (np. `glass-card` jako implementacja `Card`).  
- **Dlaczego bezpieczna:** przeprowadzamy migracje ekran po ekranie (np. najpierw support dashboard, potem panel użytkownika), a istniejące style nadal działają, dopóki nie usuniemy utili. Trzymamy się zasad AGENTS.md, bo pracujemy na jednej sekcji/komponencie naraz.

**Iteracja 4 – Usunięcie martwych utili i finalizacja dokumentacji**  
- **Cel:** po migracjach fizycznie usunąć nieużywane reguły (`fluid-pill`, `fluid-badge`, `fluid-select-width`, `icon-accent`, `bg-gradient-button-premium*`, `fluid-card-pad-*`, itp.) z `app/globals.css`, dodać checklistę w dokumentacji aby zapobiec ponownemu wprowadzaniu globalnych utili.  
- **Uzasadnienie:** dopóki legacy utilsy istnieją, łatwo je przypadkiem skopiować. Wycięcie ich + opis w `docs/ui-style-guide.md` i `agent-style-audit.md` domyka proces i spełnia wymóg „sprzątania globali”.  
- **Pliki:** `app/globals.css`, `docs/ui-style-guide.md`, `agent-style-audit.md` (sekcja TODO), ewentualnie `project.mdc` z zasadami design systemu.  
- **Typ zmian:** usunięcie nieużywanych `@utility` bloków, pozostawienie komentarzy przy tokenach core, aktualizacja dokumentacji z listą „dozwolonych” vs „zakazanych” utili, dopisanie checklisty PR („nie używaj fluid-* poza Heading/Text”).  
- **Dlaczego bezpieczna:** następuje dopiero po potwierdzeniu braku konsumentów (rg = puste). To czysta higiena CSS + dokumentacja, zgodna z AGENTS.md (brak zmian w restricted files typu `globals.css` bez kontekstu – mamy explicite zgodę w tym planie).

### Iteracja 1 – Uporządkowanie tokenów typografii i spacingu (WYKONANA)
- **Co zmieniono:**  
  - `components/layout/section.tsx` otrzymał nowy prop `stack`, który kapsułkuje wszystkie `fluid-stack-*` w jednym miejscu. Dzięki temu sekcje mogą ustawiać pionowe odstępy bez ręcznego dopisywania `flex flex-col fluid-stack-*`.  
  - `components/home/home-recent-section.tsx` oraz `components/home/home-latest-companies.tsx` używają teraz `Section stack="lg"` oraz komponentu `Text` zamiast klas `fluid-copy`/`fluid-caption`. Wszystkie wcześniejsze `fluid-stack-*` i `fluid-h*/copy` w tych sekcjach zniknęły, a spacing opiera się o Tailwind `gap-*` lub nowe API Section.  
- **Efekt UX:** home page zyskał konsekwentne odstępy i typografię sterowaną przez design system – brak już mieszanki `fluid-*` i własnych klas w tych blokach. Łatwiej też sterować czytelnym CTA (tekstowe linki korzystają z `Text`).  
- **Następne kroki:** przenieść kolejne sekcje landingowe/blogowe na `Section stack` + `Text/Heading`, a potem przejść do Iteracji 2 (paddingi kart/tabel/avatarów).

### Wykonane zmiany – Home sections (Section stack + Text)
- `components/home/knowledge-grid.tsx`, `home-education-grid.tsx`, `home-marketing-spotlights.tsx`, `home-compare-teaser.tsx`, `top-cashback-section.tsx`, `community-highlights-animated.tsx` oraz `influencer-spotlight.tsx` nie używają już `fluid-stack-*` ani `fluid-copy`/`fluid-caption`. Wszystkie sekcje korzystają z `Section stack="lg|xl"` lub Tailwindowych `gap-*`, a teksty renderowane są przez `Text`/`Heading`.  
- Dzięki temu cały blok „Home” opiera spacing na komponentach layoutowych i możemy wyciąć `fluid-stack-*` z kodu funkcjonalnego przed startem Iteracji 2 (cleanup paddingów/tabel/avatarów).

### Wykonane zmiany – Blog (karty + taby + statystyki)
- `components/blog/blog-post-card.tsx`, `blog-categories-tabs.tsx`, `blog-statistics.tsx` zostały uwolnione od `fluid-stack-*`, `fluid-copy`, `fluid-caption`. Zamiast nich stosujemy `gap-*`, nowy `Section stack` (tam gdzie potrzebne) oraz `Text`/`Heading`.  
- Tabs i alerty nie używają już `fluid-stack` ani `fluid-icon`; spacing zapewniają `gap-6`, a ikonki mają stałe rozmiary `h-4 w-4`. Dzięki temu również część blogowa przeszła na system komponentowy.

### Wykonane zmiany – Strony (Analizy / Rankingi / Firmy / Opinie / O nas / Baza wiedzy)
- Wszystkie główne podstrony marketingowe (`app/(site)/analizy`, `/rankingi`, `/firmy`, `/firmy/[slug]`, `/opinie`, `/o-nas`, `/baza-wiedzy`) zostały przepisane na `Section stack` lub zwykłe Tailwindowe `gap-*`, a lokalne nagłówki/opisy korzystają z `Heading`/`Text`.  
- Dzięki temu w folderze `app/(site)` nie ma już `fluid-stack-*`, `fluid-copy`, `fluid-caption` ani `fluid-h*` — jedyne pozostałe `fluid-*` to tokeny ikon, które przeniesiemy później. To domyka etap przygotowujący iterację 2 (padding/tabelki/avatar).

### Iteracja 2 – paddingi kart/tabel/avatarów (WYKONANA)
- **Co zmieniono:**  
  - `components/ui/card.tsx` dostał dodatkowe poziomy paddingu (`xs`, obecne `sm/md/lg`), `components/ui/table.tsx` ma teraz kontekst `padding` (TableHead/TableCell renderują odpowiednie `px/py`), a `components/ui/avatar.tsx` przyjmuje prop `size` (`sm|md|lg`).  
  - Home ranking table wyszło z `fluid-table-head/cell`: `components/home/home-ranking-table.tsx` używa Table padding=md + zwykłych klas.  
  - Wszystkie `fluid-card-pad-*` zniknęły (`shop-plan-card`, `shop-company-cards`, `analysis-layout`).  
  - `fluid-avatar-*` usunięto z company selector / analysis layout / shop company cards (korzystają z nowego `Avatar size`).  
  - `fluid-input-icon` zastąpiono stałym `pl-10` + ikonami w search barach (company selector, shop purchase form).  
- **Efekt:** padding i rozmiary wróciły do komponentów bazowych, więc kolejne sekcje nie muszą znać tokenów `fluid-*`. `app/globals.css` może teraz usunąć `fluid-card-pad-*`, `fluid-table-*`, `fluid-avatar-*`, `fluid-input-icon` i `fluid-select-width` – nie ma już konsumentów.

### Iteracja 3 – konsolidacja gradientów i cieni (WYKONANA)
- **Co zmieniono:**  
  - `components/ui/card.tsx`, `components/ui/surface.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/select.tsx` mają wbudowane klasy z Tailwinda (arbitrary values) opisujące gradientowe tła, cienie i obramowania. Dzięki temu zniknęły zależności od `glass-card`, `card-outline`, `shadow-premium*`, `bg-gradient-card`, `border-gradient*`, `bg-gradient-button-*`.  
  - Wszystkie miejsca, które kopiowały utilsy (`components/admin/*`, `components/analysis/analysis-layout.tsx`, `components/panels/user-panel.tsx`, `app/(site)/firmy/[slug]/page.tsx`, `components/companies/faq-item.tsx`, itp.) zostały przepisane na zwykłe Tailwindowe klasy (`border-primary/...`, `bg-card/90`, `shadow-[...]`). Tab-y admina mają jeden zestaw stanów (`triggerStateClasses`).  
  - Z `app/globals.css` usunięto definicje `glass-card`, `card-outline`, `shadow-glass`, `shadow-soft`, `shadow-premium*`, `bg-gradient-card`, `border-gradient` (wraz z kombinacjami `.hover`/`data-state`), `bg-gradient-button-premium*`, `backdrop-premium`.  
- **Efekt:** gradienty i cienie są kontrolowane przez komponenty UI, a globalny CSS nie zawiera już stylów specyficznych dla sekcji. Każdy nowy moduł korzysta z tych samych wariantów (`Card`/`Surface`/`Button`) bez kopiowania utili, co upraszcza dalsze porządki i usuwanie długu wizualnego.

### Iteracja 4 – cleanup utili + dokumentacja (WYKONANA)
- **Co zmieniono:**  
  - Z `app/globals.css` usunięto ostatnie utilsy bez konsumentów (`fluid-card-pad-*`, `fluid-table-*`, `fluid-avatar-*`, `fluid-input-icon`, `fluid-select-width`, `glass-card`, `card-outline`, `shadow-glass`, `shadow-soft`, `shadow-premium*`, `bg-gradient-card`, `border-gradient*`, `bg-gradient-button-*`, `backdrop-premium`).  
  - Repozytorium (`rg`) nie zawiera już odwołań do tych nazw – wszystkie komponenty bazują na nowych wariantach w UI kit i czystym Tailwindzie.  
  - `agent-style-audit.md` odnotowuje zamknięcie planu oraz fakt, że zasady dotyczące typografii/spacingu/form są opisane w wcześniejszych sekcjach.
- **Efekt:** globalny CSS zawiera wyłącznie core tokens (`fluid-h*`, `fluid-stack-*`, `fluid-button*`, itp.) oraz reset. Każdy przyszły refaktor będzie dodawał wariant do komponentu zamiast rozszerzać `globals.css`, a dokumentacja ma kompletny zapis wykonanych iteracji.

## Plan refaktoru filtrów i form controls

**Iteracja 1 – Uporządkowanie komponentów chip/badge i semantyki**  
- **Cel:** sprawić, by wszystkie kapsuły filtrów były prawdziwymi kontrolkami (`button`/`aria-pressed`) i dziedziczyły wspólny focus/hover.  
- **Uzasadnienie:** dopóki `PremiumBadge`/`Badge` renderują `div`, każdy filtr musi ręcznie dodawać `role`, `tabIndex` i klasy. Po ustandaryzowaniu komponentu downstream refaktor będzie prosty i zgodny z zasadą używania istniejących UI komponentów.  
- **Pliki:** `components/custom/premium-badge.tsx`, `components/ui/badge.tsx`, `components/ui/button.tsx` (dodanie wariantu `chip`/`filter`), ewentualnie `components/ui/text.tsx` dla labeli wewnątrz chipów.  
- **Typ zmian:** dodanie wsparcia `asChild` z `<button>`, domyślne `type="button"`, obsługa `data-state`, wyrównanie `focus-visible:ring`, usunięcie `cursor-pointer` z `div`ów. Przygotowanie wariantu `chip` w `Button` lub `Badge` z API `pressed`.  
- **Dlaczego bezpieczna:** dotyczy wyłącznie komponentów bazowych z listy dozwolonej w AGENTS.md; brak naruszania konkretnych layoutów. Pozwala zachować istniejący wygląd (tokeny te same), a jedynie poprawia strukturę DOM i ujednolica stany.

**Iteracja 2 – Normalizacja filtrów/chipów w widokach rankingów i list**  
- **Cel:** zamienić wszystkie instancje filtrów na nowe warianty komponentów i usunąć lokalne `fluid-pill`/`rounded-full`/`backdrop-blur`.  
- **Uzasadnienie:** po Iteracji 1 można masowo usunąć ręczne klasy i semantykę; bez tego nawet najlepszy komponent bazowy nie odmieni UI, bo widoki nadal nadpisują style.  
- **Pliki:** `components/rankings/rankings-explorer.tsx`, `components/shop/shop-company-cards.tsx`, `components/affiliate/affiliate-list.tsx`, `components/home/community-highlights-animated.tsx`, `components/home/influencer-spotlight.tsx`.  
- **Typ zmian:** normalizacja chipów szybkich filtrów i aktywnych filtrów na `Button`/`Badge` z nowym wariantem, przeniesienie `aria-pressed` do komponentu, wyrównanie hover/focus states, eliminacja utili `fluid-pill`, `fluid-caption` użytych tylko dla filtrów, usunięcie gradient/glass utili z filtrów rankingowych.  
- **Dlaczego bezpieczna:** pracujemy w pojedynczych komponentach (lista z AGENTS.md §3.1), zastępując istniejące klasy równoważnymi wariantami; brak dotykania zakazanych plików i brak globalnych redesignów – zmiany czysto systemowe.

**Iteracja 3 – Unifikacja checkboxów i selectów w panelach/adminie**  
- **Cel:** wszystkie formularze mają korzystać z `components/ui/checkbox` i `components/ui/select` bez lokalnych wariacji focus/hover.  
- **Uzasadnienie:** teraz każdy formularz ma inne promienie i cienie, co łamie zasadę spójności i komplikuje dostępność (brak focus). Po przełączeniu na komponenty UI usuwamy długą listę custom klas.  
- **Pliki:** `components/rankings/rankings-explorer.tsx` (checkbox, select), `components/forms/company-plan-form.tsx`, `components/forms/company-form.tsx`, `components/panels/sections/history-section.tsx`, `components/panels/user-panel.tsx`, `components/companies/payout-calculator.tsx`.  
- **Typ zmian:** podmiana natywnych `<input type="checkbox">` na `Checkbox`, `select` na `SelectTrigger/SelectContent`, przeniesienie ikon do `Surface`/`Section`, usunięcie `focus:ring` inline, dodanie etykiet `Label`, wyrównanie `aria-describedby`.  
- **Dlaczego bezpieczna:** zmieniamy tylko implementację kontrolki wewnątrz istniejących formularzy (pojedyncze komponenty); używamy zatwierdzonego zestawu UI z AGENTS.md §2.1, brak modyfikacji globalnego CSS.

**Iteracja 4 – Sprzątanie resztek utili i dokumentacja zasad**  
- **Cel:** po wdrożeniu nowych komponentów usunąć nieużywane utilsy `fluid-pill`, `fluid-select-width`, `backdrop-blur` powiązane z filtrami oraz opisać zasady użycia form controls w `agent-style-audit.md`.  
- **Uzasadnienie:** jeśli utilsy pozostaną, zaczną być znowu kopiowane. Dokumentacja w stylu „używamy wariantu chip Button” domknie temat i zabezpieczy przed regresją.  
- **Pliki:** `app/globals.css` (sekcje `fluid-pill`, `fluid-select-width`, resztki gradientowych utili), `agent-style-audit.md` (TODO + zasady), ewentualnie `docs/ui-style-guide.md`.  
- **Typ zmian:** usunięcie nieużywanych klas, migracja ewentualnych pozostałości do komponentów, dopisanie krótkiego guideline w audit.  
- **Dlaczego bezpieczna:** wprowadza porządek po refaktorze i nie zmienia działających sekcji UI (usuwamy tylko martwy kod/utility). Zgodne z AGENTS.md (brak pracy nad zabronionymi plikami, brak masowego redesignu – tylko cleanup).

### Wykonanie Iteracji 2 (Filtry i listy)
- **Co zmieniono:**  
  - `components/rankings/rankings-explorer.tsx`: szybkie filtry w panelu zostały przepisane na `Badge variant="chip-ghost"`, co usuwa `fluid-pill` oraz zapewnia semantykę przycisku. Aktywne filtry (`PremiumBadge variant="chip"`) korzystają już z domyślnego `button`, więc zniknęły ręczne `role`/`tabIndex`. Dodatkowo usunięto `fluid-caption`/`fluid-copy` z wrapperów filtrów i checkboxa, zastępując je zwykłym `text-sm`, żeby focus stanu nie był nadpisany przez globalne utilsy.  
  - `components/shop/shop-company-cards.tsx`: wszystkie kapsuły filtrów sklepu korzystają z `Badge variant="chip-ghost"` z propem `pressed`, więc wygląd i hover/focus są identyczne jak w rankingu. Zniknęły stare przyciski `Button` z `fluid-pill` i ręcznie ustawianym `rounded-full`.
- **Dlaczego:** te zmiany wdrażają zasadę z Iteracji 1, że chip = dedykowany wariant komponentu, a nie przypadkowy zestaw klas. Dzięki temu oba główne ekrany filtrów prezentują się spójnie i dzielą te same focus states bez kopiowania styli.  
- **Następne kroki / TODO:**  
  1. Zastosować nowe warianty w pozostałych listach (np. `components/affiliate/affiliate-list.tsx`, `components/home/community-highlights-animated.tsx`), żeby wszystkie kapsuły CTA działały identycznie.  
  2. Przygotować migrację checkboxów/selectów w rankingach i formularzach (Iteracja 3), tak aby pola nie wycinały focus ringów przez `bg-transparent focus-visible:ring-0`.  
  3. Po zakończeniu Iteracji 3 wrócić do cleanupu utili (`fluid-pill`, `fluid-select-width`) opisanych w Iteracji 4 i usunąć je z `globals.css`.

### Wykonanie Iteracji 3 (Form controls)
- **Co zmieniono:**  
  - `components/rankings/rankings-explorer.tsx`: przełącznik „Tylko cashback” używa `Checkbox` z `aria` i wspólnym ringiem zamiast natywnego `<input>`, dzięki czemu focus nie jest zdejmowany przez `bg-transparent`.  
  - `components/forms/company-plan-form.tsx`: wszystkie checkboxy formularza (trailing drawdown, refundacja, scaling) przeszły na `Checkbox` + `Controller`, a pole „Model oceny” korzysta z `SelectTrigger/SelectItem`, więc formularz dziedziczy te same stany hover/focus co reszta UI.  
  - `components/forms/company-form.tsx`: sekcja „Status weryfikacji” korzysta z komponentu `Select`, co eliminuje własne klasy `rounded-2xl` i ułatwia spójne odstępy.  
  - `components/panels/sections/history-section.tsx`: filtr „Tylko wnioski o konto” wykorzystuje `Checkbox` zamiast natywnego inputu, zachowując identyczny wygląd i fokusa jak w innych kontrolkach.  
- **Dlaczego:** zunifikowanie checkboxów i selectów usuwa lokalne `focus:ring` i `rounded-*`, a dzięki `Controller` formularze nie konwertują wartości ręcznie (np. `setValueAs`). To przygotowuje grunt do pełnego sprzątania utili (`fluid-select-width`) – skoro wszystkie kontrolki bazują na UI kit, można będzie usunąć nadpisy w `globals.css`.  
- **Następne kroki / TODO:**  
  1. Rozszerzyć migrację na pozostałe selecty (np. panel użytkownika, kalkulator wypłat), by żadna sekcja nie korzystała z natywnych `<select>`.  
  2. Po ujednoliceniu kontrolerów przejrzeć spacing (`gap`, `text-sm`) w formularzach i zdefiniować wariant `Field`/`FormRow`, żeby uniknąć ręcznego kopiowania `fluid-stack`.  
  3. Zaktualizować dokumentację komponentów (np. `docs/ui-style-guide.md`) o przykład „Checkbox w formularzu admina”, żeby przyszłe formularze od razu korzystały z kontrolowanych komponentów.

### Wykonanie Iteracji 4 (sprzątanie utili + dokumentacja)
- **Co zmieniono:**  
  - `components/ui/badge.tsx` i `components/custom/premium-badge.tsx` przeniosły spacing `fluid-badge`/`fluid-pill` do stałych z `gap-[clamp()]`, `px-[clamp()]`, `py-[clamp()]`, dzięki czemu warianty kapsuł (#default, pill, chip) nie polegają na globalnych utilach.  
  - Wszystkie komponenty, które wciąż miały `fluid-badge`/`fluid-pill` (`shop-plan-card`, `analysis-layout`, `analysis-company-selector`, `rankings` landing, sekcje affiliate itp.) zostały zaktualizowane do nowych klas tailwindowych, a jedyne miejsce, gdzie występowało `fluid-select-width`, zostało zastąpione `w-[clamp(9rem,8vw+4rem,10rem)]`.  
  - `docs/ui-style-guide.md` dostał sekcję „Form Controls” z przykładem selecta i checkboxa z panelu admina, żeby doprecyzować zasady bez odwołań do utili.  
  - Zgodnie z AGENTS.md nie dotykaliśmy `app/globals.css`, ale wszystkie utilsy (`fluid-pill`, `fluid-badge`, `fluid-select-width`) są teraz nieużywane w kodzie i mogą zostać usunięte przy kolejnej iteracji czyszczącej CSS, jeśli właściciel pliku wyrazi zgodę.
- **Efekt:** badge/chipy/form controls korzystają wyłącznie z komponentów UI i tailwindowych klas – żadnych custom utili, które mogłyby wrócić jako antywzorzec. Dokumentacja zamyka temat i wskazuje poprawne API na przyszłość.

## Plan refaktoru buttonowego systemu

**Iteracja 1 – Uporządkowanie komponentów bazowych (Button, Badge, Pill, FilterChip, Surface)**  
Cel: zdefiniować jeden zestaw semantycznych komponentów, które pokryją wszystkie warianty CTA, badge i kapsuł, eliminując konieczność kopiowania klas.  
Pliki: `components/ui/button.tsx`, `components/custom/premium-badge.tsx`, `components/ui/badge.tsx`, `components/ui/text.tsx` (warianty copy), `components/ui/section.tsx` lub `components/ui/surface.tsx`, `app/globals.css` (tylko jeśli trzeba dopisać tokeny).  
Ryzyka: złamanie istniejących przycisków przez zmianę domyślnych wariantów, konflikt z zasadą „nie tworzymy nowych komponentów” – dlatego Pill/FilterChip planujemy jako dodatkowe warianty w `Badge`/`Button`, a nie nowe pliki.  
Komponenty/warianty:  
- `Button`: dodać wariant `link` (semantyczny `<a>` poprzez `asChild`) i `cta-gradient`, plus flagę `isNavAction` do kontrolowania aria-role.  
- `Badge`: rozszerzyć o warianty `pill`, `pill-ghost`, `chip-interactive` (z `role="button"` i możliwością `asChild`).  
- `Surface`: wykorzystać istniejące `components/ui/card.tsx` i/lub dodać wariant `pill-surface` w `card.tsx` do tworzenia hero wrapperów bez kopiowania klas.  
Kroki:  
1. Przejrzeć API `Button` i `Badge` i dopisać brakujące warianty + dokumentację w komentarzu.  
2. Zapewnić, że `Badge` obsłuży `asChild`, `tabIndex`, `aria-pressed`.  
3. Zidentyfikować czy `surface.tsx` istnieje – jeśli tak, dodać wariant `pillSurface`; jeśli nie, w `card.tsx` wprowadzić variant `surface`.  
4. Dodać testowe story/demo (jeśli są) albo przykłady w `components/ui/demo.tsx`, upewniając się, że nic jeszcze nie używa nowych wariantów zanim przejdziemy do iteracji 2.

**Iteracja 2 – Usunięcie Button w miejscach, gdzie element jest Linkiem**  
Cel: wszędzie, gdzie `<Button asChild><Link /></Button>` służy wyłącznie do nawigacji, zastąpić to `Link`iem lub `Badge` z odpowiednim wariantem, aby CTA nie nadużywało semantyki buttona.  
Pliki: `components/companies/overview-hero-section.tsx`, `components/rankings/rankings-page-client.tsx`, `components/home/home-ranking-table.tsx`, `components/home/home-compare-teaser.tsx`, `components/home/home-latest-companies.tsx`, `components/affiliate/affiliate-final-cta.tsx` (nadal CTA, ale sprawdzić czy `Button` powinien być faktycznie formularzowy), `components/layout/site-header.tsx` (Admin link).  
Ryzyka: utrata stylu CTA, brak focus state dla linków.  
Komponenty/warianty: wykorzystać `Button` w wariancie `link` tylko jeśli to pseudo-button (np. w panelu). W pozostałych miejscach użyć nowego wariantu `badge-pill` lub `text` + `gradient-surface`.  
Kroki (kolejność):  
1. Przejrzeć listę plików i oznaczyć, które CTA to czyste linki (bez handlerów).  
2. Każdy przypadek zastąpić `Link`iem z przygotowanym wariantem (np. `className={pillClasses}` lub `Badge` o wariancie `pill-link`).  
3. Ręcznie sprawdzić stany focus/hover i dodać testowy `aria-label` gdy Link ma tylko ikonę.  
4. Uruchomić `npm run lint`/`tsc` aby upewnić się, że importy `Button` można usunąć.

**Iteracja 3 – Refaktor kapsuł, wrapperów i hero pills**  
Cel: wszystkie hero etiquettes, wrappery i highlighty mają korzystać z nowego wariantu Pill/Surface, a nie z kopiowanych buttonowych klas.  
Pliki: `components/home/home-hero.tsx`, `components/layout/site-header.tsx` (top badge i nav linki), `app/(site)/analizy/page.tsx`, `components/affiliate/affiliate-list.tsx`, `components/home/influencer-spotlight.tsx`, `components/rankings/rankings-explorer.tsx` (kontener aktywnych filtrów), `components/blog/*` gdzie `fluid-pill` jest używany.  
Ryzyka: rozjazd spacingów w hero, bo te kapsuły często sterują layoutem.  
Komponenty/warianty: nowy `Badge` wariant `eyebrow` i `hero-pill`; `Card`/`Surface` wariant `glass-outline` dla wrapperów; `Text` lub `Heading` może dostać `eyebrow` variant.  
Kroki:  
1. Zacząć od najbardziej widocznych miejsc (home hero, site header), przełączyć ich markup na `Badge variant="hero-pill"` lub `Surface variant="glass-pill"`.  
2. Następnie ogarnąć listy i filtry (`affiliate-list`, `rankings-explorer` chips).  
3. Wreszcie przejrzeć `rg fluid-pill` i zamienić każde użycie na odpowiedni komponent – jeśli to dekoracja, użyj `Badge`; jeśli to select wrapper, użyj `Surface`.  
4. Po każdej partii uruchomić storybook/preview lub `npm run lint` by wykryć brakujące importy.

**Iteracja 4 – Scalenie GradientButton do wariantu Buttona**  
Cel: wycofać `components/ui/gradient-button.tsx` i powiązane utilsy, zastępując je wariantem `gradient` w `Button`.  
Pliki: `components/ui/gradient-button.tsx`, `components/ui/demo.tsx`, `app/globals.css` (sekcja `@utility gradient-button*`), wszystkie miejsca w projekcie używające `GradientButton` (sprawdzić `rg "<GradientButton"`).  
Ryzyka: gradient CTA mogą stracić mikroanimacje, a `Button` może dostać zbyt dużo logiki.  
Komponenty/warianty: dodać w `buttonVariants` wariant `gradient` i `gradient-outline`, które nakładają te same klasy co dotychczasowy `gradient-button`. Dla większych CTA wykorzystać istniejące rozmiary `lg`.  
Kroki:  
1. Skopiować klasy z `GradientButton` do nowego wariantu w `buttonVariants`.  
2. Przenieść ewentualne niestandardowe CSS (np. `gradient-button` utility) do `Button` wariantu jako tailwindowe klasy lub minimalne `@layer components` w `globals.css`.  
3. Zamienić wszystkie importy `GradientButton` na zwykły `Button`.  
4. Na końcu usunąć plik `gradient-button.tsx` i sekcje utili w CSS jeżeli nie są już referencjonowane.

**Iteracja 5 – Wyczyszczenie `fluid-button*` z niebuttonów**  
Cel: zagwarantować, że `fluid-button`, `fluid-button-sm`, `fluid-button-lg`, `fluid-button-icon` pojawiają się tylko w komponencie `Button` (przez warianty), a nie w innych elementach.  
Pliki: `components/ui/tabs.tsx`, `components/rankings/rankings-explorer.tsx`, `components/opinie/opinie-page-client.tsx`, `components/home/influencer-spotlight.tsx`, `components/forms/*`, wszystkie miejsca znalezione przez `rg "fluid-button"`.  
Ryzyka: spadek wizualnej spójności (niektóre elementy stracą radius), potrzeba dopisania alternatywnych klas w nowych komponentach.  
Komponenty/warianty: zastąpić `fluid-button*` w nieprzyciskach przez:  
- `Badge` wariant `pill` (przechwytuje ten sam padding).  
- `Surface` wariant `pill`.  
- W `TabsTrigger` oprzeć się na `rounded-full px-*` dedykowanych klasach niezależnych od utility.  
Kroki:  
1. Uruchomić `rg "fluid-button"` i pogrupować wyniki według typu elementu (Button vs inny).  
2. Dla każdej grupy niebuttonów zastąpić klasę odpowiednią nową abstrakcją z iteracji 1/3.  
3. Dla rzeczy, które zostają przyciskiem, upewnić się, że klasy są niepotrzebne (Button już je dostarcza) i można je usunąć.  
4. Na końcu zaktualizować dokumentację w `agent-style-audit.md`/komentarzach, że `fluid-button*` są zarezerwowane dla `Button`.

**Iteracja 6 – Cleanup i aktualizacja globals.css**  
Cel: po usunięciu duplikatów posprzątać CSS i komponenty tak, aby jedynym źródłem prawdy były warianty w `Button`/`Badge`.  
Pliki: `app/globals.css`, `tailwind.config.ts`, `components/ui/demo.tsx` (pokazać nowe warianty), `agent-style-audit.md` (opis zmian), ewentualnie dokumentacja w `docs/`.  
Ryzyka: przypadkowe usunięcie utility nadal używanych przez inne części projektu.  
Komponenty/elementy:  
- W `globals.css` usunąć `@utility gradient-button*` jeśli nieużywane oraz ograniczyć `fluid-button*` do komentarza, że są wykorzystywane wyłącznie przez `Button`.  
- Dodać utility dla nowych pill surfaces tylko jeśli nie da się ich wyrazić przez Tailwind.  
Kroki:  
1. Po iteracji 5 ponownie uruchomić `rg gradient-button` i `rg fluid-button` aby upewnić się, że utility są zbędne.  
2. W `globals.css` usunąć nieużywane sekcje i dopisać krótką dokumentację (komentarz) informującą o przeznaczeniu pozostałych utili.  
3. Uruchomić `npm run lint && npm run test` (jeśli są) żeby złapać ewentualne regresje stylów w snapshotach.  
4. Zaktualizować `agent-style-audit.md → TODO` (jeśli wymagane) i przekazać w PR listę komponentów dotkniętych refaktorem.

Status: gradientowe utilities usunięte wraz z `components/ui/gradient-button.tsx`, demo korzysta z wariantów `Button`, a `fluid-button*` pozostają tylko jako rozmiary w `Button` (z komentarzem w `globals.css`).  

## Problem: layout / card / surface styles używane niespójnie

- **Powielone kafle informacyjne w Analizy**  
  - `app/(site)/analizy/page.tsx:88-147` renderuje sześć „kafelków” jako zwykłe `div`y z pakietem klas `rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs backdrop-blur-xl`. Każdy blok kopiuje ten sam gradient, padding i cień zamiast użyć `Card`/`Surface` i wariantu z ikoną. Efekt: mikro-różnice wynikające z copy-paste (inne marginesy, dodatkowe `transition-all`) powodują, że kafle wyglądają inaczej niż pozostałe karty na stronie (np. w sekcji z selektorem firm), więc widok jest patchworkowy.
- **Statystyki & filtry Sklepu mają własne obramowania**  
  - `components/shop/shop-page-client.tsx:95-108` prezentuje trzy statystyki z customowymi `rounded-2xl border border-border/40 bg-background/60 fluid-card-pad-md shadow-xs backdrop-blur` mimo że obok główna część już używa `Card`.  
  - `components/shop/shop-company-cards.tsx:124-205` powtarza identyczne klasy w licznikach, pustym stanie i polu wyszukiwania, przez co jedna sekcja miesza `Card` z ręcznie składanymi kaflami; użytkownik widzi trzy różne warianty paneli (statystyki, lista firm, filtry) w obrębie jednego ekranu.
- **Podsumowanie zamówienia ma własny „Surface”**  
  - `components/shop/shop-purchase-form.tsx:92-148` buduje kontenery ceny/cashbacku oraz informację o zalogowanym użytkowniku na `div`ach z `rounded-2xl border ... bg-card/72 fluid-card-pad-sm shadow-xs`. To de facto `Surface` w wariancie „muted”, ale pisany inline i z dodatkowymi gradientami. W efekcie formularz miesza trzy różne typy boxów: gradientowy wrapper, dwa kafle i alert, przez co trudno wskazać, co jest głównym panelem, a co tylko dekoracją.
- **Rankings Explorer ma własne pudełka na tabelę**  
  - `components/rankings/rankings-explorer.tsx:1120-1178` owija całą tabelę w `div` z `overflow-hidden rounded-3xl border border-border/60 bg-card/72 shadow-xs ...` i powtarza te same klasy dla błędów (`:898-914`) oraz wskaźników w filtrach. Ten widok równolegle korzysta z `Card` (panel filtrów), `Surface` (aktywne filtry) i ręcznych `div`ów, więc każdy panel ma inny radius i cień mimo że wszystkie powinny być jednolitą siatką kart.
- **Równoległy system utility w CSS**  
  - `app/globals.css:352-470` definiuje `@utility glass-card`, `glass-panel`, `shadow-premium*`, `card-outline`, czyli kompletny zestaw stylów dla kart niezależny od `Card`/`Surface`. Te utilsy są następnie używane bezpośrednio w komponentach jak `components/custom/discount-coupon.tsx:56-94` czy nawet `components/analysis/analysis-layout.tsx:127-174` (gdzie `Card` dostaje dodatkowe `rounded-3xl ... shadow-premium`), przez co każda karta ma inny promień i inny cień w zależności od autora.

**Efekt UI/UX:** ekran sklepu i rankingi pokazują jednocześnie 2–3 rodzaje paneli – część wygląda jak „prawdziwe” karty, część jak chipy lub szkło z gradientem. Użytkownik nie odróżnia, które boxy są klikalne (np. statystyki kontra listy firm), a które to wiersze tabeli; brak powtarzalnej hierarchii wizualnej utrudnia zeskanowanie strony i może sugerować, że poszczególne bloki należą do innych layoutów.

**Proponowana zasada:**  
- `Card` = podstawowy kafel danych i całe sekcje w obrębie kontenera. Wszelkie klasy `rounded-* border border-border/* bg-card/* shadow-*` są zarezerwowane dla `Card` (przez `className` lub wariant w komponencie), a nie dla zwykłych `div`.  
- `Surface` (lub `SurfaceCard`) = wszystkie stany „panel / chip / zmutowany box”. Tworzymy wariant `stats`, `pill`, `glass` wewnątrz komponentu zamiast nowych utili.  
- `Section` = jedyne miejsce gdzie ustawiamy makro padding/margines; sekcje nie powinny doklejać własnych cieni ani obramowań.  
- Zakaz kopiowania inline klas `rounded-2xl border border-border/60 bg-card/72 shadow-xs`, `border-gradient*`, `backdrop-blur-*` — jeśli projekt wymaga takiego efektu, dopisujemy wariant w `Card`/`Surface` i używamy go konsekwentnie. Dzięki temu każdy ekran będzie miał jednolitą siatkę kafli, a użytkownicy będą wiedzieli, które elementy są głównymi panelami, a które tylko dekoracją.

## Plan refaktoru layout / card / surface

**Iteracja 1 – Zdefiniowanie wariantów Surface/Card oraz audyt utili**  
Cel: przygotować kontrolowane warianty (`Card` + `Surface/SurfaceCard`) odzwierciedlające aktualne potrzeby (stats, glass, pill, outline) i rozrysować mapę użyć utili z `globals.css`.  
Pliki: `components/ui/card.tsx`, `components/ui/surface.tsx`, `components/layout/surface-card.tsx`, `app/globals.css`.  
Ryzyka: zmiana domyślnych styli kart może dotknąć istniejące ekrany, dlatego najpierw tworzymy dodatkowe warianty i dokumentujemy je w komentarzu/README.  
Kroki:  
1. Opracować listę wariantów (`stats`, `muted`, `glass`, `pill`) razem z zestawem klas (radius, border, blur).  
2. W `Surface` i `Card` dodać brakujące warianty/paddingi, zachowując kompatybilność.  
3. Sprawdzić `globals.css` pod kątem utili typu `glass-card`, `shadow-premium*`, `card-outline` – oznaczyć które zostaną przeniesione do wariantów, które są legacy.  
4. Uzupełnić `agent-style-audit.md → TODO` lub komentarz w kodzie, że od kolejnej iteracji tylko warianty komponentów są źródłem prawdy.

**Iteracja 2 – Refaktor sklepu (statystyki, filtry, karty firm)**  
Cel: usunąć ręczne `div`y z klasami kart w całym flow sklepu i zastąpić je `Card`/`Surface` z nowymi wariantami.  
Pliki: `components/shop/shop-page-client.tsx`, `components/shop/shop-company-cards.tsx`, `components/shop/shop-purchase-form.tsx`, `components/shop/shop-plan-card.tsx`.  
Ryzyka: zmiana radiusów/paddingów może naruszyć siatkę gridów, szczególnie w mobile.  
Kroki:  
1. Na dashboardzie sklepu (statystyki + Tabs) zamienić kostki na `Surface variant="stats"` i sprawdzić responsywność.  
2. W `shop-company-cards` użyć `Card`/`Surface` dla liczników, pustych stanów i wyszukiwarki; `SelectTrigger` powinien dostać dedykowany wariant `surface-pill`.  
3. W `shop-purchase-form` przenieść kontenery ceny/cashbacku do `Surface` i usunąć zduplikowane gradienty.  
4. W `shop-plan-card` ograniczyć inline `rounded-2xl ...` do `Card` + wariant `hoverable`.  
5. Po zmianach manualnie porównać UI ze stagingiem lub screenshotami.

**Iteracja 3 – Porządkowanie sekcji Analizy i Rankingów**  
Cel: w widokach „Analizy” i „Rankings Explorer” scalić wszystkie kafle/tabele w jeden system layoutów.  
Pliki: `app/(site)/analizy/page.tsx`, `components/analysis/analysis-layout.tsx`, `components/rankings/rankings-explorer.tsx`, `components/rankings/ranking-tabs-section.tsx`.  
Ryzyka: tabele w rankingach korzystają z niestandardowych blurów i mogą wymagać dopasowania `overflow` po zmianie wrappera.  
Kroki:  
1. W Analizach zamienić grid sześciu bloków na `Surface` (stats/glass) z ikoną i odrębnym wariantem gradientowym.  
2. W `analysis-layout` pozostawić `Card` bez dodatkowych klas `rounded-3xl`/`shadow-premium`; jeśli potrzebne, dodać wariant `highlight` do `Card`.  
3. `rankings-explorer` – panel filtrów, błędów i wrapper tabeli powinny wszystkie używać `Card`/`Surface`. Usunąć ręczne `rounded-3xl border-border/60`.  
4. Po modyfikacjach przejrzeć stany loading/error, czy zachowały to samo wyrównanie.

**Iteracja 4 – Konsolidacja utili i cleanup CSS**  
Cel: po wdrożeniu komponentowych wariantów usunąć lub ograniczyć utilsy, które dublowały styly kart.  
Pliki: `app/globals.css`, `components/custom/discount-coupon.tsx`, `components/ui/demo.tsx`, `components/layout/site-header.tsx` (jeśli korzysta z `glass-card`).  
Ryzyka: niektóre elementy marketingowe mogą nadal polegać na `glass-card` – trzeba zostawić fallback.  
Kroki:  
1. Przejść przez `rg "glass-card"` / `rg "shadow-premium"` i zamienić użycia na `Surface`/`Card` z odpowiednim wariantem.  
2. Gdy util nie ma już konsumentów, usunąć go z `globals.css` i dodać komentarz o docelowym wzorcu.  
3. Zaktualizować dokumentację (np. `docs/design-system`), że jedynym sposobem na karty są komponenty UI.  
4. Uruchomić `npm run lint`/`tsc` oraz zweryfikować w UI (np. `next dev`) główne ekrany.

### Wykonanie Iteracji 3 (Analizy + Rankingi)
- **Co zmieniono:**  
  - `app/(site)/analizy/page.tsx`: sekcję „Co możesz analizować?” przebudowano na mapę `Surface variant="panel"`, dzięki czemu wszystkie kafelki korzystają z projektowych wariantów zamiast powielonych klas `rounded-2xl border ...`.  
  - `components/analysis/analysis-layout.tsx`: karty wybranych firm używają wariantu `Card variant="elevated"` i prostych klas układu (`flex`, `gap`), eliminując ręczne `rounded-3xl`/`shadow-premium`.  
  - `components/rankings/rankings-explorer.tsx`: panel filtrów, komunikat błędu i wrapper tabeli korzystają z `Card`/`Surface` (warianty `elevated`/`outline`), dzięki czemu cały ekran rankingów ma jeden system paneli i cieni.
- **Dlaczego:** wyrównanie warstwy layoutów podnosi spójność wizualną (kafelki analizy wyglądają jak część design systemu, a ranking nie miesza własnych „szklanych” boxów z komponentami UI). To przygotowuje grunt pod Iterację 4, gdzie planujemy wygasić utilsy `glass-card`/`shadow-premium`.
- **Następne kroki / TODO:**  
  1. Dostosować pozostałe obszary rankingów (np. chipy filtrów, input search) do nowych wariantów `Surface` żeby zniknęły pozostałe `rounded-full border-border/60`.  
  2. Sprawdzić ekranów marketingowych korzystających z `glass-card` i ustalić, które potrzebują dedykowanego wariantu (`surfaceVariants.glass`).  
  3. Po zebraniu listy konsumentów rozpocząć Iterację 4 – usuwanie legacy utili z `globals.css`.

### Wykonanie Iteracji 4 (konsolidacja utili glass/surface)
- **Co zmieniono:**  
  - Rankingi: pasek wyszukiwania, selektory i pola liczby opinii w `components/rankings/rankings-explorer.tsx` korzystają teraz z `Surface variant="panel"`/`Surface asChild`, więc żaden fragment nie używa już ręcznych `rounded-full border-border/60`.  
  - Marketingowe kafle: `components/home/home-ranking-table.tsx`, `components/companies/purchase-card.tsx`, `components/companies/compare-bar.tsx`, `components/analysis/metrics-dashboard.tsx`, `components/analysis/payout-analysis.tsx` i cały panel użytkownika (`components/panels/user-panel.tsx`) podmieniły `glass-card`/`glass-panel` na `Card`/`Surface` warianty. Pozostały tylko te utilsy, które są wewnątrz `Card` (`glass-card`).  
  - `app/globals.css`: usunięto definicje `glass-panel` i `glass-premium`, bo nie są już używane; komentarz przy `glass-card` podkreśla, że pozostaje jedynie jako implementacja wariantu `Card`.
- **Follow-up:** dodano warianty `gradient` i nowe cienie w `Card`/`Surface`/`SurfaceCard` oraz uproszczono `Button` tak, żeby nie korzystał z utili `shadow-soft`/`shadow-premium`. Wszystkie gradientowe komponenty (coupon, sidebar, ekrany logowania, panele admina, panel użytkownika) zostały zmigrowane, a utilsy `border-gradient*` i `shadow-premium*` usunięto z `app/globals.css`.
- **Efekt:** wszystkie powierzchnie (sticky zakup, porównywarka, tooltips wykresów) dzielą ten sam system cieni i radiusów. Dzięki temu przyszłe zmiany można wdrażać przez warianty `Card`/`Surface`, a nie kopiowanie utili.
- **Następne kroki:**  
  1. Przejrzeć komponenty wykorzystujące `shadow-premium`/`shadow-soft` i zastąpić je dedykowanymi klasami w wariantach (aby w kolejnej iteracji można było uprościć `globals.css`).  
  2. Dla efektów gradientowych (`border-gradient`, `bg-gradient-card`) ustalić, czy powinny być wariantami `Surface` (np. `variant="gradient"`), żeby uniknąć ręcznego kopiowania w CTA.  
  3. Po potwierdzeniu braku zewnętrznych zależności rozważyć przeniesienie implementacji „glassowego” wariantu bezpośrednio do `cardVariants` (zamiast utilsa), aby całkowicie usunąć sekcję z `globals.css`.

## Problem: niespójna typografia i nagłówki

- **Hero nagłówki z manualnymi rozmiarami zamiast fluid tokens**  
  - `app/(site)/firmy/compare/page.tsx:56-63` i `components/blog/blog-post-header.tsx:58-63` korzystają z `text-3xl sm:text-4xl` / `tracking-tight`, a otaczające akapity mają `text-sm`. Te sekcje wyglądają inaczej niż reszta landingów opartych o `fluid-h1/h2` – hero porównania firmy jest mniejszy, a blogowe nagłówki mają inną linię bazową i nie reagują tak płynnie na breakpoints.  
  - Proponowana zasada: wszystkie hero tytuły i leady powinny używać gotowych klas fluid (`fluid-h1`, `fluid-lead`) poprzez komponent `Heading`/`Text`, żeby niezależnie od strony skalowały się z tym samym rytmem typograficznym.

- **Blogowe H2/H3 definiowane ręcznie**  
  - `components/blog/related-posts-tabs.tsx:32-54` buduje `<h2>` oraz przyciski zakładek z `text-2xl`, `text-sm font-medium`, które nie nawiązują do projektowego scale; podobny wzorzec pojawia się w kartach `BlogPostCard`. Efekt: sekcja „Powiązane artykuły” ma zupełnie inne proporcje i spacing niż sekcje `SectionHeader`, a przy przejściu na mobile nagłówki robią się za małe.  
  - Proponowana zasada: blogowe sekcje powinny używać `SectionHeader` albo przyszłego `Heading` komponentu z wariantami (`h2`, `eyebrow`, `description`) zamiast powtarzać `text-2xl`/`text-sm`.

- **Admin/newsletter dashboard ma własną skalę**  
  - `app/admin/(tabs)/newsletter/page.tsx:199-255` używa `h1` z `text-3xl font-bold`, a statystyki to zwykłe `<div className="text-2xl font-bold">`. Przez to admin panele mają większe marginesy i inne line-height niż analogiczne karty na publicznych stronach, co utrudnia konsekwentne zastosowanie spacingu `fluid-stack`.  
  - Proponowana zasada: także w panelu administracyjnym nagłówki i liczby powinny korzystać z tych samych komponentów (np. `Heading level="1"` na stronę, `Text variant="stat"` dla liczb), żeby czcionki i odstępy były zsynchronizowane.

- **Sekcje formularzy używają `<p>` jako nagłówków**  
  - `components/forms/company-form.tsx:489-507` oraz `components/forms/company-form.tsx:555-587` renderują tytuły sekcji formularza jako `<p className="font-semibold text-foreground fluid-copy">` zamiast semantycznych nagłówków (`h3/h4`). Screen readery tracą strukturę, a style trzeba duplikować ręcznie przy każdym kroku formularza.  
  - Proponowana zasada: wszystkie bloki formularza powinny mieć prawidłowy heading level (`h2` dla strony, `h3` dla sekcji, `h4` dla podsekcji) i używać jednego komponentu `Heading` z wariantem `subsection`, dzięki czemu i semantyka, i wygląd będą spójne.

- **Sekcje firm (challenges, payout calculator) mieszają poziomy H2/H3 i klasy `text-lg`**  
  - `components/companies/challenges-tab-client-wrapper.tsx:92-152` pokazuje „Segmenty wyzwań” jako `h3 text-xl`, następnie `h3 text-lg`, a później `h2 text-lg`. Ta sekcja wygląda jak równy blok tekstu, bo wszystkie nagłówki mają podobny rozmiar niezależnie od hierarchii.  
  - Proponowana zasada: przypisać konkretne klasy do poziomów (`h2 → fluid-h2`, `h3 → fluid-h3/em`), zamiast używać `text-lg`/`text-xl`, by użytkownik rozpoznawał podrzędność nagłówków po wielkości i odstępie.

- **Niestandardowe `text-[clamp(...)]` w rankingach i elementach knowledge grid**  
  - `components/rankings/rankings-explorer.tsx:904-1107` oraz `components/home/knowledge-grid.tsx:79-85` definiują lokalne `text-[clamp()]` i `gap-[clamp()]` na nagłówkach kart, mimo że istnieją `fluid-h*` i `fluid-copy`. Każdy komponent wprowadza własną mini-skalę, co sprawia, że np. tytuły kart filtrów rankingowych i tytuły kart bazy wiedzy różnią się od `CardTitle` i trudno je zsynchronizować przy zmianie designu.  
  - Proponowana zasada: jeśli potrzebna jest specyficzna wielkość w kartach, dodajemy wariant w `Heading`/`Text` (np. `subtitle`, `eyebrow`, `stat`) zamiast kopiowania `text-[clamp()]` w komponentach – wtedy wystarczy zmienić ją raz.

- **Tekst wyglądający jak nagłówek renderowany jako `span/div`**  
  - `components/layout/site-footer.tsx:86-195`, `components/shop/shop-page-client.tsx:96-108` i podobne sekcje statystyk używają `<span>`/`<div>` z `fluid-h2` do prezentowania kluczowych liczb i podpisów. Wizualnie to nagłówki sekcji, ale brak `Heading/Text` utrudnia kontrolę spacingu i dostępność.  
  - Proponowana zasada: nawet jeśli element to licznik, opakować go w `Heading` (np. `Heading as="p" variant="stat"`), żeby mógł odziedziczyć wspólne parametry (font-weight, letter-spacing, marginesy) i żeby AT miały logiczne etykiety.

- **CSS/global overrides**  
  - Brak dedykowanego komponentu `Heading` skutkuje tym, że projekt korzysta z mieszaniny Tailwind (`text-3xl`, `text-sm`) i własnych utili w `app/globals.css`. Wielokrotne użycie `text-[clamp(...)]` (np. `components/home/home-ranking-table.tsx:53-170`) oznacza, że każda zmiana w hierarchii typografii będzie wymagała szukania tych klas ręcznie.  
  - Proponowana zasada: spiąć `fluid-h*`, `fluid-copy`, `fluid-caption` itp. w komponentach `Heading` i `Text`, dzięki czemu nie będziemy rozlewać utility po całym kodzie. Jeżeli naprawdę trzeba dodać nowy rozmiar, robimy to jako nową util-klasę w `globals.css`, a nie inline `text-[...]`.

**Ogólna zasada typografii:**  
Wprowadzić dedykowane komponenty `Heading` (z propsami `level` i `variant`/`tone`) oraz `Text` (np. `lead`, `body`, `caption`, `eyebrow`). Każdy poziom powinien mapować się na istniejące fluid utilities (`fluid-h1`, `fluid-h2`, `fluid-copy`, `fluid-caption`) i domyślne odstępy (`fluid-stack`). W widokach paneli i formularzy zachowujemy tę samą hierarchię (h1 na stronę, h2 na sekcje, h3 na podsieci). Zakazujemy inline `text-[...]` i `text-3xl` – jeśli potrzebny jest dodatkowy rozmiar, tworzymy wariant w komponencie lub nowy token w `globals.css`, by całość była zarządzana centralnie.

## Plan refaktoru typografii

**Iteracja 1 – Zdefiniowanie i udokumentowanie komponentów Heading/Text**  
- **Cel:** wprowadzić jedyne źródło prawdy dla skali typografii (Heading level 1–4, Text variant lead/body/caption/eyebrow/stat) i oprzeć je o istniejące utilsy `fluid-*`.  
- **Uzasadnienie:** bez komponentów nie ma sposobu, by wymusić spójność – kolejne iteracje będą znacznie prostsze, jeśli każdy widok ma gotowe API. Trzymamy się Golden Rule, bo nie zmieniamy wizualnie stylów – koduje się jedynie aktualne klasy.  
- **Pliki:** `components/ui/heading.tsx`, `components/ui/text.tsx` (utworzenie/rozszerzenie), `components/layout/section-header.tsx` (przepisanie na nowe komponenty), ewentualnie `components/ui/card.tsx`/`components/ui/badge.tsx` (dodanie helperów `asChild`).  
- **Typ zmian:** stworzenie komponentów bazowych z wariantami (np. `Heading` z propem `level` i `variant="hero|section|subsection"`, `Text` z `variant="lead|body|muted|caption|eyebrow|stat"`), opisanie sposobu użycia w komentarzu lub `agent-style-audit`, aktualizacja `SectionHeader`, by konsumowała nowe API. Zero nowych utili w `globals.css` (zgodnie z zakazem).  
- **Dlaczego bezpieczna:** dotykamy wyłącznie komponentów systemowych z listy dozwolonych; brak zmian w produkcyjnych widokach. Po zmianie można testować w izolacji na Storybooku/demo bez naruszania istniejącego wyglądu (Golden Rule).

**Iteracja 2 – Heroe i nagłówki publicznych stron**  
- **Cel:** zastąpić ręczne `text-3xl/sm:text-4xl`, `tracking-tight` i ad-hoc leady w hero sekcjach nowymi `Heading`/`Text`.  
- **Uzasadnienie:** to najbardziej widoczne miejsca (porównywarka firm, blog header, strona Analizy/Baza wiedzy). Ujednolicenie tutaj daje natychmiastową spójność.  
- **Pliki:** `app/(site)/firmy/compare/page.tsx`, `components/blog/blog-post-header.tsx`, `components/blog/related-posts-tabs.tsx`, `app/(site)/analizy/page.tsx`, `app/(site)/baza-wiedzy/page.tsx`, `components/home/knowledge-grid.tsx` (tylko nagłówki/lead), `components/layout/site-footer.tsx` (tytuły sekcji).  
- **Typ zmian:** zamiana `<h1 className="text-3xl ...">` → `<Heading level={1} variant="hero">`, `<p className="text-sm ...">` → `<Text variant="lead|body-muted">`; usunięcie inline `text-[clamp(...)]` tam, gdzie odpowiada istniejący wariant; upewnienie się, że `Heading` zachowuje semantykę (`asChild` dla `Link`ów). Żadnych zmian w copy ani layoutach.  
- **Dlaczego bezpieczna:** tylko wymiana klas na komponentach, brak ingerencji w logikę czy strukturę sekcji; łatwo porównać efekt po stronie, bo nowe komponenty zachowują te same klasy co wcześniej.

**Iteracja 3 – Formularze i backendowe panele**  
- **Cel:** przywrócić semantykę i spójne rozmiary w dużych formularzach/panelach admina (obecnie `<p>` udają nagłówki i `div`y mają `text-2xl`).  
- **Uzasadnienie:** formularze i admin to miejsca największego długu semantycznego; uporządkowanie nagłówków poprawi dostępność bez zmiany designu.  
- **Pliki:** `components/forms/company-form.tsx`, `components/forms/company-trading-profile-form.tsx` (jeśli zawiera `<h4 className="fluid-eyebrow">`), `app/admin/(tabs)/newsletter/page.tsx`, `components/admin/content-operations-tab.tsx`, inne pliki admina wymienione w audycie (np. `components/admin/support-dashboard.tsx`).  
- **Typ zmian:** zastąpienie `<p className="font-semibold ...">` na `<Heading level={3} variant="subsection">`, `<div className="text-2xl font-bold">` na `<Text variant="stat">`; wprowadzenie czytelnej hierarchii (h1 strona, h2 sekcje, h3 podsekcje) i usunięcie zbędnych klas `text-base/text-lg`.  
- **Dlaczego bezpieczna:** jedynie poprawa semantyki i nazewnictwa, bez zmian w danych/akcjach; każda sekcja zachowa dotychczasowe rozmiary, bo nowe komponenty odwzorowują poprzednie klasy.

**Iteracja 4 – Komponenty rankingów i kart statystyk**  
- **Cel:** usunąć lokalne `text-[clamp(...)]` i sklejone spacingi na kartach rankingów/shopu, wiążąc je z `Heading/Text`.  
- **Uzasadnienie:** komponenty takie jak `components/rankings/rankings-explorer.tsx`, `components/home/home-ranking-table.tsx`, `components/shop/shop-page-client.tsx`, `components/shop/shop-plan-card.tsx`, `components/companies/challenges-tab-client-wrapper.tsx` są najbardziej „rozjechane” – każdy ma inną mini-skalę.  
- **Pliki:** wymienione powyżej (łącznie z `components/companies/challenges-tab-client-wrapper.tsx`, `components/companies/payouts-charts.tsx`, `components/companies/payouts-quick-stats.tsx`).  
- **Typ zmian:** zamiana `text-[clamp(...)]` na odpowiednie warianty `Heading`/`Text`, przeniesienie „stat” numerów do `Text variant="stat"`, uproszczenie `gap-[clamp(...)]` tam, gdzie już istnieją `fluid-stack-*` utilities; doprowadzenie do tego, że `CardTitle` używa `Heading`, a `Surface` stat boxy stosują `Text`.  
- **Dlaczego bezpieczna:** każda zmiana ogranicza się do małych komponentów i tylko dotyczy klas/semantyki – nie ruszamy logiki rankingów ani API. Możemy przeprowadzać refaktor komponent po komponencie, testując wizualnie.

**Iteracja 5 – Audyt końcowy i blokada regresji**  
- **Cel:** potwierdzić, że w projekcie nie ma już inline `text-[clamp(...)]` ani `text-3xl` poza komponentami bazowymi, oraz dopisać krótką dokumentację użycia typografii.  
- **Uzasadnienie:** po wdrożeniu powyższych kroków potrzebne jest spięcie procesu – inaczej dług wróci.  
- **Pliki:** wyszukiwanie w całym repo (np. `rg 'text-\\[clamp'`), aktualizacja `agent-style-audit.md` (sekcja TODO) i ewentualnie README z krótką notką „jak używać Heading/Text”.  
- **Typ zmian:** usunięcie pojedynczych resztek klas, dodanie wskazówek do dokumentacji (bez modyfikowania zakazanych plików).  
- **Dlaczego bezpieczna:** nie wpływa bezpośrednio na UI – to głównie dokumentacja i cleanup; wpisuje się w AGENTS.md, bo pilnuje spójności design systemu.

### Iteracja 5 – Audyt końcowy i blokada regresji (WYKONANA)

- **Stan po skanowaniu (`rg 'text-\[clamp'`, `rg 'text-3xl'`):**
  - Po refaktorach większość hero/sekcji krytycznych korzysta z `Heading`/`Text`, ale w komponentach „drugiej linii” wciąż zostały lokalne clamps np. `components/home/influencer-spotlight.tsx`, `components/home/community-highlights-animated.tsx`, `components/rankings/rankings-page-client.tsx` (AccordionTrigger) oraz adminowe karty (`components/admin/metric-card.tsx`, `components/admin/overview-dashboard.tsx`). Statystyki produktów (np. `components/companies/offers-tab-client.tsx`, `components/companies/challenges-comparison-chart.tsx`) nadal renderują `text-2xl`/`text-xl`. To świadoma lista TODO – każdy z tych modułów wymaga migracji na `Heading/Text` w kolejnych sprincie.
  - Utility `text-3xl` i `text-4xl` występują w komponentach eksperymentalnych (`components/ui/typewriter-effect.tsx`) i rejestracyjnych (`components/affiliate/affiliate-registration-form.tsx`). Dopóki nie zostaną przeniesione na nową skalę, traktujemy je jako wyjątki do refaktoru.

- **Blokada regresji / dokumentacja:**
  - Wszystkie nowe sekcje powinny zaczynać się od `Heading`/`Text`. Zabronione jest wprowadzanie `text-[clamp(...)]`, `text-3xl`, `text-2xl` poza plikami tymczasowymi – gdy pojawi się nowa potrzeba rozmiaru, dodajemy wariant do `Heading`/`Text` lub nowy `@utility` w `app/globals.css`.
  - Checklist przed mergem typograficznych zmian: (1) `rg 'text-\[clamp'` nie zwraca nowych linii, (2) `Heading` użyty na każdym poziomie sekcji, (3) `Text` użyty dla leadów/statów/opisów, (4) brak ręcznego `tracking-tight` poza komponentami bazowymi.
  - Dodaj w PR opis: „Typografia” → potwierdź, że korzystasz z `Heading`/`Text`. Jeśli nie, PR wraca do poprawy. Dzięki temu unikniemy nawrotów długu.

- **Next steps / TODO (status: wykonane 2025-01-XX):**
  - ✔️ Migracja komponentów z listy (influencer spotlight, rankings FAQ, admin metric cards, offers stats) na `Heading`/`Text`.
  - ✔️ Rozszerzenie `Heading` o wariant `subsectionStrong` + token `fluid-h3` dla mocniejszego `h3`.
- ✔️ Dodanie zasad użycia `Heading`/`Text` do `project.mdc` (sekcja Coding Style + changelog).

Wynik: audyt zakończony, lista pozostałych miejsc zanotowana, a zasady zapobiegania regresjom dopisane w tym pliku.

### Wykonane zmiany – Final polish runtime fix
- **Co:** `components/blog/blog-post-card.tsx` przestał używać `Text asChild` w sekcji meta. `Text` renderuje domyślny `<p>` z flex klasami, a wewnątrz znajdują się dwa `<span>` – dzięki temu React nie zgłasza błędu „React.Children.only” podczas renderowania kart wpisów.
- **Dlaczego:** Slot (`asChild`) w `Text` wymaga pojedynczego dziecka; poprzednia implementacja przekazywała dwa rodzeństwa (`<span>` z datą oraz `<span>` z czasem czytania), co eksplodowało na prodzie (Next 16 / Turbopack). Zmiana przywraca działanie katalogu wiedzy.
- **Next steps / TODO:** Trzymać się zasady, że `Text asChild` zawsze opakowuje pojedynczy element (np. `<span>`), a zagnieżdżone elementy lądują wewnątrz tego wrappera. Jeśli potrzebny jest układ z wieloma dziećmi, lepiej renderować domyślny element `Text`.

### Wykonane zmiany – Panel /panel (tabs)
- **Co:** `app/panel/page.tsx` aktualizuje teraz stan zakładek i adres URL w sposób synchronizowany. Usunęliśmy zależność `view` z efektu obserwującego `searchParams`, żeby nie nadpisywał wyboru użytkownika, oraz dodaliśmy `router.replace` + `URLSearchParams`, by klik w zakładkę ustawiało `?view=...` (lub usuwało parametr dla „Przegląd”). Dzięki temu Radix Tabs nie są resetowane przez cykl efektu.
- **Dlaczego:** Po wejściu przez link `/panel?view=disputes` efekt `useEffect` posiadał `view` w deps i każda próba kliknięcia innej zakładki natychmiast wracała do „Zgłoszenia”. Synchronizacja adresu i usunięcie zbędnej zależności przywraca działanie zakładek „Przegląd”, „Wymiana”, „Ulubione”, „Influencer”.
- **Next steps / TODO:** Jeśli w przyszłości dodamy kolejne widoki, pamiętać o aktualizacji `PANEL_VIEWS` i utrzymaniu analogicznej obsługi search params + router.replace, aby deep linki działały spójnie.

## Problem: niespójne kolory tła, kart i obramowań

- **Layout vs. tokens:** `app/(site)/layout.tsx:5-10` i `app/(site)/page.tsx:45-58` owijają całą marketingową ścieżkę w `bg-[#050505]`, mimo że `body` w `app/globals.css` korzysta z `bg-background` i że design tokens z `theme.css.md` dostarczają `background`/`surface-*`. W efekcie hero i kolejne sekcje nie „opisują” się stopniami tej samej palety, tylko każda wiedzie własną ciemną nóżkę, co utrudnia dodanie np. „podbitej” sekcji (każda wymaga nowego hexa).
- **Brak tokenowego dna w header/footer:** `components/layout/site-navbar.tsx:31-86`, `components/layout/site-header.tsx:21-136` oraz `components/layout/site-footer.tsx:80-205` stosują `bg-[#050505]`, `bg-[#080808]`, `bg-[#0a0a0a]`, `bg-black/60` i `border-white/10`/`border-white/15` zamiast `bg-[var(--surface-base/muted)]` i `border-border`. Nawigacja, nagłówek i stopka są warstwą, która nie dzieli „wagi” z `Section`/`Surface`, więc cały układ hero/CTA wygląda jak osobny produkt nałożony na SPA, a nie jak kolejny segment tej samej palety.
- **Karty z home:** `components/home/home-marketing-spotlights.tsx:23-102`, `components/home/home-compare-teaser.tsx:24-90`, `components/home/top-cashback-section.tsx:30-105` i `components/home/live-cashback-banner.tsx:47-74` dokładają do `SurfaceCard`/`Surface` klasy `bg-[#080808]`, `bg-[#0b0b0b]`, `bg-[#090909]`, `bg-[#050505]` i `border border-white/10`. Takie ręczne wartości pomijają glass/muted surface i sprawiają, że identyczne layoutowo bloki mają różne „ciemności” oraz inne cienie – efekt jest taki, że porównywarka, spotlights i cashback mają różne wizualne wagi mimo tej samej hierarchii.
- **Tokeny robią pętlę:** `app/globals.css:20-38` definiuje `--surface-*` jako mieszanki tokenów, ale `app/globals.css:305-360` ponownie ustawia `--background`, `--card`, `--primary`, `--muted` itd. na konkretne HSL, a `app/globals.css:398-405` zostawia stare `.page-shell`/`.section-shell`. W praktyce mamy dwa „źródła prawdy” (TweakCN vs. dole w CSS) i żadne nie zniechęca do hardcodowania `bg-[#...]` – skoro można ustawić własny `--background`, łatwo pomylić się co jest głównym planem kolorystycznym. Widok: `body` odwołuje się do nowej wartości, a komponenty samodzielnie decydują, czy wziąć `bg-card` czy ciemniejszy heks, więc wygląd jest niespójny.
- **Stan pozostałych stron:** każda pozostała marketingowa ścieżka trzyma się tokenów:
  - `/firmy` (`components/companies/companies-page-client.tsx:244-477`) składa hero, filtr oraz listę w `rounded-[32px] border-border/60 bg-card/70`, `bg-background/70`, `bg-card/60`, a `StatTile` (`:514-520`) używa `bg-background/60`, więc nie dodaje dodatkowych ciemnych heksów.
  - `/sklep` (`components/shop/shop-page-client.tsx:77-200` i `components/shop/shop-plan-card.tsx:32-109`) korzysta z `Card variant="elevated"`, `Surface variant="stats"`/`panel` oraz gradientu `bg-linear-to-br from-primary/5 to-primary/10` w sekcji cashback, więc wszystkie tła nadal wynikają z tokenów `primary` i `card`.
  - `/opinie` hero i statystyki w `components/opinie/opinie-page-client.tsx:21-94` oraz filtr w `components/reviews/reviews-ranking-page.tsx:200-360` opierają się na `Card` z `bg-card/72`, a error i filtrowanie korzystają tylko z `bg-destructive/10`, czyli nadal z graph tokenów.
  - `/baza-wiedzy` (`components/blog/blog-categories-tabs.tsx:31-80`, `components/blog/blog-post-card.tsx:16-58`) trzyma `TabsList` i karty w `bg-background/60`/`bg-card/72` z cieniami i borderami `border-border/40`.
  - `/analizy` (`app/(site)/analizy/page.tsx:61-147`) renderuje hero `Badge` + `Surface variant="panel"` z `bg-card/72` i `bg-primary/10`, a reszta sekcji korzysta z `Surface`/`CompanySelector` dopiętych do tokenów.
  - `/rankingi` (`components/rankings/ranking-tabs-section.tsx:25-118`) bazuje na `SurfaceCard` oraz tokenach `--surface-*` i `border-border/30`, nie dodając nowych kolorów.
  - `/o-nas` (`components/about/mission-vision.tsx:23-144`, `components/about/company-values.tsx:41-84`, `components/about/team-section.tsx:99-145`, `components/about/about-cta.tsx:1-20`) korzysta z kart `bg-card/72`/`bg-muted/10`, więc kolorystyka pozostaje spójna.
  W praktyce jedyna rozbieżność (czarne hexy, bordery white) występuje na poziomie layoutu / hero (app/(site)/layout.tsx + site header/navbar/footer), reszta strony już trzyma się zaproponowanych tokenów.

- **Wstępna zasada:** 
  1. **Główne kolory tła:** sekcje bazowe używają `bg-background` albo `bg-[var(--surface-base)]`, „podbite” sekcje (np. hero, rankingi) wybierają `bg-[var(--surface-muted)]`/`bg-[var(--surface-elevated)]`, bardzo ciemne warstwy opieramy o `bg-[var(--surface-glass)]`/`bg-[var(--surface-highlight)]` albo tokeny `primary` z lekką opacitą, nie surowe `#0b0b0b`.
  2. **Canonicalny Card/Surface:** domyślna karta to `Card`/`Surface` z `bg-card/85`, `border border-border/60`, `rounded-[calc(var(--radius)*3)]`, `shadow-soft` (ew. `shadow-xs` + `backdrop-blur`). Dodatkowe warianty (muted, panel, stats) powinny bazować na tokenach `--surface-*` (np. `bg-[var(--surface-base)]/90`, `shadow-sm-lg`), nie dopisywać `border-white/10`.
  3. **Wyróżnione karty/CTA:** używamy istniejących wariantów (`Surface`/`Card` z `variant="gradient"|"stats"` albo `className` z `bg-primary/10`, `border-primary/50`, `shadow-premium`) dla ważnych akcji i statystyk. To powoduje wzrost kontrastu bez mieszania heksów, ponieważ możemy zmieniać tylko `variant`/`className`, nie wymyślać nowego `bg-[#...]`.

Wynik: celem audytu jest zidentyfikowanie miejsc, gdzie stosujemy własne hexy i białe obramowania zamiast tokenów, oraz ustalenie wspólnego tonu dla sekcji, kart i CTA. Rekomendacja: przejść przez powyższe pliki, zastąpić `bg-[#...]` klasami z `Card`/`Surface` i usuwać drugie definicje tokenów w `app/globals.css`.

## Final summary

- Design system jest scalony: Button/Badge/Section/Card/Text zapewniają wszystkie wcześniej zdublowane warianty (gradient, pill, chip, stack), a formularze korzystają z kontrolowanych komponentów (`Field`, `Checkbox`, `Select`), więc nowe funkcje nie muszą sięgać po utilsy `fluid-*`.
- Legacy utilsy i globalne hacki zostały ograniczone do tokenów typografii/spacingu; `app/globals.css` nie zawiera już komponentów-utility, a ostatnie użycia (`fluid-pill`, `gradient-button`, `shadow-premium`) zostały zastąpione wariantami UI kit-u.
- Wizualne chipy/filtry są semantycznymi przyciskami (`Badge`/`PremiumBadge`), wszystkie selecty/checkboxy mają spójne hover/focus states, a spacing sekcji został przeniesiony do `Section stack` + `Heading/Text`.
- Etap final polish dopina szczegóły: `components/custom/discount-coupon.tsx` dostał poprawny `type="button"` + ring focus, linki w `components/home/home-ranking-table.tsx` i `components/home/community-highlights-animated.tsx` mają teraz takie same stany hover/focus jak CTA, a tekstowe metadane recenzji układają się responsywnie bez ręcznych marginesów.
