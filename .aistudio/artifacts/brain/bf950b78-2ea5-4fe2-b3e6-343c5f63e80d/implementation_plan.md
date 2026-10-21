# Cashflow Copilot: Actionable Transaction Intelligence & Leak Prevention

A Consumer FinTech web application demonstrating AI-powered transaction enrichment, automated financial money-leak detection, and Google PAIR-compliant human-in-the-loop remediation workflows.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product design choices have been confirmed through user feedback and will govern the build:

- **Confirmed Decision 1 (Currency Model)**: Indian Rupee (`₹` INR) default with instantaneous real-time conversion toggles to USD (`$`) and EUR (`€`). Leak amounts and savings calculations adapt dynamically.
- **Confirmed Decision 2 (Ingest & Testing Experience)**: The Custom SMS / Bank Statement Ingest Box will provide instant one-click presets representing real-world messy formats (HDFC bank alerts, ICICI POS debit, Chase card transaction, and UPI strings) alongside a freeform multi-line paste box.
- **Confirmed Decision 3 (PAIR Human-in-the-Loop Action Drawer)**: Interactive modal drawer that stages safety actions with live previews, editable merchant dispute / cancellation letters, and simulated card management controls (virtual card freeze / recurring billing cutoff), requiring explicit user confirmation before executing.

---

### 1. Overview & Core Concept

- **What It Does**: Cashflow Copilot transforms unintelligible raw transaction feeds and SMS alerts into enriched financial intelligence. Beyond cosmetic cleanup, it actively audits transactions against 3 leak archetypes (Price Creep, Reward Optimizer misallocations, and Zombie Subscriptions) and provides safe, staged remediation following Google PAIR (People + AI Research) principles.
- **Target Audience / Persona**: Personal finance power users, founders, and consumers managing complex recurring software subscriptions, multi-currency credit cards, and multiple merchant debits.
- **Key Value**: Replaces passive retro-budgeting with proactive leak prevention, estimated savings calculations, and non-destructive AI actions where the human remains firmly in the driver's seat.

---

### 2. User Experience & Visual Design

- **Visual Identity & Theme**:
  - *Palette*: Dark slate executive console (`#0B0F17` dominant background, `#111827` / `#161F30` surface cards, `#1E293B` hairline borders).
  - *Accents*: Emerald Green (`#10B981`) for confirmed savings and optimal rewards; Amber (`#F59E0B`) for price creep warnings; Crimson (`#EF4444`) for zombie leaks; Cyan/Indigo subtle highlights for active filters.
  - *Typography*: `Plus Jakarta Sans` for titles, navigation, and executive summaries; `JetBrains Mono` with `tabular-nums` for all amounts, currencies, timestamps, and transaction reference IDs.
  - *Layout Contract*: 1440px-optimized desktop console with clean section pacing, unboxed metadata (`·` typographic separators), single-level elevation, and zero visual clutter.

