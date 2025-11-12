# Lista Problemów Wydajnościowych - FundedRank

## 🔴 KRYTYCZNE (Wysoki Priorytet)

### 1. **Brak inline script dla motywu - FOUC**
**Plik:** `app/layout.tsx`  
**Problem:** ThemeProvider jest kliencki i wykonuje się po hydration, powodując białe błyski przy pierwszym załadowaniu.  
**Wpływ:** FCP ↑ 200-500ms, złe UX  
**Rozwiązanie:** Dodaj inline script w `<head>` ustawiający klasę motywu przed hydration React.

### 2. **Duże zapytanie Prisma bez limitów - Rankings**
**Plik:** `lib/queries/rankings.ts:66`  
**Problem:** `getRankingsDatasetImpl` pobiera **wszystkie** firmy z bazy bez limitu, wraz z pełnymi relacjami (reviews, plans, transactions, clicks).  
**Wpływ:** Przy 100+ firmach zapytanie może zwracać tysiące rekordów, powodując:
- Wysokie zużycie pamięci
- Długi czas wykonania (2-5s+)
- Duże payloady JSON (MB+)
- Problemy z cache'owaniem  
**Rozwiązanie:** 
- Dodać paginację lub limit (np. max 200 firm)
- Rozważyć agregację danych w bazie zamiast pobierania wszystkich reviews/clicks
- Dodać indeksy na często filtrowane pola

### 3. **Synchroniczny import Tiptap Editor (~150KB)**
**Plik:** `components/editor/rich-text-editor.tsx`  
**Problem:** Tiptap jest importowany synchronicznie, zwiększając initial bundle size.  
**Wpływ:** Bundle size ↑ ~150KB, wolniejsze ładowanie strony  
**Rozwiązanie:** Dynamic import z `ssr: false` tylko gdy edytor jest potrzebny.

### 4. **Brak cache headers w API routes**
**Pliki:** 
- `app/api/rankings/route.ts` - brak cache headers
- `app/api/companies/route.ts` - brak cache headers
- Większość GET endpoints nie ma cache headers  
**Problem:** Każde żądanie wykonuje pełne zapytanie do bazy.  
**Wpływ:** Niepotrzebne obciążenie bazy, wolniejsze odpowiedzi  
**Rozwiązanie:** Dodać cache headers i tagged revalidation zgodnie z regułami projektu.

---

## 🟠 WYSOKIE (Średni Priorytet)

### 5. **Duże komponenty bez code splitting**
**Plik:** `components/rankings/rankings-explorer.tsx` (~1700 linii)  
**Problem:** Ogromny komponent Client Component renderuje wszystko naraz.  
**Wpływ:** Duży bundle JS, wolniejsze hydration  
**Rozwiązanie:** Rozdzielić na mniejsze komponenty i ładować dynamicznie (filtry, tabela, mobile list).

### 6. **N+1 Query Pattern - getCompanies**
**Plik:** `lib/queries/companies.ts:433`  
**Problem:** Po pobraniu firm, wykonuje się osobne zapytanie dla favorites dla każdego użytkownika.  
**Wpływ:** Przy wielu firmach i użytkownikach - wiele zapytań do bazy  
**Rozwiązanie:** Użyć `include` w głównym zapytaniu lub batch query.

### 7. **Brak paginacji w getCompanyFiltersMetadata**
**Plik:** `lib/queries/companies.ts:461-500`  
**Problem:** Pobiera **wszystkie** unikalne wartości (kraje, accountTypes, profitSplits) bez limitów.  
**Wpływ:** Przy dużej liczbie firm może zwracać setki wartości  
**Rozwiązanie:** Dodać limit lub cache wyników (są to dane rzadko zmieniające się).

### 8. **Renderowanie dużych list bez React.memo**
**Pliki:**
- `components/reviews/reviews-ranking-table.tsx:71` - renderuje wszystkie items bez memo
- `components/rankings/rankings-explorer.tsx:1161` - renderuje wszystkie companies bez memo
- `components/companies/companies-page-client.tsx:360` - renderuje wszystkie companies bez memo  
**Problem:** Każda zmiana powoduje re-render wszystkich elementów listy.  
**Wpływ:** Spowolnienie przy dużych listach (50+ elementów)  
**Rozwiązanie:** Owinąć komponenty wierszy w `React.memo` z odpowiednimi porównaniami.

