# Routing

## Public routes
- `/` (`app/(site)/page.tsx`) – główny landing wewnątrz `CompareProvider`. Sekcje: `HomeHero` (wyszukiwarka + metryki), `HomeRankingSection` (zakładki rankingów), `TopCashbackSection`, `HomeMarketingSpotlights` (karuzela ofert z panelu admina), `HomeLatestCompanies`, `HomeCompareTeaser`, `HomeEducationGrid` oraz blok “Ostatnie opinie” (`HomeRecentSection`). Całości towarzyszy `CompareBar`.
- `/rankingi` (`app/rankingi/page.tsx`) – dwuczęściowy układ. Najpierw statystyki zagregowane w `RankingsPageClient`, niżej interaktywny `RankingsExplorer` z filtrami (`RankingFilters`) i sekcja metodologii (`RankingsMethodologyClient`). Dane pochodzą z `getRankingsDataset`.
- `/firmy` (`app/firmy/page.tsx`) – lista firm (`CompaniesPageClient`) z filtrami modelu finansowania, cashbacku, krajów, typów kont, sortowaniem i wyszukiwarką. Wszystko otoczone `AuroraWrapper`. Widok pracuje na `getCompanies` + `getCompanyFiltersMetadata`.
- `/firmy/[slug]` – kompletny profil firmy. Strona ładuje się wewnątrz `CompareProvider`, buduje breadcrumbs, `CompanyHeroClient`, `OverviewQuickStats`, listę alertów, moduły planów (`PlansShopList` z CTA `PurchaseButton`), zakładki (overview/reguły/payouty/oferty/ogłoszenia/recenzje/FAQ), komponenty payoutowe (`PayoutCalendar`, `PayoutsChartsWrapper`, `PayoutsTimeline`, `PayoutsComparison`), checklisty, `CompanyFaqTabs`, `ReviewsPanel` oraz formularze (`ReviewForm`, `ReportIssueForm`). Całość kończy `CompareBar`.
- `/firmy/compare` – tabela porównawcza maks. 3 firm. Wyrównuje kolumny, pokazuje `CompareToggle` i `FavoriteButton` w nagłówkach, korzysta z `convertCurrency` oraz `getCurrencyRates`.
- `/opinie` – sekcja hero (`OpiniePageClient`) z liczbą opinii, nowymi recenzjami i średnią oceną oraz ranking opinii (`ReviewsRankingPage`). Dodatkową plakietkę dostarcza `OpinieBadgeClient`.
- `/analizy` – landing narzędzia analitycznego z chipami (`TrendingUp`, `FileText`, `Award`). Rdzeniem jest asynchroniczny `CompanySelector` osadzony w `Suspense`.
- `/analizy/[...slugs]` – analiza maks. 3 wybranych firm. Ładuje `AnalysisLayout` z historią cen (`getCompaniesPriceHistory`), ratingami, statystykami opinii oraz metrykami porównawczymi.
- `/affilacja` – landing dla partnerów/influencerów: `AffiliateHero`, `AffiliateBenefits`, `AffiliateHowItWorks`, `AffiliateStatistics`, `AffiliateList`, formularz `AffiliateRegistrationForm` i finalne CTA.
- `/sklep` – `ShopPageClient` renderuje katalog planów z możliwością zakupu (wywołuje `/api/shop/purchase`). `ShopPurchaseConfirmation` wyświetla status transakcji po powrocie.
- `/baza-wiedzy` i `/baza-wiedzy/[slug]` – katalog i pojedyncze artykuły bloga. Index pokazuje `BlogStatistics` + `BlogCategoriesTabs`. Detal używa `Breadcrumb`, nagłówka (`BlogPostHeader`), opcji obrazu, treści renderowanej z `sanitizeHtml` i sekcji pokrewnych (`RelatedPostsTabs`).
- `/o-nas` – sekwencja modułów (`AboutHero`, `MissionVision`, `CompanyValues`, `TeamSection`, `AboutCta`) na wspólnym tle `AuroraWrapper`.
- `/panel` – w całości kliencki hub użytkownika z breadcrumb, zakładkami (`overview`, `redeem`, `disputes`, `favorites`, `influencer`). Pobiera `/api/user/summary`, `/api/wallet/offers`, `/api/user/disputes`, `/api/wallet/transactions`. Wbudowane sekcje (`RedeemSection`, `FavoritesSection`, `InfluencerSection`) współdzielą logikę z panelem bocznym (`UserPanel`).
- `/opinie`, `/rankingi`, `/firmy`, `/affilacja`, `/sklep`, `/analizy`, `/baza-wiedzy`, `/o-nas` korzystają ze wspólnego layoutu `app/(site)/layout.tsx`, który raz renderuje `AuroraWrapper` i zapewnia spójne tło.
- `/ (auth)/sign-in` oraz `/sign-up` (Next Clerk) implementują pojedyncze formularze w kartach `shadcn/ui`.

