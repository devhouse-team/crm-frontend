# Surface Brief: Sales Pipeline (`sales-pipeline`)

## Visitor Mode
operate

## Job and Audience
- **Primary Users**: Sales Managers (`Менеджер по продажам`) qualifying inbound debt-collection inquiries and closing deals, and Executives (`Руководитель`) tracking pipeline volume and bottlenecks.
- **Operating Context**: High-volume, fast-paced work. Sales managers switch rapidly between WhatsApp conversations, document requests, debt fee calculations, and stage progression.
- **Visitor Mode**: `operate` (speed, scanability, dense information, zero visual clutter).

## Outcome and Proof
- **Primary Task**: Qualify incoming leads from WhatsApp, clear conflict-of-interest gates, generate and dispatch commercial proposals, and convert won deals into legal proceedings.
- **Success Criteria**:
  - Immediate visual identification of leads needing urgent manager attention (`⚠️ Ждет менеджера` / `A — Срочно`).
  - Strict enforcement of mandatory stage rules (Debt sum required for `Квалифицирована`, conflict clearance required for `Предложение отправлено`).
  - Seamless navigation between the Kanban board and the split-pane Deal slide-over without losing board scroll position.
- **Real Evidence / Data**: Kazakhstan currency figures (₸), 12-digit IIN/BIN (`ИИН/БИН`), bailiff (`ЧСИ`) proceeding numbers, and 5 distinct client scenarios from ТЗ.

## Selected Direction
- **Topology**: Dual-mode view (Kanban Board by default with a Dense Table/List toggle) paired with a persistent right slide-over drawer (`USlideover`, 55–60% width) for split-pane deal inspection and WhatsApp messaging.
- **Visual Identity**: High-density enterprise precision using `@nuxt/ui` + Tailwind CSS. Muted slate surfaces, monospaced numerals for currency and identification numbers, subtle border dividers, and high-contrast semantic badges (`A/B/C/D`).
- **Focal Moment**: Dragging a deal to `Квалифицирована` or `Предложение отправлено` triggering a crisp, keyboard-focused validation blocker modal if required data is missing.

## Scope and Boundaries
- **In Scope**:
  - Full Sales Pipeline Kanban board with 8 active stages + 1 loss drop zone.
  - Compact Deal Card: client name, debt sum, recommended fee, A/B/C/D badge, live WhatsApp status indicator, next task deadline.
  - Column headers with aggregate counts and total debt sums.
  - Quick filter bar: search (name/phone/IIN), My Deals, Readiness tag filter (`A / B / C / D`), WhatsApp filter (`⚠️ Ждет ответа`).
  - Strict modal intercept for mandatory field enforcement.
  - Lost deal dialog with mandatory rejection reason picker.
  - Slide-over drawer trigger keeping the background board intact.
- **Anti-Goals**:
  - No full-page route jumps that reload or wipe board scroll position.
  - No mixing of post-sale case execution into this sales route (handled in `/cases`).

## States and Ranges
- **Data Ranges**:
  - Typical pipeline load: 50–200 active deals across 8 stages.
  - Debt sums: 150 000 ₸ to 250 000 000 ₸.
  - Service fees: 50 000 ₸ to 2 500 000 ₸ (+ optional success fee %).
- **Key UI States**:
  - *Normal*: Cards displayed with live status pills.
  - *Dragging / Hover*: Highlighted drop targets with valid/invalid indicator.
  - *Intercepted*: Blocker modal with inline field inputs (e.g. `Сумма долга`).
  - *Filtered / Empty*: Clean empty state per column with clear reset button.
  - *Conflict Alert*: Card marked with amber/red conflict shield icon if duplicate IIN/BIN found.

## Interaction and Layout
- **Header Toolbar**: Pipeline switcher tab (`Воронка продаж` | `Ведение дел`), view mode toggle (Kanban vs Table), search input, quick filter chips, and primary `+ Новая сделка` action.
- **Kanban Columns**:
  1. `Новая заявка` (New)
  2. `Опрос AI` (Bot Active)
  3. `Квалифицирована` (Qualified)
  4. `Ждем документы` (Awaiting Docs)
  5. `Предложение отправлено` (Offer Sent)
  6. `Переговоры` (Negotiations)
  7. `Договор подписан` (Contract Signed)
  8. `Оплачена` (Paid -> auto-handoff trigger)
  - Bottom drop zone: `Закрыто и не реализовано` (Lost).
- **Deal Inspection Drawer**: Opens smoothly from right on card click; background Kanban dims slightly but retains its exact scroll state.

## Constraints and Deliverables
- Built using **Nuxt 3/4 + @nuxt/ui v4 + Tailwind CSS + Pinia**.
- WCAG AA contrast on all badge colors and text.
- Russian domain terminology adhering strictly to ТЗ.
