# agents.md – wytyczne przebudowy frontendu v2

Jesteś agentem odpowiedzialnym za **przebudowę frontendu (v2)** tej aplikacji, na podstawie wykonanego wcześniej audytu (`docs/frontend-audit-v1.md`).

Aplikacji NIE znasz na pamięć – masz polegać na:
- kodzie,
- audycie (`frontend-audit-v1.md`),
- poniższych wytycznych.

---

## 1. Cel

- Stworzyć **nowy frontend v2** z **nowym UI/UX**.
- Zachować obecną **logikę, backend, dane, biznesowe flow**.
- **Nie korzystać z żadnego komponentu/stylu legacy UI** – wszystko po stronie wyglądu ma być napisane od nowa.

---

## 2. Twarde zasady

1. **Zero reuse legacy UI**

   - NIE importujesz żadnych komponentów UI, layoutów ani styli ze starego frontu.
   - Nie kopiujesz JSX ani klas CSS z legacy.
   - Możesz używać TYLKO:
     - istniejących hooków/logiki biznesowej (np. `useXXX`, serwisy API, utils),
     - endpointów `/api/*`,
     - konfiguracji Clerk, Prisma, itp.

2. **Nowy frontend tylko w `src/app/(v2)`**

   Cały nowy frontend v2 umieszczasz w drzewie:

   - `src/app/(v2)/layout.tsx`
   - `src/app/(v2)/page.tsx` (home v2)
   - `src/app/(v2)/[...route]/page.tsx`
   - `src/app/(v2)/components/**`
   - opcjonalne: `src/app/(v2)/hooks/**`, jeśli potrzebujesz hooków specyficznych dla v2.

   Legacy `src/app` (bez `(v2)`) służy wyłącznie jako referencja logiczna (do audytu i zrozumienia flow).

3. **Nowy shadcn/ui tylko dla v2**

   - Inicjalizujesz shadcn/ui dla v2.
   - Komponenty generujesz np. do:
     - `src/app/(v2)/components/ui`.
   - NIE używasz komponentów shadcn wygenerowanych wcześniej (legacy).

4. **Backend / Clerk / Prisma bez zmian**

   - Nie zmieniasz kontraktów API (`/api/*`), modeli Prisma, konfiguracji Clerk.
   - Jeśli musisz dodać nowy endpoint – zrób to w sposób spójny, ale **celem tej przebudowy jest UI**, nie rewolucja API.

---
## 2.5 Wymaganie dotyczące MCP (Model Context Protocol)

Podczas budowy frontendu v2 musisz w pełni korzystać z dostępnych MCP serwerów, w szczególności:

---

### ✔ MCP shadcn registry
- Wszystkie komponenty shadcn/ui **pobierasz i generujesz** wyłącznie poprzez MCP shadcn registry.
- Nie używasz:
  - lokalnych/legacy komponentów shadcn,
  - starych wygenerowanych wersji,
  - manualnych kopii z poprzedniego frontu.
- Każdy nowy komponent shadcn musi pochodzić z **aktualnego MCP shadcn registry**.

---

### ✔ MCP Context7 (https://context7.com)
- Masz obowiązek korzystać z MCP Context7 jako autorytatywnego źródła:
  - dokumentacji bibliotek,
  - przykładowych implementacji,
  - snippetów, utili, hooków,
  - patternów UI,
  - aktualnych API dla bibliotek wykorzystywanych w projekcie.
- Jeśli Context7 udostępnia:
  - hook,
  - utility,
  - pattern shadcn,
  - pattern layoutu,
  - komponent lub snippet,
  
  który pasuje do danej funkcji/ekranu — **powinieneś go użyć**.

- Context7 ma pierwszeństwo nad:
  - legacy kodem,
  - własnymi improwizowanymi implementacjami,
  - niespójnymi komponentami.

---

### Zasada nadrzędna:

> **Jeśli dany komponent, hook, wzorzec lub implementacja jest dostępna w MCP shadcn registry lub MCP Context7, użyj go ZAMIAST:**
> - tworzenia komponentu od zera,
> - kopiowania kodu z legacy,
> - używania jakiejkolwiek nieaktualnej wersji.

Celem jest:
- maksymalna spójność,
- aktualność,
- zgodność z najlepszymi praktykami shadcn/ui + Tailwind 4,
- pełne wykorzystanie zasobów MPC/MCP zamiast kodu legacy.

## 3. Styl i theme v2

### 3.1 Styl ogólny
4. Toolbox komponentów Aceternity / shadcn

(Agent dobiera komponenty na podstawie funkcji sekcji i wyników audytu)

To jest toolbox, nie sztywna lista do użycia wszędzie.
Agent ma:

zainstalować te paczki przez MCP,

używać ich tam, gdzie pasują funkcjonalnie,

