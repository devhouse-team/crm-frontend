# Surface Brief: Conflict Resolution, Pricing/SLA Settings & Unlimited RBAC (`conflicts-and-settings`)

## Visitor Mode
operate

## Job and Audience
- **Primary Users**:
  - **Executives (`Руководитель`)**: Resolving legal conflict-of-interest escalations, tuning debt-to-service fee brackets, maintaining Kazakhstan working-day SLA rules, and onboarding unlimited staff members (`Юрист`, `Менеджер`).
  - **Stakeholders (Demo Evaluators)**: Testing role-based permissions (`Руководитель` <-> `Юрист` <-> `Менеджер`) and verifying the **$0 per-seat licensing advantage** vs. amoCRM.
- **Visitor Mode**: `operate` (authoritative decision gates, transparent rule configuration, zero ambiguity).

## Outcome and Proof
- **Primary Task**: Prevent legal conflicts of interest before commercial proposals are dispatched, govern automated pricing and RK procedural deadlines from a central control plane, and scale the team without per-user license fees.
- **Success Criteria**:
  - **Zero accidental dual-representation**: Every duplicate `ИИН/БИН` or proceeding number (`№ ИП`) across `Взыскатель` and `Должник` records is caught and presented side-by-side for Executive sign-off.
  - **Instant rule validation**: Editing a debt bracket or fee threshold immediately updates a live pricing test calculator on the same screen.
  - **Tangible ROI proof**: Adding new managers or lawyers updates the live **amoCRM License Savings Counter** (`0 ₸ vs. 9 899–15 099 ₸/чел/мес`).

## Selected Direction
- **Topology**: Three focused administrative/governance workspaces accessible from the sidebar:
  1. **`/conflicts` — Conflict of Interest Resolution Queue (`ТЗ §6`)**:
     - Top summary strip (`Ожидают решения Руководителя`, `Разрешено`, `Отклонено из-за конфликта`) + live **`🔍 Проверить ИИН/БИН или № ИП`** manual scanner.
     - **Side-by-Side Comparison Cards**: Left side shows the **New Incoming Deal** (Client name, role `Взыскатель/Должник`, `ИИН/БИН`, `№ ИП`, assigned manager); Center badge highlights the exact collision (`⚡ Совпадение ИИН: 890512300145` or `⚡ Совпадение № ИП`); Right side shows the **Existing Active/Archived Record** (opposing party role, lawyer, stage).
     - **Executive Decision Dock**: Mandatory resolution comment + 1-click **`✅ Разрешить продолжение`** (unlocks stage `Предложение отправлено`) or **`⛔ Отклонить из-за конфликта`** (moves deal to `Закрыто и не реализовано` with reason `Конфликт интересов`).
  2. **`/settings` — Pricing Matrix, RK Holiday Calendar & Document Templates (`ТЗ §4, §9, §10`)**:
     - **Tab 1 — `Тарифная сетка от суммы долга`**: Editable bracket table (`Сумма долга от – до`, `Базовый тариф ₸`, `Макс. % от долга`, `Альтернативный тариф (Фикс + % от взыскания)`) paired with a **Live Simulator Widget** (`Введите сумму долга → Расчет тарифа, % и предупреждения`).
     - **Tab 2 — `Сроки РК и Праздничный календарь`**: Editable procedural SLA rules (`Заявление — 5 раб. дней`, `Ходатайство — 10 раб. дней`, `Жалоба — 15 раб. дней`) + visual **Republic of Kazakhstan Official Holidays Calendar** (`Наурыз`, `День Республики`, `День Независимости`, etc.) with a live working-day deadline tester.
     - **Tab 3 — `Шаблоны документов (6) и WhatsApp (4)`**: Variable tags editor (`{{client_name}}`, `{{debt_amount}}`, `{{bailiff_name}}`, `{{tariff_price}}`) for the 6 legal/commercial templates and 4 WhatsApp quick replies.
  3. **`/users` — Unlimited Free RBAC & Demo Role Switcher**:
     - **Top Stakeholder ROI Banner**: Shows current headcount (`N сотрудников = 0 ₸/мес в нашей CRM`) vs. amoCRM Extended (`9 899 ₸/мес × N`) and Pro (`15 099 ₸/мес × N`) with annual KZT savings (`Экономия ~2.8 млн ₸/год`).
     - **Team Directory & Permission Matrix**: Table of `Руководитель`, `Юрист`, and `Менеджер` accounts with active caseload/deal counters, `+ Добавить сотрудника (0 ₸ / безлимит)`, and a **1-Click "Войти под ролью (Демо)"** button that switches the current session's active role immediately.

## Scope and Boundaries
- **In Scope**:
  - Side-by-side Conflict of Interest queue + manual `ИИН/БИН` & `№ ИП` scanner.
  - Editable Debt-to-Service Pricing Matrix with live threshold warning simulator.
  - Editable Kazakhstan Working-Day SLA rules & RK public holiday list with live date calculator.
  - Unlimited user management table, role permission matrix, and amoCRM cost-savings comparison banner.
- **Anti-Goals**:
  - No complex developer-only regex/JSON editors; every rule is a clean table or visual control operable by a non-technical `Руководитель`.

## States and Ranges
- **Conflict Severity States**:
  - *Critical Opposing Party Match (`🚨 Противоположная сторона по одному ИП`)*: Red alert badge when the new lead is the debtor in a case where we already represent the creditor (or vice versa).
  - *Duplicate Inquiry / Related Entity (`⚠️ Повторное обращение / Связанный БИН`)*: Amber alert badge when the same client or subsidiary re-applies.
  - *Cleared / Rejected*: Archived in the resolution history tab with Executive timestamp and note.

## Interaction and Layout
- **Reactive Cross-App State**: Updating a pricing bracket in `/settings` or resolving a conflict in `/conflicts` immediately updates the corresponding deals on `/sales` and inside `DealSlideover` via Pinia.
- **Instant Role Preview**: Clicking `Переключить роль` on `/users` (or in the top navigation bar) updates visible sidebar items and action permissions across the entire app without reload.

## Constraints and Deliverables
- Built with **Nuxt 3/4 + @nuxt/ui v4 + Tailwind CSS + Pinia**.
- Adheres strictly to ТЗ §4 (Расчёт цены), §6 (Проверка конфликта интересов), §9 (Контроль сроков РК), §10 (Шаблоны), and §Роли и доступы.