## Zbiór route'ów chronionych
- `/admin` – `page.tsx` przekierowuje na `/admin/overview`. `app/admin/layout.tsx` wymusza zalogowanie i rolę admina (`currentUser` + redirect), ładuje `AdminScrollLock`.
- `/admin/(tabs)/*` – współdzielą layout (`AdminSidebar` + mobilny `AdminSidebarMobile` + `AdminContent`). Podzakładki:
  - `overview` – `OverviewDashboard` łączy kolejki afiliacyjne, wypłaty cashbacku, influencerów, recenzje i zgłoszenia z `prisma` i `lib/queries`.
  - `cashback`, `community`, `content`, `marketing`, `shop`, `support`, `blog` – każdy ma dedykowany *Dashboard* agregujący statystyki, wykresy i kolejki (np. `CashbackDashboard`, `CommunityDashboard`, `MarketingDashboard`).
  - `newsletter` – jedyna zakładka w pełni kliencka; zarządza subskrybentami przez `/api/admin/newsletter` (brak weryfikacji roli na API).

## API (skrót architektoniczny)
- Bot endpoints (np. `/api/clicks`, `/api/favorites`, `/api/cashback`, `/api/report`, `/api/wallet/*`, `/api/shop/*`, `/api/companies`, `/api/rankings`) są zagnieżdżone w `app/api`. Większość korzysta z `lib/queries/*` oraz wspólnych helperów (`ensureUserRecord`, `revalidateTag`). Szczegółowy audyt w `docs/data-api-audit.md`.

# Layouty
- **Root layout** (`app/layout.tsx`) – owija całość w `ClerkProvider`, `ThemeProvider`, `CurrencyProvider`, `UserPanelProvider`, `SiteHeader`, `SiteFooter`, globalny `UserPanel` (wysuwany panel portfela/ulubionych) i `Toaster`. Wstawia też ręczny `<Script>` do synchronizacji motywu przed hydracją.
- **Sekcje** – `components/layout/section.tsx` standaryzuje spacing (`fluid-section-*`) i opcję `bleed`, ale wiele stron dodatkowo tworzy własne kontenery, więc nie zawsze jest używana konsekwentnie.
- **Admin layout** – `app/admin/layout.tsx` (autoryzacja) + `app/admin/(tabs)/layout.tsx` (sidebar + sticky mobile nav); do tego `AdminContent` blokuje scroll w tle, `AdminSidebarProvider` trzyma stan mobilny.
- **Specjalistyczne overlay'e** – `UserPanel` (komponent w `components/panels/user-panel.tsx`) wyświetlany globalnie, otwierany przyciskiem "Panel" z `SiteHeader`. Dodatkowo `CompareBar` jest renderowany na stronie głównej i podstronach firm.

