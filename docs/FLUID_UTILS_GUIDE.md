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
| `fluid-h1`           | Hero/primary heading                        | `font-size: clamp(2.25rem, 4vw + 1rem, 3.5rem)`<br>`line-height: clamp(2.75rem, 4vw + 1.5rem, 3.75rem)` |
| `fluid-h2`           | Secondary heading                           | `font-size: clamp(1.75rem, 3vw + 0.9rem, 2.75rem)`<br>`line-height: clamp(2.25rem, 3vw + 1.4rem, 3.25rem)` |
| `fluid-lead`         | Lead paragraphs                             | `font-size: clamp(1rem, 1.8vw + 0.5rem, 1.25rem)`<br>`line-height: 1.65` |
| `fluid-copy`         | Body text                                   | `font-size: clamp(0.975rem, 0.45vw + 0.85rem, 1.1rem)`<br>`line-height: 1.7` |
| `fluid-caption`      | Small text / descriptions                   | `font-size: clamp(0.7rem, 0.28vw + 0.6rem, 0.82rem)`<br>`line-height: 1.45` |
| `fluid-eyebrow`      | Uppercase label text                        | `font-size: clamp(0.68rem, 0.35vw + 0.58rem, 0.78rem)`<br>`letter-spacing: clamp(0.18em, 0.06em + 0.22vw, 0.3em)` |
| `fluid-button`       | Primary buttons                             | `height: clamp(2.75rem, 2vw + 2.25rem, 3.25rem)`<br>`padding-inline: clamp(1.25rem, 2vw + 0.75rem, 2.25rem)`<br>`font-size: clamp(0.95rem, 0.6vw + 0.8rem, 1.05rem)` |
| `fluid-button-sm`    | Compact buttons                             | `height: clamp(2.25rem, 1.3vw + 1.8rem, 2.5rem)`<br>`padding-inline: clamp(1rem, 1.4vw + 0.75rem, 1.5rem)`<br>`font-size: clamp(0.75rem, 0.4vw + 0.65rem, 0.85rem)` |
| `fluid-button-lg`    | Emphasised CTAs                             | `height: clamp(3.1rem, 2.4vw + 2.6rem, 3.75rem)`<br>`padding-inline: clamp(1.5rem, 2.6vw + 1.1rem, 3.1rem)`<br>`font-size: clamp(1.05rem, 0.65vw + 0.9rem, 1.2rem)` |
| `fluid-button-icon`  | Icon-only buttons                           | `height: clamp(2.65rem, 1.6vw + 2.2rem, 3rem)`<br>`width: clamp(2.65rem, 1.6vw + 2.2rem, 3rem)` |
| `fluid-badge`        | Badge / pill text & padding                 | `padding-inline: clamp(0.75rem, 1.5vw, 1rem)`<br>`padding-block: clamp(0.35rem, 1vw, 0.5rem)`<br>`font-size: clamp(0.7rem, 0.4vw + 0.6rem, 0.75rem)` |

### Spacing tokens

| Utility              | Purpose                         | Current clamp configuration                                          |
|----------------------|---------------------------------|-----------------------------------------------------------------------|
| `fluid-section-sm`   | Compact block padding           | `padding-block: clamp(1.75rem, 2vw + 1.25rem, 2.5rem)`                |
| `fluid-section-md`   | Default block padding           | `padding-block: clamp(2.5rem, 3vw + 1.5rem, 3.5rem)`                  |
| `fluid-section-lg`   | Hero / spacious block padding   | `padding-block: clamp(3.25rem, 4vw + 1.75rem, 4.5rem)`                |
| `fluid-stack-2xs`    | Micro copy/meta gaps            | `gap: clamp(0.25rem, 0.6vw + 0.05rem, 0.45rem)`                       |
| `fluid-stack-xs`     | Tight inline/vertical gaps      | `gap: clamp(0.35rem, 0.75vw + 0.1rem, 0.6rem)`                        |
| `fluid-stack-sm`     | Body copy stacks                | `gap: clamp(0.6rem, 1vw + 0.2rem, 1rem)`                              |
| `fluid-stack-md`     | Card internals / forms          | `gap: clamp(0.9rem, 1.3vw + 0.35rem, 1.5rem)`                         |
| `fluid-stack-lg`     | Section-level layout gaps       | `gap: clamp(1.25rem, 1.6vw + 0.5rem, 2rem)`                           |
| `fluid-stack-xl`     | Hero spacing / multi-block gaps | `gap: clamp(1.75rem, 2.2vw + 0.6rem, 2.75rem)`                        |

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


