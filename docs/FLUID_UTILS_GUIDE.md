# Fluid Responsiveness Guide

## Overview

This project unifies responsive typography, buttons, and badges through a set of Tailwind utilities defined in `app/globals.css`. When any component uses the `fluid-*` classes described below, changing the values in `globals.css` automatically adjusts the look across the app.

### Where the utilities live
- File: `app/globals.css`
- Section: `@utility` declarations (`fluid-h1`, `fluid-h2`, `fluid-copy`, etc.)

### High-level principles
1. **Centralized sizing** – All primary sizing (`font-size`, `line-height`, `height`, `padding`, etc.) flows from the `fluid-*` utilities.
2. **Clamp everywhere** – Inputs, cards, and layout spacing use `clamp(...)` to avoid hard breakpoint jumps.
3. **Minimal per-component overrides** – Only unique sizing (e.g. icon dimensions) are set locally.

## Utility reference

| Utility              | Purpose                                    | Current clamp configuration                                       |
|----------------------|---------------------------------------------|-------------------------------------------------------------------|
| `fluid-h1`           | Hero/primary heading                        | `font-size: clamp(1.89rem, 3.36vw + 0.84rem, 2.94rem)`<br>`line-height: clamp(2.31rem, 3.36vw + 1.26rem, 3.15rem)` |
| `fluid-h2`           | Secondary heading                           | `font-size: clamp(1.47rem, 2.52vw + 0.756rem, 2.31rem)`<br>`line-height: clamp(1.89rem, 2.52vw + 1.176rem, 2.73rem)` |
| `fluid-lead`         | Lead paragraphs                             | `font-size: clamp(0.84rem, 1.512vw + 0.42rem, 1.05rem)`<br>`line-height: 1.65` |
| `fluid-copy`         | Body text                                   | `font-size: clamp(0.819rem, 0.378vw + 0.714rem, 0.924rem)`<br>`line-height: 1.7` |
| `fluid-caption`      | Small text / descriptions                   | `font-size: clamp(0.588rem, 0.2352vw + 0.504rem, 0.688rem)`<br>`line-height: 1.45` |
| `fluid-eyebrow`      | Uppercase label text                        | `font-size: clamp(0.571rem, 0.294vw + 0.487rem, 0.655rem)`<br>`letter-spacing: clamp(0.151em, 0.050em + 0.185vw, 0.252em)` |
| `fluid-pill`         | Pigułki / chipy / badge CTA                 | `gap: clamp(0.35rem, 0.6vw, 0.5rem)`<br>`padding-inline: clamp(0.6rem, 1vw, 0.85rem)`<br>`padding-block: clamp(0.25rem, 0.5vw, 0.4rem)` |
| `fluid-table-head`   | Padding nagłówków tabel                     | `padding-inline: clamp(0.75rem, 1.2vw, 1.4rem)`<br>`padding-block: clamp(0.85rem, 1.3vw, 1.35rem)` |
| `fluid-table-cell`   | Padding komórek tabel                       | `padding-inline: clamp(0.75rem, 1.2vw, 1.4rem)`<br>`padding-block: clamp(1rem, 1.5vw, 1.6rem)` |
| `fluid-icon-sm`      | Małe ikony w badge/pill                    | `height/width: clamp(0.65rem, 0.4vw + 0.55rem, 0.8rem)` |
| `fluid-button`       | Primary buttons                             | `height: clamp(2.31rem, 1.68vw + 1.89rem, 2.73rem)`<br>`padding-inline: clamp(1.05rem, 1.68vw + 0.63rem, 1.89rem)`<br>`font-size: clamp(0.798rem, 0.504vw + 0.672rem, 0.882rem)` |
| `fluid-button-sm`    | Compact buttons                             | `height: clamp(1.89rem, 1.092vw + 1.512rem, 2.1rem)`<br>`padding-inline: clamp(0.84rem, 1.176vw + 0.63rem, 1.26rem)`<br>`font-size: clamp(0.63rem, 0.336vw + 0.546rem, 0.714rem)` |
| `fluid-button-lg`    | Emphasised CTAs                             | `height: clamp(2.604rem, 2.016vw + 2.184rem, 3.15rem)`<br>`padding-inline: clamp(1.26rem, 2.184vw + 0.924rem, 2.604rem)`<br>`font-size: clamp(0.882rem, 0.546vw + 0.756rem, 1.008rem)` |
| `fluid-button-icon`  | Icon-only buttons                           | `height: clamp(2.226rem, 1.344vw + 1.848rem, 2.52rem)`<br>`width: clamp(2.226rem, 1.344vw + 1.848rem, 2.52rem)` |
| `fluid-badge`        | Badge / pill text & padding                 | `padding-inline: clamp(0.63rem, 1.26vw, 0.84rem)`<br>`padding-block: clamp(0.294rem, 0.84vw, 0.42rem)`<br>`font-size: clamp(0.588rem, 0.336vw + 0.504rem, 0.63rem)` |

### Spacing tokens

