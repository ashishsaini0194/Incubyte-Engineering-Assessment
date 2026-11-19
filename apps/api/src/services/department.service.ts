import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DepartmentService {
  async list() {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async create(name: string) {
    return prisma.department.create({
      data: { name },
    });
  }

  async getById(id: number) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new Error(`Department with ID ${id} not found`);
    }

    return department;
  }
}

export const departmentService = new DepartmentService();
