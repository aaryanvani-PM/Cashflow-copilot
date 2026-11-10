# Cashflow Copilot: Transaction Enrichment and Leak Detection

A prototype for consumer finance apps that turns raw bank-statement lines into clean, categorized transactions and flags "leaks" such as forgotten subscriptions, free trials that auto-renew, and price hikes. Every suggested action goes through a human-in-the-loop step before anything changes.

**Status:** Working prototype. Built in Google AI Studio; exported to GitHub on 22 October 2026.

## What it does

- **Enriches transactions.** A raw descriptor (for example `SPOTIFY INDIA ENT RECUR 119.00`) is parsed into a merchant, category, and recurrence pattern.
- **Flags leaks.** A leaks inbox surfaces likely waste, such as "zombie" subscriptions, trials that auto-renew, and price hikes.
- **Keeps the user in control.** An action drawer explains each flag and asks the user to confirm, dismiss, or correct it, following Google's People + AI (PAIR) guidance on human-in-the-loop design.
- **Shows the payoff.** A cumulative savings chart tracks what confirmed actions would save.

## How it works

React and Vite front end, Express server (`server.ts`) calling Gemini 2.5 Flash through `@google/genai` with a structured output schema.

| Endpoint | What it does |
|---|---|
| `POST /api/auth/token` | Issues a short-lived demo token (JWT) |
| `POST /api/parse-transaction` | Enriches a raw transaction line; requires the token |
| `GET /api/health` | Health check |

## What's real and what's simulated

**Real, when a Gemini API key is set**
- Transaction enrichment is done by Gemini 2.5 Flash, and each result is labeled with its source.

**Simulated or assumed**
- The transaction feed is sample data (`src/data/mockData.ts`). The app does not connect to any bank.
- Without a key, or if a call fails, enrichment falls back to a rule-based parser, and the result is labeled as such.
- The token flow is a demo of the pattern, not production authentication.

**Privacy:** use sample data only. Do not paste real account or card details into the sandbox.

## What I learned

- A false "leak" alert costs trust quickly, so the product asks for confirmation rather than acting on its own.
- Labeling where each answer came from (model or rule engine) makes failures easier to spot and explain.
- Recurrence detection matters more than categorization for finding leaks: a subscription is only a leak if the user stopped using it.

## Next steps

- Build a labeled set of descriptors and measure enrichment accuracy and false-alert rate.
- Add redaction of personal data before any text reaches the model.

## Run it locally

Requires Node.js.

```bash
npm install
cp .env.example .env    # add your own GEMINI_API_KEY; never commit .env
npm run dev
```

Without a key, the app uses its rule-based parser.
