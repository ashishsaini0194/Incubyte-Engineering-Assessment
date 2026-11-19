import axios from 'axios';
import type {
  Employee,
  PaginatedResponse,
  EmployeeFilters,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  Salary,
  CreateSalaryInput,
  UpdateSalaryInput,
  Department,
} from '@salary-sight/shared';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Employees ───

export async function fetchEmployees(
  filters: EmployeeFilters,
): Promise<PaginatedResponse<Employee>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await api.get('/employees', { params });
  return data;
}

export async function fetchEmployee(id: number): Promise<Employee> {
  const { data } = await api.get(`/employees/${id}`);
  return data;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { data } = await api.post('/employees', input);
  return data;
}

export async function updateEmployee(
  id: number,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const { data } = await api.put(`/employees/${id}`, input);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}

// ─── Salaries ───

export async function fetchSalaries(employeeId: number): Promise<Salary[]> {
  const { data } = await api.get(`/salaries/employee/${employeeId}`);
  return data;
}

export async function createSalary(
  employeeId: number,
  input: CreateSalaryInput,
): Promise<Salary> {
  const { data } = await api.post(`/salaries/employee/${employeeId}`, input);
  return data;
}

export async function updateSalary(
  id: number,
  input: UpdateSalaryInput,
): Promise<Salary> {
  const { data } = await api.put(`/salaries/${id}`, input);
  return data;
}

// ─── Departments ───

export async function fetchDepartments(): Promise<Department[]> {
  const { data } = await api.get('/departments');
  return data;
}

export async function createDepartment(name: string): Promise<Department> {
  const { data } = await api.post('/departments', { name });
  return data;
}
