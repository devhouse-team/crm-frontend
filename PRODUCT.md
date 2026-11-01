# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Nuxt 3/4 + @nuxt/ui (Tailwind CSS, Vue 3, TypeScript, Pinia)

## Users

- **Руководитель (Executive / Head)**: Oversees company revenue and legal caseload, configures debt pricing brackets and SLA rules, reviews and resolves conflict-of-interest alerts, and manages escalations for overdue procedural tasks.
- **Юрист (Lawyer)**: Executes active post-sale legal cases (`Ведение дел`), prepares procedural legal documents, monitors court dates and bailiff enforcement proceedings (`ЧСИ`), tracks procedural deadlines in working days, and communicates with assigned clients.
- **Менеджер по продажам (Sales Manager)**: Handles inbound inquiries via WhatsApp, qualifies debt cases, verifies document completeness, calculates fees, generates commercial proposals, and negotiates agreements.
- **End Clients (Debtors & Creditors in Kazakhstan)**: External individuals and corporate entities interacting with the company exclusively through WhatsApp with the automated AI sales agent and human staff.

## Product Purpose

An in-house, AI-native CRM platform specifically built for debt collection and legal case management in the Republic of Kazakhstan. It replaces generic amoCRM instances and third-party WhatsApp aggregators to eliminate per-seat licensing costs ($0 per additional user as team scales) and natively support Kazakhstan-specific legal workflows that generic CRMs cannot accommodate. Success means faster lead qualification, zero licensing overhead, 100% compliance with Kazakhstan personal data residency requirements, zero undetected conflicts of interest, and automated calculation of procedural deadlines.

## Positioning

Unlike generic CRM platforms (amoCRM, Bitrix24), this system natively couples an AI-driven WhatsApp intake funnel directly to a specialized legal procedural case pipeline with Kazakhstan calendar-aware deadline engines, automatic conflict-of-interest gating by IIN/BIN, and debt-to-fee bracket calculations.

## Operating Context

- **Operating Environment**: High-density desktop web interface used by sales managers and lawyers operating concurrently in fast-paced call/chat workflows.
- **Primary Channels**: WhatsApp Business API (WABA) for all client communications; internal Kanban boards and slide-out workspaces for operations.
- **Core Artifacts & Documents**: Republic of Kazakhstan court rulings (`Решение суда`), executive writ documents (`Исполнительный лист`), bailiff rulings (`Постановление ЧСИ`), commercial proposals, and formal petitions/complaints.

## Capabilities and Constraints

- **Dual Pipeline Engine**: Seamless handoff from Sales Funnel (`Новая заявка` -> `Квалифицирована` -> `Ждем документы` -> `Предложение отправлено` -> `Переговоры` -> `Договор подписан` -> `Оплачена`) to Case Funnel (`Сбор материалов` -> `Анализ` -> `Подготовка документа` -> `Подписание` -> `Отправлено` -> `Ожидание ответа` -> `Следующее действие` -> `Завершено`).
- **Mandatory Stage Transitions**: Enforcement rules (cannot qualify without debt amount; cannot propose without conflict clearance; cannot lose without mandatory reason).
- **Conflict-of-Interest Gate**: Automatic deduplication and matching against existing parties by IIN/BIN (`ИИН/БИН`) and proceeding number (`Номер исполнительного производства`).
- **RK Procedural Calendar SLA**: Calculates procedural deadlines in working days excluding RK official holidays and transferred non-working days.
- **Dynamic Pricing Engine**: Automated legal fee recommendation with high-ratio warnings and alternative success-fee tariff suggestions.
- **Native Two-Way WhatsApp Workspace**: Dedicated `/inbox` and split-pane Deal chat with bidirectional photo/PDF attachments.
- **AI Qualification & Co-Pilot**: AI Sales Agent 24/7 intake, structured AI Brief (`Суть`, `Стадия`, `Чего не хватает`), A/B/C/D triage tagging, and live manager handoff.
- **PII Privacy Shield**: Strict masking of IIN/BIN and phone numbers before dispatch to any LLM.
- **Local Data Residency**: Compliant with RK Law on Personal Data; zero external foreign cloud dependency for client PII.

## Brand Commitments

- **Tone & Voice**: Professional, restrained, authoritative, clear, and reassuring in both client-facing templates and internal workspaces.
- **Visual Archetype**: Enterprise tool precision (high information density, subtle borders, high contrast scanability, no frivolous ornament).

## Evidence on Hand

- `ТЗ CRM продаж и ведения дел по взысканию.pdf` (detailed specification of business logic, 5 client scenarios, pricing tables, stages, and 6 document templates).
- `plan.md` (complete 5-stage implementation roadmap, comparative benchmark, and architecture).

## Product Principles

1. **Zero-Friction Ergonomics**: High information density and keyboard-friendly speed; lawyers and managers need immediate access without deep nesting.
2. **Domain-Enforced Integrity**: The system refuses impossible or legally hazardous states (unresolved conflicts, missing debt sums, missed procedural deadlines).
3. **Privacy & Sovereign Security First**: Sensitive client financial and legal identification data is strictly guarded and masked before entering AI models.
4. **Transparent AI Collaboration**: The AI agent assists and qualifies, but human managers always retain full visibility, override control, and clear ownership.

## Accessibility & Inclusion

- WCAG 2.1 AA compliant color contrast on all text, badges, and status indicators.
- Full keyboard accessibility for modals, drawers, slide-overs, and table interactions.
- Russian-language domain terminology and clear typographic hierarchy for dense legal-financial data tables.
