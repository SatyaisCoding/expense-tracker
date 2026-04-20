/**
 * Converts a decimal string (e.g. "123.45") to integer cents.
 * Construction logic avoids parseFloat to prevent precision error.
 */
export function toCents(decimalStr: string): number {
  const [intPart, fracPart = ""] = decimalStr.split(".");
  const paddedFrac = fracPart.padEnd(2, "0").slice(0, 2);
  return parseInt(intPart, 10) * 100 + parseInt(paddedFrac, 10);
}

/**
 * Formats integer cents to a currency string (₹).
 */
export function fromCents(cents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
