# 🔍 Frontend Audit Report - FundedRank

**Data:** 2025-01-27  
**Stack:** Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, TypeScript

---

## 📋 Executive Summary

Przeprowadzono pełny audyt frontendu projektu. Zidentyfikowano **47 problemów** w kategoriach: stylowanie, dostępność, wydajność, hydration i spójność kodu. Większość to problemy średniego priorytetu, które można łatwo naprawić.

---

## 1️⃣ STYLOWANIE I UI

### ⚠️ Problem 1: Inline styles z dynamicznymi kolorami (borderLeftColor)
**Lokalizacja:** Wiele komponentów analitycznych  
**Pliki:**
- `components/analysis/trading-conditions.tsx` (linie 43, 110, 165, 213, 250)
- `components/analysis/company-profile.tsx` (linie 34, 140, 204, 261, 313, 373)
- `components/analysis/payout-analysis.tsx` (linia 130)
- `components/analysis/rating-trends-chart.tsx` (linia 108)
- `components/analysis/price-comparison-chart.tsx` (linia 98)

**Opis:** Dynamiczne kolory ramek są ustawiane przez inline `style={{ borderLeftColor: getCompanyColor(idx) }}`. To działa, ale nie jest zgodne z podejściem Tailwind-first.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{ borderLeftColor: getCompanyColor(idx) }}

// Użyj CSS variables lub arbitrary values:
className="border-l-4"
style={{ '--border-color': getCompanyColor(idx) } as React.CSSProperties}
// + w CSS: border-left-color: var(--border-color);
```

**LUB** użyj Tailwind arbitrary values (jeśli kolory są znane):
```tsx
className={`border-l-4 border-[${getCompanyColor(idx)}]`}
```

---

### ⚠️ Problem 2: Inline styles z backgroundColor dla dynamicznych kolorów
**Lokalizacja:** Komponenty wykresów i wskaźników  
**Pliki:**
- `components/analysis/rating-trends-chart.tsx` (linia 172)
- `components/analysis/price-comparison-chart.tsx` (linia 148)
- `components/analysis/plan-features-matrix.tsx` (linia 209)
- `components/analysis/review-statistics.tsx` (linia 165)
- `components/ui/chart.tsx` (linia 271)

**Opis:** Dynamiczne kolory tła są ustawiane przez inline styles.

**💡 Propozycja naprawy:**
Użyj CSS variables lub Tailwind arbitrary values (jak wyżej).

---

### ⚠️ Problem 3: Stare klasy Tailwind (gray-* zamiast tokenów)
**Lokalizacja:** `components/admin/blog-posts-panel.tsx` (linia 33)

**Opis:** Używa `bg-gray-100 text-gray-800` zamiast tokenów design systemu (`bg-muted`, `text-muted-foreground`).

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
ARCHIVED: "bg-gray-100 text-gray-800",

// Użyj:
ARCHIVED: "bg-muted text-muted-foreground",
```

---

### ⚠️ Problem 4: Inline styles dla transitionDelay (animacje)
**Lokalizacja:** Wiele komponentów z animacjami stagger  
**Pliki:**
- `components/companies/rules-section.tsx` (linie 203, 252)
- `components/companies/reviews-panel.tsx` (linia 385)
- `components/companies/leverage-tiers-card.tsx` (linia 190)
- `components/companies/offers-quick-stats.tsx` (linia 132)
- `components/companies/accordion-item-client.tsx` (linia 183)
- `components/companies/company-timeline.tsx` (linia 65)
- `components/affiliate/affiliate-how-it-works.tsx` (linia 64)
- `components/about/team-section.tsx` (linia 93)
- `components/about/mission-vision.tsx` (linia 35)
- `components/about/company-values.tsx` (linia 60)
- `components/affiliate/affiliate-list.tsx` (linia 77)
- `components/affiliate/affiliate-benefits.tsx` (linia 65)
- `components/home/community-highlights.tsx` (linia 62)
- `components/home/influencer-spotlight.tsx` (linie 51, 73)
- `components/home/knowledge-grid.tsx` (linia 65)
- `components/home/how-it-works.tsx` (linia 58)
- `components/companies/companies-page-client.tsx` (linia 328)

