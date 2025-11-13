# Raport pozostałych ostrzeżeń ESLint

## Podsumowanie
Po naprawie głównych problemów pozostało **~130 ostrzeżeń** dotyczących nieużywanych importów i zmiennych.

## Kategorie problemów

### 1. Nieużywane importy typów i komponentów UI

#### Komponenty UI (Card, CardHeader, CardTitle, CardDescription, CardContent)
**Lokalizacje:**
- `app/panel/page.tsx` - CardDescription, CardHeader, CardTitle
- `components/admin/shop-time-filter.tsx` - Card, CardContent
- `components/admin/team-management-form.tsx` - CardHeader, CardTitle
- `components/companies/announcements-tab-client.tsx` - CardContent
- `components/companies/offers-tab-client.tsx` - CardHeader, Separator
- `components/companies/payout-calendar.tsx` - Card, CardContent
- `components/companies/payouts-tab-client.tsx` - CardContent, CardDescription
- `components/companies/payouts-timeline.tsx` - CardDescription, CardHeader, CardTitle, Button
- `components/panels/sections/disputes-section.tsx` - CardDescription
- `components/panels/sections/influencer-section.tsx` - CardHeader
- `components/panels/user-dashboard-recent.tsx` - CardHeader, CardTitle
- `components/rankings/rankings-page-client.tsx` - CardDescription

**Status:** Wszystkie do usunięcia - nieużywane importy.

#### Ikony Lucide React
**Lokalizacje:**
- `components/admin/cashback-statistics-overview.tsx` - Percent
- `components/admin/company-management-panel.tsx` - X
- `components/admin/content-statistics-overview.tsx` - TrendingUp
- `components/admin/disputes-dashboard.tsx` - router (useRouter)
- `components/admin/overview-stats-grid.tsx` - TrendingDown, Clock
- `components/admin/team-management-form.tsx` - Plus
- `components/analysis/payout-analysis.tsx` - Legend, DollarSign
- `components/companies/company-popularity-chart.tsx` - LineChart, Line
- `components/companies/company-timeline.tsx` - Zap
- `components/companies/leverage-tiers-card.tsx` - Gauge, TrendingUp, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
- `components/companies/rules-section.tsx` - Shield, ResponsiveContainer
- `components/companies/technical-details-tabs-card.tsx` - Gauge, Receipt, Shield
- `components/home/community-highlights-animated.tsx` - Star, Badge
- `components/home/influencer-spotlight.tsx` - Badge
- `components/home/knowledge-grid.tsx` - ArrowUpRight
- `components/rankings/rankings-explorer.tsx` - Badge
- `components/reviews/reviews-ranking-mobile-list.tsx` - Badge
- `components/reviews/reviews-ranking-page.tsx` - Badge
- `components/reviews/reviews-ranking-table.tsx` - Badge
- `components/companies/reviews-panel.tsx` - Badge, Filter
- `components/companies/company-card.tsx` - Badge
- `components/panels/user-panel.tsx` - Badge

**Status:** Wszystkie do usunięcia - nieużywane importy.

#### Komponenty z recharts
**Lokalizacje:**
- `components/companies/challenges-comparison-chart.tsx` - ChartTooltipContent
- `components/companies/leverage-tiers-card.tsx` - ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
- `components/companies/offers-comparison-chart.tsx` - ChartTooltipContent
- `components/companies/payouts-charts.tsx` - ChartTooltipContent, Legend
- `components/companies/reviews-statistics-chart.tsx` - ChartTooltipContent
- `components/companies/rules-section.tsx` - ResponsiveContainer
- `components/rankings/rankings-charts.tsx` - ChartTooltipContent, Legend
- `components/reviews/reviews-charts.tsx` - ChartTooltipContent

**Status:** Wszystkie do usunięcia - nieużywane importy.

### 2. Nieużywane zmienne i stałe

#### Zmienne lokalne
- `components/admin/company-management-panel.tsx` - `plan` (linia 172)
- `components/admin/overview-stats-grid.tsx` - `clickAnalytics` (parametr funkcji)
- `components/companies/companies-page-client.tsx` - `params` (linia 257)
- `components/companies/payouts-timeline.tsx` - `events` (linia 36) - **FALSE POSITIVE** - zmienna lokalna w useMemo, używana wewnątrz
- `components/panels/user-panel.tsx` - `statusLabels` (linia 95) - nieużywany, duplikat (używany w innych sekcjach)

#### Stałe
- `components/companies/leverage-tiers-card.tsx` - `CHART_COLORS` (linia 34)

**Status:** Większość do usunięcia, `events` w payouts-timeline.tsx to false positive.

### 3. Nieużywane typy

- `app/panel/page.tsx` - `RedeemPlanOption` (linia 25)
- `components/admin/cashback-history-panel.tsx` - `TransactionHistoryType` (linia 28)
- `components/companies/offers-comparison-chart.tsx` - `CompanyPlan` (linia 25)
- `components/companies/payouts-table.tsx` - `CompanyWithDetails` (linia 12)

**Status:** Wszystkie do usunięcia.

### 4. Nieużywane hooki i funkcje

- `app/panel/page.tsx` - `useMemo` (linia 3)
- `components/affiliate/affiliate-registration-form.tsx` - `useEffect` (linia 3)
- `components/companies/offers-quick-stats.tsx` - `useFadeIn` (linia 7)
- `components/reviews/reviews-ranking-page.tsx` - `useCallback` (linia 3)

