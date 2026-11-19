# SalarySight 💰

Employee salary management platform for ACME Corp — managing 10,000 employees across 10 countries.

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Run database migration
cd apps/api
cp .env.example .env
npx prisma migrate dev --name init
cd ../..

# 3. Seed 10,000 employees
npm run db:seed

# 4. Start both backend and frontend
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000

### Docker

```bash
docker compose up --build
```

## Project Structure

```
salary-sight/
├── apps/
│   ├── api/          # Express + Prisma + SQLite backend
│   └── web/          # React + Vite + Ant Design frontend
├── packages/
│   └── shared/       # Shared types, constants, currency mappings
├── docs/             # Requirements, architecture, AI usage notes
├── Dockerfile
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Ant Design, TanStack Query |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | SQLite |
| Monorepo | npm workspaces, Turborepo |
| Testing | Vitest, React Testing Library, Supertest |

## Features

- ✅ View, search, filter, and sort 10,000 employees
- ✅ Add, edit, and terminate employees
- ✅ Salary history with revision tracking
- ✅ Country-based currency (USD, INR, GBP, EUR, JPY, etc.)
- ✅ CSV export
- ✅ Server-side pagination
- ✅ Responsive Ant Design UI

## Running Tests

```bash
# All tests
npm run test

# Backend tests only
cd apps/api && npm test

# Frontend tests only
cd apps/web && npm test
```

## Documentation

- [Requirements](docs/REQUIREMENTS.md)
- [Architecture & Trade-offs](docs/ARCHITECTURE.md)
- [AI Tool Usage](docs/AI-USAGE.md)
