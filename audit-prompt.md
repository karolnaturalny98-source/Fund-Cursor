# audit-prompt.md

Jesteś agentem, który ma **po raz pierwszy poznać tę aplikację** i przygotować pełny AUDYT frontendu (App Router) + powiązanej logiki.

Na tym etapie:
- **NICZEGO nie przebudowujesz**,
- **NIE zmieniasz żadnych plików** (tylko odczyt / analiza),
- Twoim celem jest **zrozumieć, co ta aplikacja robi i jak jest zbudowana**,
- wynik audytu masz opisać w osobnym pliku `.md`.

---

## 1. Kontekst techniczny (który znasz, ale nie znasz kodu)

- Framework: Next.js (App Router, `src/app`)
- Stylizacja: Tailwind CSS + shadcn/ui (legacy, nie dotykać na razie)
- Backend: Next.js Route Handlers (`/api/*`)
- Auth: Clerk
- ORM: Prisma
- Baza: PostgreSQL (Neon)
- Hosting: Vercel

Aplikacja jest **porównywarką firm prop tradingowych**, ale:
- Twoim zadaniem jest TO POTWIERDZIĆ na podstawie kodu,
- i dokładnie opisać, jak to jest zrobione.

---

## 2. Cel audytu

Twoim zadaniem jest:

1. **Odnaleźć i opisać wszystkie strony / routy** w `src/app/**`.
2. **Zrozumieć logikę frontu**:
   - skąd pochodzą dane,
   - jakie hooki i serwisy są używane,
   - jakie są główne flow użytkownika.
3. **Zidentyfikować kluczowe elementy, które później trzeba będzie przepisać w v2**:
   - strony o wysokim znaczeniu biznesowym,
   - wspólne layouty,
   - główne komponenty UI (bez wchodzenia w szczegóły stylu),
   - powiązanie z backendem (`/api/*`), Clerk, Prisma.

Na końcu masz przygotować **czytelną mapę aplikacji**, która pozwoli Ci później zaplanować przebudowę frontendu v2.

---

## 3. Zakres analizy – co dokładnie masz przejrzeć

Przejrzyj co najmniej:

- `src/app/**` (wszystkie routy App Routera),
- `src/components/**` (wspólne komponenty),
- `src/lib/**`, `src/core/**`, `src/hooks/**` (jeśli istnieją),
- `src/app/api/**` (route handlers – tylko z punktu widzenia tego, co zużywa frontend).

Nie zmieniaj tych plików – tylko odczyt i opis.

---

## 4. Co masz przygotować jako wynik

W repozytorium utwórz nowy plik:

`docs/frontend-audit-v1.md`

i w nim opisz wszystko w poniższym formacie.

### 4.1. Sekcja: Overview (opis ogólny)

- Krótkie streszczenie:
  - czym jest aplikacja (na podstawie kodu, nazw, tekstów),
  - jakie są główne funkcje (np. „ranking firm”, „szczegóły firmy”, „porównanie”, „konto usera”, itp. – jeśli to wynika z kodu),
  - jakie są najważniejsze „typy ekranów” (lista, szczegóły, dashboard, formularze, itp.).

### 4.2. Sekcja: Routes (mapa stron)

Utwórz tabelę (`markdown table`) ze stronami (na podstawie App Routera):

- **path** – np. `/`, `/firms`, `/firms/[slug]`, `/compare`, `/settings`, itp.
- **plik** – ścieżka do pliku `page.tsx` / layoutu,
- **opis** – 1–2 zdania, co ta strona robi (na podstawie kodu),
- **ważność** – `high`, `medium`, `low` (na podstawie Twojej oceny biznesowej).

Przykład struktury (treść wymyślasz na podstawie kodu):

| path              | file                                   | description                             | priority |
|-------------------|----------------------------------------|-----------------------------------------|----------|
| `/`               | `src/app/page.tsx`                     | Home / główny widok aplikacji           | high     |
| `/firms`          | `src/app/firms/page.tsx`               | Lista firm prop tradingowych            | high     |
| `/firms/[slug]`   | `src/app/firms/[slug]/page.tsx`        | Szczegóły wybranej firmy                | high     |
| `/settings`       | `src/app/settings/page.tsx`            | Ustawienia użytkownika                  | medium   |

(NIE zgaduj – wszystko wyciągaj z kodu.)

