import { describe, it, expect } from 'vitest';
import {
  formatSalary,
  getCurrencyForCountry,
  COUNTRY_CURRENCY_MAP,
  COUNTRIES,
} from '@salary-sight/shared';

describe('Shared Utilities & Formatters', () => {
  describe('getCurrencyForCountry', () => {
    it('should map United States to USD', () => {
      expect(getCurrencyForCountry('United States')).toBe('USD');
    });

    it('should map India to INR', () => {
      expect(getCurrencyForCountry('India')).toBe('INR');
    });

    it('should map United Kingdom to GBP', () => {
      expect(getCurrencyForCountry('United Kingdom')).toBe('GBP');
    });

    it('should map Germany to EUR', () => {
      expect(getCurrencyForCountry('Germany')).toBe('EUR');
    });

    it('should map Japan to JPY', () => {
      expect(getCurrencyForCountry('Japan')).toBe('JPY');
    });

    it('should default to USD for unknown country', () => {
      expect(getCurrencyForCountry('UnknownLand')).toBe('USD');
    });
  });

  describe('formatSalary', () => {
    it('should format USD correctly', () => {
      const formatted = formatSalary(100000, 'United States');
      expect(formatted).toContain('100,000');
      expect(formatted).toContain('$');
    });

    it('should format INR with rupee symbol', () => {
      const formatted = formatSalary(1500000, 'India');
      expect(formatted).toMatch(/₹|Rs/);
    });

    it('should format JPY without decimal fractions', () => {
      const formatted = formatSalary(8000000, 'Japan');
      expect(formatted).not.toContain('.00');
    });
  });

  describe('Country Configuration', () => {
    it('should have 10 supported countries defined', () => {
      expect(COUNTRIES.length).toBe(10);
      expect(Object.keys(COUNTRY_CURRENCY_MAP).length).toBe(10);
    });
  });
});
