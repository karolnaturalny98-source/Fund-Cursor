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