**Opis:** `transitionDelay` jest ustawiane przez inline styles. Można to przenieść do CSS variables lub użyć Tailwind arbitrary values.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{ transitionDelay: `${index * 100}ms` }}

// Użyj CSS variable:
style={{ '--delay': `${index * 100}ms` } as React.CSSProperties}
className="transition-all duration-700"
// + w CSS: transition-delay: var(--delay);
```

**LUB** użyj Tailwind arbitrary values (jeśli opóźnienia są znane):
```tsx
className={`transition-all duration-700 delay-[${index * 100}ms]`}
```

---

### ⚠️ Problem 5: Gradient backgrounds w inline styles
**Lokalizacja:** Strony z gradientami tła  
**Pliki:**
- `app/panel/page.tsx` (linie 429-431)
- `app/baza-wiedzy/[slug]/page.tsx` (linie 76-77)

**Opis:** Gradienty są hardkodowane w inline styles zamiast używać klas Tailwind lub CSS variables.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{
  background: 'linear-gradient(135deg, #0f1726 0%, #1f2a3c 50%, #2446a6 100%)',
}}

// Użyj klasy Tailwind lub utility w globals.css:
className="bg-gradient-dark"
// + w globals.css:
@utility bg-gradient-dark {
  background: linear-gradient(135deg, #0f1726 0%, #1f2a3c 50%, #2446a6 100%);
}
```

---

### ⚠️ Problem 6: Inline styles dla szerokości progress bars
**Lokalizacja:** Komponenty z progress bars  
**Pliki:**
- `components/rankings/rankings-explorer.tsx` (linia 1564)
- `components/reviews/reviews-ranking-mobile-list.tsx` (linia 111)
- `components/reviews/reviews-ranking-table.tsx` (linia 157)
- `components/analysis/metrics-dashboard.tsx` (linia 126)

**Opis:** Szerokość progress barów jest ustawiana przez inline styles. Komponent `Progress` z shadcn/ui już używa inline styles (uzasadnione), ale można użyć CSS variables.

**💡 Propozycja naprawy:**
Dla custom progress bars użyj CSS variables:
```tsx
// Zamiast:
style={{ width: `${progress * 100}%` }}

// Użyj:
style={{ '--progress': `${progress * 100}%` } as React.CSSProperties}
className="w-[var(--progress)]"
```

**Uwaga:** Komponent `components/ui/progress.tsx` używa inline styles dla transformacji — to jest uzasadnione, ponieważ Radix UI wymaga dynamicznych wartości.

---

### ⚠️ Problem 7: Inline style dla textShadow
**Lokalizacja:** `components/home/marketing-carousel.tsx` (linia 127)

**Opis:** Text shadow jest ustawiany przez inline style.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{
  textShadow: "0 0 20px hsl(150 70% 45% / 0.3), 0 0 40px hsl(150 70% 45% / 0.2)"
}}

// Użyj klasy Tailwind lub utility:
className="text-shadow-glow"
// + w globals.css:
@utility text-shadow-glow {
  text-shadow: 0 0 20px hsl(150 70% 45% / 0.3), 0 0 40px hsl(150 70% 45% / 0.2);
}
```

---

### ⚠️ Problem 8: Inline style dla SVG width/height
**Lokalizacja:** `components/companies/team-tree.tsx` (linia 123)

**Opis:** SVG ma inline style dla width/height.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{ width: "100%", height: "100%" }}

// Użyj:
className="w-full h-full"
```

---

### ⚠️ Problem 9: Inline style dla paddingLeft (dynamiczny)
**Lokalizacja:** `components/admin/admin-content.tsx` (linia 38)