**Status:** Wszystkie do usunięcia.

### 5. Nieużywane funkcje pomocnicze (cn, formatPoints, itp.)

- `components/analysis/review-sentiment.tsx` - `cn`
- `components/blog/blog-post-header.tsx` - `cn`
- `components/companies/announcements-tab-client.tsx` - `cn`
- `components/companies/overview-hero-section.tsx` - `cn`, `PremiumBadge`
- `components/companies/overview-sidebar.tsx` - `cn`
- `components/companies/payout-calculator.tsx` - `PremiumBadge`
- `components/home/home-ranking-table.tsx` - `cn`
- `components/panels/sections/disputes-section.tsx` - `cn`

**Status:** Wszystkie do usunięcia.

### 6. Nieużywane komponenty w user-panel.tsx

**Problem:** W pliku `components/panels/user-panel.tsx` zdefiniowane są komponenty, które nie są używane:
- `DisputesSection` (linia 770)
- `RedeemSection` (linia 1147)
- `InfluencerSection` (linia 1536)
- `FavoritesSection` (linia 1800)

**Analiza:** Te komponenty są zdefiniowane w tym pliku, ale istnieją również w osobnych plikach:
- `components/panels/sections/disputes-section.tsx`
- `components/panels/sections/redeem-section.tsx`
- `components/panels/sections/influencer-section.tsx`
- `components/panels/sections/favorites-section.tsx`

**Status:** Prawdopodobnie duplikaty - należy sprawdzić, które są faktycznie używane i usunąć nieużywane.

### 7. False Positives (używane tylko jako typy)

#### `components/ui/chart.tsx` - `THEMES`
```typescript
const THEMES = { light: "", dark: ".dark" } as const;
// Używane jako: Record<keyof typeof THEMES, string>
```
**Status:** FALSE POSITIVE - używane jako typ przez `keyof typeof THEMES`. Można oznaczyć jako `const THEMES` i użyć w typie, ale ESLint nadal będzie narzekać.

#### `lib/hooks/use-toast.ts` - `actionTypes`
```typescript
const actionTypes = { ... } as const;
// Używane jako: typeof actionTypes
```
**Status:** FALSE POSITIVE - używane jako typ przez `typeof actionTypes`. Podobnie jak wyżej.

**Rekomendacja:** Dla tych dwóch przypadków można dodać komentarz `// eslint-disable-next-line` lub zmienić konfigurację ESLint.

### 8. Nieużywane importy Link

- `components/affiliate/affiliate-final-cta.tsx` - `Link` (linia 3)

**Status:** Do usunięcia.

### 9. Nieużywane importy Accordion

- `components/companies/overview-sidebar.tsx` - AccordionContent, AccordionItem, AccordionTrigger
- `components/companies/technical-details-tabs-card.tsx` - AccordionItemClient, CommissionCard, RulesCard

**Status:** Wszystkie do usunięcia.

### 10. Nieużywane zmienne w catch blocks

- `components/layout/site-footer.tsx` - `error` w catch (linia 66)

**Status:** Prefiksować jako `_error`.

## Statystyki

- **Całkowita liczba ostrzeżeń:** ~130
- **Do usunięcia (importy):** ~90
- **Do prefiksowania (parametry):** ~5
- **False positives:** ~3
- **Do sprawdzenia (duplikaty):** ~4

## Plan działania

### Priorytet 1: Nieużywane importy (łatwe do naprawy)
1. Usunąć wszystkie nieużywane importy komponentów UI
2. Usunąć wszystkie nieużywane importy ikon
3. Usunąć wszystkie nieużywane importy z recharts
4. Usunąć nieużywane typy

### Priorytet 2: Nieużywane zmienne i stałe
1. Usunąć nieużywane stałe (CHART_COLORS)
2. Usunąć nieużywane zmienne lokalne
3. Prefiksować nieużywane parametry funkcji

### Priorytet 3: Duplikaty i sprawdzenie
1. Sprawdzić duplikaty komponentów w user-panel.tsx
2. Usunąć nieużywane duplikaty

### Priorytet 4: False positives
1. Dodać komentarze eslint-disable dla THEMES i actionTypes
2. Lub zmienić konfigurację ESLint dla tych przypadków

## Rekomendacje

1. **Automatyzacja:** Rozważyć użycie narzędzia do automatycznego usuwania nieużywanych importów (np. `eslint --fix` z odpowiednią konfiguracją)

2. **Konfiguracja ESLint:** Rozważyć dodanie reguły dla zmiennych używanych tylko jako typy:
   ```javascript
   "@typescript-eslint/no-unused-vars": [
     "warn",
     {
       varsIgnorePattern: "^_",
       argsIgnorePattern: "^_",
       caughtErrorsIgnorePattern: "^_",
       // Dodaj wyjątek dla zmiennych używanych tylko jako typy
       ignoreRestSiblings: true,
     },
   ],
   ```

3. **Refaktoryzacja:** Rozważyć przeniesienie duplikatów komponentów z user-panel.tsx do osobnych plików, jeśli nie są używane.

4. **Code review:** Przed usunięciem komponentów z user-panel.tsx sprawdzić, czy nie są używane dynamicznie lub przez reflection.

