// Shared Expense type used across client and server
export type Expense = {
  id: string;
  idempotencyKey: string;
  title: string;
  amountCents: number;
  category: string;
  date: string; // ISO string
  createdAt: string; // ISO string
};

export type ApiError = {
  error: string;
  details?: unknown;
};