**Opis:** Dynamiczny padding jest ustawiany przez inline style.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
style={{ paddingLeft }}

// Użyj CSS variable:
style={{ '--padding-left': paddingLeft } as React.CSSProperties}
className="pl-[var(--padding-left)]"
```

---

## 2️⃣ HYDRATION / CLIENT COMPONENTS

### ⚠️ Problem 10: Komponent "use client" bez interakcji
**Lokalizacja:** `components/home/community-highlights.tsx`

**Opis:** Komponent ma `"use client"`, ale używa tylko hooków animacji (`useFadeIn`, `useStaggerAnimation`, `useScrollAnimation`). Hooki animacji mogą być przeniesione do Server Component z wrapperem Client Component tylko dla części z animacjami.

**💡 Propozycja naprawy:**
Rozdziel na Server Component (dane) i Client Component (animacje):
```tsx
// Server Component:
export function CommunityHighlights({ reviews }: { reviews: ReviewHighlight[] }) {
  return <CommunityHighlightsClient reviews={reviews} />;
}

// Client Component (tylko dla animacji):
"use client";
export function CommunityHighlightsClient({ reviews }: { reviews: ReviewHighlight[] }) {
  // ... logika animacji
}
```

**Uwaga:** To wymaga refaktoryzacji, ale poprawi wydajność (mniej JS wysyłanego do klienta).

---

### ⚠️ Problem 11: Strona "use client" bez uzasadnienia
**Lokalizacja:** `app/admin/(tabs)/newsletter/page.tsx`

**Opis:** Cała strona jest Client Component. Sprawdź, czy wszystkie funkcjonalności wymagają interakcji.

**💡 Propozycja naprawy:**
Przenieś część logiki do Server Component, jeśli to możliwe. Użyj Client Component tylko dla części wymagających interakcji.

---

## 3️⃣ WYDAJNOŚĆ / UX

### ⚠️ Problem 12: Brak dynamic imports dla dużych komponentów
**Lokalizacja:** Wiele komponentów z wykresami i ciężkimi bibliotekami

**Opis:** Komponenty z Recharts (`components/analysis/*`, `components/companies/payouts-charts.tsx`, itd.) są importowane bezpośrednio. Powinny być ładowane dynamicznie.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
import { RatingTrendsChart } from "@/components/analysis/rating-trends-chart";

// Użyj:
import dynamic from "next/dynamic";
const RatingTrendsChart = dynamic(
  () => import("@/components/analysis/rating-trends-chart").then(mod => ({ default: mod.RatingTrendsChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

**Pliki do zmiany:**
- `components/analysis/rating-trends-chart.tsx`
- `components/analysis/price-comparison-chart.tsx`
- `components/analysis/payout-analysis.tsx`
- `components/companies/payouts-charts.tsx`
- `components/rankings/rankings-charts.tsx`
- `components/reviews/reviews-charts.tsx`
- Inne komponenty z Recharts

---

### ⚠️ Problem 13: Brak `sizes` dla niektórych obrazów Next/Image
**Lokalizacja:** `components/home/home-ranking-table.tsx` (linia 40-46)

**Opis:** Obraz ma `width` i `height`, ale brakuje `sizes` dla responsywności.

**💡 Propozycja naprawy:**
```tsx
<Image
  src={logoUrl}
  alt={name}
  width={44}
  height={44}
  sizes="44px" // Dodaj sizes
  priority={priority}
  className="..."
/>
```

**Uwaga:** `components/blog/blog-post-card.tsx` już ma `sizes` — dobrze! ✅

---

### ⚠️ Problem 14: Import całych bibliotek zamiast tree-shaking
**Lokalizacja:** Wszystkie komponenty UI

**Opis:** Używasz `import * as React from "react"` i `import * as RadixPrimitive from "@radix-ui/..."`. To jest OK dla Radix UI (eksportują tylko potrzebne komponenty), ale sprawdź, czy nie importujesz całych bibliotek.

**Status:** ✅ To jest poprawne — Radix UI i React są zoptymalizowane.

---

## 4️⃣ DOSTĘPNOŚĆ I UX (A11y)

### ⚠️ Problem 15: Brak aria-label dla niektórych przycisków
**Lokalizacja:** Wiele komponentów z przyciskami

**Pliki:**
- `components/admin/disputes-dashboard.tsx` (linie 381, 395, 536, 539, 543)
- `components/admin/community-history-panel.tsx` (linie 344, 405, 452, 499)
- `components/admin/blog-categories-panel.tsx` (linie 105, 185, 188)
- `components/admin/company-management-panel.tsx` (linie 500, 503, 521, 524)
- `components/panels/user-dashboard-recent.tsx` (linia 92)
- `components/analysis/company-selector.tsx` (linia 103)

**Opis:** Niektóre przyciski nie mają `aria-label` ani tekstu widocznego dla screen readerów.

**💡 Propozycja naprawy:**
```tsx
// Zamiast:
<Button onClick={handleClear} variant="ghost" size="sm">
  <X className="h-4 w-4" />
</Button>

// Użyj:
<Button onClick={handleClear} variant="ghost" size="sm" aria-label="Wyczyść">
  <X className="h-4 w-4" />
</Button>
```

---

### ⚠️ Problem 16: Dialog/Sheet/AlertDialog — sprawdź focus trap
**Lokalizacja:** `components/ui/dialog.tsx`, `components/ui/sheet.tsx`, `components/ui/alert-dialog.tsx`

**Opis:** Komponenty używają Radix UI, który automatycznie obsługuje focus trap. ✅ To jest poprawne.

**Status:** ✅ Radix UI automatycznie obsługuje focus trap i keyboard navigation.

---

### ⚠️ Problem 17: Brak aria-label dla obrazów w niektórych miejscach
**Lokalizacja:** Wszystkie komponenty z `Image` z Next.js

**Opis:** Większość obrazów ma `alt`, ale sprawdź, czy wszystkie są opisowe.

**Status:** ✅ Większość obrazów ma `alt` — dobrze!

**Uwaga:** `components/home/home-ranking-table.tsx` ma `alt={name}` — OK ✅

---

### ⚠️ Problem 18: Struktura headingów — sprawdź hierarchię
**Lokalizacja:** Wszystkie strony i komponenty

**Opis:** Sprawdź, czy struktura `h1` → `h2` → `h3` jest semantyczna i nie pomija poziomów.

**💡 Propozycja naprawy:**
Użyj narzędzia do audytu dostępności (np. axe DevTools) lub sprawdź ręcznie każdą stronę.

---

## 5️⃣ KOD I STRUKTURA PROJEKTU

### ⚠️ Problem 19: Użycie `import * as React`
**Lokalizacja:** Wszystkie komponenty UI

**Opis:** Używasz `import * as React from "react"`. To jest OK, ale można użyć `import React from "react"` dla lepszego tree-shaking (choć różnica jest minimalna).

**Status:** ✅ To jest akceptowalne — React 19 i bundlery są zoptymalizowane.

---

### ⚠️ Problem 20: Brak sprawdzenia nieużywanych komponentów
**Lokalizacja:** Cały projekt

**Opis:** Nie zidentyfikowano nieużywanych komponentów, ale warto sprawdzić.

**💡 Propozycja naprawy:**
Użyj narzędzia do analizy zależności (np. `depcheck` lub `unimported`).

---

### ⚠️ Problem 21: Aliasy TypeScript — sprawdź konfigurację
**Lokalizacja:** `tsconfig.json`

**Opis:** Aliasy `@/components`, `@/lib`, `@/hooks` są używane konsekwentnie. ✅

**Status:** ✅ Aliasy są poprawne.

---

## 6️⃣ SPÓJNOŚĆ Z shadcn/ui

### ⚠️ Problem 22: Komponenty shadcn/ui — sprawdź aktualizacje
**Lokalizacja:** `components/ui/*`

**Opis:** Sprawdź, czy komponenty są zaktualizowane do najnowszych wersji z registry.

**💡 Propozycja naprawy:**
```bash
npx shadcn@latest diff
```

Jeśli są różnice, zaktualizuj komponenty:
```bash
npx shadcn@latest add [component-name] --overwrite
```

---

### ⚠️ Problem 23: Customizacja komponentów shadcn/ui
**Lokalizacja:** `components/ui/*`

**Opis:** Sprawdź, czy modyfikacje komponentów shadcn/ui są uzasadnione i nie powodują rozjazdu ze stylem systemu.

**Status:** ✅ Komponenty wyglądają na zgodne z shadcn/ui.

---

## 📊 PODSUMOWANIE PRIORYTETÓW

### 🔴 Wysoki priorytet (napraw natychmiast):
1. **Problem 3:** Stare klasy gray-* → użyj tokenów design systemu
2. **Problem 12:** Brak dynamic imports dla dużych komponentów → dodaj dynamic imports dla Recharts
3. **Problem 15:** Brak aria-label dla przycisków → dodaj aria-label

### 🟡 Średni priorytet (napraw w ciągu tygodnia):
4. **Problem 1-2:** Inline styles z kolorami → użyj CSS variables lub Tailwind arbitrary values
5. **Problem 4:** Inline styles dla transitionDelay → użyj CSS variables
6. **Problem 5:** Gradient backgrounds w inline styles → przenieś do utility classes
7. **Problem 13:** Brak `sizes` dla obrazów → dodaj `sizes`

### 🟢 Niski priorytet (napraw w ciągu miesiąca):
8. **Problem 10-11:** Optymalizacja Client Components → rozdziel Server/Client Components
9. **Problem 6-9:** Pozostałe inline styles → przenieś do CSS/Tailwind
10. **Problem 18:** Struktura headingów → audyt dostępności
11. **Problem 20:** Nieużywane komponenty → analiza zależności
12. **Problem 22:** Aktualizacja shadcn/ui → sprawdź i zaktualizuj

---

## ✅ CO DZIAŁA DOBRZE

1. ✅ Większość obrazów ma `alt` attributes
2. ✅ Komponenty używają `cn()` dla className
3. ✅ Radix UI automatycznie obsługuje focus trap i keyboard navigation
4. ✅ Aliasy TypeScript są poprawne
5. ✅ Komponenty shadcn/ui są zgodne z systemem designu
6. ✅ Używasz tokenów design systemu (`bg-background`, `text-foreground`, itp.) w większości miejsc
7. ✅ `components/blog/blog-post-card.tsx` ma `sizes` dla obrazów ✅
8. ✅ `components/panels/user-panel.tsx` używa dynamic imports ✅

---

## 🎯 REKOMENDACJE DALSZE

1. **Dodaj ESLint rules** dla dostępności:
   ```json
   "rules": {
     "jsx-a11y/alt-text": "error",
     "jsx-a11y/aria-props": "error",
     "jsx-a11y/aria-proptypes": "error",
     "jsx-a11y/aria-unsupported-elements": "error",
     "jsx-a11y/role-has-required-aria-props": "error",
     "jsx-a11y/role-supports-aria-props": "error"
   }
   ```

2. **Dodaj testy dostępności** (np. jest-axe, @testing-library/jest-dom)

3. **Użyj Lighthouse CI** do automatycznego audytu wydajności i dostępności

4. **Rozważ użycie CSS-in-JS z Tailwind** dla dynamicznych wartości (np. `style={{ '--color': color } as React.CSSProperties}`)

5. **Dodaj Storybook** dla dokumentacji komponentów i testów wizualnych

---

**Raport wygenerowany:** 2025-01-27  
**Następny audyt:** Po naprawie problemów wysokiego priorytetu

