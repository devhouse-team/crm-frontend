# Surface Brief: Legal Case Management Pipeline (`case-pipeline` — «Ведение дел»)

## Visitor Mode
operate

## Job and Audience
- **Primary Users**:
  - **Lawyers (`Юрист`)**: Managing post-sale legal execution across active enforcement proceedings, preparing petitions/complaints (`Ходатайство`, `Жалоба`, `Заявление об ознакомлении`), tracking private bailiff (`ЧСИ`) responses, and logging recovered funds (`Взыскано`).
  - **Executives (`Руководитель`)**: Monitoring lawyer caseload distribution, intervening on overdue statutory deadlines (`🚨 Просрочено`), and tracking total debt recovery performance (`Всего взыскано ₸`).
- **Visitor Mode**: `operate` (strict procedural deadline discipline, high-density legal metadata, zero missed statutory windows).

## Outcome and Proof
- **Primary Task**: Execute paid legal cases from initial material gathering (`Сбор материалов`) through document filing (`Отправлено`), official response tracking (`Ожидание ответа`), and final debt recovery (`Завершено`).
- **Success Criteria**:
  - **100% accurate Kazakhstan procedural deadlines**: Every filed petition or complaint automatically calculates its statutory response date in **RK working days** (visibly skipping Saturdays, Sundays, and official Republic of Kazakhstan public holidays).
  - **Proactive escalation**: Tasks expiring in 1 working day highlight in amber (`⏰ Истекает завтра`); overdue tasks highlight in red (`🚨 Просрочено`) and automatically flag the `Руководитель`.
  - **Clear financial recovery visibility**: Real-time tracking of `Взыскано` vs. `Сумма долга` per case and across the entire pipeline.

## Selected Direction
- **Topology**:
  - **Top SLA Triage & Recovery Bar**: Quick filter counters (`🚨 Просрочено [Эскалация Руководителю]`, `⏰ Истекает завтра [1 раб. день]`, `📅 Ждут ответа ЧСИ/Суда`), Lawyer workload selector (`Мои дела` / `Все юристы`), aggregate **Total Recovered (`Взыскано ₸ / Сумма долга ₸`)**, and Kanban / Dense Table toggle.
  - **8-Stage Legal Execution Board (`ТЗ §8`)**:
    1. `Сбор материалов`
    2. `Анализ`
    3. `Подготовка документа`
    4. `Подписание`
    5. `Отправлено`
    6. `Ожидание ответа`
    7. `Следующее действие`
    8. `Завершено`
  - **Procedural SLA-First Case Card**: Leads with the live **RK Working-Day Countdown Badge**, Proceeding `#` (`№ ИП`) & Bailiff name (`ЧСИ`), Client/Debtor `ИИН/БИН`, **Debt Recovery Progress Bar** (`Взыскано / Долг`), and a 1-click `📄 Шаблон` generator trigger.
  - **Right Slide-over Integration**: Clicking any card opens `DealSlideover` directly to the `Сроки РК и Задачи` or `Документы и Шаблоны` tab while keeping the right-hand WhatsApp client chat active.
- **Focal Moment**: Dragging a case into `Отправлено` or `Ожидание ответа` opens the **RK Procedural Deadline Popover**, where selecting an event (e.g., *«Жалоба на действия ЧСИ — +10 раб. дней РК»*) displays a transparent breakdown of skipped weekends and RK national holidays (e.g., *Наурыз / День Республики*) before locking the exact target date.

## Scope and Boundaries
- **In Scope**:
  - Automatic handoff banner showing deals recently transferred from `Воронка продаж` upon `Оплачена`.
  - 8-stage Kanban & Dense Table view tailored to legal case execution.
  - Interactive **RK Working-Day & Holiday Deadline Modal** triggered on stage transition to `Отправлено` / `Ожидание ответа`.
  - Overdue escalation banner notifying `Руководитель` when a deadline passes without action.
  - Quick 1-click access to the 4 post-sale legal templates (`Заявление об ознакомлении`, `Ходатайство`, `Повторное обращение`, `Жалоба`).
  - Partial & full debt recovery logger (`+ Зафиксировать взыскание ₸`) updating `Взыскано` in real time.
- **Anti-Goals**:
  - No lead-qualification clutter (AI bot quiz steps or commercial proposal fee negotiation warnings are tucked away once the case is in post-sale execution).
  - No opaque calendar math: lawyers must always see *why* a deadline landed on a specific date (which RK holidays/weekends were excluded).

## States and Ranges
- **SLA Countdown States**:
  - *On Track (`🟢 Осталось 4 раб. дня РК`)*: Calm neutral/emerald badge with target date and skipped-holiday tooltip.
  - *Due Tomorrow (`🟡 Истекает завтра — 1 раб. день`)*: Amber warning badge + automatic reminder task for the assigned `Юрист`.
  - *Overdue & Escalated (`🔴 Просрочено на 2 раб. дня · Уведомлен Руководитель`)*: High-contrast red card border, escalation badge, and entry in the Executive's overdue queue.
  - *Completed (`✅ Взыскано полностью`)*: Green recovery progress bar at 100%.

## Interaction and Layout
- **Seamless Dual-Pipeline Continuity**: Header includes a quick pipeline switcher (`Воронка продаж` $\leftrightarrow$ `Ведение дел`) showing the badge count of newly paid cases handed off today.
- **Keyboard & Filter Speed**: Clicking any SLA Triage counter (`🚨 Просрочено`, `⏰ Истекает завтра`) filters the 8 columns in place without page reload.

## Constraints and Deliverables
- Built with **Nuxt 3/4 + @nuxt/ui v4 + Tailwind CSS + Pinia**.
- Adheres strictly to ТЗ §8 (Часть 2: Ведение дел), §9 (Контроль сроков в рабочих днях с учётом праздников РК), and §10 (Шаблоны документов для ведения дел).
