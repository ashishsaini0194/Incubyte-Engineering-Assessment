# SalarySight — Requirements Document

## Goal

Build a web-based employee salary management platform for ACME Corp, an organization with 10,000 employees across multiple countries. The system replaces the current spreadsheet-based workflow and empowers the HR Manager to efficiently manage, search, and understand employee compensation data.

## User Persona

**HR Manager** — A single primary user who needs to:
- View and search through the entire employee roster quickly
- Manage employee records (add, edit, update status)
- Track salary history with revisions over time
- Understand compensation patterns across departments and countries
- Export data for reporting

## Core Features (In Scope)

### Employee Management
- **View all employees** with server-side pagination (10K+ records)
- **Search** by name, email, or employee code
- **Filter** by department, country, employment status
- **Sort** by any column (name, joining date, department, etc.)
- **Add new employee** with validation
- **Edit employee** details (name, department, designation, etc.)
- **Soft-delete** (terminate) employees — data is preserved, status changes

### Salary Management
- **View current salary** for each employee
- **Salary history** — full revision trail with effective dates
- **Add salary revision** — automatically closes previous record
- **Country-based currency** — salary currency auto-maps to employee country
  - US → USD, India → INR, UK → GBP, Germany → EUR, Japan → JPY, etc.
- **Salary components** — base salary, bonus, deductions, net salary

### Department Management
- View all departments with employee count
- Create new departments

### Data & Export
- **CSV export** of filtered employee data
- **10,000 employee seed** with realistic, country-adjusted salaries

## Technical Architecture

- **Monorepo** — npm workspaces + Turborepo
- **Backend** — Node.js, Express, TypeScript, Prisma ORM, SQLite
- **Frontend** — React, TypeScript, Vite, Ant Design
- **Shared package** — Types, constants, validation schemas (Zod)
- **Deployment** — Docker Compose (single command)

## Deliberately Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication & Authorization | Not in requirements; would add auth infrastructure without demonstrating salary management skills |
| Payroll Processing | This is salary *data management*, not payment execution (tax, payroll runs) |
| Analytics Dashboard / Charts | Deferred — data tables with filtering solve the core need |
| Approval Workflows | Requires role-based access, state machines — good for V2 |
| Excel/CSV Import | We're moving *away* from spreadsheets; focus on the new system |
| Real-time Collaboration | Single-user persona; WebSocket complexity isn't justified |
| Audit Logging | Important for production, not core to this assessment |
| Internationalization (i18n) | English-only; currency formatting is handled per country |

## Success Criteria

1. HR Manager can browse 10,000 employees without lag
2. Can find any employee via search in under 2 seconds
3. Can add, edit, and terminate employees
4. Can view and manage salary history with currency per country
5. Can export filtered data to CSV
6. System deploys with a single `docker compose up` command
