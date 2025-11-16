# Fund – UI Style Guide
Analiza na podstawie screenów `public/s1.png`–`public/s6.png`. Dokument stanowi referencję dla wszystkich przyszłych implementacji frontendu.

## Color Palette & Effects
- **Tła:** #050505 do #0B0B0B z delikatnym vignette gradientem. Druga warstwa sekcji (karty, panele) – #151515/#1E1E1E z ledwo widoczną poświatą.
- **Tekst:** nagłówki i CTA w #F5F5F5; body copy w #9EA0A4; pomocnicze elementy (ikony, opisy) w #7A7A7D.
- **Akcenty neonowe:** aqua #4BF0FF, emerald #00F37F, electric blue #3B7BFF, magenta glow #CC4EFF. Stosujemy w gradientach i obry­sach pillów.
- **Gradienty:** radialne lub diagonalne (np. emerald→aqua→blue). Każdy gradient ma miękki blur, często dodatkową warstwę noise/grid.
- **Obrysy:** 1px półprzezroczysty (#1F1F1F) wokół kart; neonowe chipsy mają subtelny wewnętrzny cień i outer glow.

## Typography
- **Font:** mocny grotesk sans (np. Satoshi/Inter) z odważnym kontrastem i minimalnym trackingiem (-1%).
- **Hero Headline:** 80–96px / 110% line-height. Pojedyncze słowa wyróżniamy kapsułą lub gradientową belką.
- **Sekcyjne nagłówki:** 36–48px / 120%. Wspólna hierarchia – wszystkie tytuły lewostronne.
- **Body copy:** 16–18px, 150% line-height, średnia waga. Krótkie akapity, maks 60 znaków na wiersz.
- **CTA/Badge text:** uppercase lub Title Case, 16–18px, weight 600. W badge’ach kerning ciaśniejszy.

## Spacing & Layout
- **Siatka:** max-width ~1200px wycentrowane; główne sekcje mają 96px padding w pionie.
- **Gaps:** pionowe odstępy między blokami tekstu 24–32px; między kartami w siatce 24px; między wierszami w gridzie 32px.
- **Karty:** 20–28px border-radius, 24px padding wewnętrzny, równy wzrost w kolumnach.
- **Align:** hero copy left, karty/elementy interaktywne mogą tworzyć pionową kolumnę po prawej. Avatary, loga w równych odstępach i w jednej linii.

## Component Patterns
- **Navigation:** płaski czarny pasek, minimalne linki, CTA w świecącej kapsule. Ikony monochromatyczne do momentu najechania.
- **Hero:** nagłówek + opis + rząd CTA, poniżej rząd logotypów/awatarów. Tło hero ma gradientowy halation i noise.
- **Cards:** prostokąty z borderem i glow; zawartość wycentrowana lub top-left. Na hoverze pojawia się gradient, noise tekstura, drobne scale (1.02) i tekst staje się czysto biały.
- **Badges/Chips:** mikro kapsuły z neonowym obrysem, tekst uppercase. Czesto stosowane jako label przy hero lub nad kartą.
- **Icon Tiles:** siatka płytek z ikoną + tytułem + opisem, równa wysokość, minimalny border.

## Form Controls
- **Select/Dropdown:** zawsze używamy komponentu `Select` (`SelectTrigger` + `SelectContent`). Trigger ma obrys 1px, wysokość 44px (compact 36px), `focus-visible:ring-2 ring-primary/40`. `SelectItem` pokazuje pełną etykietę – zero natywnych `<select>`.
- **Checkbox:** korzystamy z `Checkbox` z `aria`, a tekst umieszczamy w `label htmlFor`. To zapewnia spójny ring i rozmiar 16px. Checkbox może siedzieć wewnątrz `FormRow`.
- **FormRow/Field:** wszystkie pola budujemy wariantem `Field` (flex-col gap-2). Nagłówek (`span.font-semibold`) + opcjonalny opis (`text-xs text-muted-foreground`), poniżej kontrolka i błąd (`text-xs text-destructive`). Brak ręcznych `fluid-stack` – spacing kontroluje komponent.
- **Przykład (admin checkbox):**
```tsx
<Field label="Status weryfikacji" description="Stan procesu KYC">
  <Select value={status} onValueChange={setStatus}>
    <SelectTrigger className="h-11 rounded-2xl border border-input px-4 text-sm">
      <SelectValue placeholder="Nie wybrano" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="VERIFIED">Zweryfikowana</SelectItem>
      <SelectItem value="PENDING">W trakcie weryfikacji</SelectItem>
    </SelectContent>
  </Select>
</Field>

<div className="flex items-center gap-3 text-sm">
  <Checkbox id="kycRequired" checked={kycRequired} onCheckedChange={setKycRequired} />
  <label htmlFor="kycRequired" className="cursor-pointer">
    Wymagane potwierdzenie KYC
  </label>
</div>
```

## CTAs & Hover States
- **Primary CTA:** kapsuła 56px wysokości, gradient emerald→aqua lub blue→magenta, miękki drop shadow, tekst w #050505 lub #F5F5F5 w zależności od kontrastu.
- **Secondary CTA:** kapsuła z półprzezroczystym tłem i 1px obrysem #F5F5F5 z lekkim inner shadow.
- **Hover behavior:** rozjaśnij tło, dodaj glow, skalę 1.02, tekst przechodzi na #FFFFFF. Ikony/loga zmieniają opalizującą obwódkę.
- **Micro-interactions:** neon ring wokół avatarów, pulsujące border gradienty na badge’ach, drobne przesunięcia (translateY(-2px)).

## Strict UI Rules
1. Zawsze używamy czarnego tła z vignette gradientem; brak płaskich szarości w sekcjach.
2. Headline’y muszą być bold grotesk, wyróżnione słowa umieszczamy w kapsule lub gradientowym highlightcie.
3. Spacing: sekcje 96px w pionie, gridy 24px gapy, tekstowe bloki 32px oddechu – nie łamiemy tego rytmu.
4. Każda karta ma 20–28px radius, delikatny glow i własny stan hover (gradient + scale).
5. Primary CTA zawsze gradientowa kapsuła; secondary CTA półprzezroczysta z obrysem – nigdy płaskie prostokąty.
6. Hover zawsze łączy efekt światła i ruchu (glow + scale 1.02). Brak hoveru = brak komponentu.
7. Akcenty kolorystyczne ograniczamy do neonowej palety (aqua, emerald, electric blue, magenta). Nie używamy ciepłych barw.
8. Avatary, logotypy i badge mają neonowe obwódki lub ringi – to podkreśla high-tech estetykę.
