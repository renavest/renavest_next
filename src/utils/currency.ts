/**
 * Formats a number as currency (USD)
 * @param amount - Amount in dollars (not cents)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: 'USD' = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats cents as currency (USD)
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCentsAsCurrency(cents: number, currency: 'USD' = 'USD'): string {
  return formatCurrency(cents / 100, currency);
}