### 9. **Aurora animacja bez prefers-reduced-motion**
**Plik:** `components/Aurora.tsx:127-229`  
**Problem:** requestAnimationFrame działa ciągle, nawet gdy komponent nie jest widoczny (choć jest IntersectionObserver, ale brakuje prefers-reduced-motion).  
**Wpływ:** Wysokie zużycie CPU/GPU, szczególnie na mobile  
**Rozwiązanie:** Dodać sprawdzenie `prefers-reduced-motion` i zatrzymać animację.

### 10. **Brak sizes dla Image**
**Pliki:**
- `components/reviews/reviews-ranking-table.tsx:256` - brak `sizes`
- `components/rankings/rankings-explorer.tsx:1330` - brak `sizes`  
**Problem:** Next.js nie może optymalizować obrazów bez informacji o rozmiarze.  
**Wpływ:** Większe obrazy niż potrzebne, wolniejsze ładowanie  
**Rozwiązanie:** Dodać `sizes="44px"` dla logo, odpowiednie wartości dla innych obrazów.

### 11. **Brak cache dla getCompanies**
**Plik:** `lib/queries/companies.ts:318`  
**Problem:** Funkcja nie używa `unstable_cache` ani tagged revalidation.  
**Wpływ:** Każde wywołanie wykonuje pełne zapytanie do bazy  
**Rozwiązanie:** Dodać cache z tagiem `"companies"` i revalidate po mutacjach.

### 12. **Filtrowanie po pobraniu danych (minProfitSplit)**
**Plik:** `lib/queries/companies.ts:407-414`  
**Problem:** Filtrowanie `minProfitSplit` odbywa się **po** pobraniu wszystkich firm z bazy, zamiast w WHERE clause.  
**Wpływ:** Pobiera więcej danych niż potrzebne  
**Rozwiązanie:** Przenieść filtrowanie do zapytania Prisma (może wymagać subquery).

---

## 🟡 ŚREDNIE (Niski Priorytet)

### 13. **Duże useMemo z wieloma zależnościami**
**Plik:** `components/companies/plans-explorer.tsx:107-178`  
**Problem:** `plansWithComputed` wykonuje mapowanie, filtrowanie i sortowanie dla wszystkich planów przy każdej zmianie currency/rates/search.  
**Wpływ:** Może być kosztowne przy wielu planach  
**Rozwiązanie:** Rozważyć podział na mniejsze useMemo lub optymalizację algorytmu.

### 14. **Brak debounce w niektórych polach wyszukiwania**
**Plik:** `components/companies/companies-page-client.tsx:98` - ma debounce (300ms)  
**Status:** OK, ale sprawdzić inne komponenty  
**Rozwiązanie:** Upewnić się, że wszystkie pola wyszukiwania mają debounce.

### 15. **DataTable renderuje wszystkie wiersze naraz**
**Plik:** `components/admin/data-table.tsx:162`  
**Problem:** Używa ScrollArea z fixed height, ale renderuje wszystkie wiersze.  
**Wpływ:** Przy dużych listach może być wolne  
**Rozwiązanie:** Rozważyć virtualizację (react-window) dla list >100 elementów.

### 16. **Brak lazy loading dla Recharts**
**Plik:** `components/companies/payouts-charts.tsx`  
**Status:** Częściowo zrobione (dynamic import w niektórych miejscach)  
**Problem:** Nie wszystkie komponenty z Recharts są lazy loaded  
**Rozwiązanie:** Upewnić się, że wszystkie komponenty z Recharts używają dynamic import.

### 17. **Brak cleanup dla setTimeout**
**Plik:** `components/companies/companies-page-client.tsx:98-123`  
**Status:** ✅ MA cleanup  
**Uwaga:** Sprawdzić inne miejsca używające setTimeout.

### 18. **Inline styles zamiast Tailwind**
**Pliki:**
- `components/affiliate/affiliate-benefits.tsx:67` - inline style dla CSS variable
- `components/companies/companies-page-client.tsx:366` - inline style dla delay  
**Problem:** Inline styles mogą powodować re-rendery  
**Rozwiązanie:** Przenieść do Tailwind arbitrary values lub CSS utility classes.

### 19. **Brak indeksów w bazie danych**
**Potencjalne problemy:**
- `Company.clicks.clickedAt` - często filtrowane w rankings
- `Review.publishedAt` - często sortowane
- `Company.cashbackRate` - często filtrowane
- `Favorite.companyId + user.clerkId` - często używane w WHERE  
**Rozwiązanie:** Dodać indeksy w `schema.prisma` dla często filtrowanych/sortowanych pól.

