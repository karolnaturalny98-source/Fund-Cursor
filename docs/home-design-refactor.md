# Home – audyt i refaktoryzacja stylów (2025-02)

Krótka dokumentacja opisująca zmiany wizualne wdrożone na stronie Home w lutym 2025 r. – ma służyć jako punkt odniesienia przy stylowaniu kolejnych sekcji/podstron.

## System powierzchni i spacingu

- Dodano tokeny `--surface-{base,muted,elevated,glass,ring,highlight}` oraz elastyczne paddingi `surface-pad-{sm,md,lg}` (zdef. w `app/globals.css`).  
- `SurfaceCard` (`components/layout/surface-card.tsx`) jest podstawowym wrapperem dla kart/glass panels. Przyjmuje `variant` (określa kolor, border, cień) i `padding`.  
- Dla elementów doklejanych do dolnej krawędzi wprowadzono util `safe-area-bottom`, aby uwzględniać `env(safe-area-inset-bottom)` (użyty w CompareBar).

## Nagłówki sekcji

- Wiele sekcji Home powielało schemat eyebrow + H2 + opis; zastąpiono go komponentem `SectionHeader` (`components/layout/section-header.tsx`).  
- Props `eyebrowTone` kontroluje kolor (muted/accent/primary), `align` ustawia wyrównanie. Dzięki temu każda sekcja może zmieniać jedynie copy, a nie klasy Tailwind.

## Hero i CTA

- Hero (`components/home/home-hero.tsx`) zamiast ręcznych hexów korzysta z nowych tokenów.  
- Formularz wyszukiwania osadzono w `SurfaceCard` z ringiem `var(--surface-ring)`.  
- CTA przeniesiono na `Button` (warianty `premium`/`secondary`) – dzięki temu wszystkie stany focus/hover są zgodne z systemem, a gradient managed jest centralnie.  
- Animacja słów uwzględnia `prefers-reduced-motion`, a log wypłat to semantyczna lista (`<ul role="list" aria-live="polite">`).

## Sekcje kontentowe

- `HomeRankingSection`, `HomeEducationGrid`, `HomeLatestCompanies`, `HomeRecentSection`, `HomeMarketingSpotlights`, `TopCashbackSection`, `HomeCompareTeaser` – każda sekcja korzysta teraz z `SectionHeader`.  
- Karty (`Recent`, `Latest`, `Spotlights`, `TopCashback`, `CompareCard`) to `SurfaceCard` z odpowiednim `variant`. Dzięki temu mają identyczne promienie, border i tło.  
- TopCashback zyskał opis, aria-label na scrollu mobilnym i siatkę `auto-fit` bez sztywnych szerokości.  
- Sekcja porównywarki została zamknięta w `SurfaceCard` z jednym `container`, żeby uniknąć mieszania bleed/ container.  
- CompareBar (`components/companies/compare-bar.tsx`) otrzymał safe-area, responsywny max-width i spójne przyciski.

## Co dalej / użycie na innych stronach

1. Przy dodawaniu nowych sekcji zaczynaj od `SectionHeader` + `SurfaceCard` – unikniesz duplikacji klas i zachowasz spójny spacing.  
2. Jeśli potrzeba nowej wariacji tła/glass, rozbuduj `SurfaceCard` zamiast tworzyć ad-hoc `div` z hexami.  
3. CTA powinny bazować na `Button` (można dodać nowe warianty np. `gradient`, `link-ghost`, ale w `components/ui/button.tsx`).  
4. Dokumentuj kolejne tokeny/patterny w tym pliku, aby powstawał mini-design system dla v2.

### Docelowy klimat i narzędzia (Aceternity style)

- Canvas: głęboka czerń (`#040404`–`#050505`) z wysokim kontrastem; brak pełnoekranowych gradientów. Gradienty stosujemy tylko jako akcenty (CTA border, wnętrza kart w stylu Evervault).  
- Typografia: białe fonty, muted szarości; duża kontrastowość jak na zrzutach z https://ui.aceternity.com.  
- Karty: glass/hover cards podobne do Aceternity („Evervault Card”). Gotowy komponent można dodać poleceniem `npx shadcn add @aceternity/evervault-card` (CLI ma wbudowane registry shadcn & Aceternity).  
- CTA: tło czarne/białe, gradient w obrysie lub lekkim fillu; żadnych gradientów na całej sekcji.  
- Przy kolejnych pracach pamiętaj, że mamy dostęp do MCP shadcn + registry Aceternity – warto sięgać po gotowe wzory kart/przycisków z tej biblioteki, żeby trzymać spójność.

## Lista głównych plików dotkniętych refaktoryzacją

- `app/globals.css` – tokeny powierzchni, paddingi, safe-area.  
- `components/layout/section-header.tsx`, `components/layout/surface-card.tsx` – nowe prymitywy wizualne.  
- `components/home/*` – hero, ranking, cashback, edukacja, latest, opinie, marketing, compare.  
- `components/companies/compare-bar.tsx` – safe-area i Button-based CTA.

Ten dokument można rozwijać przy kolejnych iteracjach (np. dodając sekcje nt. gridów, ikonografii, nowych wariantów Buttona).
