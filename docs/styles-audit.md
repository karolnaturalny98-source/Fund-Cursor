# Systemy stylizacji
- **Tailwind CSS v4** – projekt opiera się na nowym, „zero-config” podejściu (brak `tailwind.config.*`). Deklaracje `@utility`, `@theme` i `@layer` w `app/globals.css` zastępują klasyczne rozszerzanie configu. Ręcznie definiowane są zestawy `fluid-*`, `glass-*`, gradienty i cienie.
- **shadcn/ui** – katalog `components/ui/*` zawiera skopiowane komponenty (Accordion, Tabs, Dialog, Table itd.) z wariantami dostosowanymi do lokalnych utili. `class-variance-authority` umożliwia warianty (`button.tsx` ma `premium`, `premium-outline`, `glow`, `ghost-dark`, itd.).
- **Tailwind Merge + cn** – helper `cn` + `tailwind-merge` porządkują złożone listy klas w komponentach (np. `Section`, `Badge`, `Tabs`).
- **Własne efekty WebGL** – `components/Aurora.tsx` + `AuroraWrapper` są traktowane jak część systemu wizualnego (płynne gradienty w tle), ale nie żyją w dedykowanym layoutcie.
- **Brak innych systemów** – nie ma CSS Modules, SCSS ani stylów w osobnych folderach; wszystkie style są inline (klasy utility) lub w `globals.css`.

# Główne pliki
- `app/globals.css`
  - Importuje `tailwindcss` i definiuje ~400 linii niestandardowych utili (`fluid-*` dla typografii/spacingu, `glass-card`, `glass-panel`, gradienty, `shadow-premium`, `border-gradient`, itd.).
  - `@theme` ustawia mapowanie na zmienne CSS (`--color-*`, promienie, keyframes). To jedyne źródło theme tokens.
  - `@layer base` reintrodukuje domyślny kolor obramowań (bo w Tailwind 4 domyślne to `currentcolor`).
  - Wiele utili używa `@apply` z niestandardowymi klasami (`relative`, `border-border/50`, `shadow-[...]`), co utrudnia analizę – część klas kończy się `!` (np. `backdrop-blur-[36px]!`) by nadpisać styl.
- `postcss.config.mjs` – minimalny (tylko `@tailwindcss/postcss`). Nie ma autoprefixera ani dodatkowych pluginów.
- `components/ui/*` – każdy komponent importuje `cn` i łączy `fluid-*` oraz standardowe klasy. `components/ui/button.tsx` to najbogatszy wariant – zależy od utili `fluid-button*` z `globals.css`.
- `components/layout/section.tsx` – jedyny komponent, który sięga wprost do `fluid-section-*` z `globals.css`.
- `components/custom/*` – `PremiumBadge`, `AnimatedCounter` itd. korzystają z inline klas; `premium`/`glow` efekty są głęboko związane z definicjami w `globals.css`.

# Użycie w widokach
- **Marketingowe strony** (`app/page.tsx`, `app/affilacja/page.tsx`, `app/opinie/page.tsx`, `app/analizy/page.tsx`, `app/o-nas/page.tsx`, `app/firmy/page.tsx`, `app/sklep/page.tsx`) powielają te same wzorce: `AuroraWrapper` jako tło + `container` + zestaw klas `fluid-*` i `border-border/60`. Każda sekcja ręcznie dokłada `fluid-stack-*`, więc ewentualne zmiany spacingu muszą być propagowane manualnie.
- **Strona firmy** (`app/firmy/[slug]/page.tsx`) miesza kilkadziesiąt utili (np. `fluid-stack-xl`, `glass-panel`, `border-border/40`, `text-muted-foreground`) z gradientami i `@apply`-owanymi klasami w komponentach potomnych. To prowadzi do bardzo długich atrybutów `className`.
- **Admin** (`components/admin/*`) stawia na standardowe klasy Tailwinda (flex/grid, spacing px-*) + shadcn. Często powtarza `border-border/60`, `bg-card/80`, `backdrop-blur-md`.
- **Panele i overlay** (`components/panels/*`, `UserPanel`) ponownie używają `glass-panel`, `fluid-stack-*`, customowych cieni. `SiteHeader` i `SiteFooter` oczekują klasy `glass-premium`, ale taka utilita nie istnieje w `globals.css`.
- **Przyciski i CTA** – w całym projekcie widoczne są warianty `Button` (`premium`, `premium-outline`, `glow`), lecz część komponentów wciąż dodaje ad-hoc gradienty (`bg-gradient-button-premium`) zamiast korzystać tylko z wariantu.
- **AuroraWrapper** – w każdym widoku powtarza się `<div className="fixed inset-0 -z-10 h-[150vh]">` z `AuroraWrapper`. Ten kod jest copy-paste, co utrudnia kontrolę wydajności WebGL/GSAP.

# Problemy / dług techniczny
- **Brak centralnej konfiguracji Tailwind** – cała personalizacja jest w `globals.css`; trudno wyszukiwać lub dzielić utilsy między zespoły. Nie ma miejsca na współdzielenie kolorów/typografii w sposób typowy dla Tailwinda (brak `tailwind.config.ts`).
- **Niezdefiniowane klasy** – `SiteHeader` i `SiteFooter` używają `.glass-premium`, której nie ma w `globals.css`. Te elementy realnie renderują się bez zamierzonego efektu, bo Tailwind nie wygeneruje takiej klasy.
- **Powielanie `AuroraWrapper`** – każdy layout powtarza identyczny blok tła z `AuroraWrapper` i statycznymi parametrami (`colorStops`, `blend`). W praktyce generuje to wiele instancji WebGL na każdej podstronie i utrudnia kontrolę stylów globalnych.
- **Mieszanie spacingu** – mimo `Section` i `fluid-section-*`, wiele sekcji (np. `app/rankingi/page.tsx`) dodatkowo buduje układ `Section bleed + div.container` z własnymi `px-[clamp(...)]`, co prowadzi do niespójnego marginesu/paddingu i złożonych kombinacji klas.
- **Nadmiernie złożone klasy** – `fluid` utils w `globals.css` korzystają z `clamp` + custom media queries. W komponentach często łączą się z surowymi wartościami `px-[clamp(...`), `gap-[clamp(...]`, co utrudnia czytelność i sprzyja kopiowaniu tych samych wartości między plikami.
- **Utilsy z `!important`** – wiele utili kończy się `!` (np. `backdrop-blur-[36px]!`), przez co potrafią niespodziewanie nadpisywać style w różnych kontekstach.
- **shadcn/ui + custom** – komponenty shadcn są rozszerzane o `fluid-*` i niestandardowe gradienty, ale nie zawsze spójnie (np. `SiteFooter` korzysta z `Button variant="premium"`, lecz wewnątrz formularzy w adminie często sztywno ustawiono `className="bg-primary..."`). To mieszanie utrudnia standaryzację.
- **Brak modularyzacji stylów admina** – `components/admin/*` powtarzają identyczne CTA, cienie i gradienty bez wspólnego zestawu utili; w praktyce jest to wiele lokalnych kombinacji `border-border/60`, `bg-card/60`, `shadow-xs`.
