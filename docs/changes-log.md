# Changes Log

## 2025-11-14 – Etap 1: API security
- Uszczelniono `/api/cashback`: zwykli użytkownicy mogą jedynie zgłosić transakcję PENDING z limitem 5 000 punktów, a po utworzeniu rewalidowany jest tag punktów.
- Dodano admin endpoint `POST /api/admin/cashback/manual`, który pozwala administratorowi na tworzenie manualnych cashbacków (status, punkty, wskazanie użytkownika) oraz loguje operację.
- Wszystkie endpointy newslettera po stronie admina korzystają teraz z `assertAdminRequest`, a mutacje rewalidują tag `admin-newsletter`.

## 2025-11-14 – Etap 1.3 i Etap 2
- `/api/newsletter`, `/api/report` oraz `/api/clicks` mają proste ograniczenia zapytań oparte o IP (i email dla newslettera); przekroczenie limitu zwraca `429` z nagłówkiem `Retry-After`.
- Stworzono `app/(site)/layout.tsx` z jedną instancją `AuroraWrapper` i przeniesiono landing, rankingi, firmy (wraz z `[slug]` i `compare`), opinie, analizy, affilację, sklep, bazę wiedzy oraz stronę „O nas” do grupy `(site)`.
- Usunięto lokalne kopie aurory z każdej strony publicznej, dzięki czemu tło WebGL renderuje się tylko raz i nie duplikuje kosztownych efektów.

## 2025-11-14 – Rename (marketing) → (site)
- Zmieniono nazwę route group z `(marketing)` na `(site)` bez wpływu na publiczne URL-e.
- Zaktualizowano dokumentację (`agents.md`, `docs/refactor-plan.md`) oraz wpisy o layoutach tak, aby nowa grupa była opisana jako segment publiczny aplikacji.