ignorować je tam, gdzie nie mają sensu.

Instalacje (MCP shadcn add):
@aceternity/resizable-navbar
@aceternity/evervault-card
@aceternity/card-spotlight
@aceternity/hero-section-demo-1
@aceternity/carousel
@aceternity/tracing-beam
@aceternity/compare
@aceternity/sparkles
@aceternity/features-section-demo-1
@aceternity/features-section-demo-2
@aceternity/features-section-demo-3
@aceternity/animated-tooltip
@aceternity/typewriter-effect
@aceternity/hover-border-gradient
@aceternity/3d-pin
@aceternity/timeline
@aceternity/bento-grid
@aceternity/globe
@aceternity/expandable-card-demo-standard
@aceternity/expandable-card-demo-grid

Jak dobierać komponenty

Agent ma wybierać komponenty na podstawie sekcji, np.:

Hero → hero-section-demo-1

Hover card → hover-border-gradient / card-spotlight

Porównanie → @aceternity/compare

Features → features-section-demo-*

Timeline → @aceternity/timeline

Bento grid → @aceternity/bento-grid

Showcase → carousel, globe, 3d-pin

Agent nie może wrzucić wszystkich komponentów wszędzie — wybiera je tylko wtedy, gdy pasują do funkcji strony.
Frontend v2 ma być wizualnie zbliżony do **strony Aceternity UI**:

- dark theme:
  - tło prawie czarne,
  - białe / jasne nagłówki,
  - jasnoszary tekst pomocniczy,
- płynne layouty, duże odstępy, nowoczesny SaaS,
- **gradientowe akcenty** (np. zielony → niebieski) używane:
  - na przyciskach CTA,
  - na hover/feature cards,
  - na badge typu „PRO”.

Dobierając komponenty z registry, zawsze dbaj, żeby:
- były wizualnie kompatybilne z tym stylem,
- nie wprowadzały chaosu (np. innych palet kolorów).

### 3.2 Theme z TweakCN

Theme kolorów, radius itd. jest zdefiniowany w osobnym pliku (np. `theme.css.md`) jako blok:

