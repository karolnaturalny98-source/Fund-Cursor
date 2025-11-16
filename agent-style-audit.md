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
