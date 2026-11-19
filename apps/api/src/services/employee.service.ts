import { PrismaClient, Prisma } from '@prisma/client';
import { getCurrencyForCountry } from '@salary-sight/shared';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface EmployeeQueryParams {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  country?: string;
  status?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class EmployeeService {
  /**
   * List employees with pagination, filtering, sorting, and search.
   */
  async list(params: EmployeeQueryParams) {
    const { page, limit, search, department, country, status, salaryMin, salaryMax, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeCode: { contains: search } },
      ];
    }

    if (department) {
      where.department = { name: department };
    }

    if (country) {
      where.country = country;
    }

    if (status) {
      where.status = status;
    }

    // Salary range filter: filter employees whose current salary falls in range
    if (salaryMin !== undefined || salaryMax !== undefined) {
      where.salaries = {
        some: {
          endDate: null, // current salary
          ...(salaryMin !== undefined ? { netSalary: { gte: salaryMin } } : {}),
          ...(salaryMax !== undefined ? { netSalary: { lte: salaryMax } } : {}),
        },
      };
    }

    // Build orderBy
    let orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
    if (sortBy === 'department') {
      orderBy = { department: { name: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          salaries: {
            where: { endDate: null },
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    // Flatten the current salary into the response
    const data = employees.map((emp) => ({
      ...emp,
      currentSalary: emp.salaries[0] || null,
      salaries: undefined,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single employee by ID with full salary history.
   */
  async getById(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        salaries: {
          orderBy: { effectiveDate: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new AppError(404, `Employee with ID ${id} not found`);
    }

    return {
      ...employee,
      currentSalary: employee.salaries.find((s) => s.endDate === null) || null,
    };
  }

  /**
   * Create a new employee with an initial salary record.
   */
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    dateOfBirth: string;
    dateOfJoining: string;
    gender: string;
    departmentId: number;
    designation: string;
    country: string;
    city?: string | null;
    baseSalary: number;
    bonus?: number;
    deductions?: number;
  }) {
    const { baseSalary, bonus = 0, deductions = 0, ...employeeData } = data;
    const netSalary = baseSalary + bonus - deductions;
    const currency = getCurrencyForCountry(data.country);

    // Generate employee code
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = (lastEmployee?.id || 0) + 1;
    const employeeCode = `EMP-${String(nextId).padStart(5, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        employeeCode,
        dateOfBirth: new Date(employeeData.dateOfBirth),
        dateOfJoining: new Date(employeeData.dateOfJoining),
        salaries: {
          create: {
            baseSalary,
            bonus,
            deductions,
            netSalary,
            currency,
            effectiveDate: new Date(employeeData.dateOfJoining),
          },
        },
      },
      include: {
        department: true,
        salaries: true,
      },
    });

    return employee;
  }

  /**
   * Update an employee's details.
   */
  async update(id: number, data: Prisma.EmployeeUpdateInput) {
    // Check existence
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, `Employee with ID ${id} not found`);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        ...(data.dateOfBirth ? { dateOfBirth: new Date(data.dateOfBirth as string) } : {}),
        ...(data.dateOfJoining ? { dateOfJoining: new Date(data.dateOfJoining as string) } : {}),
      },
      include: {
        department: true,
        salaries: {
          where: { endDate: null },
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
      },
    });

    return employee;
  }

  /**
   * Soft-delete an employee by setting status to TERMINATED.
   */
  async delete(id: number) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, `Employee with ID ${id} not found`);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED' },
    });

    return employee;
  }
}

export const employeeService = new EmployeeService();
