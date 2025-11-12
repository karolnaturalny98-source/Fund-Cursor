# Naprawa problemów z SSR w Next.js 15

## Problem
W Next.js 15 Server Components nie mogą używać `ssr: false` w dynamic importach. To powodowało błędy build i nie działające komponenty.

## Rozwiązanie
Utworzono Client Component wrappery dla komponentów wymagających `ssr: false`:

### 1. **AuroraWrapper** (`components/aurora-wrapper.tsx`)
- Wrapper dla komponentu `Aurora` który wymaga `ssr: false` (używa WebGL)
- Używany we wszystkich Server Components:
  - `app/page.tsx`
  - `app/rankingi/page.tsx`
  - `app/firmy/page.tsx`
  - `app/firmy/[slug]/page.tsx`
  - `app/opinie/page.tsx`
  - `app/affilacja/page.tsx`
  - `app/o-nas/page.tsx`
  - `app/sklep/page.tsx`
  - `app/baza-wiedzy/page.tsx`
  - `app/analizy/page.tsx`

### 2. **PayoutsChartsWrapper** (`components/companies/payouts-charts-wrapper.tsx`)
- Wrapper dla `PayoutsCharts` (używa Recharts)
- Używany w: `app/firmy/[slug]/page.tsx`

### 3. **CompanyPopularityChartWrapper** (`components/companies/company-popularity-chart-wrapper.tsx`)
- Wrapper dla `CompanyPopularityChart` (używa Recharts)
- Używany w: `app/firmy/[slug]/page.tsx`

## Komponenty które już są Client Components
Te komponenty mogą używać `ssr: false` bezpośrednio:
- `app/panel/page.tsx` - Client Component (`"use client"`)
- `components/admin/*` - Client Components (`"use client"`)
- `components/reviews/reviews-ranking-page.tsx` - Client Component (`"use client"`)

## Status
✅ Wszystkie Server Components zostały naprawione
✅ Wszystkie komponenty z Recharts działają poprawnie
✅ Wszystkie komponenty z Aurora działają poprawnie
✅ Brak błędów lintera
✅ Brak błędów TypeScript

