# Expense Tracker (Production-Style)

A full-stack personal expense tracker built with Next.js 15, TypeScript, and Prisma.

## Why this project?
I built this to demonstrate how to handle "real-world" challenges in financial apps, specifically:
- **Zero-loss money handling**: Using integer cents to avoid JavaScript's floating-point math issues.
- **API Idempotency**: Ensuring that network retries or double-clicks don't result in duplicate transactions.
- **Resilient UI**: Optimistic updates and graceful error handling for poor connections.

---

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **DB**: SQLite + Prisma
- **Validation**: Zod (shared schemas for API and Form)
- **Styling**: Tailwind CSS v4

---

## Key Implementation Details

### 1. The Idempotency Strategy
We use a client-generated UUID for each submission. 
*   **The Problem**: If a POST request hangs and the client retries, you might get two expenses.
*   **The Fix**: The database has a `unique` constraint on the `idempotencyKey`. If a retry hits the server, Prisma catches the violation and we simply return the existing record with a `200 OK`. No duplicates, no double-spending.

### 2. Money as Integers
We don't use `0.1 + 0.2`. We store everything as `Int` (cents/paise).
*   Input `"12.50"` becomes `1250`. 
*   Logic: `toCents()` splits the string and constructs the integer to avoid `parseFloat` precision errors entirely.

---

## Setting Up
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

---

## Future Improvements (The "Backlog")
If I had more time, I'd add:
1. **Pagination**: Switch to cursor-based pagination for the list.
2. **Auth**: Integrate NextAuth for private user accounts.
3. **Charts**: A simple Chart.js breakdown of spending by category.
4. **Persistent Keys**: Store the pending idempotency key in `localStorage` to survive hard browser refreshes during a hanging request.
