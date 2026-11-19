# AI Tool Usage

This document records how AI tools were used during the development of SalarySight.

## Tools Used

- **Google Antigravity (AGY)** — Agentic AI coding assistant

## How AI Was Used

### Planning & Architecture
- Generated initial requirements document structure
- Reviewed tech stack trade-offs (SQLite vs PostgreSQL, Prisma vs Knex)
- Designed database schema with proper indexing strategy
- Planned API endpoints and response shapes

### Code Generation
- Scaffolded monorepo structure with proper TypeScript configuration
- Generated Prisma schema with relationships and indexes
- Built Express routes, services, and validators
- Created React components with Ant Design integration
- Wrote seed script with realistic, country-adjusted data

### Testing
- Generated unit tests for backend services
- Created integration tests for API routes with supertest
- Built frontend component tests with React Testing Library

### Quality Assurance
- Reviewed generated code for correctness and edge cases
- Ensured consistent error handling patterns
- Validated TypeScript types across shared package boundaries

## Human Decisions

While AI accelerated the implementation, the following decisions were made with intentional human judgment:

1. **Scope definition** — What to include/exclude and why
2. **Database design** — Salary as separate table with history
3. **Country-currency mapping** — Which countries to include, realistic salary ranges
4. **UX flow** — Page layout, navigation, form placement
5. **Error handling strategy** — Soft delete vs hard delete, validation approach
6. **Testing philosophy** — What to test, what level of coverage is meaningful

## Principle

AI was used as an accelerator, not a replacement for thinking. Every architectural decision was reasoned about, and generated code was reviewed for correctness and quality.