### 4.3. Sekcja: Layouts & Providers

- Wypisz:
  - wszystkie **layouty** w `src/app/**` (np. `layout.tsx`, nested layouty),
  - globalne providery (Clerk, ThemeProvider, QueryClient, itp.).
- Do każdego:
  - opisz, za co odpowiada,
  - gdzie jest używany.

### 4.4. Sekcja: Shared components

- Lista najważniejszych komponentów używanych wielokrotnie (z legacy), np.:
  - tabele,
  - karty,
  - formularze,
  - modale,
  - nawigacja.
- Dla każdego:
  - ścieżka pliku,
  - krótki opis roli.

(Ta sekcja służy tylko do zrozumienia, **co** będzie przepisywane – w v2 nie użyjesz tego UI 1:1.)

### 4.5. Sekcja: Data & Logic

- Opisz, **skąd frontend bierze dane**:
  - które hooki/serwisy są odpowiedzialne za pobieranie danych (np. `useFirms`, `useRanking`, itp. – nazwy z kodu),
  - z jakimi endpointami `/api/*` się łączą,
  - jakie są główne obiekty / typy danych (np. `Firm`, `RankingEntry`, itp.).
- Wypisz najważniejsze flow:
  - np. „jak użytkownik przechodzi od rankingu do szczegółów firmy” – na podstawie routera/linków, nie z głowy.

### 4.6. Sekcja: UX / Flow (tylko logicznie)

Krótko opisz, **jak z kodu wynika przepływ użytkownika**, bez skupiania się na stylu:

- Jak wygląda typowa ścieżka usera?
- Jakie kroki podejmuje, żeby:
  - znaleźć firmę,
  - zobaczyć szczegóły,
  - porównać dwie/trzy firmy,
  - zalogować się / zarejestrować (na podstawie istniejącego frontu).

---

## 5. Ważne ograniczenia

- Na tym etapie:
  - **nie tworzysz nowego frontendu v2**,
  - **nie zmieniasz stylów**, nie dodajesz nowych komponentów,
  - skupiasz się TYLKO na poznaniu istniejącej aplikacji i opisaniu jej w `docs/frontend-audit-v1.md`.
- Nie zakładasz niczego „na czuja” – opierasz się tylko na tym, co widzisz w kodzie.
- Ten audyt ma być na tyle dokładny, żeby:
  - inny agent (albo Ty później) mógł na jego podstawie bez problemu zaplanować przebudowę frontu na v2.

---

## 6. Output końcowy

Kiedy skończysz:

1. Plik `docs/frontend-audit-v1.md` jest kompletny i czytelny,
2. Daje pełen obraz:
   - jakie są strony,
   - jak działa logika,
   - jakie są kluczowe komponenty i data flows,
3. **Nie dokonałeś żadnej zmiany w implementacji**, tylko analizę.


## 7. Lista stron do przebudowy i priorytetyzacja

Na podstawie pełnej analizy kodu w `src/app/**`, masz obowiązek przygotować:

### ✔ 7.1 Kompletną listę wszystkich stron aplikacji

W formie tabeli:

| path | file | opis | priorytet |

gdzie priorytet oceniasz na podstawie znaczenia funkcji biznesowej:
- **HIGH** – kluczowe flow (ranking, lista firm, szczegóły firmy, porównanie, onboarding itp.)
- **MEDIUM** – ustawienia, konto, dashboard, profile
- **LOW** – FAQ, pricing, statyczne podstrony

### ✔ 7.2 Kolejność przebudowy v2

Na końcu audytu masz stworzyć **zalecaną kolejność migracji**, zgodnie z poniższą logiką:

1. Setup v2 (theme, Tailwind 4, shadcn via MCP, ReactBits, Aceternity)
2. Global layout (layout.tsx + Navbar)
3. Strona główna (Hero + HoverCard + tabela)
4. Strony HIGH (wg listy)
5. Strony MEDIUM
6. Strony LOW
7. QA i polish

**Kolejność ta ma być generowana automatycznie na podstawie audytu.**

### ✔ 7.3 Podsumowanie „Plan migracji v2”
Na końcu pliku audytu dodaj:

- listę stron w kolejności przebudowy,
- krótkie uzasadnienie kolejności (dlaczego taka),
- informację które strony są zależne od których (np. lista → szczegóły → porównanie).

Ta lista będzie punktem startowym dla implementacji v2.