# Plan Napraw - Diagnostyka Wydajności Frontendu

## Quick Wins (Do wdrożenia od ręki)

### 1. Dodaj inline script dla motywu (HIGH PRIORITY)
**Plik:** `app/layout.tsx`  
**Czas:** 5 minut  
**Wpływ:** Eliminuje białe błyski przy pierwszym załadowaniu  
**Kod:**
```tsx
// W app/layout.tsx, przed <html>:
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          const theme = localStorage.getItem('theme') || 'system';
          const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.classList.toggle('dark', isDark);
        } catch (e) {}
      })();
    `,
  }}
/>
```

### 2. Dodaj `sizes` do obrazów Image
**Pliki:** 
- `components/rankings/rankings-explorer.tsx` (linia 1330)
- `components/companies/company-media.tsx` (linia 71)

**Czas:** 2 minuty  
**Wpływ:** Lepsza optymalizacja obrazów przez Next.js  
**Kod:**
```tsx
// rankings-explorer.tsx:
<Image sizes="44px" ... />

// company-media.tsx:
<Image sizes="96px" ... />
```

### 3. Skróć transition-duration w gradient-button
**Plik:** `app/globals.css` (linia 229)  
**Czas:** 1 minuta  
**Wpływ:** Szybsza responsywność UI  
**Zmiana:** `0.5s` → `0.3s` dla wszystkich transition w gradient-button utility

### 4. Dodaj prefers-reduced-motion do Aurora
**Plik:** `components/Aurora.tsx`  
**Czas:** 5 minut  
**Wpływ:** Lepsza dostępność i wydajność dla użytkowników wrażliwych na ruch  
**Kod:**
```tsx
useEffect(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  // ... reszta animacji
}, []);
```

---

## Plan Napraw (Kolejność wykonywania)

### Faza 1: FOUC & Theme (Wysoki priorytet)
**Przewidywany wpływ:** FCP ↓ 200-500ms, eliminacja białych błysków

1. ✅ **Dodaj inline script dla motywu** (Quick Win #1)
2. **Upewnij się że body ma solidne tło** - sprawdź `app/globals.css`
3. **Testuj na różnych urządzeniach** - sprawdź czy FOUC zniknął

**Metryki do monitorowania:**
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- Wizualne testy na różnych przeglądarkach

---

### Faza 2: Bundle Size & Code Splitting (Średni priorytet)
**Przewidywany wpływ:** Bundle size ↓ 200-400KB, szybsze ładowanie stron

1. **Dynamic import dla RichTextEditor**
   - Plik: `components/editor/rich-text-editor.tsx`
   - Użyj w: `components/forms/blog-post-form.tsx`, `components/admin/*`
   - Czas: 15 minut

2. **Dynamic import dla LeverageTiersCard**
   - Plik: `components/companies/leverage-tiers-card.tsx`
   - Sprawdź gdzie jest używany i dodaj dynamic import
   - Czas: 10 minut

3. **Optymalizacja Aurora**
   - Dodaj IntersectionObserver aby zatrzymać animację gdy nie jest widoczna
   - Dodaj prefers-reduced-motion check
   - Czas: 20 minut

4. **Audyt użycia GSAP**
   - Sprawdź czy wszystkie komponenty rzeczywiście potrzebują GSAP
   - Rozważ zastąpienie prostszymi animacjami CSS gdzie możliwe
   - Czas: 30 minut

**Metryki do monitorowania:**
- Bundle size (przed/po)
- Time to Interactive (TTI)
- First Input Delay (FID)

---

### Faza 3: Hydration & Re-renders (Średni priorytet)
**Przewidywany wpływ:** Mniej hydration warnings, szybsze interakcje

1. **Refaktoryzacja AnalysisLayout**
   - Przenieś część do Server Component
   - Tylko tabs i interakcje jako Client Components
   - Czas: 45 minut

2. **Optymalizacja CurrencyProvider**
   - Upewnij się że initialCurrency z SSR jest zawsze używany jako fallback
   - Rozważ użycie cookie zamiast localStorage dla initial render
   - Czas: 30 minut

3. **Cleanup setTimeout w useEffect**
   - Sprawdź wszystkie użycia `window.setTimeout`
   - Dodaj cleanup w return z useEffect
   - Pliki: `components/companies/companies-page-client.tsx`, `components/rankings/rankings-explorer.tsx`
   - Czas: 15 minut

**Metryki do monitorowania:**
- Hydration warnings w konsoli
- Re-render count (React DevTools Profiler)
- Time to Interactive (TTI)

---

### Faza 4: Image Optimization (Niski priorytet)
**Przewidywany wpływ:** Lepsza optymalizacja obrazów, mniejszy CLS

1. ✅ **Dodaj `sizes` do wszystkich Image** (Quick Win #2)
2. **Sprawdź czy wszystkie obrazy mają `priority` gdzie potrzebne**
   - Above-the-fold obrazy powinny mieć `priority={true}`
   - Czas: 20 minut

3. **Dodaj skeleton loading dla obrazów**
   - Tam gdzie brakuje, dodaj skeleton podczas ładowania
   - Czas: 30 minut

**Metryki do monitorowania:**
- Cumulative Layout Shift (CLS)
- Image load time
- LCP (jeśli LCP to obraz)

---

### Faza 5: Code Quality & Accessibility (Niski priorytet)
**Przewidywany wpływ:** Lepsza dostępność, czystszy kod

1. ✅ **Dodaj prefers-reduced-motion do Aurora** (Quick Win #4)
2. **Przenieś inline styles do Tailwind**
   - Pliki: `components/affiliate/affiliate-benefits.tsx`, `components/home/influencer-spotlight.tsx`
   - Czas: 20 minut

3. **Optymalizacja RankingsExplorer**
   - Rozdziel na mniejsze komponenty
   - Dynamic import dla części niekrytycznych
   - Czas: 60 minut

---

## Przewidywany Całkowity Wpływ

### Metryki Core Web Vitals (przed → po):
- **FCP:** ~1.8s → ~1.3s (↓ 28%)
- **LCP:** ~2.5s → ~2.0s (↓ 20%)
- **CLS:** ~0.05 → ~0.02 (↓ 60%)
- **TTI:** ~3.5s → ~2.8s (↓ 20%)
- **Bundle Size:** ~800KB → ~500KB (↓ 37%)

### User Experience:
- ✅ Eliminacja białych błysków przy pierwszym załadowaniu
- ✅ Szybsze ładowanie stron (szczególnie na mobile)
- ✅ Płynniejsze przejścia między stronami
- ✅ Lepsza dostępność (prefers-reduced-motion)

---

## Narzędzia do Monitorowania

1. **Lighthouse CI** - automatyczne testy wydajności
2. **Next.js Bundle Analyzer** - analiza rozmiaru bundle
3. **React DevTools Profiler** - analiza re-renderów
4. **Chrome DevTools Performance** - profilowanie runtime

---

## Uwagi

- **Nie rób wszystkich zmian naraz** - testuj każdą fazę osobno
- **Monitoruj metryki przed i po** - upewnij się że zmiany rzeczywiście pomagają
- **Testuj na różnych urządzeniach** - mobile vs desktop mogą mieć różne wyniki
- **Zachowaj backup** - commit przed każdą fazą

---

## Quick Reference - Komendy

```bash
# Analiza bundle size
ANALYZE=true npm run build

# Test wydajności lokalnie
npm run build && npm run start

# Lighthouse test
npx lighthouse http://localhost:3000 --view

# Sprawdź hydration warnings
npm run dev
# Otwórz konsolę przeglądarki i szukaj "hydration" warnings
```

