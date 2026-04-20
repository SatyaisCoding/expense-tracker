# 💰 Expense Tracker

A production-grade personal expense tracking app built with **Next.js 14 App Router**, **TypeScript**, **Prisma + SQLite**, and **Tailwind CSS**.

## ✨ Features

- ✅ **Idempotent submissions** — safe against network retries and double-clicks
- ✅ **Integer money handling** — amounts stored as paise (cents), no floating-point errors
- ✅ **Category filtering** — filter expenses by category with a running total
- ✅ **Optimistic UI** — new expenses appear immediately in the list
- ✅ **Resilient form** — button disables on submit, inline error messages, retry on fetch failure
- ✅ **Sorted newest first** — expenses always appear by date (descending)

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run DB migration (creates SQLite file)
npx prisma migrate dev --name init

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Architecture & Design Decisions

### 1. Idempotency Strategy

**The problem:** If a user clicks "Add Expense" twice, or the network times out and the browser retries the request, the server could create duplicate records.

**The solution:** Client-generated UUID per submission.

```
1. On form mount (or after successful submit), generate: crypto.randomUUID()
2. Store it in React state as `idempotencyKey`
3. POST it in the request body with every submission attempt
4. The DB has a UNIQUE constraint on idempotencyKey
5. On duplicate key error (Prisma P2002), return the existing record (HTTP 200)
6. Only generate a NEW key after a successful response
```

This means the user can click "Submit" 10 times and exactly 1 record will be created. The UI stays correct because the optimistic update deduplicates by `id`.

**Trade-off:** Using the key in the body (not an `Idempotency-Key` header) is simpler for Next.js route handlers and works perfectly for a single-page app where we control both ends. A header-based approach would be preferable for a public API consumed by third parties.

---

### 2. Money Handling — Why Integers?

JavaScript floating-point math is unreliable for currency:

```js
0.1 + 0.2 // → 0.30000000000000004 ❌
```

**The solution:** Store all amounts as **integer paise (cents)**.

| Layer   | Representation |
|---------|----------------|
| DB      | `amountCents INT` (e.g. ₹123.45 → `12345`) |
| API     | Integer in JSON body |
| Display | `Intl.NumberFormat` formats `cents / 100` |
| Running Total | Pure integer addition (`sum + e.amountCents`) — no floating point |

The `toCents()` helper in `lib/money.ts` converts user input `"123.45"` → `12345` by splitting on `.` and constructing integers — never using `parseFloat * 100` which would reintroduce float errors.

---

### 3. Running Total — Frontend vs Backend

The running total is calculated on the **frontend** from the currently loaded (filtered) list using integer addition. This approach:

- **Saves an API round-trip** — no extra `/api/expenses/total` endpoint needed
- **Stays in sync instantly** — updates when filter changes, with no additional fetch
- **Is exactly correct** — integer addition has no floating-point error

The trade-off is that if the dataset is huge and the user paginates, the total would only reflect the current page. For this scope (personal tracker), loading all filtered expenses upfront is the right call.

---

### 4. Database Schema

```prisma
model Expense {
  id             String   @id @default(uuid())
  idempotencyKey String   @unique          // enforces exactly-once at DB level
  title          String
  amountCents    Int                        // no floats
  category       String
  date           DateTime                   // user-specified expense date
  createdAt      DateTime @default(now())   // server timestamp
}
```

- `date` and `createdAt` are kept separate — an expense on last Tuesday has `date = Tuesday` but `createdAt = today`.
- SQLite is used for zero-config local persistence. Swapping to PostgreSQL requires only changing the `provider` in `schema.prisma` and the `DATABASE_URL`.

---

## 📁 Project Structure

```
expense-tracker/
├── app/
│   ├── api/expenses/route.ts   # POST (idempotent) + GET (filtered)
│   ├── page.tsx                # Main page (server component)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ExpenseApp.tsx          # Root client component (state + fetch)
│   ├── ExpenseForm.tsx         # Add expense form
│   ├── ExpenseList.tsx         # Table + running total
│   └── FilterBar.tsx           # Category filter pills
├── lib/
│   ├── prisma.ts               # Singleton Prisma client
│   ├── validators.ts           # Zod schemas (shared API + form)
│   ├── money.ts                # toCents / fromCents helpers
│   └── types.ts                # Shared TypeScript types
└── prisma/
    └── schema.prisma
```

---

## 🌐 API Reference

### `POST /api/expenses`

| Field | Type | Description |
|-------|------|-------------|
| `idempotencyKey` | `string (UUID)` | Client-generated per submission |
| `title` | `string` | Expense title (max 100 chars) |
| `amountCents` | `number (int)` | Amount in paise (e.g. ₹123.45 → 12345) |
| `category` | `enum` | One of: Food, Transport, Housing, etc. |
| `date` | `string (ISO 8601)` | Expense date |

**Returns:** `201` on create, `200` on duplicate (idempotent), `400` on validation error.

### `GET /api/expenses`

| Param | Type | Description |
|-------|------|-------------|
| `category` | `string?` | Filter by category |
| `sort` | `date_desc \| date_asc` | Sort order (default: `date_desc`) |

---

## ⚖️ Trade-offs

| Decision | Alternative | Why this choice |
|----------|-------------|-----------------|
| Client-body idempotency key | `Idempotency-Key` header | Simpler for Next.js, no custom middleware |
| SQLite | PostgreSQL | Zero setup for local dev; trivial to swap |
| Frontend running total | Dedicated API endpoint | Saves a round-trip; always in sync with filter |
| No pagination | Cursor-based pagination | Appropriate scope for personal tracker |
