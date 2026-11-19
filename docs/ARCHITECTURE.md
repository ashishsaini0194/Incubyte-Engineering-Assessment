# Architecture & Design Decisions

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                     │
│                                                     │
│  ┌──────────────┐         ┌──────────────────────┐  │
│  │   React App   │  HTTP   │   Express API         │  │
│  │   (Vite)     │ ──────> │   (Node.js)           │  │
│  │   Port 5173  │         │   Port 3000            │  │
│  └──────────────┘         │                        │  │
│                           │  ┌──────────────────┐  │  │
│                           │  │  Prisma ORM      │  │  │
│                           │  │  ↓               │  │  │
│                           │  │  SQLite (.db)    │  │  │
│                           │  └──────────────────┘  │  │
│                           └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Why This Stack?

### SQLite over PostgreSQL
- **Zero configuration** — no DB server to provision
- **10K records** — well within SQLite's comfort zone (handles millions)
- **Single-user** — no concurrent write contention
- **Portable** — evaluators run `docker compose up` without DB setup
- **Trade-off**: Can't do `ILIKE` natively; Prisma's `contains` works for case-insensitive search

### Prisma over raw SQL or Knex
- **Type-safe queries** — auto-generated TypeScript types from schema
- **Migration system** — versioned, reproducible schema changes
- **Seed support** — integrates with our seed script
- **Trade-off**: Slightly heavier than raw SQL, but developer productivity wins here

### Ant Design over Material UI or Tailwind
- **Enterprise-grade table** — built-in pagination, sorting, filtering
- **Rich form components** — DatePicker, Select, InputNumber with validation
- **Consistent design** — professional look out of the box for data-heavy apps
- **Trade-off**: Larger bundle than Tailwind, but tree-shaking mitigates this

### Monorepo over separate repos
- **Shared types** — `@salary-sight/shared` used by both backend and frontend
- **Atomic changes** — one commit can update types, API, and UI together
- **Single CI/CD** — one pipeline builds and tests everything
- **Trade-off**: Slightly more setup, but Turborepo makes it painless

## Database Design

### Why Salary is a separate table (not embedded in Employee)
- Tracks salary **history** — HR can see when raises happened
- Each record has `effectiveDate` and `endDate` for date ranges
- Adding a new salary automatically closes the previous one
- Currency is on Salary, not Employee — allows historical accuracy

### Country → Currency Auto-Mapping
- Each country maps to a default currency (see `@salary-sight/shared/constants`)
- When creating a salary, currency is auto-set from employee's country
- Currency can be overridden per salary record for edge cases
- Frontend formats amounts using `Intl.NumberFormat` with country locale

## API Design

### Pagination Strategy
- **Server-side** — essential for 10K records
- Default 25 per page, max 100
- Returns `{ data, pagination: { page, limit, total, totalPages } }`

### Soft Delete
- Employees are never hard-deleted
- `DELETE /api/employees/:id` sets `status = 'TERMINATED'`
- Terminated employees still appear in filtered views (can filter by status)
- Preserves salary history and data integrity

### Error Handling
- Zod validation errors → 400 with field-level details
- Prisma unique constraint → 409 Conflict
- Not found → 404
- Everything else → 500 Internal Server Error

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| 10K rows in table | Server-side pagination (25/page default) |
| Search performance | SQLite indexes on `firstName`, `lastName`, `email`, `employeeCode` |
| Filter performance | Indexes on `departmentId`, `country`, `status` |
| N+1 queries | Prisma `include` for eager loading department + current salary |
| Bundle size | Vite code splitting, lazy routes, Ant Design tree-shaking |
| SQLite concurrency | WAL mode; sufficient for single-user scenario |
