import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('GET /api/departments', () => {
    it('should return list of departments', async () => {
      const res = await request(app).get('/api/departments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('_count');
    });
  });

  describe('Employee & Salary Endpoints Flow', () => {
    let createdEmployeeId: number;

    it('GET /api/employees should return paginated list', async () => {
      const res = await request(app).get('/api/employees?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination.total).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('currentSalary');
    });

    it('POST /api/employees should create a new employee with initial salary and auto currency', async () => {
      const deptsRes = await request(app).get('/api/departments');
      const deptId = deptsRes.body[0].id;

      const newEmp = {
        firstName: 'TestUser',
        lastName: 'Incubyte',
        email: `test.${Date.now()}@acme.com`,
        phone: '+1-555-0199',
        dateOfBirth: '1992-04-12',
        dateOfJoining: '2023-01-15',
        gender: 'OTHER',
        departmentId: deptId,
        designation: 'Quality Engineer',
        country: 'India',
        city: 'Bengaluru',
        baseSalary: 1200000,
        bonus: 100000,
        deductions: 50000,
      };

      const res = await request(app).post('/api/employees').send(newEmp);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.employeeCode).toMatch(/^EMP-\d{5}$/);
      expect(res.body.firstName).toBe('TestUser');
      expect(res.body.salaries.length).toBe(1);
      expect(res.body.salaries[0].currency).toBe('INR');
      expect(res.body.salaries[0].netSalary).toBe(1250000);

      createdEmployeeId = res.body.id;
    });

    it('GET /api/employees/:id should return employee with details and history', async () => {
      const res = await request(app).get(`/api/employees/${createdEmployeeId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdEmployeeId);
      expect(res.body.firstName).toBe('TestUser');
      expect(res.body.currentSalary).not.toBeNull();
      expect(res.body.salaries.length).toBe(1);
    });

    it('POST /api/salaries/employee/:id should add revision and update previous record endDate', async () => {
      const revision = {
        baseSalary: 1500000,
        bonus: 150000,
        deductions: 50000,
        effectiveDate: '2024-04-01',
        notes: 'Promotion to Senior Quality Engineer',
      };

      const res = await request(app)
        .post(`/api/salaries/employee/${createdEmployeeId}`)
        .send(revision);

      expect(res.status).toBe(201);
      expect(res.body.baseSalary).toBe(1500000);
      expect(res.body.netSalary).toBe(1600000);
      expect(res.body.currency).toBe('INR');

      // Verify history
      const historyRes = await request(app).get(`/api/salaries/employee/${createdEmployeeId}`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.length).toBe(2);

      // Verify the previous record now has an endDate
      const previous = historyRes.body.find((s: any) => s.id !== res.body.id);
      expect(previous.endDate).not.toBeNull();
    });

    it('PUT /api/employees/:id should update employee details', async () => {
      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .send({ designation: 'Lead Quality Engineer' });

      expect(res.status).toBe(200);
      expect(res.body.designation).toBe('Lead Quality Engineer');
    });

    it('DELETE /api/employees/:id should soft-delete (set status to TERMINATED)', async () => {
      const res = await request(app).delete(`/api/employees/${createdEmployeeId}`);
      expect(res.status).toBe(200);
      expect(res.body.employee.status).toBe('TERMINATED');

      // Verify getById reflects status
      const getRes = await request(app).get(`/api/employees/${createdEmployeeId}`);
      expect(getRes.body.status).toBe('TERMINATED');
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app).get('/api/employees/999999');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid query parameters', async () => {
      const res = await request(app).get('/api/employees?page=0');
      expect(res.status).toBe(400);
    });
  });
});
