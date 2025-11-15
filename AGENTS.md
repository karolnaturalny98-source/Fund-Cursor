# Agents.md – Zasady pracy i kontekst projektu

## 1. Framework i stack technologiczny
- Projekt działa na **Next.js 14 (App Router)**  
- Stylowanie: **Tailwind CSS v4**  
- UI: **shadcn/ui + własne komponenty**  
- Animacje: **Framer Motion (opcjonalnie)**  
- Dane i logika backendowa: **WSZYSTKO już istnieje – nie zmieniaj API, hooków, endpointów ani modeli.**

## 2. Cel
Celem jest **pełna przebudowa UI (frontend)**, bez zmieniania logiki.  
Nowy wygląd jest tworzony na podstawie **screenów**, które dostarczę przed każdą sekcją.

Cały layout, spacing, typografia i komponenty mają zostać zbudowane **od nowa**, ale w oparciu o:
- shadcn/ui,
- Tailwind v4,
- minimalne własne utilsy (istniejące w globals.css).

## 3. Źródło stylu
Wszystkie decyzje wizualne mają pochodzić z **screenów, które dostarczam**.  
Jeżeli dostarczam link do komponentu z Aceternity UI lub innego źródła:
- należy go traktować jako **referencję stylu**,
- można go odtworzyć wizualnie,
- ale należy napisać go jako **nasz własny komponent shadcn + Tailwind**, bez kopiowania obcego kodu.

## 4. Tryb pracy (bardzo ważne)
Pracujemy **sekcja po sekcji**, od góry do dołu, według moich poleceń.
Uzywaj serwra mpc context7 jeśli nie wiesz jak poprawnie coś zaimplentować

Do shadcn bedziemy używać głownie registrów 
 Toolbox komponentów Aceternity / shadcn  
Agent ma traktować tę listę jako **toolbox**, z którego dobiera komponenty zależnie od funkcji sekcji.

Głownie tych bedziemy używać chyba ze powiem coś innego.

Paczki, które mają być dostępne (MCP shadcn add)

```bash
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
**Flow pracy:**
1. Ja mówię: „Zaczynamy od nawigacji”.
2. Dostarczam screen.
3. Ty przerabiasz tylko i wyłącznie tę jedną sekcję.
4. Po mojej akceptacji przechodzimy do następnej:  
   „Teraz robimy hero”  
   → dostarczam screen  
   → Ty robisz hero.
5. Powtarzamy proces, aż strona główna będzie ukończona.
6. Po ukończeniu strony głównej przechodzimy do kolejnych stron (np. `/firmy`, `/rankingi`, `/analizy`) w tym samym trybie.

Bez samodzielnego przechodzenia do kolejnych sekcji.  
Robimy **powoli, po kolei, precyzyjnie**.

## 5. Zasady implementacji UI
- Każdą sekcję twórz jako **oddzielny komponent** w folderze `components/home/*`
- Stosuj **czytelny, czysty JSX** bez zbędnych klas.
- Stosuj nowe spacingi zgodnie z Tailwind v4 + istniejącymi utilami (np. `fluid-section`, jeśli używane).
- Nie używaj starych komponentów ani starych styli — budujemy UI od nowa.

## 6. Co pozostaje bez zmian
- Logika pobierania danych  
- Logika rankingów, zapytań, firm  
- API i struktury danych  
- Typy TypeScript

Frontend ma być nowy, ale kompatybilny z istniejącymi danymi.

## 7. Kiedy potrzebne wyjaśnienia
Gdy coś nie wynika jasno ze screena albo nie wiesz:
- jaki gradient,  
- jakie odstępy,  
- jak rozmieścić elementy,

→ **zawsze pytaj mnie**, nie zgaduj.

## 8. Najważniejsza zasada
**Projekt jest budowany stricte według moich instrukcji.  
Najpierw ja pokazuję screen → Ty przerabiasz tylko to, co na screenie.**

## 9. Log postępu (bardzo ważne)
Agent musi po każdym zadaniu dopisywać postęp w pliku:

`docs/progress-log.md`

lub, jeśli plik nie istnieje — MA GO UTWORZYĆ.

### Format wpisów:
[Data] – [Sekcja / Strona]

Co zostało wykonane (konkretnie):

[plik] → działania

[nowy komponent] → opis roli

[usunięto / zastąpiono] → co i dlaczego

Status: Ukończone / W toku / Czeka na akceptację użytkownika


### Przykłady:


2025-11-16 – Strona główna – Sekcja 1: Nawigacja

Utworzono components/home/SiteNavbar.tsx

Zaimplementowano nową nawigację na podstawie screenów

Dodano nowy styl CTA z neon gradient border
Status: Czeka na akceptację

2025-11-16 – Strona główna – Sekcja 2: Hero

Zaimplementowano HeroSection w components/home/Hero.tsx

Dodano fluid spacing i nową typografię
Status: Ukończone


Agent musi prowadzić log **przez cały czas**, każdą sekcję.

## 9. Najważniejsza reguła
**Użytkownik prowadzi projekt krok po kroku.  
Agent robi tylko to, co jest opisane i potwierdzone screenami.**


STYL DESINGU APLIKACJI DO KOTREJ DĄŻYMY ZNAJDUJE SIĘ W /fund/public