### 20. **Promise.allSettled dla wszystkich firm w rankings**
**Plik:** `lib/queries/rankings.ts:351-358`  
**Problem:** Zapisuje score do historii dla **wszystkich** firm równolegle.  
**Wpływ:** Przy 100+ firmach = 100+ równoległych zapytań do bazy  
**Rozwiązanie:** Rozważyć batch processing (np. po 10-20 firm naraz) lub background job.

### 21. **Brak optymalizacji dla mobile**
**Plik:** `components/rankings/rankings-explorer.tsx`  
**Problem:** Desktop i mobile listy renderują się zawsze, tylko są ukryte przez CSS.  
**Wpływ:** Renderuje więcej niż potrzeba  
**Rozwiązanie:** Użyć conditional rendering lub dynamic import dla mobile view.

### 22. **Brak skeleton loading dla niektórych komponentów**
**Pliki:** Wiele komponentów nie ma skeleton loading  
**Rozwiązanie:** Dodać skeleton loading dla wszystkich async komponentów.

### 23. **Długie transition-duration w CSS**
**Plik:** `app/globals.css:229`  
**Problem:** Gradient-button ma `transition-duration: 0.5s` dla wielu właściwości  
**Rozwiązanie:** Skrócić do 0.2-0.3s dla lepszej responsywności.

### 24. **Brak optymalizacji dla preferowanej waluty**
**Plik:** `components/companies/plans-explorer.tsx:107`  
**Problem:** Konwersja waluty wykonywana dla wszystkich planów przy każdej zmianie  
**Rozwiązanie:** Rozważyć cache dla konwersji lub optymalizację algorytmu.

---

## 🔵 NISKIE (Nice to Have)

### 25. **Brak preload dla krytycznych fontów**
**Plik:** `app/layout.tsx:15`  
**Status:** Next.js automatycznie optymalizuje, ale można dodać explicit preload  
**Rozwiązanie:** Dodać preload dla Geist Sans jeśli jest krytyczny.

### 26. **Brak optymalizacji dla obrazów zewnętrznych**
**Plik:** `next.config.ts`  
**Problem:** Wszystkie obrazy zewnętrzne są dozwolone (`hostname: "**"`)  
**Rozwiązanie:** Ograniczyć do konkretnych domen jeśli możliwe.

### 27. **Brak service worker dla cache**
**Status:** Brak PWA/service worker  
**Rozwiązanie:** Rozważyć dodanie service worker dla cache'owania statycznych zasobów.

### 28. **Brak compression dla API responses**
**Status:** Next.js automatycznie kompresuje, ale sprawdzić czy działa  
**Rozwiązanie:** Upewnić się, że compression jest włączone w Vercel.

### 29. **Brak optymalizacji dla SSR hydration**
**Problem:** Niektóre komponenty mogą mieć hydration mismatch  
**Rozwiązanie:** Sprawdzić wszystkie komponenty używające `window`/`localStorage` w useEffect.

### 30. **Brak monitoring wydajności**
**Status:** Brak APM (Application Performance Monitoring)  
**Rozwiązanie:** Rozważyć dodanie Sentry, Vercel Analytics lub podobnego narzędzia.

---

## 📊 Podsumowanie Statystyk

- **Krytyczne:** 4 problemy
- **Wysokie:** 8 problemów  
- **Średnie:** 10 problemów
- **Niskie:** 6 problemów
- **Razem:** 28 problemów

## 🎯 Rekomendowane Priorytety Naprawy

1. **Faza 1 (Quick Wins - 1-2h):**
   - #1: Inline script dla motywu
   - #10: Dodaj sizes do Image
   - #23: Skróć transition-duration

2. **Faza 2 (Wysoki Wpływ - 4-6h):**
   - #2: Optymalizacja getRankingsDataset (paginacja/limity)
   - #4: Cache headers w API routes
   - #11: Cache dla getCompanies
   - #3: Dynamic import dla Tiptap

3. **Faza 3 (Średni Wpływ - 8-12h):**
   - #5: Code splitting dla RankingsExplorer
   - #8: React.memo dla list
   - #9: prefers-reduced-motion dla Aurora
   - #12: Filtrowanie w WHERE clause

4. **Faza 4 (Długoterminowe - 16h+):**
   - #19: Indeksy w bazie danych
   - #20: Batch processing dla ranking history
   - #15: Virtualizacja dla DataTable
   - #21: Conditional rendering dla mobile

---

**Ostatnia aktualizacja:** 2025-01-XX  
**Autor:** AI Assistant (Composer)

