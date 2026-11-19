import { describe, it, expect } from 'vitest';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  createSalarySchema,
  updateSalarySchema,
} from '../../src/validators/schemas';

describe('Validation Schemas', () => {
  describe('createEmployeeSchema', () => {
    it('should validate a valid employee input', () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@acme.com',
        dateOfBirth: '1990-05-15',
        dateOfJoining: '2022-01-10',
        gender: 'FEMALE' as const,
        departmentId: 1,
        designation: 'Software Engineer',
        country: 'United States',
        baseSalary: 120000,
        bonus: 10000,
        deductions: 5000,
      };

      const result = createEmployeeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'not-an-email',
        dateOfBirth: '1990-05-15',
        dateOfJoining: '2022-01-10',
        gender: 'FEMALE',
        departmentId: 1,
        designation: 'Engineer',
        country: 'United States',
        baseSalary: 100000,
      };

      const result = createEmployeeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should fail if baseSalary is not positive', () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@acme.com',
        dateOfBirth: '1990-05-15',
        dateOfJoining: '2022-01-10',
        gender: 'FEMALE',
        departmentId: 1,
        designation: 'Engineer',
        country: 'United States',
        baseSalary: -500,
      };

      const result = createEmployeeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('employeeQuerySchema', () => {
    it('should provide default values for pagination and sorting', () => {
      const result = employeeQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(25);
      expect(result.sortBy).toBe('firstName');
      expect(result.sortOrder).toBe('asc');
    });

    it('should parse valid filters', () => {
      const result = employeeQuerySchema.parse({
        page: '2',
        limit: '50',
        search: 'Alice',
        department: 'Engineering',
        country: 'India',
        status: 'ACTIVE',
        salaryMin: '50000',
        salaryMax: '150000',
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.search).toBe('Alice');
      expect(result.salaryMin).toBe(50000);
      expect(result.salaryMax).toBe(150000);
    });
  });

  describe('createSalarySchema', () => {
    it('should validate valid salary revision input', () => {
      const input = {
        baseSalary: 95000,
        bonus: 5000,
        deductions: 2000,
        effectiveDate: '2024-01-01',
        notes: 'Annual performance increase',
      };

      const result = createSalarySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject non-positive baseSalary', () => {
      const result = createSalarySchema.safeParse({
        baseSalary: 0,
        effectiveDate: '2024-01-01',
      });
      expect(result.success).toBe(false);
    });
  });
});
