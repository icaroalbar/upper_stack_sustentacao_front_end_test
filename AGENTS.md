# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js App Router pages, layouts, and route segments.
- `components/`, `hooks/`, `lib/`, `shared/`, and `types/` contain reusable UI, logic, utilities, and shared types.
- `public/` stores static assets.
- `tests/` contains Playwright end-to-end specs (see `*.spec.ts`), while `test-results/` is generated output.
- Key config files: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `playwright.config.ts`.

## Build, Test, and Development Commands
Use the project’s Yarn scripts:
- `yarn dev` — run the local dev server (Next.js with Turbopack).
- `yarn build` — create a production build.
- `yarn start` — serve the production build locally.
- `yarn lint` — run Next.js ESLint checks.
- `yarn playwright:install` — install the Chromium browser for Playwright once.
- `yarn test:e2e` — run end-to-end tests.
- `yarn test:e2e:ui` — run Playwright with the UI runner.

For login-related E2E tests, export the variables used in `README.md` (`TEST_BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`).

## Coding Style & Naming Conventions
- TypeScript + React + Next.js; follow existing patterns in `app/` and `components/`.
- Formatting is handled by Prettier (with the Tailwind plugin); prefer letting the formatter decide whitespace.
- Linting uses `next lint` (ESLint config in `eslint.config.mjs`).
- Naming: React components in PascalCase, hooks as `useX`, and test files as `*.spec.ts`.

## Testing Guidelines
- E2E tests use Playwright; specs live in `tests/` and follow `*.spec.ts` naming.
- Keep tests deterministic and isolated; avoid relying on shared state across specs.
- Run `yarn test:e2e` before opening a PR that changes user flows.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits with an emoji prefix and short subject:
  `:sparkles: feat: add login screen`.
- Use the types listed in `commit-patterns.md` (e.g., `feat`, `fix`, `docs`, `test`, `refactor`).
- Keep the first line concise (the repo recommends a very short subject line), and use the body/footer for details when needed.

For pull requests, include:
- A clear summary and testing notes (`yarn lint`, `yarn test:e2e`).
- Screenshots or short clips for UI changes.
- Links to related issues or tickets when applicable.

## Security & Configuration Tips
- Do not commit secrets; use environment variables for credentials and test users.
- If you add new env vars, document them in `README.md` and keep defaults safe.
