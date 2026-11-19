// ─── Employee Types ───

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string;
  dateOfJoining: string;
  gender: Gender;
  status: EmployeeStatus;
  departmentId: number;
  designation: string;
  country: string;
  city: string | null;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  salaries?: Salary[];
  currentSalary?: Salary | null;
}

export interface Salary {
  id: number;
  employeeId: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  currency: string;
  effectiveDate: string;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API Request/Response Types ───

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  country?: string;
  status?: EmployeeStatus;
  salaryMin?: number;
  salaryMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth: string;
  dateOfJoining: string;
  gender: Gender;
  departmentId: number;
  designation: string;
  country: string;
  city?: string | null;
  baseSalary: number;
  bonus?: number;
  deductions?: number;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  dateOfBirth?: string;
  dateOfJoining?: string;
  gender?: Gender;
  departmentId?: number;
  designation?: string;
  country?: string;
  city?: string | null;
  status?: EmployeeStatus;
}

export interface CreateSalaryInput {
  baseSalary: number;
  bonus?: number;
  deductions?: number;
  currency?: string;
  effectiveDate: string;
  notes?: string | null;
}

export interface UpdateSalaryInput {
  baseSalary?: number;
  bonus?: number;
  deductions?: number;
  effectiveDate?: string;
  endDate?: string | null;
  notes?: string | null;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
