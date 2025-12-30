# Pastebin-Lite

A lightweight, secure, and serverless-compatible Pastebin clone built with Next.js. Users can create text pastes with optional time-to-live (TTL) and view-count limits. Once either constraint is triggered, the paste is immediately deleted and becomes permanently unavailable.

This implementation fulfills all functional and non-functional requirements of the take-home assignment, including deterministic testing support, XSS-safe rendering, and robust constraint enforcement.

---

## ✅ Features

- Create text pastes via UI or API
- Optional **TTL (time-to-live)** in seconds
- Optional **max view count** (e.g., self-destruct after 3 views)
- **Atomic constraint enforcement**: paste deleted as soon as TTL expires or view limit is reached
- **Deterministic testing support**: respects `x-test-now-ms` header when `TEST_MODE=1`
- **XSS-safe rendering**: user content is HTML-escaped
- **Responsive, clean UI** with light/dark mode
- **Full 404 handling** for expired/missing pastes
- Deployable on **Vercel (serverless)** with persistent storage

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Persistence**: [Upstash Redis](https://upstash.com) (serverless, durable, low-latency)
- **Styling**: Vanilla CSS (no external CSS frameworks)
- **Deployment**: Vercel

---

## 🗃 Persistence Layer

We use **Upstash Redis** — a serverless, pay-as-you-go Redis-compatible database — because:

- It survives across serverless cold starts (unlike in-memory storage)
- Supports automatic key expiration (`EX` flag), which aligns with TTL logic
- Offers global low-latency access
- Free tier is sufficient for this assignment
- Fully compatible with Vercel Edge/Runtime

All paste data is stored as JSON objects under keys like `paste:<id>`. When a paste expires (by time or views), it is **immediately deleted** from Redis to ensure consistency.

---

## 🧪 Deterministic Testing

To support automated grading, the app respects the following:

- If environment variable `TEST_MODE=1` is set,
- And an incoming request includes the header `x-test-now-ms: <timestamp>`,
- Then **that timestamp (in milliseconds since epoch) is used as "current time"** for TTL checks.

This allows the grader to simulate time passing without waiting in real time.

> Example:
> `curl -H "x-test-now-ms: 1735689600000" https://pastebin-lite-psi.vercel.app/`

---

## ▶️ Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pastebin-lite.git
   cd pastebin-lite

2. **Install dependencies**
   ```bash
   npm install

3. **Set up environment variables**
   ```bash
   Create a .env.local file in the project root:
      UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
      UPSTASH_REDIS_REST_TOKEN=your-token-here
      NEXT_PUBLIC_APP_URL=http://localhost:3000

4. **Run the development server**
   ```bash
   npm run dev

5. **Open your browser**
   Visit http://localhost:3000
   Create a paste, copy the link, and test expiry/view limits