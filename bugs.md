# TypeScript build failures (from `npx tsc --noemit`)

1. `app/panel/page.tsx:340` & `components/panels/user-dashboard-recent.tsx:29` – `transactions` prop expects a local `WalletTransaction[]` where `points` is required, but the summary hook returns the shared `lib/types` version with `points?: number | null`, leading to a mismatch.
2. `components/companies/company-header-section.tsx:50` – `FavoriteButton` requires `initialFavorite: boolean` but `company.viewerHasFavorite` is `boolean | undefined`.
3. `components/companies/company-header-section.tsx:119` + related uses – `CompanyWithDetails` from `lib/types` lacks computed fields like `copyMetrics`, `rankingHistory`, etc., so props such as `copyMetrics={company.copyMetrics}` fail.
4. `components/companies/company-media-section.tsx:16`/`35` – `company.rankingHistory` is used but missing from the `CompanyWithDetails` definition.
5. `components/companies/company-meta-section.tsx:17` and `components/companies/company-plans-section.tsx:16` – the type provided to `OverviewQuickStats` / `ChallengesTabClientWrapper` omits numerous fields (`copyMetrics`, affiliate/regular transactions, marketing spotlights, `rankingHistory`, etc.) that those downstream components access.
6. `components/companies/offers-quick-stats.tsx:152` – `Text` component is given `variant="subsectionStrong"`, which isn’t currently part of `Text`’s allowed variants.
7. `components/custom/premium-badge.tsx:65`, `components/ui/badge.tsx:69`, `components/ui/surface.tsx:75` – the forwarded refs default to `HTMLElement`, but the consumers expect `HTMLButtonElement`/`HTMLDivElement`, causing type incompatibility.
8. `components/home/home-hero.tsx:149` – `HoverBorderGradient` is used with `href`/`as={Link}` but its prop types only extend `React.HTMLAttributes<HTMLElement>`, so `href` is rejected and `Link` usage fails.
9. `components/layout/section-header.tsx:11` – `SectionHeaderProps` extends `HTMLAttributes<HTMLDivElement>` but reuses the `title` prop as `ReactNode`, conflicting with the inherited `title?: string` attribute.
10. `components/shop/shop-company-cards.tsx:45` – `next/image` receives a nonexistent `size` prop (should be `sizes`).
11. `components/ui/heading.tsx:37,58` – `JSX` namespace can’t be found and the `LEVEL_TAG` object + `Comp` inference doesn’t satisfy JSX component typing when `asChild` or numeric `level` is used.
12. `components/ui/sparkles.tsx:83` – the `particles` config sets `resize: true`, whereas the `IResizeEvent` type expects a configuration object.
13. `prisma/seed.ts:768`, `1414` – `blogCategories` is initialized with `[]`, so TypeScript infers `any[]` and later usage (`categories.find`) becomes unsafe.

## Remediation plan (next steps)
1. Align the shared data types and props:
   - Import the canonical `WalletTransaction` from `lib/types` into `components/panels/user-dashboard-recent.tsx`, treat `points` as optional, and guard against `null`/`undefined` when rendering so the panel can accept `recentTransactions` directly.
   - Expand `CompanyWithDetails` (and related `Company` definitions) in `lib/types.ts` so it matches every property returned by `getCompanyBySlug` (plans, faqs, reviews, team members, certifications, media items, computed `copyMetrics`, `rankingHistory`, `transactions`, `affiliateTransactions`, `marketingSpotlights`, `viewerHasFavorite`, `clickCount`, etc.)—that will make all company sections compile without manual casts.
   - Let `FavoriteButton` accept `boolean | undefined` for `initialFavorite` (defaulting to `false` internally) so `company.viewerHasFavorite` passes through cleanly.
2. Harden UI primitives/types:
   - Add the `subsectionStrong` variant to `Text`’s `variant` palette (and ensure equivalent token/class is defined) so consumers like `offers-quick-stats` can rely on it.
   - Rework `Heading` to reference `React.JSX.IntrinsicElements`/`React.ElementType` when mapping numeric `level` values, ensuring `Comp` always satisfies JSX constraints regardless of `asChild`.
   - Update `SectionHeaderProps` to omit the inherited `title?: string` attribute (e.g., `Omit<HTMLAttributes<HTMLDivElement>, "title">`) before declaring a `title: ReactNode`, avoiding the conflict.
   - Turn `HoverBorderGradient` into a proper polymorphic component (`as?: React.ElementType`, extend `ComponentPropsWithoutRef<T>`), so `href` and `as={Link}` typings work.
   - Align the ref forwarding in `Badge`, `PremiumBadge`, and `Surface` to the actual element type (`HTMLButtonElement` or `HTMLDivElement`) or constrain `Comp` so the forwarded `ref` is acceptable; this will unblock those components’ usages with `React.forwardRef`.
   - Fix the `sparkles` config by passing an object (e.g., `resize: { delay: 0 }` or whatever the library expects) so the `IResizeEvent` type is satisfied.
3. Address remaining usage issues & typing gaps:
   - Rename the incorrect `size` prop on `Image` in `components/shop/shop-company-cards.tsx` to `sizes` (and supply an appropriate value) to match Next’s API.
   - Add explicit typing for `blogCategories` in `prisma/seed.ts` (e.g., `const blogCategories: BlogCategory[] = [];` with the type imported from `lib/types`) so consumers like `category.slug` are type-safe.

Once this document is reviewed, I’ll proceed with the actual fixes; no code changes have been made yet.
