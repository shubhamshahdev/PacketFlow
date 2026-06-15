# Contributing to PacketFlow

We love contributions! Here's how to get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `cd backend && npm install && cd ../frontend && npm install`
3. Set up PostgreSQL and create a `.env` file
4. Run migrations: `npm run migrate`
5. Start dev servers: `npm run dev` (backend) and `npm run dev` (frontend)

## Code Style

- TypeScript strict mode enforced
- ESLint + Prettier for formatting
- Follow Clean Architecture and SOLID principles
- Maintain 90%+ test coverage

## Pull Request Process

1. Create a feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Update documentation if needed
6. Submit PR with a clear description of changes

## Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits focused and atomic
