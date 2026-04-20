import { z } from "zod";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Used by the API POST endpoint – amountCents already converted by the client
export const CreateExpenseSchema = z.object({
  idempotencyKey: z.string().uuid("idempotencyKey must be a valid UUID"),
  title: z.string().min(1, "Title is required").max(100),
  amountCents: z
    .number()
    .int("Amount must be an integer in cents")
    .positive("Amount must be positive"),
  category: z.enum(CATEGORIES),
  date: z.string().datetime({ message: "date must be an ISO 8601 datetime" }),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

// Used by UI form before converting to cents
export const ExpenseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n > 0;
    }, "Amount must be a positive number")
    .refine((v) => {
      const parts = v.split(".");
      return !parts[1] || parts[1].length <= 2;
    }, "Amount can have at most 2 decimal places"),
  category: z.enum(CATEGORIES),
  date: z.string().min(1, "Date is required"),
});

export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;

export const GetExpensesQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  sort: z.enum(["date_desc", "date_asc"]).optional().default("date_desc"),
});