| Utility              | Purpose                         | Current clamp configuration                                          |
|----------------------|---------------------------------|-----------------------------------------------------------------------|
| `fluid-section-sm`   | Compact block padding           | `padding-block: clamp(1.47rem, 1.68vw + 1.05rem, 2.1rem)`             |
| `fluid-section-md`   | Default block padding           | `padding-block: clamp(2.1rem, 2.52vw + 1.26rem, 2.94rem)`             |
| `fluid-section-lg`   | Hero / spacious block padding   | `padding-block: clamp(2.73rem, 3.36vw + 1.47rem, 3.78rem)`            |
| `fluid-stack-2xs`    | Micro copy/meta gaps            | `gap: clamp(0.21rem, 0.504vw + 0.042rem, 0.378rem)`                   |
| `fluid-stack-xs`     | Tight inline/vertical gaps      | `gap: clamp(0.294rem, 0.63vw + 0.084rem, 0.504rem)`                   |
| `fluid-stack-sm`     | Body copy stacks                | `gap: clamp(0.504rem, 0.84vw + 0.168rem, 0.84rem)`                    |
| `fluid-stack-md`     | Card internals / forms          | `gap: clamp(0.756rem, 1.092vw + 0.294rem, 1.26rem)`                   |
| `fluid-stack-lg`     | Section-level layout gaps       | `gap: clamp(1.05rem, 1.344vw + 0.42rem, 1.68rem)`                     |
| `fluid-stack-xl`     | Hero spacing / multi-block gaps | `gap: clamp(1.47rem, 1.848vw + 0.504rem, 2.31rem)`                    |

Use the stack tokens on any flex/grid wrapper (`className="flex flex-col fluid-stack-md"` or `className="grid fluid-stack-lg"`) instead of bespoke `space-y-*`.

### Layout primitives

- `components/layout/section.tsx` exports a server `Section` wrapper that applies `container` + `fluid-section-*` padding. Prefer `<Section size="md" className="flex flex-col fluid-stack-lg">` over manual `<section className="container py-[clamp(...)] ...">`.

### UI primitives

- `components/ui/button.tsx` routes every `size` to `fluid-button`, `fluid-button-sm`, `fluid-button-lg`, or `fluid-button-icon`. Link-styled buttons fall back to `fluid-copy` + `fluid-stack-2xs` for tight inline spacing.
- `components/ui/badge.tsx` applies `fluid-badge` so pills inherit centralized padding/typography.
- `components/ui/tabs.tsx` relies on `fluid-button-sm` for triggers and `fluid-stack-2xs` on the list wrapper, guaranteeing even spacing across breakpoints.

> 💡 If we need to scale the design up/down again, adjust the clamps here and verify in the viewport QA checklist (375/414/768/1024/1440 px).

## Key components already wired up

### Public Landing / Rankings / Company views
- `components/home/*`
- `components/companies/*`
- `app/firmy/page.tsx`

### Analysis tools
- `app/analizy/page.tsx`
- `components/analysis/*`

### Admin dashboards + queues
- `components/admin/disputes-dashboard.tsx`
- `components/admin/*-queue-table.tsx`
- `components/ui/tabs.tsx` (shared tab trigger styles)

### User & Affiliate panels
- `components/panels/*`
- `components/affiliate/*`
- `components/about/about-hero.tsx`

### Shop experience
- `components/shop/shop-page-client.tsx`
- `components/shop/shop-company-cards.tsx`
- `components/shop/shop-plan-card.tsx`
- `components/shop/shop-purchase-form.tsx`

### Knowledge base
- `app/baza-wiedzy/page.tsx`
- `components/blog/*`

### Shared forms
- `components/forms/company-form.tsx`
- `components/forms/company-faq-form.tsx`
- `components/forms/company-faq-item-form.tsx`

## Workflow for future agents

1. **New component?** – Prefer using existing `fluid-*` classes. For spacing, prefer `gap-[clamp(...)]`, `px-[clamp(...)]`, or shared Tailwind `space-y` utilities.
2. **Need a variant?** – If you truly need a different scale, define it once in `globals.css`. Avoid mixing ad hoc pixel values with fluid classes unless absolutely necessary.
3. **Refining design tokens** – To tighten or loosen sizing globally, edit the clamps in `globals.css`. Run viewport QA afterward and jot updates in `PODSUMOWANIE_ZMIAN_RESPONSYWNOŚĆ.md`.
4. **Spacing lint** – Before pushing, run `pnpm lint && pnpm lint:spacing`. The latter inspects the staged diff and blocks any new `space-y-*` classes so PRs stay on `fluid-stack-*`.
5. **Tabs** – All `<TabsTrigger>` components now inherit from `components/ui/tabs.tsx`, so they respect the global scaling.
6. **Legacy selectors** – If you find fixed classes like `text-sm` or `px-4`, confirm whether the component predates the migration. Plan to refactor it onto `fluid-*`.

## Testing checklist after adjustments
1. `/` (landing)
2. `/rankingi`
3. `/firmy`, `/firmy/[slug]`
4. `/analizy`
5. `/baza-wiedzy`
6. `/sklep`
7. Admin dashboard tabs (queues, disputes)
8. User panel (app/panel + nested components)

## Notes
- Up-to-date status is tracked in `PODSUMOWANIE_ZMIAN_RESPONSYWNOŚĆ.md`.
- Clamp values documented above reflect the current baseline. If you need exact historical values (e.g. the brief 15% variant), consult git history.
- When unsure, grep for `fluid-` usage to ensure new components are consistent.
