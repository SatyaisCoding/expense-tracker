/**
 * Convert a user-input decimal string to integer cents.
 * e.g. "123.45" → 12345, "100" → 10000
 */
export function toCents(decimalStr: string): number {
  const [intPart, fracPart = ""] = decimalStr.split(".");
  const paddedFrac = fracPart.padEnd(2, "0").slice(0, 2);
  return parseInt(intPart, 10) * 100 + parseInt(paddedFrac, 10);
}

/**
 * Convert integer cents to a formatted currency string.
 * e.g. 12345 → "₹123.45"
 */
export function fromCents(cents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format cents as a plain decimal string (for totals display).
 */
export function centsToDecimalStr(cents: number): string {
  return (cents / 100).toFixed(2);
}
