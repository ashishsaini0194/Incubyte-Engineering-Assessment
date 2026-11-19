// ─── Country → Currency Mapping ───

export const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string; locale: string }> = {
  'United States': { currency: 'USD', symbol: '$', locale: 'en-US' },
  'United Kingdom': { currency: 'GBP', symbol: '£', locale: 'en-GB' },
  'India': { currency: 'INR', symbol: '₹', locale: 'en-IN' },
  'Germany': { currency: 'EUR', symbol: '€', locale: 'de-DE' },
  'Canada': { currency: 'CAD', symbol: 'C$', locale: 'en-CA' },
  'Australia': { currency: 'AUD', symbol: 'A$', locale: 'en-AU' },
  'Singapore': { currency: 'SGD', symbol: 'S$', locale: 'en-SG' },
  'Japan': { currency: 'JPY', symbol: '¥', locale: 'ja-JP' },
  'Brazil': { currency: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  'France': { currency: 'EUR', symbol: '€', locale: 'fr-FR' },
};

// ─── Salary Ranges by Country (annual, in local currency) ───

export const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'United States': { min: 50000, max: 200000 },
  'United Kingdom': { min: 30000, max: 150000 },
  'India': { min: 400000, max: 5000000 },
  'Germany': { min: 40000, max: 160000 },
  'Canada': { min: 50000, max: 180000 },
  'Australia': { min: 60000, max: 200000 },
  'Singapore': { min: 50000, max: 200000 },
  'Japan': { min: 4000000, max: 15000000 },
  'Brazil': { min: 60000, max: 400000 },
  'France': { min: 35000, max: 150000 },
};

// ─── Enums ───

export const COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP);

export const CURRENCIES = [...new Set(Object.values(COUNTRY_CURRENCY_MAP).map((c) => c.currency))];

export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE', 'TERMINATED'] as const;

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
] as const;

export const DESIGNATIONS: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'VP Engineering', 'Principal Engineer'],
  Product: ['Product Analyst', 'Product Manager', 'Senior Product Manager', 'Director of Product', 'VP Product'],
  Design: ['UI Designer', 'UX Designer', 'Senior Designer', 'Design Lead', 'Head of Design'],
  Marketing: ['Marketing Coordinator', 'Marketing Manager', 'Content Strategist', 'Growth Lead', 'VP Marketing'],
  Sales: ['Sales Representative', 'Account Executive', 'Sales Manager', 'Regional Sales Director', 'VP Sales'],
  Finance: ['Financial Analyst', 'Senior Accountant', 'Finance Manager', 'Controller', 'CFO'],
  'Human Resources': ['HR Coordinator', 'HR Generalist', 'HR Manager', 'HR Business Partner', 'VP People'],
  Operations: ['Operations Analyst', 'Operations Manager', 'Supply Chain Lead', 'Director of Operations', 'COO'],
};

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/**
 * Returns the currency code for a given country name.
 * Falls back to USD if the country is unknown.
 */
export function getCurrencyForCountry(country: string): string {
  return COUNTRY_CURRENCY_MAP[country]?.currency ?? 'USD';
}

/**
 * Formats a salary amount with the appropriate currency symbol and locale.
 */
export function formatSalary(amount: number, country: string): string {
  const info = COUNTRY_CURRENCY_MAP[country];
  if (!info) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.currency,
    minimumFractionDigits: info.currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: info.currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
