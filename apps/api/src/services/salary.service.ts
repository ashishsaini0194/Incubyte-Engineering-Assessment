import { PrismaClient } from '@prisma/client';
import { getCurrencyForCountry } from '@salary-sight/shared';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class SalaryService {
  /**
   * Get salary history for an employee.
   */
  async getByEmployeeId(employeeId: number) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw new AppError(404, `Employee with ID ${employeeId} not found`);
    }

    const salaries = await prisma.salary.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
    });

    return salaries;
  }

  /**
   * Add a new salary record for an employee.
   * Automatically ends the previous current salary.
   */
  async create(
    employeeId: number,
    data: {
      baseSalary: number;
      bonus?: number;
      deductions?: number;
      currency?: string;
      effectiveDate: string;
      notes?: string | null;
    },
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, country: true },
    });

    if (!employee) {
      throw new AppError(404, `Employee with ID ${employeeId} not found`);
    }

    const { baseSalary, bonus = 0, deductions = 0, effectiveDate, notes } = data;
    const netSalary = baseSalary + bonus - deductions;
    const currency = data.currency || getCurrencyForCountry(employee.country);
    const effectiveDateObj = new Date(effectiveDate);

    // End the previous current salary
    const previousSalary = await prisma.salary.findFirst({
      where: { employeeId, endDate: null },
      orderBy: { effectiveDate: 'desc' },
    });

    const operations: any[] = [];

    if (previousSalary) {
      // Set the end date of the previous salary to the day before the new one
      const endDate = new Date(effectiveDateObj);
      endDate.setDate(endDate.getDate() - 1);
      operations.push(
        prisma.salary.update({
          where: { id: previousSalary.id },
          data: { endDate },
        }),
      );
    }

    operations.push(
      prisma.salary.create({
        data: {
          employeeId,
          baseSalary,
          bonus,
          deductions,
          netSalary,
          currency,
          effectiveDate: effectiveDateObj,
          notes,
        },
      }),
    );

    const results = await prisma.$transaction(operations);
    return results[results.length - 1]; // Return the newly created salary
  }

  /**
   * Update a salary record.
   */
  async update(
    salaryId: number,
    data: {
      baseSalary?: number;
      bonus?: number;
      deductions?: number;
      effectiveDate?: string;
      endDate?: string | null;
      notes?: string | null;
    },
  ) {
    const existing = await prisma.salary.findUnique({ where: { id: salaryId } });
    if (!existing) {
      throw new AppError(404, `Salary record with ID ${salaryId} not found`);
    }

    // Recalculate net salary if any component changes
    const baseSalary = data.baseSalary ?? existing.baseSalary;
    const bonus = data.bonus ?? existing.bonus;
    const deductions = data.deductions ?? existing.deductions;
    const netSalary = baseSalary + bonus - deductions;

    const salary = await prisma.salary.update({
      where: { id: salaryId },
      data: {
        baseSalary,
        bonus,
        deductions,
        netSalary,
        ...(data.effectiveDate ? { effectiveDate: new Date(data.effectiveDate) } : {}),
        ...(data.endDate !== undefined
          ? { endDate: data.endDate ? new Date(data.endDate) : null }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    return salary;
  }
}

export const salaryService = new SalaryService();
