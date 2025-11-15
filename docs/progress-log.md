2025-11-15 – Analiza stylistyczna – Ekrany referencyjne

Przeanalizowano screeny z folderu `public/s1.png`–`public/s6.png` w celu opisania kolorystyki, typografii, spacingów, kart, CTA, hoverów i ogólnej filozofii layoutu.
Status: Ukończone

2025-11-15 – Dokument stylu – UI Style Guide

Utworzono `docs/ui-style-guide.md` z opisem palety kolorów, typografii, spacingów, zachowania komponentów i zasad „Strict UI Rules” będących podstawą projektu.
Status: Ukończone

2025-11-15 – Strona główna – Nawigacja i Hero

`components/layout/site-header.tsx` → zastąpiono starą nawigację wersją referencyjną na bazie `@aceternity/resizable-navbar`, dodano neonową typografię, integrację z Clerk, użytkownikiem, panelami i przełącznikiem walut.

`components/home/home-hero.tsx` → zbudowano nowy hero na wzór `@aceternity/hero-section-demo-1`, uwzględniając istniejącą wyszukiwarkę, CTA, log wypłat oraz `@aceternity/animated-tooltip` dla awatarów społeczności.

`components/ui/resizable-navbar.tsx`, `components/ui/animated-tooltip.tsx` → dodano komponenty pomocnicze z rejestru Aceternity i dostosowano je do projektu.

15.11 – doprecyzowanie: hero otrzymał pełną szerokość, min-h-screen oraz poprawiony formularz wyszukiwania (client-side navigation) i CTA Linki, aby wszystko było klikalne na całej powierzchni.

15.11 – poprawka: siatka tła ma `pointer-events-none`, aby nie blokowała kliknięć w przyciski/wyszukiwarkę.

15.11 – iteracja hero: przebudowano prawą kolumnę na układ kart jak w referencji (`live log` z listą wypłat i kafelkami promo). Dodano `components/ui/evervault-card.tsx` (na razie poza użyciem w hero – gotowy do kolejnych sekcji).
15.11 – dopracowanie hero po feedbacku: wyszukiwarka i CTA odwzorowują układ ze screena (`Zrzut ekranu 2025-11-15 161629.png`), lista wypłat ma neonowy gradient, a kafelki promo działają jako linki do rankingów.
15.11 – dostosowanie do `app/globals.css`: hero korzysta z `fluid-*` spacing/typografii oraz natywnego kontenera, żeby zachować spójność spacingów i responsywności.
15.11 – kolejna iteracja: uproszczono tła (bez gradientu w tle sekcji), CTA to czarne przyciski z gradientowym obrysem emerald→sky, a „Live log wypłat” korzysta z komponentu `EvervaultCard`/`Icon`.
Status: Czeka na akceptację użytkownika
