import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).nullable().optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  dateOfJoining: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  departmentId: z.number().int().positive(),
  designation: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  city: z.string().max(100).nullable().optional(),
  baseSalary: z.number().positive('Base salary must be positive'),
  bonus: z.number().min(0).optional().default(0),
  deductions: z.number().min(0).optional().default(0),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  dateOfJoining: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  departmentId: z.number().int().positive().optional(),
  designation: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  city: z.string().max(100).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),
});

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  search: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'dateOfJoining', 'department', 'country', 'designation']).optional().default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const createSalarySchema = z.object({
  baseSalary: z.number().positive('Base salary must be positive'),
  bonus: z.number().min(0).optional().default(0),
  deductions: z.number().min(0).optional().default(0),
  currency: z.string().min(1).max(3).optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  notes: z.string().max(500).nullable().optional(),
});

export const updateSalarySchema = z.object({
  baseSalary: z.number().positive().optional(),
  bonus: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});
