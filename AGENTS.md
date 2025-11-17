# Repository Guidelines

## Project Structure & Module Organization
- `app/` hostuje trasy Next.js 16 (App Router) – grupy `(site)` i `(auth)` dla marketingu vs auth, `app/admin` i `app/panel` dla paneli.  
- Wspólne UI siedzi w `components/` (PascalCase pliki, colocated styles), logika współdzielona, hooki i zapytania w `lib/`.  
- Dokumentacja i audyty: `docs/global-audit.md` (stan systemu), `agent-style-audit.md` (UWAGA nt. CTA) są obowiązkową lekturą przed zmianami; produktowe specy w `docs/`/`PRD.md`.  
- Danych schemat: `prisma/` z `schema.prisma`, migracjami i `prisma.config.ts`. Statyczne assets w `public/`.  
- Testy trzymaj w `tests/unit/<feature>` lub `tests/e2e`; aktualnie katalog nie istnieje – przy dopisywaniu kodu dodawaj brakujące pliki testowe.

## Build, Test, and Development Commands
- `npm run dev`: Launch Turbopack dev server for local work.
- `npm run build` → `npm run start`: Produce and inspect the production build.
- `npm run lint` / `npm run lint:spacing`: Standard ESLint plus the custom fluid-spacing checker.
- `npm run test`: Full CI sweep (lint + unit tests).
- `npm run test:unit`: Run `tsx --test "tests/unit/**/*.test.ts"`.
- `npm run test:e2e`: Execute Playwright end-to-end suites.
- `npm run db:generate | db:push | db:seed`: Prisma client regen, schema push, and seed flow.

## Coding Style & Naming Conventions
- TypeScript (strict) z `tsconfig.json`; eksporty nazwane. `npm run lint` używa konfiguracji Next + `eslint-plugin-jsx-a11y`.  
- Tailwind 4 + tokeny z `theme.css.md` + implementacja w `app/globals.css`; trzymaj kolejność utili layout → spacing → kolor i używaj `fluid-*` tylko tam, gdzie to ma sens (CTA nie mogą być stylowane ad hoc, patrz `agent-style-audit.md`).  
- Zachowuj semantykę: komponent `Button` tylko dla natychmiastowych akcji, Linki i chipy muszą mieć poprawne role/focus. Wszelkie nowe CTA dokumentuj w audycie UI zanim trafią do PR.

## Testing & Quality Gates
- `npm run test` uruchamia lint + `tsx --test`; dodaj brakujące `*.test.ts(x)` w `tests/unit/`, szczególnie dla parserów filtrów i API.  
- `npm run test:e2e` (Playwright) dla krytycznych flow (auth, zakupy). Szybkie suite’y oznacz `parallel`.  
- `npm run lint:spacing` wymusza zgodność z fluid spacing – uruchamiaj przed PR.  
- `tsc --noEmit` obecnie pada (lista w `bugs.md`); każdy PR musi redukować liczbę błędów lub przynajmniej nie wprowadzać nowych.

## Commit & Pull Request Guidelines
- Krótkie, rzeczowe commity (`ui: fix CTA semantics`).  
- PR: opis + link do zadania (`#000` jeśli brak), zrzuty ekranu dla UI, informacja o zmianach schematu/env i status testów/lint/tsc (nawet jeśli aktualnie przegrywa – wskaż, które błędy ubyły).  
- Jeżeli dotykasz obszarów oznaczonych w `docs/global-audit.md` (CTA, rate-limit, testy), dopisz sekcję “Audit compliance” w opisie PR.

## Security & Configuration Tips
- Nigdy nie commituj sekretów; `.env.local` + opis w PR.  
- Komendy Prisma (`db:generate`, `db:push`, `db:seed`) uruchamiaj świadomie – wspomnij o ręcznych krokach.  
- Rate limiting (`lib/rate-limit.ts`) jest pamięciowy – jeśli modyfikujesz endpointy publiczne, rozważ globalny storage lub przynajmniej odnotuj limit w audycie.  
- UI tokens i motyw: jedyne źródło prawdy to `theme.css.md`; wszelkie zmiany konsultuj i aktualizuj dokument.
