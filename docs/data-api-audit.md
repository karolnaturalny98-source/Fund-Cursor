# Modele Prisma
- **User** – mapowanie użytkowników Clerk (`clerkId`, `email`, `displayName`). Powiązania: `favorites`, `transactions`, `affiliateTransactions`, `reviews`, `dataIssues`, `disputes`, `influencerProfile`, `blogPosts`. Kluczowy helper `ensureUserRecord` (lib/services/user.ts) tworzy lub aktualizuje rekord przy każdej akcji API.
- **Company** – centralny model firm prop: dane marketingowe (nazwa, slug, headline, CTA, opis, adresy, linki), parametry tradingowe (regulacje, platformy, instrumenty, rules JSON), relacje do planów (`CompanyPlan`), FAQ, opinii, mediów, timeline, rankingów, marketing spotlights, kliknięć oraz transakcji cashbackowych/afiliacyjnych.
- **CompanyPlan** – opisuje każdy plan (cena, waluta, model ewaluacji, drawdown, profit target, payout, dźwignia, typ konta, link afiliacyjny). Powiązany z historią cen (`PriceHistory`), zgłoszeniami (`DataIssueReport`) i sporami (`DisputeCase`).
- **CashbackTransaction** i **AffiliateTransaction** – śledzą punkty cashbackowe i eventy afiliacyjne. Transakcje cashbackowe mogą być dodatnie (cashback) lub ujemne (redeem), mają statusy `PENDING/APPROVED/REDEEMED/REJECTED`. Affiliate transactions przechowują `platform`, `source`, `externalId`, `userEmail` i referencję do powiązanego cashbacku.
- **Favorite** i **ClickEvent** – zapisują interakcje użytkowników (lista ulubionych i kliknięcia CTA, z danymi o IP, user-agencie, źródle).
- **Review**, **FaqItem**, **InfluencerProfile**, **DataIssueReport**, **DisputeCase** – obsługują odpowiednio recenzje, FAQ-i, profile influencerów, zgłoszenia błędów i spory. Każdy ma szczegółowe pola (np. Review metadata dla kategorii ocen, DisputeCase przechowuje evidence links i przypisanego admina).
- **MarketingSpotlightSection / MarketingSpotlight** – konfigurują karuzele ofert na stronie głównej (tytuł, emoji, kampanie z CTA, badge'ami, datami start/koniec).
- **BlogPost / BlogCategory / BlogPostCategory** – Baza wiedzy z wieloma kategoriami, tagami, metadanymi SEO i licznikiem wyświetleń.
- **TeamMember, CompanyTimeline, CompanyCertification, CompanyMedia, CompanyRankingHistory** – dane rozszerzone wyświetlane na stronie firmy.
- **NewsletterSubscriber** – przechowuje zapisanych do newslettera (id, email, status, source); mapuje się do tabeli `newsletter_subscribers`.

# Endpointy API

## Publiczne / półpubliczne
- `/api/companies` – stronicowane streszczenia firm (`getCompanySummaries`, cache 5 min), obsługa `page`, `perPage`, `search`.
- `/api/companies/options` – lista firm do selektorów (np. spory, panel).
- `/api/clicks` – logowanie kliknięć CTA; zapisuje IP/User-Agent, optional source, automatycznie `ensureUserRecord`.
- `/api/favorites` – toggle ulubionych (POST/DELETE) z autoryzacją Clerk.
- `/api/newsletter` – zapis/reaktywacja subskrypcji (walidacja email, brak throttlingu).
- `/api/rankings` – otwarte API datasetu rankingów z filtrami (country, model, hasCashback, minReviews) -> `getRankingsDataset`.
- `/api/reviews/ranking` i `/api/reviews` (podzapytania) – statystyki opinii i tworzenie nowych recenzji firm (wymaga logowania).
- `/api/report` – zgłoszenia błędów danych (kategoria, opis, email, powiązanie z firmą/planem); również dostępne dla niezalogowanych (email opcjonalny).
- `/api/currency/rates` – proxuje `getCurrencyRates` na exchangerate.host z revalidate 12h.
- `/api/preferences/currency` – zapis preferowanej waluty do cookie + revalidate tag.

## Endpointy użytkownika
- `/api/user/summary` – dashboard użytkownika (sumy cashback, ulubione, ostatnie transakcje, profil influencera).
- `/api/user/disputes` – listowanie i tworzenie sporów; waliduje plan/firma, rewaliduje tagi admin i user.
- `/api/wallet/*` – `available` (saldo), `transactions` (paginacja), `offers` (lista firm+planów), `redeem` (tworzenie ujemnych transakcji PENDING z walidacją punktów dostępnych).
- `/api/cashback` – pozwala zalogowanemu użytkownikowi stworzyć dowolny `CashbackTransaction` (dowolna liczba punktów i status) dla wybranej firmy.
- `/api/shop/purchase` – przygotowuje transakcję afiliacyjną (generuje externalId, wylicza cashback, zapisuje w `AffiliateTransaction`, zwraca link). `/api/shop/confirm` – użytkownik potwierdza transakcję (sprawdzenie własności po userId/emailu).
- `/api/influencers/profile` – CRUD profilu influencera (walidacja Zod, metadane kontaktowe).
- `/api/wallet/offers` – lista dostępnych planów (id, nazwa, cena) do wymiany punktów.

## Admin
- `/api/admin/companies/*` – CRUD firmy, planów, timeline, teamu, mediów, certyfikatów, revalidate. Każdy handler korzysta z `assertAdminRequest`.
- `/api/admin/affiliates`, `/api/admin/cashback`, `/api/admin/transactions/history`, `/api/admin/data-issues`, `/api/admin/disputes`, `/api/admin/influencers`, `/api/admin/reviews`, `/api/admin/marketing/spotlights`, `/api/admin/shop/link`, `/api/admin/users/search` – operacje moderacyjne/tablicowe (kolejki, statusy, linkowanie zamówień).
- `/api/admin/blog/*` – zarządzanie artykułami i kategoriami.
- `/api/admin/newsletter` oraz `/api/admin/newsletter/[id]` – listowanie, filtrowanie, aktualizacja statusu i kasowanie subskrybentów **bez** weryfikacji admina (tylko `auth()` sprawdza `userId`).

# Przepływ danych
- **Home/rankingi/firmy** – gromadzą dane przez `lib/queries/companies`, `reviews`, `influencers`, `marketing`, `rankings`. Wiele funkcji opakowano w `unstable_cache` (np. `getHomeRanking`, `getCompanyBySlug`, `getRankingsDataset`) z revalidate 5–10 min i tagami `companies`.
- **Strona firmy** – `getCompanyBySlug(slug, viewerId)` agreguje plan, FAQ, recenzje (20), zespół, timeline, certyfikaty, media, ranking history, transakcje. Dodatkowo `getSimilarCompanies` i transformacje JSON-LD. Wszystko ładuje się w SSR przed renderem.
- **Compare / Currency** – `CompareProvider` trzyma stan porównań (query param `compare`), `CurrencyProvider` serwuje walutę/rates (SSR) i synchronizuje z cookie/localStorage oraz `/api/preferences/currency`.
- **CTA / zakupy** – `PurchaseButton` i `ShopPageClient` bazują na planach z `getCompanies`. Kliknięcia są logowane do `ClickEvent` (via `/api/clicks`). Zakup w sklepie – `ShopPageClient` -> `/api/shop/purchase` (tworzy `AffiliateTransaction` + link) -> strona firmy/partnera -> `/api/shop/confirm`.
- **Cashback / Wallet / Panel** – `getUserSummary`, `getUserAvailablePoints`, `getUserTransactionsPage`, `getRedeemQueue` i `getShopRevenueStats` zasilają panel użytkownika oraz widoki admina. Użytkownik może także sam tworzyć transakcje przez `/api/cashback` i `redeem`.
- **Newsletter i baza wiedzy** – `/api/newsletter` tworzy rekordy w `NewsletterSubscriber`, `/api/admin/newsletter` ich moderuje; blog korzysta z `getBlogPosts`, `getBlogCategories`, `getBlogPostBySlug`, `getRelatedPosts`.
- **Społeczność** – recenzje (`/api/companies/[slug]/reviews`, `getPendingReviews`), influencerzy (`/api/influencers/profile`, `getInfluencerProfiles`), zgłoszenia (`/api/report`, `getPendingDataIssues`), spory (`/api/user/disputes`, `getAdminDisputes`), wszystkie spięte w zakładce `community` panelu admina.
- **Cachowanie i rewalidacja** – `revalidateTag` jest używane po większości operacji mutujących (np. `wallet/redeem`, `report`, `user/disputes`), ale część endpointów (np. newsletter, manual cashback) nie triggeruje rewalidacji.

# Problemy i ryzyka
- **Brak autoryzacji admina dla newslettera** – `/api/admin/newsletter` i `/api/admin/newsletter/[id]` sprawdzają tylko `userId` (komentarz „TODO: dodać rolę admin”), więc dowolny zalogowany użytkownik może pobrać, usunąć lub edytować subskrybentów.
- **/api/cashback otwiera furtkę do nadużyć** – każdy zalogowany użytkownik może stworzyć transakcję cashbackową z dowolną liczbą punktów i nawet statusem `APPROVED`/`REDEEMED` (`status` jest parametrem wejściowym). Endpoint nie weryfikuje, czy żądanie pochodzi od admina, ani czy transakcja jest odwzorowaniem realnego zakupu.
- **Ciężkie zapytania SSR** – `app/firmy/[slug]/page.tsx` i `app/panel/page.tsx` wykonują serie dużych `Promise.all` (kilkanaście zapytań + agregaty). Baza `Company` ma wiele relacji; brak stronicowania recenzji/planów oznacza, że każda wizyta ładuje pełne dane.
- **Powielone żądania panelu** – `UserPanel` (globalny overlay) i `/panel` (strona) korzystają z tych samych endpointów (`/api/user/summary`, `/api/wallet/offers`, `/api/user/disputes`). Przy równoczesnym używaniu (np. otwarcie panelu będąc na `/panel`) powstają zdublowane wywołania i race conditiony.
- **Brak rate limiting / CSRF** – krytyczne endpointy (newsletter, clicks, report, cashback, shop/purchase) są otwarte na nadużycia (boty mogą generować wpisy lub spam zgłoszeniami).
- **Niespójne rewalidacje** – część mutacji (`/api/admin/newsletter`, `/api/newsletter`, `/api/cashback`) nie wywołuje `revalidateTag` ani `revalidatePath`, więc UI może pokazywać nieaktualne dane do momentu upłynięcia `revalidate`.
