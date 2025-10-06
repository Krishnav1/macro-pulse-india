// Smart Currency Formatter for Indian Markets
// Handles Crores, Lakhs, Thousands, and regular values

export interface CurrencyFormatOptions {
  decimals?: number;
  showSymbol?: boolean;
  showSuffix?: boolean;
  minValue?: number; // Minimum value to apply suffix (default: 1000)
}

/**
 * Format currency value with smart suffixes (Cr, L, K)
 * @param value - Value in INR (base currency)
 * @param options - Formatting options
 * @returns Formatted string
 * 
 * Examples:
 * - 1234567890 → "₹123.46 Cr"
 * - 12345678 → "₹1.23 Cr"
 * - 987654 → "₹9.88 L"
 * - 45678 → "₹45.68 K"
 * - 329 → "₹329"
 */
export function formatCurrency(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    decimals = 2,
    showSymbol = true,
    showSuffix = true,
    minValue = 1000
  } = options;

  const symbol = showSymbol ? '₹' : '';
  
  // Handle zero and very small values
  if (Math.abs(value) < minValue) {
    return `${symbol}${value.toFixed(decimals === 2 ? 0 : decimals)}`;
  }

  // Crore (10,000,000)
  if (Math.abs(value) >= 10000000) {
    const crores = value / 10000000;
    const suffix = showSuffix ? ' Cr' : '';
    return `${symbol}${crores.toFixed(decimals)}${suffix}`;
  }

  // Lakh (100,000)
  if (Math.abs(value) >= 100000) {
    const lakhs = value / 100000;
    const suffix = showSuffix ? ' L' : '';
    return `${symbol}${lakhs.toFixed(decimals)}${suffix}`;
  }

  // Thousand (1,000)
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000;
    const suffix = showSuffix ? ' K' : '';
    return `${symbol}${thousands.toFixed(decimals)}${suffix}`;
  }

  // Default: no suffix
  return `${symbol}${value.toFixed(decimals === 2 ? 0 : decimals)}`;
}

/**
 * Format value for display in tables/cards
 * @param value - Value in INR
 * @returns Formatted string with appropriate suffix
 */
export function formatValueShort(value: number): string {
  return formatCurrency(value, { decimals: 2, showSymbol: true, showSuffix: true });
}

/**
 * Format value without symbol (for tooltips, etc.)
 * @param value - Value in INR
 * @returns Formatted string without ₹ symbol
 */
export function formatValueNoSymbol(value: number): string {
  return formatCurrency(value, { decimals: 2, showSymbol: false, showSuffix: true });
}

/**
 * Format percentage value
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with commas (Indian numbering system)
 * @param value - Numeric value
 * @returns Formatted string with commas
 * 
 * Examples:
 * - 1234567 → "12,34,567"
 * - 98765 → "98,765"
 */
export function formatIndianNumber(value: number): string {
  const str = Math.floor(value).toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return lastThree;
}

/**
 * Format quantity (shares) with commas
 * @param quantity - Number of shares
 * @returns Formatted string
 */
export function formatQuantity(quantity: number): string {
  return formatIndianNumber(quantity);
}

/**
 * Get appropriate value display for deal size categories
 * @param value - Value in INR
 * @returns Category label
 */
export function getValueCategory(value: number): string {
  if (value < 1000000) return 'Micro'; // < 10L
  if (value < 10000000) return 'Small'; // 10L - 1Cr
  if (value < 100000000) return 'Medium'; // 1Cr - 10Cr
  return 'Large'; // > 10Cr
}

/**
 * Format deal value for display in tables
 * Optimized for bulk/block deals page
 */
export function formatDealValue(value: number): string {
  // For very small values (< ₹1000), show exact amount
  if (value < 1000) {
    return `₹${value.toFixed(0)}`;
  }
  
  // For values < 1 lakh, show in thousands
  if (value < 100000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  }
  
  // For values < 1 crore, show in lakhs
  if (value < 10000000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  
  // For values >= 1 crore, show in crores
  return `₹${(value / 10000000).toFixed(2)} Cr`;
}
