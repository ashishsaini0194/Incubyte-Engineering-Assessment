import { Router, Request, Response, NextFunction } from 'express';
import { salaryService } from '../services/salary.service';
import { createSalarySchema, updateSalarySchema } from '../validators/schemas';

export const salaryRouter = Router();

// GET /api/salaries/employee/:employeeId — Get salary history
salaryRouter.get('/employee/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    const salaries = await salaryService.getByEmployeeId(employeeId);
    res.json(salaries);
  } catch (err) {
    next(err);
  }
});

// POST /api/salaries/employee/:employeeId — Add salary revision
salaryRouter.post('/employee/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    const data = createSalarySchema.parse(req.body);
    const salary = await salaryService.create(employeeId, data);
    res.status(201).json(salary);
  } catch (err) {
    next(err);
  }
});

// PUT /api/salaries/:id — Update salary record
salaryRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid salary ID' });
      return;
    }
    const data = updateSalarySchema.parse(req.body);
    const salary = await salaryService.update(id, data);
    res.json(salary);
  } catch (err) {
    next(err);
  }
});
