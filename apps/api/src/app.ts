import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { employeeRouter } from './routes/employees';
import { departmentRouter } from './routes/departments';
import { salaryRouter } from './routes/salaries';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/salaries', salaryRouter);

// Serve frontend static build if present (for single-service deployment)
const frontendDist = path.resolve(__dirname, '../../web/dist');
const altFrontendDist = path.resolve(process.cwd(), 'apps/web/dist');
const staticPath = fs.existsSync(frontendDist)
  ? frontendDist
  : fs.existsSync(altFrontendDist)
  ? altFrontendDist
  : null;

if (staticPath) {
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

export default app;
