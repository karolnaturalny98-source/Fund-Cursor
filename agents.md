# FundedRank – Agents Guide

Ten dokument definiuje zasady pracy agentów AI w repozytorium FundedRank.

Celem jest:
- utrzymanie pełnej, rozbudowanej aplikacji (landing, rankingi, firmy, analizy, opinie, sklep, baza wiedzy, panel użytkownika, panel admina),
- poprawa bezpieczeństwa i wydajności,
- uproszczenie UX (szczególnie strony głównej),
- uporządkowanie stylów i layoutów,
- zachowanie stabilności biznesowej (afiliacja + cashback).

---

## 1. Zakres odpowiedzialności

Agenci AI mogą:

- refaktorować kod frontendu (Next.js + React + shadcn/ui + Tailwind v4),
- wprowadzać zmiany w layoutach, komponentach, stylach,
- wprowadzać poprawki bezpieczeństwa w API,
- poprawiać wydajność (SSR, cachowanie, paginacja, zapytania),
- porządkować strukturę plików i komponentów,
- aktualizować dokumentację w `docs/*`.

Agenci NIE mogą bez wyraźnego celu:

- usuwać głównych funkcjonalności (rankingi, firmy, opinie, analizy, sklep, panel user, admin),
- zmieniać modelu danych w sposób, który łamie istniejące flow biznesowe (bez powodu),
- przeprowadzać inwazyjnych migracji bazy bez jasnego uzasadnienia i dokumentacji.

---

## 2. Źródła prawdy

Priorytet źródeł informacji:

1. **Kod i konfiguracja**:
   - `app/`, `components/`, `lib/`, `prisma/`, `app/api/*`, `app/layout.tsx`
2. **Dokumentacja techniczna**:
   - `docs/current-architecture.md`
   - `docs/styles-audit.md`
   - `docs/data-api-audit.md`
   - `docs/audit-summary.md`
   - `docs/refactor-plan.md` (gdy istnieje)
3. **Ten plik `agents.md`**

Stare notatki, outputy agentów, szkice (`*.md`, `*.mdc`, `*.txt` w folderach typu `notes/`, `old/`, `tmp/`, `playground/`) są **historyczne** i **nie są źródłem prawdy**.  
Jeśli są sprzeczne z kodem – zawsze wygrywa kod.

---

## 3. Tech stack i biblioteki

- Framework: **Next.js App Router**
- UI: **React**, **shadcn/ui**, **Tailwind CSS v4**
- Stylizacja: inline klasy + utilsy `fluid-*` i `glass-*` z `app/globals.css`
- Autoryzacja: **Clerk**
- ORM: **Prisma**
- Baza: **PostgreSQL (Neon)**
- API: Next.js route handlers pod `app/api/*`
- Kontekst: dostęp do dokumentacji **shadcn/ui** i **mpc context7**

Zasady:

- shadcn/ui jest głównym zestawem komponentów bazowych.
- Tailwind v4 + `@utility` / `@theme` z `globals.css` to aktywny system stylizacji.
- W miarę refaktoru można stopniowo wprowadzać `tailwind.config.ts` (opisane w `refactor-plan.md`).

---

## 4. Zasady stylów

1. **Nie dodawaj nowych frameworków stylizacji** (brak SCSS, styled-components itp.).
2. Docelowo:
   - kolory, spacing, typografia → powinny być skoncentrowane w:
     - `tailwind.config.ts` (stopniowo),
     - `app/globals.css` (obecne fluid-utils).
3. Używaj:
   - komponentów shadcn (`components/ui/*`) jako bazy,
   - helpera `cn` + `tailwind-merge`.
4. Unikaj:
   - nowych klas z `!important` bez uzasadnienia,
   - ręcznych `px-[clamp(...)]` tam, gdzie istnieją `fluid-*`,
   - lokalnych gradientów, jeśli istnieje globalny util (np. dla CTA).
5. Napraw:
   - zdefiniuj brakujące klasy używane w layoutach (np. `glass-premium`),
   - stopniowo redukuj duplikaty gradientów i cieni (według `refactor-plan.md`).

W Etapie 8 dozwolone jest wykorzystywanie gotowych bloków z rejestrów (np. Aceternity) jako inspiracji UI, ale każdy blok musi zostać przepisany na shadcn/ui + Tailwind zgodnie z naszym theme

---

## 5. Zasady architektury i routingów

1. Zachowujemy pełny zestaw route’ów:
   - landing `/`
   - `/firmy`, `/firmy/[slug]`, `/firmy/compare`
   - `/rankingi`
   - `/opinie`
   - `/analizy`, `/analizy/[...slugs]`
   - `/affilacja`
   - `/sklep`
   - `/baza-wiedzy`, `/baza-wiedzy/[slug]`
   - `/o-nas`
   - `/panel`
   - `/admin/(tabs)/*`
