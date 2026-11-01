# Surface Brief: Platform WhatsApp Inbox & AI Monitor (`whatsapp-inbox`)

## Visitor Mode
operate

## Job and Audience
- **Primary Users**:
  - **Sales Managers (`Менеджер`)**: Operating a high-velocity omnichannel queue, taking over conversations qualified by the AI Sales Agent, requesting missing legal documents, and dispatching Commercial Proposals (`КП`).
  - **Lawyers (`Юрист`)**: Communicating with assigned clients (`Мои диалоги`) regarding court hearings, bailiff (`ЧСИ`) updates, and sending procedural documents.
  - **Executives (`Руководитель`)**: Monitoring live AI qualification quality, response SLAs, and PII masking compliance.
- **Visitor Mode**: `operate` (triage speed, zero missed escalations, simultaneous chat + deal field control).

## Outcome and Proof
- **Primary Task**: Triage all incoming WhatsApp inquiries, supervise the 24/7 AI Sales Agent in real time, seamlessly take over dialogues when human intervention is needed, and advance deals without leaving the inbox.
- **Success Criteria**:
  - **Zero dropped handoffs**: Conversations where the client asks for a human or finishes AI qualification (`⚠️ Ждет менеджера`) or has an expiring deadline (`A — Срочно`) automatically pin to the top of the queue.
  - **Full context before typing**: The right-hand inspector shows the structured **AI Brief (`Резюме ИИ`)**, extracted debt sum, and document checklist before the manager sends a single message.
  - **Verifiable PII Security**: Inline `🛡️ Скрыто для ИИ` pills prove that 12-digit `ИИН/БИН` and phone numbers are masked as `[ИИН_СКРЫТ]` / `[ТЕЛ_СКРЫТ]` before reaching the LLM.

## Selected Direction
- **Topology**: **3-Column Operator Console** filling `100vh` (no page scroll; independent column scrolling):
  - **Left Column — Thread Queue & Triage Filters (`26% width`)**: Search bar + segmented filter tabs (`⚠️ Ждет менеджера`, `🤖 Опрос AI`, `👤 Мои`, `Все`) + Pinned Escalation section at top + chronological active threads below.
  - **Center Column — Active WhatsApp Conversation & AI Console (`46% width`)**:
    - Top **AI Agent Live Control Bar**: shows current owner (`🤖 AI-Агент ведет опрос` vs `👤 Менеджер в диалоге`), 1-click `Перехватить диалог` / `Вернуть AI (Дожать документы)` toggle, and `🛡️ Режим ИИ-лога` PII masking preview switch.
    - **Message Stream**: WhatsApp bubbles with delivery ticks, inline PDF/image previews (with 1-click *"Сохранить в Документы сделки"*), AI extraction callouts, and inline `🛡️ Скрыто для ИИ` badges on sensitive numbers.
    - **Composer Dock**: **AI Smart Whisper (`AI Подсказка`)** contextual reply chips above the input (including objection handling for *"Дорого"*), Quick Template picker (`Приветствие`, `Запрос документов`, `Напоминание`, `КП`), file/template attachment trigger, and message input.
  - **Right Column — Live Deal & AI Brief Inspector (`28% width`)**:
    - **Pinned AI Brief Card (`Резюме ИИ`)**: *Суть ситуации*, *Стадия*, *Чего не хватает*, *Рекомендуемый шаг*.
    - **Quick Deal Controls**: Stage selector (with mandatory field validation), Readiness Tag (`A/B/C/D`), `Сумма долга`, recommended fee & Fee % badge, Conflict check status, Scenario Document Checklist, and a `Открыть полную карточку ↗` button (triggers `DealSlideover`).

## Scope and Boundaries
- **In Scope**:
  - Full-screen 3-column `/inbox` workspace.
  - Automatic lead & deal creation simulator (`+ Симулировать входящее WhatsApp`) to demonstrate new client intake, live AI questioning, PII masking, and A/B/C/D classification for stakeholders.
  - Pinned escalation queue for `⚠️ Ждет менеджера` and `A — Срочно`.
  - Inline PII Privacy Shield inspector (`[ИИН_СКРЫТ]`, `[ТЕЛ_СКРЫТ]`).
  - AI Smart Whisper suggestions and 4 WABA Quick Message Templates with variable interpolation.
  - 1-click PDF Commercial Proposal & legal document dispatch directly into the active thread.
- **Anti-Goals**:
  - No consumer-grade decorative chat wallpapers that hurt readability of legal documents and financial figures.
  - No hidden deal context requiring the manager to leave `/inbox` just to update `Сумма долга` or check required documents.

## States and Ranges
- **Queue States**:
  - *Escalated (`⚠️ Ждет менеджера`)*: Amber/red left border accent, pinned to top of queue, pulsing status dot.
  - *AI Qualifying (`🤖 Опрос AI`)*: Indigo/violet bot badge showing current question step (e.g., `Шаг 2/4: Запрос суммы долга`).
  - *Human Active (`👤 В работе`)*: Assigned manager avatar, unread counter, last message timestamp.
  - *PII Inspector Mode (`🛡️ Лог для ИИ`)*: Toggling the shield button swaps visible `ИИН 910412300412` and `+7 701 555 12 34` in the chat stream to `[ИИН_СКРЫТ]` and `[ТЕЛ_СКРЫТ]` to demonstrate compliance.

## Interaction and Layout
- **Keyboard Ergonomics**: `↑`/`↓` or `Alt+↑`/`↓` to cycle threads; `1`–`3` hotkeys or click to insert AI Smart Whisper suggestions; `/` to open Quick Templates menu.
- **Responsive Reflow**: Full 3-column layout on desktop (`≥1280px`); 2-column on laptop (`1024px–1279px` with Right Inspector collapsible via slide-over toggle).

## Constraints and Deliverables
- Built with **Nuxt 3/4 + @nuxt/ui v4 + Tailwind CSS + Pinia**.
- Adheres strictly to ТЗ §1 (WhatsApp Integration), §2 (AI Sales Agent), §5 (A/B/C/D Triage), and Security (`Маскирование ИИН/БИН`).
