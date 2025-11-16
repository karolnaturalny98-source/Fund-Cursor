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
