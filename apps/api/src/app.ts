import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { employeeRouter } from './routes/employees';
import { departmentRouter } from './routes/departments';
import { salaryRouter } from './routes/salaries';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/salaries', salaryRouter);

// Error handling
app.use(errorHandler);

export default app;