```css
:root {
  /* tutaj znajduje się dokładny bloczek zmiennych CSS (HSL) wygenerowany w TweakCN */
}

Twoje obowiązki:

używasz tych zmiennych tak jak są (HSL),

nie konwertujesz ich na RGB/HEX,

w tailwind.config mapujesz kolory tak, aby korzystały z hsl(var(--...)) (np. background, foreground, primary, itd.),

wszystkie nowe komponenty v2 (shadcn, ReactBits, Aceternity) stylizujesz w oparciu o ten theme.

4. Zakres technologiczny v2

W v2 używasz:

Next.js App Router (src/app/(v2)),

Tailwind CSS 4,

shadcn/ui (nowa instalacja dla v2),

ReactBits / shadcn registry – do tabel, forms i zaawansowanych patternów,

Aceternity UI – do hero, sekcji, hover/feature cards, layoutów.

Priorytety:

Tam gdzie istnieje odpowiedni komponent w shadcn/ReactBits – użyj go i ostyluj.

Tam gdzie potrzebujesz „wow-efektu” i sekcji marketingowej – użyj Aceternity UI.

Unikaj pisania zupełnie własnych prymitywów, jeśli możesz oprzeć się na tych bibliotekach.

5. Obowiązkowe elementy v2 (to, co z góry ustalamy)

Resztę dobierasz sam – patrz sekcja 6.

5.1 Navbar

Zaimplementuj nowy Navbar v2, w stylu Aceternity:

ciemny pasek,

logo/nazwa po lewej,

podstawowe linki (na podstawie routów z audytu),

przycisk CTA w stylu gradientowym,

integracja z Clerk (avatar / logowanie).

Navbar ma być używany w globalnym layoutcie src/app/(v2)/layout.tsx.

5.2 Hero + Hover/Feature Card na stronie głównej

Na home v2 (nowa src/app/(v2)/page.tsx) musi być:

hero sekcja:

duży nagłówek opisujący, że to porównywarka firm prop tradingowych,

krótki opis,

CTA (gradientowy button),

obok / poniżej:

hover/feature card z gradientem, inspirowana kartami z Aceternity (takimi jak na dostarczonych screenach),

karta ma używać gradientu z theme (np. zielony → niebieski), dużego radiusa, lekkiego glow na hover.

6. Dobór komponentów dla reszty UI

Poza Navbar + Hero/Hover:

Masz pełną swobodę w wyborze komponentów z:

shadcn/ui,

ReactBits,

Aceternity UI.

Twoje zadanie:

Przeczytać audyt (frontend-audit-v1.md) i dokładnie zrozumieć:

jakie są strony,

jaką pełnią funkcję (ranking, szczegóły, porównanie, ustawienia, onboarding, itp.),

jakie dane i akcje użytkownika są na każdej stronie.

Dla każdej strony z audytu, gdy będziesz ją przepisywać do v2:

tworzysz odpowiadający route w src/app/(v2)/.../page.tsx,

korzystasz z istniejącej logiki (hooki, serwisy, endpointy), ALE:

UI budujesz od nowa,

komponenty dobierasz sam na podstawie:

funkcji strony (co użytkownik robi),

stylu (dark + gradient Aceternity),

rodzaju danych (lista, szczegóły, formularz, tabela, wizard, itp.).

Przykłady decyzji, które podejmujesz sam (nie są z góry narzucone):

Tabela rankingu:

wybierz odpowiedni DataTable pattern z ReactBits / shadcn,

ostyluj go pod dark theme,

zapewnij sort, filtry, paginację, jeśli logika na to pozwala.

Szczegóły firmy:

dobierz layout z kartami, tabami, statystykami,

możesz użyć vertical tabs / accordion / cards z shadcn/Aceternity.

Porównanie firm:

wybierz layout porównawczy (kolumny, cards, table),

dostosuj komponenty tak, żeby porównanie było czytelne.

Jeśli w dokumentach/promptach nie masz narzuconej nazwy komponentu – to Ty wybierasz najlepszy wariant z registry.

7. Kolejność prac (wysoki poziom)

Zakładamy, że audyt (frontend-audit-v1.md) jest gotowy.

Setup v2:

stwórz drzewo src/app/(v2),

skonfiguruj Tailwind 4 + theme z TweakCN,

zainicjalizuj shadcn/ui dla v2,

zintegruj Aceternity + ReactBits,

dodaj styleguide v2 dla testu komponentów.

Globalny layout + Navbar + Shell:

zaimplementuj layout layout.tsx v2 z Navbar + głównym kontenerem.

Home v2:

hero + hover/feature card,

tabela rankingu podpięta do istniejącej logiki.

Pozostałe strony (według priorytetów z audytu):

przepisywanie kolejnych routów do v2:

dla każdej strony:

stwórz nowy plik page.tsx w (v2),

podłącz istniejącą logikę,

dobierz komponenty z registry zgodnie z tym dokumentem,

po ukończeniu – oznacz stronę jako zmigrowaną (w audycie).

QA i dopieszczenie:

sprawdź responsywność,

stany loading/empty/error,

spójność stylu między widokami,

brak importów z legacy UI.

8. Co jest najważniejsze z punktu widzenia właściciela projektu

v2 ma wyglądać jak nowoczesna, ciemna aplikacja typu SaaS w stylu Aceternity,

ma być spójna wizualnie – niezależnie od ilości stron,

agent:

sam dobiera komponenty z registry do funkcji ekranu,

bazuje na audycie, a nie na zgadywaniu,

nie dotyka backendu i logiki biznesowej poza potrzebnym okablowaniem pod nowy UI.

Jeżeli coś nie jest wprost określone – wybierasz rozwiązanie:

zgodne z theme z TweakCN,

zgodne ze stylem Aceternity,

maksymalnie czytelne dla użytkownika porównującego firmy prop tradingowe.


## 9. Obowiązek raportowania i logowania postępów

Podczas realizacji przebudowy frontendu v2 masz obowiązek prowadzić regularny dziennik postępów i raportować każde zakończone zadanie.

### ✔ 9.1 Plik postępów
Utwórz plik:

`docs/frontend-v2-progress.md`

W tym pliku zapisujesz:

- każdy krok pracy,
- każdą zmigrowaną stronę,
- każdy wykonany etap (setup, layout, komponenty, routy),
- decyzje projektowe i techniczne (np. wybór komponentu z MCP),
- linki do nowych plików i commitów (jeśli dotyczy).

### ✔ 9.2 Format wpisu w dzienniku

Każdy wpis powinien mieć:

[DATA] – [ETAP / MODUŁ]

Co zostało wykonane:

...

Jakich komponentów użyto (shadcn / ReactBits / Aceternity):

...

Z jakiej logiki / API skorzystano:

...

Dlaczego podjęto tę decyzję:

...

Stan: DONE / IN PROGRESS / BLOCKED


### ✔ 9.3 Raportowanie na bieżąco
Po każdej większej zmianie agent:

- dopisuje wpis do `frontend-v2-progress.md`,
- w odpowiedzi do użytkownika informuje krótko:
  - **co zostało ukończone**,  
  - **co aktualnie robi**,  
  - **co będzie robione później**.

### ✔ 9.4 Zachowanie przejrzystości
- ŻADNE zmiany w v2 nie mogą być „niewidoczne”.
- Każdy krok ma być udokumentowany w logu postępów.
- Log musi pozwolić nowemu agentowi lub człowiekowi przejąć projekt w dowolnym momencie.