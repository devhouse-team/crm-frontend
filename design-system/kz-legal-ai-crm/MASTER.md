# KZ Legal AI-CRM — Master Design System (`ui-ux-pro-max` + `impeccable`)

## 1. Visual Direction & Dials
- **Visitor Mode**: `operate` (High-density desktop operator console for Sales Managers, Lawyers, and Executives)
- **Density Dial**: `8/10` (Dense / Dashboard — 4/8px spacing rhythm, compact tabular rows, split-pane slideover)
- **Variance / Motion Dials**: `2/10` / `2/10` (Minimalism & Swiss Style — clean, high contrast, restrained motion, zero frivolous ornament)
- **Style**: Flat Enterprise Precision (`@nuxt/ui` + Tailwind CSS v4)

## 2. Semantic Palette (`app.config.ts`)
- **Primary**: `emerald` (`#059669`) — Financial recovery, verified compliance, primary actions
- **Secondary**: `indigo` (`#4F46E5`) — AI Sales Agent, quiet `<AiMarker />` field provenance, Smart Whisper suggestions
- **Warning**: `amber` (`#D97706`) — Escalated WhatsApp handoffs (`Ждут ответа`), high fee % alerts, expiring 1-day RK deadlines
- **Error / Destructive**: `rose` (`#E11D48`) — Conflict of Interest blocks (`ИИН/БИН`, `№ ИП`), Tag `A · Срочно`, overdue statutory deadlines
- **Neutral**: `slate` — Crisp borders, elevated cards, muted table headers

## 3. Typography & Numerals
- **Sans**: `Inter`, system-ui (`--font-sans`)
- **Monospace**: `JetBrains Mono` (`--font-mono`) with `tabular-nums` for all KZT (`₸`) currency figures, 12-digit `ИИН/БИН`, and bailiff proceeding numbers (`№ ИП`)
- **Modular Type Scale**: 4 steps only — `text-xs` (12px meta), `text-sm` (14px body/table), `text-base` (16px panel title), `text-lg` (18px page H1); `text-2xl` reserved exclusively for top-level KPI numerals.

## 4. Surface Architecture
1. **Sales Pipeline (`/sales`)**: 8 active Kanban stages + 1 bottom drop zone (`Закрыто и не реализовано`), readiness tags `A / B / C / D`, mandatory field intercept modals.
2. **Case Management Pipeline (`/cases`)**: 8 post-sale legal execution stages, RK working-day countdowns skipping official Kazakhstan holidays, debt recovery progress bars.
3. **Split-Pane Deal Workspace (`DealSlideover.vue`)**: 52% Left (4 sub-tabs: Карточка, Документы, Сроки, История) + 48% Right (Persistent two-way WhatsApp Business chat).
4. **Platform WhatsApp Inbox (`/inbox`)**: 3-column `100vh` operator console with pinned escalations, AI Brief (`Резюме`), PII Privacy Shield (`[ИИН_СКРЫТ]`, `[ТЕЛ_СКРЫТ]`), and AI Smart Whisper chips.
5. **Governance & RBAC (`/conflicts`, `/settings`, `/users`, `/analytics`)**: Side-by-side Conflict of Interest resolution, live Debt-to-Price simulator, RK Holiday Calendar tester, team & role directory, and funnel analytics.

## 5. Accessibility & Interaction Standards
- WCAG 2.1 AA contrast (`>= 4.5:1`) verified independently in both light and dark modes.
- Keyboard-operable cards, rows, drawers, and dropdowns with visible focus rings and `aria-label` on icon-only controls.
- `prefers-reduced-motion: reduce` disables non-essential transitions.

## 6. Anti-Slop Rules
Enforced automatically via `npm run lint:slop` (`scripts/check-slop.mjs`):

| # | Rule | Do | Don't |
|---|---|---|---|
| R1 | **No emoji / decorative unicode** in templates, toasts, or store strings | `trailing-icon="i-lucide-arrow-right"` or plain label | `"Открыть →"`, `"Ждут ⚠️"`, `"✨ AI"` |
| R2 | **Type scale = 4 steps**: `text-xs`, `text-sm`, `text-base`, `text-lg` (plus `text-2xl` KPI) | `text-xs text-muted` | `text-[10px]`, `text-[11px]`, `text-[13px]` |
| R3 | **Weights**: `font-semibold` for titles, `font-medium` for emphasis, `font-bold` only for main KPI numerals | `font-semibold` | `font-bold` on every heading, name, and row |
| R4 | **Semantic color only**: `text-primary`, `text-error`, `bg-warning/10`, `border-error/30`, `text-muted/toned/highlighted` | `text-error` | `text-rose-700 dark:text-rose-300` |
| R5 | **Color = state, not decoration**: color only for error, warning, success, or primary action | Neutral names and hover states | Colored hover on client names, green chat icons |
| R6 | **State is signalled once** per item: badge *or* status line, never border + banner + badge together | Single priority badge + status dot | Colored border + tinted box + solid badge |
| R7 | **Badge budget**: `<= 2` badges per card/row, `<= 1` per heading | Counts in nav badges or tabs | Multiple stacked badges per header |
| R8 | **Titles `<= 3` words**, no parentheses, no counts, no spec refs | `"Аналитика"` | `"Отчеты и Аналитика Руководителя (ТЗ §11)"` |
| R9 | **Button labels = verb + object**, `<= 3` words, no leading `+` (use `icon="i-lucide-plus"`) | `"Новая сделка"` | `"+ Добавить сотрудника"` |
| R10 | **No self-promotion in product UI** (licensing pitches, "100%", "24/7", compliance slogans) | Quiet operational status only on error | Marketing banners inside operator screens |
| R11 | **Radius & surfaces**: `rounded-lg` for panels, `rounded-md` for cards/inputs, no nested bordered boxes inside cards | Flat 4-row card | Nested `rounded-xl` -> bordered box -> bordered banner |
| R12 | **Icons**: Lucide only (`size-4` inline, `size-3.5` dense), `AiMarker` (`i-lucide-bot` + tooltip) for AI provenance | `<AiMarker />` | Sparkles icons, `"✨ Извлечено ИИ"` |
