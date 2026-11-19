import { Router, Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/department.service';
import { z } from 'zod';

export const departmentRouter = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET /api/departments — List all departments
departmentRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await departmentService.list();
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

// POST /api/departments — Create department
departmentRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = createDepartmentSchema.parse(req.body);
    const department = await departmentService.create(name);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
});