# Kluczowe komponenty
- **Nawigacja i globalne UI**: `SiteHeader` (`components/layout/site-header.tsx`) z `CurrencySwitcher`, `SignedIn/Out`, `UserButton`, mobilnym menu; `SiteFooter` łączy nawigację, CTA newslettera (wywołuje `/api/newsletter`), bloki social i kontaktów. `CurrencyClientProvider` zarządza kursami i preferencjami (cookie + localStorage + `/api/preferences/currency`).
- **System porównania**: `CompareProvider`, `CompareBar`, `CompareToggle`, `FavoriteButton`, `PurchaseButton`. Udostępnia globalny stan porównań i CTA „Kup z kodem”.
- **Home + marketing**: `HomeHero`, `HomeRankingSection`, `TopCashbackSection`, `HomeMarketingSpotlights`, `HomeLatestCompanies`, `HomeCompareTeaser`, `HomeEducationGrid`, `HomeRecentSection`. Bazują na `getHomepageMetrics`, `getHomeRankingTabs`, `getTopCashbackCompanies`, `getHomepageMarketingSection`, `getRecentPublicReviews`, `getRecentCompanies`.
- **Firmy / commerce**: duży zestaw w `components/companies/*` – hero, karty ofert, zakładki regulaminów, `RulesGridClient`, `ChallengesTabClientWrapper`, `AnnouncementsTabClientWrapper`, `CompanyFaqTabs`, `ReviewsPanel`, moduły payout (kalendarz, timeline, porównanie), `CompanyMedia`, `VerificationAccordionCard`, `CompanyPopularityChartWrapper`, `TeamHistoryTabsCard`, `TechnicalDetailsTabsCard`, `SocialLinksClient`, `ChecklistSection`.
- **Rankingi i analizy**: `RankingsPageClient`, `RankingsExplorer`, `RankingsMethodologyClient`, `AnalysisLayout`, `CompanySelector`. Wspierają filtry, tabele i wykresy.
- **Społeczność**: `ReviewsRankingPage`, `OpiniePageClient`, `OpinieBadgeClient`, `ReviewForm`, `ReportIssueForm`.
- **Affiliate/Shop**: `Affiliate*` komponenty, `ShopPageClient`, `ShopPurchaseConfirmation`.
- **Admin suite**: setki drobnych komponentów (`*Dashboard`, `*OverviewTab`, wykresy, kolejki, formularze) – każdy tab posiada własne sekcje (np. `CashbackQueuesTab`, `ReviewModerationPanel`, `CompanyManagementPanel`).
- **UI kit**: `components/ui/*` to forki shadcn/ui (Accordion, Tabs, Dialog, Table, Badge itd.) rozszerzone o lokalne warianty (np. `gradient-button`, `premium` button). Dostępne są też `components/custom/*` (np. `PremiumBadge`, `AnimatedCounter`).
- **Efekty graficzne**: `components/Aurora.tsx` + `components/aurora-wrapper.tsx` (dynamiczny import) generują WebGL-ową „aurorę”. Segment `app/(site)/layout.tsx` renderuje ją raz dla publicznych stron.

# Wnioski i problemy
- Segment `(site)` centralizuje `AuroraWrapper`, ale inne layouty (np. panel użytkownika, admin) nadal mają własne tła i spacing, więc estetyka poza publicznym segmentem jest niespójna.
- Strona firmy (`app/firmy/[slug]/page.tsx`) jest monolitem liczącym kilkaset linii, importuje kilkanaście modułów i ładuje wszystkie dane naraz. Utrudnia to iteracje, SSR i ładowanie warstwowe.
- `app/panel/page.tsx` i `UserPanel` duplikują część funkcjonalności (redeem, disputes, ulubione), ale komunikują się z tymi samymi endpointami – kod jest złożony, a logika UI powiela się w dwóch miejscach.
- `app/admin/(tabs)/newsletter/page.tsx` działa jako klient pobierający dane z `/api/admin/newsletter`, jednak to API nie weryfikuje roli admina – każda zalogowana osoba może pobrać/usuwać subskrybentów.
- Wiele stron (np. `/rankingi`, `/analizy`, `/baza-wiedzy`) łączy `Section` i ręczne kontenery, przez co spacing nie zawsze jest spójny mimo istnienia `Section`.
- `CompareBar` i `UserPanel` są renderowane globalnie, ale sposób ich inicjalizacji różni się między stroną główną, stroną firmy i panelem użytkownika, co komplikuje śledzenie stanu CTA/cashbacku.