2. **Landing `/`**:
   - docelowo ma być **“one-page core”**: hero + ranking + top cashback + marketing + społeczność + CTA.
   - Kompozycja opisana w `docs/refactor-plan.md`.
3. **Aurora / tło WebGL**:
   - nie powielaj `AuroraWrapper` na każdej stronie.
   - publiczny segment aplikacji (`app/(site)/*`) obejmuje landing, rankingi, firmy, opinie, analizy i content – korzysta ze wspólnego layoutu `app/(site)/layout.tsx`, który wstrzykuje aurorę i kontroluje tło (szczegóły w `refactor-plan.md`).
4. **Strona firmy** (`/firmy/[slug]`):
   - powinna zostać rozbita na mniejsze moduły (sekcje) zamiast jednego monolitu,
   - SSR ma być zachowany, ale można wprowadzić lazy-loading wybranych części (np. recenzje).
5. **Panel użytkownika**:
   - istnieją dwie formy: globalny `UserPanel` + `/panel`.
   - w refaktorze dążyć do współdzielonych komponentów i hooków danych, aby nie duplikować logiki.

---

## 6. Zasady API i bezpieczeństwa

Priorytet P1 (naprawić jak najszybciej):

- `/api/cashback`:
  - użytkownik NIE może samodzielnie tworzyć transakcji o dowolnym statusie i dowolnej liczbie punktów.
  - statusy i wartości muszą być weryfikowane serwerowo.
  - operacje “manual cashback” powinny być dostępne tylko dla admina (np. osobny endpoint lub `assertAdminRequest`).
- `/api/admin/newsletter` i `/api/admin/newsletter/[id]`:
  - MUSZĄ używać `assertAdminRequest` (rola admin).
  - Tylko admin może pobierać, edytować i usuwać subskrybentów.

Ogólne zasady:

- wszystkie endpointy admina muszą przechodzić przez `assertAdminRequest`,
- dodać rate limiting (np. do newslettera, zgłoszeń, `/api/clicks`),
- po mutacji zawsze wywoływać `revalidateTag`/`revalidatePath`, zgodnie z istniejącym stylem.

---

## 7. Proces pracy agenta

Każda większa zmiana powinna przebiegać w krokach:

1. **Przeczytaj**:
   - ten plik (`agents.md`),
   - `docs/audit-summary.md`,
   - odpowiednią sekcję `docs/refactor-plan.md`.
2. **Zaproponuj konkretne zmiany**:
   - zlokalizuj pliki,
   - zidentyfikuj komponenty, które wymagają modyfikacji.
3. **Wprowadź zmiany inkrementalnie**:
   - małe, spójne kroki (np. tylko layout strony głównej, tylko Aurora layout, tylko jeden endpoint).
4. **Uruchom**:
   - `lint`, `typecheck`, `build` (jeśli dostępne)
   - popraw błędy.
5. **Zaktualizuj dokumentację**:
   - jeśli zmieniasz architekturę, layout, API – uzupełnij `docs/refactor-plan.md` lub dodaj krótką sekcję w `docs/changes-log.md` (jeśli taki plik zostanie utworzony).
6. **Nie usuwaj funkcjonalności**:
   - jeżeli coś jest przestarzałe, oznacz jako `LEGACY` i opisz w dokumentacji, zamiast usuwać w ciemno.

---

## 8. Czego nie robić

- Nie wprowadzaj nowych głównych bibliotek UI (MUI, Chakra, Bootstrap, styled-components, SCSS itp.).
- Nie zmieniaj kontraktu API (kształt payloadów) bez aktualizacji wszystkich konsumentów i opisania tego w `docs/refactor-plan.md`.
- Nie wprowadzaj globalnych “magicznych” wrapperów, które zmieniają zachowanie całej aplikacji bez precyzyjnej dokumentacji.
- Nie usuwaj stron / route’ów zdefiniowanych w `current-architecture.md`, chyba że zostało to WYRAŹNIE opisane w `docs/refactor-plan.md` i zatwierdzone.

---

## 9. Cele końcowe (definition of done – high level)

- Strona główna `/` działa jako jeden, spójny one-page core pod konwersję (ranking + CTA + cashback).
- Strona firmy jest modularna, wydajna, łatwa w edycji.
- Aurora i tła są kontrolowane przez layouty, a nie przez copy-paste.
- Stylowanie jest spójne, zdefiniowane w jednym systemie (Tailwind v4 + config + utilities).
- API jest bezpieczne (szczególnie cashback i newsletter), z sensownym cachowaniem i rewalidacją.
- Panel użytkownika i globalny panel korzystają z tych samych źródeł danych bez zbędnej duplikacji logiki.
