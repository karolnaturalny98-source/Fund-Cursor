# ui-requirements.md
Minimalne wymagania UI, które muszą zostać wdrożone w frontendzie v2.

Ten dokument określa elementy **obowiązkowe**, niezależne od stron znalezionych w audycie.  
Wszystkie pozostałe komponenty agent dobiera samodzielnie na podstawie:
- audytu (`frontend-audit-v1.md`),
- funkcji aplikacji,
- theme,
- stylu Aceternity.

---



# 1. Globalne wymagania UI

1. **Nowy, spójny UI/UX — żadnego reuse legacy UI**
   - wszystkie komponenty wizualne mają być stworzone w v2 od zera,
   - layout, karty, tabela, przyciski → nowe,
   - styl: Aceternity (dark, clean, gradient accents),
   - theme: CSS variables z TweakCN.

2. **Komponenty muszą być zbudowane z:**
   - **shadcn/ui (nowa instalacja)**
   - **ReactBits** (tabele, zaawansowane patterny)
   - **Aceternity UI** (layouty, hero, gradient cards)
   - Tailwind 4

3. **Responsywność obowiązkowa**
   - mobile → tablet → desktop
   - layout bez rozjeżdżania

4. **Wszędzie używaj theme (`hsl(var(--...))`)**

---

# 2. Obowiązkowe komponenty i sekcje

Te elementy muszą pojawić się w v2 bez względu na to, jakie strony ma aplikacja.

## 2.1 Navbar (wymagany)
- nowy Navbar stworzony od zera,
- inspirowany Aceternity UI,
- ciemny, minimalistyczny,
- elementy:
  - logo / nazwa,
  - nawigacja do głównych stron (wywnioskowanych z audytu),
  - przycisk CTA (gradient),
  - integracja z Clerk:
    - avatar jeśli zalogowany,
    - lub przycisk logowania.

Navbar jest częścią:
`src/app/(v2)/layout.tsx`.

---

## 2.2 Hero section (wymagana na stronie głównej v2)
- duży, nowoczesny headline (np. „Compare prop firms instantly”),
- krótki opis,
- gradientowy button CTA,
- styl: Aceternity (duże odstępy, minimalizm, jasna typografia).

---

## 2.3 Hover Gradient Card (wymagana na stronie głównej v2)
- karta inspirowana kartami Aceternity:
  - lekki glow,
  - gradient green→blue (lub zgodny z theme),
  - duży border-radius,
  - ciemne tło,
- interakcja: powiększenie / rozświetlenie przy hover.

---

## 2.4 Tabela danych (ranking firm) – obowiązkowa
- musi być zbudowana w v2 na:
  - ReactBits Data Table lub shadcn table pattern,
- musi mieć wsparcie dla:
  - sortowania,
  - filtrów (jeśli logika istnieje),
  - paginacji (jeśli istnieje),
- musi być ostylowana pod dark theme,
- dane pobierane z istniejącej logiki wykrytej w audycie.

# 3. Toolbox komponentów Aceternity / shadcn  
Agent ma traktować tę listę jako **toolbox**, z którego dobiera komponenty zależnie od funkcji sekcji.

To NIE jest lista obowiązkowa do pełnego użycia.

## 3.1 Paczki, które mają być dostępne (MCP shadcn add)

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
3.2 Zasada wyboru komponentów
Dla każdej sekcji strony agent wybiera najbardziej pasujący wzorzec z toolboxa.

Przykłady zastosowania:

Hero → hero-section-demo-1

Feature grid → features-section-demo-*

Hover cards → hover-border-gradient, card-spotlight

Story / timeline → timeline

Showcase → carousel, globe

Porównanie firm → @aceternity/compare

Grid premium → bento-grid

Highlighted cards → evervault-card, spotlight-card

Ważne:
Agent nie używa komponentów na siłę — tylko jeśli pasują do funkcji i UX danej strony.

4. Komponenty tworzone samodzielnie przez agenta
Agent tworzy własne elementy UI tylko wtedy, gdy:

toolbox Aceternity / shadcn nie zawiera odpowiedniego wzorca,

logika lub specyfika aplikacji wymaga customowego komponentu,

potrzeba specjalnej sekcji.

Może to być np.:

sekcja z wartościami,

blok informacyjny,

formularze shadcn,

custom cards,

custom layouts.

Wszystkie custom komponenty muszą:

być zbudowane w stylu Aceternity,

używać theme,

być responsywne,

nie pochodzić z legacy.




# 3.2 Komponenty wspólne, które agent tworzy sam w razie potrzeby

Agent tworzy samodzielnie **standardowy zestaw komponentów v2**, o ile ich potrzebuje:

- karty informacyjne (feature cards),
- sekcje (content sections),
- stat cards / value cards,
- formularze (z shadcn UI v2),
- modale/dialogi.

Każdy komponent:
- musi być zgodny ze stylem Aceternity,
- musi używać theme z TweakCN,
- NIE może pochodzić z legacy.

---

# 4. Spójność i jakość

Agent jest odpowiedzialny za:
- zachowanie spójnego gridu/layoutu,
- używanie jednorodnych spacingów,
- spójny styl ciemny + gradienty,
- pełną responsywność,
- dopasowanie wybranych komponentów do funkcjonalności aplikacji.

---

# 5. Podsumowanie

To są jedyne elementy, których wymagamy od v2 z góry:
- Navbar v2,
- Hero v2,
- Hover Gradient Card,
- Tabela danych/Rankingu,
- Cała reszta UI dobrana przez agenta zgodnie z audytem i stylem.

Resztę agent projektuje sam – zgodnie z zasadami opisanymi w `agents.md`.
