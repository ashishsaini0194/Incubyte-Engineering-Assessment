import { Router, Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } from '../validators/schemas';

export const employeeRouter = Router();

// GET /api/employees — List with pagination, filtering, sorting
employeeRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = employeeQuerySchema.parse(req.query);
    const result = await employeeService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id — Get single employee with salary history
employeeRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    const employee = await employeeService.getById(id);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees — Create new employee
employeeRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const employee = await employeeService.create(data);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id — Update employee
employeeRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    const data = updateEmployeeSchema.parse(req.body);
    const employee = await employeeService.update(id, data);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id — Soft-delete (set status to TERMINATED)
employeeRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    const employee = await employeeService.delete(id);
    res.json({ message: 'Employee terminated successfully', employee });
  } catch (err) {
    next(err);
  }
});
