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

| Utility            | Purpose                                    | Current clamp configuration                                       |
|--------------------|---------------------------------------------|-------------------------------------------------------------------|
| `fluid-h1`         | Hero/primary heading                        | `font-size: clamp(1.91rem, 3.4vw + 0.85rem, 2.98rem)`<br>`line-height: clamp(2.34rem, 3.4vw + 1.28rem, 3.19rem)` |
| `fluid-h2`         | Secondary heading                           | `font-size: clamp(1.49rem, 2.55vw + 0.77rem, 2.34rem)`<br>`line-height: clamp(1.91rem, 2.55vw + 1.19rem, 2.76rem)` |
| `fluid-copy`       | Body text                                   | `font-size: clamp(0.83rem, 0.38vw + 0.72rem, 0.94rem)`            |
| `fluid-caption`    | Small text / descriptions                   | `font-size: clamp(0.60rem, 0.24vw + 0.51rem, 0.70rem)`            |
| `fluid-eyebrow`    | Uppercase label text                        | `font-size: clamp(0.58rem, 0.30vw + 0.49rem, 0.66rem)`            |
| `fluid-button`     | Primary buttons                             | `height: clamp(2.34rem, 1.7vw + 1.91rem, 2.76rem)`<br>`padding-inline: clamp(1.06rem, 1.7vw + 0.64rem, 1.91rem)`<br>`font-size: clamp(0.81rem, 0.51vw + 0.68rem, 0.89rem)` |
| `fluid-button-sm`  | Secondary/smaller buttons                   | `height: clamp(1.91rem, 1.11vw + 1.53rem, 2.13rem)`<br>`padding-inline: clamp(0.85rem, 1.19vw + 0.64rem, 1.28rem)`<br>`font-size: clamp(0.64rem, 0.34vw + 0.55rem, 0.72rem)` |
| `fluid-badge`      | Badge / pill text & padding                 | `padding-inline: clamp(0.64rem, 1.28vw, 0.85rem)`<br>`padding-block: clamp(0.30rem, 0.85vw, 0.43rem)`<br>`font-size: clamp(0.60rem, 0.34vw + 0.51rem, 0.64rem)` |

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
4. **Tabs** – All `<TabsTrigger>` components now inherit from `components/ui/tabs.tsx`, so they respect the global scaling.
5. **Legacy selectors** – If you find fixed classes like `text-sm` or `px-4`, confirm whether the component predates the migration. Plan to refactor it onto `fluid-*`.

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