- **Key User Flows & Interactive Views**:
  1. **Top Bar & Executive Summary**:
     - Wordmark: `Cashflow Copilot` with subtle subtitle in hero.
     - Controls: Currency switcher (`INR ₹`, `USD $`, `EUR €`), statement switch (`Pre-Loaded Statement` vs `Custom SMS Ingest Box`), and active JWT session indicator.
     - Executive KPI Strip: Total Tracked Spend, Net Monthly Leakage Detected, Realized Savings, and Active Protected Subscriptions.
  2. **The 3-Card "Financial Leaks" Action Inbox**:
     - Prominent headline: `₹3,450/mo Potential Savings Identified`.
     - *Card 1 (Price Creep)*: Netflix premium plan escalated from ₹499 to ₹649 (+30.1% sudden hike) with historical pricing comparison.
     - *Card 2 (Reward Optimizer)*: Indigo / British Airways flight booking billed to standard debit card instead of 4x travel points card (loss of ₹1,800 in travel miles).
     - *Card 3 (Zombie Trial)*: AI Design Tool renewal scheduled in 3 days with zero login activity in 42 days.
     - Each card features an actionable button: `"Review & Fix"`.
  3. **PAIR Human-in-the-Loop Action Drawer**:
     - Slides into focus when clicking `"Review & Fix"` on any leak card.
     - Displays:
       - **AI Explanation & Confidence**: Rationale explaining why this was flagged.
       - **Staged Action Step 1 (Merchant Communication)**: Pre-drafted formal cancellation or dispute email with editable fields (recipient, subject, body).
       - **Staged Action Step 2 (Payment Safeguard)**: Simulated virtual card freeze toggle or recurring merchant block with instant visual feedback.
       - **Confirmation Gate**: The AI refuses to auto-execute. The user must review, make adjustments, and click `"Confirm & Execute Safeguard"`.
       - **Audit Receipt**: Generates a downloadable / copyable remediation receipt with timestamp and action log.
  4. **The Messy-to-Clean Transaction Feed**:
     - Interactive view toggle: **Raw Bank SMS / POS Feed** vs **Copilot Enriched Feed**.
     - Raw view exposes messy uppercase strings, masked account numbers, and cryptic merchant terminal IDs.
     - Enriched view shows verified brand logos, category categorization, recurrence cycle (Monthly, Annual, One-off), FX markup tags, and anomaly indicators.
     - Live search filter by merchant name or category.
  5. **Live Statement & SMS Ingest Sandbox**:
     - Paste any raw bank SMS or credit card alert, or select sample one-click presets.
     - Calls backend Express route connected to `@google/genai` (`gemini-2.5-flash`).
     - Live parsing extracts merchant, standardized amount, category, recurrence flag, and anomaly score, appending directly into the feed.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Architecture with Express & Vite (`server.ts`)**
  - *Chosen Approach*: Unified Node server running Express on port 3000, serving Vite in development, hosting secure `/api/*` endpoints for Gemini parsing and simulated JWT authentication.
  - *Why*: Satisfies API security constraints (Gemini API key is kept strictly server-side), enables clean JSON schemas for Gemini 2.5 Flash, and provides JWT token verification for financial data endpoints.
  - *Alternatives Considered*: Pure client-side app (rejected because it would expose Gemini keys in browser code and cannot demonstrate server-side JWT security).

- **Decision 2: Google PAIR Compliance for Financial Autonomy**
  - *Chosen Approach*: Explicit staging state machine (`flagged` → `staged` → `reviewed` → `executed`). AI prepares the artifacts (drafts, merchant lookup, card rule) but cannot trigger the mock payment API or card network block without explicit user authorization.
  - *Why*: Adheres strictly to the prompt requirement and Google PAIR financial guidelines preventing catastrophic autonomous financial actions.

- **Decision 3: Zero-Pill & Tabular Discipline**
  - *Chosen Approach*: Clean typography with middle-dot separators (`·`) for categories and dates; dedicated `font-mono tabular-nums` for all financial figures.
  - *Why*: Adheres to strict FinTech design standards avoiding colorful candy pill sandwiches while maintaining high-density readability.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CASHFLOW COPILOT UI                             │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ Top Navigation        │  │ Currency Toggles (INR/USD/EUR)        │  │
│  │ Brand + Auth Token    │  │ Preloaded Statement / Ingest Sandbox  │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Financial Leaks Action Inbox (3 Priority Cards with "Fix This")   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ click "Review & Fix"             │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Google PAIR Human-in-the-Loop Action Drawer                      │  │
│  │  - Transparent AI Rationale                                      │  │
│  │  - Editable Cancellation Draft                                   │  │
│  │  - Virtual Card Block Toggle                                     │  │
│  │  - Explicit "Confirm & Execute" Human Authorization Gate         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Transaction Feed (Toggle: Cryptic Raw SMS <-> Enriched Copilot)  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────▼───────────────────────────────┐  │
│  │ Custom SMS / Statement Ingest Box (with Gemini 2.5 Flash Parser) │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                   POST /api/parse-transaction
                   Authorization: Bearer <JWT>
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (server.ts)                         │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ Auth Middleware (JWT) │  │ Rate Limiter & Structured Validator   │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Google GenAI Client (server-side with GEMINI_API_KEY)            │  │
│  │ Model: gemini-2.5-flash                                          │  │
│  │ Output: Structured JSON (Merchant, Category, Anomaly, Risk)      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Interactive State & Handlers**:
  - `activeCurrency`: Swaps currency representation and applies exact conversion factors to all feeds and summaries.
  - `transactions`: Reactive array seeded with realistic credit card/UPI transactions (Cloudflare, Netflix, Indigo, Midjourney, AWS, Uber).
  - `leaks`: State tracking leak status (`pending`, `staged`, `executed`, `dismissed`).
  - `selectedLeak`: Active leak displayed in the PAIR drawer.
  - `rawVsEnriched`: View mode toggle flipping between cryptic SMS text and enriched metadata.
  - `ingestState`: Handles live SMS parsing via `/api/parse-transaction` with loading skeletons and instant feedback.
