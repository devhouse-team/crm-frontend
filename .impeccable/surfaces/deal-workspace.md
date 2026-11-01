# Surface Brief: Split-Pane Deal Workspace (`deal-workspace`)

## Visitor Mode
operate

## Job and Audience
- **Primary Users**:
  - **Sales Managers (`Менеджер`)**: Reviewing AI-extracted qualification data, running debt-to-fee pricing calculations, clearing conflicts, and sending Commercial Proposals (`КП`) over WhatsApp.
  - **Lawyers (`Юрист`)**: Managing post-sale case execution (`Ведение дел`), generating the 6 procedural legal templates (`Ходатайство`, `Жалоба`, `Заявление об ознакомлении`), and tracking Kazakhstan working-day procedural deadlines.
  - **Executives (`Руководитель`)**: Inspecting escalated conflicts (`ИИН/БИН` matches) and approving custom fee structures.
- **Visitor Mode**: `operate` (zero context switching: structured legal/financial controls on the left, live client WhatsApp dialogue on the right).

## Outcome and Proof
- **Primary Task**: Move a deal from initial WhatsApp inquiry to signed contract and active legal execution inside a single unified workspace without leaving the board context.
- **Success Criteria**:
  - Zero manual re-typing of client answers: AI-extracted parameters (`Сумма долга`, `Ситуация`, `ИИН/БИН`, `ЧСИ`) auto-populate deal fields with `✨ AI` provenance indicators.
  - Instant visibility into deal economics: automatic calculation of recommended fee, **Service Cost % of Debt**, and automatic suggestion of a **Success-Fee (оплата по результату)** tariff when the fixed fee ratio is too high.
  - 1-click end-to-end document dispatch: generating any of the 6 legal/commercial templates previews interpolated fields, saves the `.pdf`/`.docx` to the deal, and sends it directly into the WhatsApp chat.

## Selected Direction
- **Topology**: Wide Right Slide-over Drawer (`USlideover`, ~60–65% viewport width) split into two persistent columns:
  - **Left Column (52% width)**: Sticky Deal Summary Header + 4 fast sub-tabs (`Основное и Расчет`, `Документы и Шаблоны`, `Сроки РК и Задачи`, `История`).
  - **Right Column (48% width)**: Persistent Platform WhatsApp Chat (`WhatsAppThread`) topped by the **AI Sales Agent Control Bar** and collapsible **Pinned AI Brief (`Резюме ИИ`)**.
- **Visual Identity**: High-density enterprise workspace (`@nuxt/ui` + Tailwind CSS). Monospaced numerals for `₸` amounts, `ИИН/БИН`, and proceeding numbers (`№ ИП`); subtle `✨ AI` badges on auto-filled inputs; semantic banners for Conflict of Interest and High Fee % warnings.
- **Focal Moment**: Toggling `👤 Перехватить диалог` in the AI Control Bar or clicking `Сгенерировать и отправить в WhatsApp` on a Commercial Proposal and watching it appear immediately as a sent PDF attachment in the right-hand WhatsApp thread.

## Scope and Boundaries
- **In Scope**:
  - **Sticky Deal Header**: Deal ID/Title, Pipeline & Stage dropdown (enforcing mandatory field guards), Readiness Tag (`A / B / C / D`), Conflict status badge, and Fee-to-Debt % pill.
  - **Sub-Tab 1 — `Основное и Расчет`**:
    - Conflict of Interest Banner (`ConflictCheckBanner`): alerts on matching `ИИН/БИН` or proceeding `#`, with inline `Разрешить` / `Отклонить` buttons for `Руководитель`.
    - Client & Case Fields (`ИИН/БИН`, `Сумма долга`, `Взыскано`, `Ситуация` [5 scenarios], `Стадия`, `Номер ИП`, `ЧСИ`) with `✨ AI` auto-fill indicators.
    - Dynamic Debt-to-Service Pricing Widget (`DebtPricingWidget`): bracket match, Fee % of Debt indicator, high-ratio warning alert, and 1-click switch to Alternative Success-Fee tariff.
  - **Sub-Tab 2 — `Документы и Шаблоны`**:
    - Scenario Document Checklist (`Решение суда`, `Исполнительный лист`, `Постановление ЧСИ`) synced with incoming WhatsApp media.
    - 6 Template Generators (`Коммерческое предложение`, `Договор`, `Заявление об ознакомлении`, `Ходатайство`, `Повторное обращение`, `Жалоба`) with inline variable preview modal and 1-click `Сгенерировать и отправить в WhatsApp`.
  - **Sub-Tab 3 — `Сроки РК и Задачи`**:
    - Procedural Event Logger (`Отправлено заявление`, `Получено постановление`) that computes deadlines in **Kazakhstan working days** (skipping weekends & official RK public holidays) + task list.
  - **Sub-Tab 4 — `История`**: Full audit log (stage transitions, AI extractions, PII masking events, conflict checks).
  - **Right Column — Embedded WhatsApp & AI Console**:
    - AI Agent Status Bar (`🤖 AI-Агент ведет опрос` / `👤 Менеджер в диалоге` / `⚠️ Требуется человек`) + `🛡️ ИИН/Тел скрыты` PII Privacy Shield indicator.
    - Pinned AI Brief Card (`Суть`, `Стадия`, `Чего не хватает`, `Следующий шаг`).
    - Two-way WhatsApp thread with inline PDF/image preview, **AI Smart Whisper** contextual reply chips (including objection handling for *"Дорого"*), and Quick Message Templates.
- **Anti-Goals**:
  - No separate browser tab or external messenger window required to chat or send PDFs.
  - No silent overwriting of human-edited fields by the AI Agent (AI only auto-fills empty fields or flags diffs).

## States and Ranges
- **Key States**:
  - *AI Active (`🤖 Опрос AI`)*: Fields populate live with `✨ AI` badges; composer shows "AI ведет диалог — Нажмите, чтобы перехватить".
  - *Conflict Detected (`⛔ Конфликт ИИН/БИН`)*: Red/amber top banner locks transition to `Предложение отправлено` until `Руководитель` resolves.
  - *Disproportionate Fee Warning (`⚠️ Услуга > 30% от долга`)*: Pricing widget highlights ratio in amber and offers 1-click switch to lower-upfront + success-fee package.
  - *Paid Handoff (`Оплачена → Ведение дел`)*: Banner confirms automatic transfer to Case Management pipeline and highlights the `Сроки РК и Задачи` tab.

## Interaction and Layout
- **Keyboard & Operator Ergonomics**: `Esc` closes drawer back to Kanban/Inbox; sub-tabs switch instantaneously without re-mounting the right-hand WhatsApp chat stream.
- **Responsive Reflow**: On wide desktop (`≥1280px`), side-by-side 52% / 48% split; on smaller viewports (`<1024px`), top segmented toggle switches between `Карточка сделки` and `WhatsApp Чат (unread badge)`.

## Constraints and Deliverables
- Built with **Nuxt 3/4 + @nuxt/ui v4 + Tailwind CSS + Pinia**.
- Strict adherence to ТЗ sections §1, §3, §4, §5, §6, §9, §10, and Security (`Маскирование ИИН/БИН`).
