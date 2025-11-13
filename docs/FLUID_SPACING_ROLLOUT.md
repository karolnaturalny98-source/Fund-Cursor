# Fluid Spacing Rollout Tracker

This tracker lists every remaining module that still relies on bespoke `py-*`, `space-y-*` or ad-hoc gap utilities. Each row should move from **TODO → In Progress → Done** as we migrate the component to `Section`, `fluid-section-*`, and `fluid-stack-*`.

| Area | Path / Component | Issue | Status | Notes |
| --- | --- | --- | --- | --- |
| Public – Companies | `app/firmy/page.tsx` | Page wrapper uses manual `gap`/`py` and nested `space-y-*` stacks | TODO | Convert all sections to `<Section>` and stack tokens |
| Public – Company detail | `app/firmy/[slug]/page.tsx` | Multiple `space-y-*` sections, tabs, and cards defined locally | TODO | Break into subcomponents w/ `fluid-stack`; align tabs/tables |
| Public – Analysis | `app/analizy/page.tsx` & cards | Hero + benefit tiles rely on `space-y` and card-specific padding | TODO | Replace with `Section` + shared card utilities |
| Public – Affiliate pages | `components/affiliate/*` | Entire affiliate funnel still uses container `space-y` and per-card padding | TODO | Batch migrate sections, cards, and CTA blocks |
| Public – Blog hub | `components/blog/blog-categories-tabs.tsx`, `blog-post-card.tsx` | Tabs and cards define `space-y` + per-card padding | TODO | Wrap with `Section` and reuse stack utilities |
| Public – Reviews | `components/companies/reviews-panel.tsx` | Panel sections and cards rely on `space-y` and custom padding | TODO | Bring onto new tokens to match other company blocks |
| Shop | `components/shop/*` (filters, badges, pill buttons) | Remaining controls still hard-code `px`/`py` clamp values | TODO | Introduce shared pill/badge utility or reuse button variants |
| Admin – Company management | `components/admin/company-management-panel.tsx` | Tabs + accordion content use `space-y` and ad-hoc gaps | TODO | Refactor accordion body + tabs to shared stack tokens |
| Admin – Queues & history | `components/admin/cashback-history-panel.tsx`, `affiliate-queue-table.tsx`, `redeem-queue-table.tsx`, `community-history-panel.tsx`, `data-issue-moderation-panel.tsx` | Lists/tabs rely on `space-y-*` wrappers | TODO | Convert panels to flex/grid + `fluid-stack-*` |
| Forms | `components/forms/company-form.tsx`, `company-faq-form.tsx`, `company-faq-item-form.tsx` | Forms use `space-y` wrappers and per-field spacing | TODO | Replace with `<form className=\"flex flex-col fluid-stack-md\">` etc. |
| UI Primitives | `components/ui/input.tsx`, `select.tsx`, `textarea.tsx`, `tabs.tsx`, badges/pills | Base components still declare bespoke padding/margins | TODO | Move to CSS custom properties or token classes referenced in `globals.css` |
| Documentation | `docs/FLUID_UTILS_GUIDE.md` | Needs section describing new tracker + primitive usage | TODO | Update after primitives migrate |
| QA | Viewports 375/414/768/1024/1440 | Need screenshot diff vs PropFirmMatch to confirm rhythm | TODO | Run once all surface rows marked Done |

> When you finish a row, update the **Status** column and add any relevant notes (PR link, gotchas). Use one row per meaningful module; feel free to append additional rows if new spacing outliers appear.

