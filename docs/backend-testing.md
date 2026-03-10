# Backend Testing Strategy

This document explains the unit and integration/e2e testing setup for the `@app/server` package.

### Dependencies & Setup

- **Vitest**: test runner with built‑in TypeScript support and `vi.mock`.
- **Supertest**: HTTP assertion library used for integration/e2e tests.
- **Types**: `vitest`, `node` and `@types/supertest` are included in `devDependencies`.

Relevant `package.json` scripts:

```json
"scripts": {
  "test": "vitest run --config vitest.config.ts",
  "test:watch": "vitest --config vitest.config.ts"
}
```

`vitest.config.ts` configures a Node environment, global helpers, and inclusion patterns. The server `tsconfig.json` sets `rootDir: "."` and includes both `src` and `tests`.

### Directory Layout

```
packages/server/
├── src/
└── tests/
    ├── unit/
    │   ├── config.test.ts
    │   ├── middleware/authMiddleware.test.ts
    │   └── controllers/userController.test.ts
    └── e2e/
        ├── health.test.ts
        └── userRoutes.test.ts
```

### Unit Tests

- **`config.test.ts`**: validates environment variable parsing and defaults.
- **`middleware/authMiddleware.test.ts`**: exercises auth middleware with mocked `verifyIdToken` responses.
- **`controllers/userController.test.ts`**: ensures the controller calls the service and returns JSON.
- **`repositories/userRepository.test.ts`**: verifies SQL queries and parameter binding; the `db` helper is mocked so no real database is required.

All unit tests use `vi.mock()` to stub dependencies and `vi.mocked()` for type-checked mock access. Mocks are reset between examples.

### Integration / E2E Tests

Integration tests load the full Express application via `createApp()` from `src/app.ts`. The Firebase initialization is mocked to avoid external calls, and `userRepository` is stubbed to control responses.

- **`health.test.ts`**: asserts `GET /api/health` returns `200 {status:'ok'}`.
- **`userRoutes.test.ts`**: exercises `/api/me` with no token, invalid token, and valid token scenarios.

### Running the Suite

From `packages/server`:

```bash
npm install     # one-time dependency install
npm run test     # run all tests once
npm run test:watch  # watch mode during development
```

Tests are fully isolated; `vi.resetModules()` ensures different mock states or env settings don’t leak between tests.

---

> **Frontend tests live in a separate document:** see `docs/client-testing.md` for the client testing strategy and individual test descriptions.

---

## Frontend

### Dependencies

| Package | Purpose |
|---|---|
| `vitest` | Test runner |
| `@vitest/coverage-istanbul` | Coverage reports |
| `@testing-library/react` | `render`, `screen`, `fireEvent`, etc. |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `jsdom` | Browser DOM environment for Vitest |

### Configuration — `packages/client/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
    coverage: { provider: 'istanbul', reporter: ['text', 'html'] },
  },
});
```

Key differences from the server config: `environment: 'jsdom'` (browser DOM) and `@vitejs/plugin-react` (JSX transform).

### Global Setup — `src/setupTests.ts`

Runs once before every test file.

```ts
import '@testing-library/jest-dom';   // adds DOM matchers to expect()

// vi.mock is hoisted above imports by Vitest, so this stub is in place
// before any module that imports firebase (e.g. AuthContext) is evaluated.
vi.mock('./firebase', () => ({
  auth: {},
  googleProvider: {},
}));
```

The firebase stub prevents `initializeApp` from running (which throws without real env config). The `vi.mock` call does **not** need a preceding `import` of the module — hoisting means the factory runs first regardless.

### Scripts

```json
"scripts": {
  "test": "vitest run --config vitest.config.ts",
  "test:watch": "vitest --config vitest.config.ts"
}
```

### Test Files

```
packages/client/src/
├── App.test.tsx
└── features/common/
    └── ErrorBoundary.test.tsx
```

#### `App.test.tsx` — Login screen smoke test

Stubs `useAuth` via `vi.spyOn` (avoids mounting `AuthProvider` which would call Firebase), and wraps `Login` in `MemoryRouter` with React Router v7 future flags to silence deprecation warnings:

```ts
vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: null, loading: false, ... });

render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Login />
  </MemoryRouter>
);
```

Use `vi.spyOn` (not `vi.mock`) when you only need to override a single exported function from a module that is otherwise fine to import normally.

#### `ErrorBoundary.test.tsx` — error boundary behaviour

Tests that the fallback UI renders when a child throws. Two separate sources of stderr noise occur during error boundary tests and both must be suppressed:

1. **React dev-mode** calls `console.error` with "The above error occurred…" — silenced with a mock.
2. **jsdom** writes directly to `process.stderr` via its `reportException` path — stopped by calling `event.preventDefault()` on the `window error` event (jsdom respects `defaultPrevented`).

```ts
const suppressUncaught = (e: ErrorEvent) => e.preventDefault();

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  window.addEventListener('error', suppressUncaught);
});
afterEach(() => {
  vi.restoreAllMocks();
  window.removeEventListener('error', suppressUncaught);
});
```

Apply this pattern to any future test that intentionally triggers an error boundary.

### Mocking Patterns

| Situation | Approach |
|---|---|
| Override one hook / export | `vi.spyOn(module, 'fn').mockReturnValue(...)` |
| Replace an entire module | `vi.mock('./path', () => ({ ... }))` in the test file |
| Global stub (all test files) | `vi.mock(...)` in `setupTests.ts` |
| Component needs a router | Wrap with `<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>` |
| Component needs auth context | `vi.spyOn(AuthContext, 'useAuth')` — avoids touching Firebase |
| Error boundary tests | Suppress both `console.error` and the `window error` event (see above) |

### Running

```bash
# from packages/client
npm run test                  # run once
npm run test:watch            # watch mode
npm run test -- --coverage    # with coverage report
```

---

## Extending Coverage

- **Server**: add unit tests under `tests/unit/` and e2e tests under `tests/e2e/`.
- **Client**: add `*.test.tsx` files alongside components. Use `vi.mock` for services/APIs and `vi.spyOn` for context hooks.
- Use `vi.mock()` for any external service (Firebase, axios, etc.) to keep tests free of network and environment dependencies.


## Dependencies & Setup

- **Vitest**: test runner with built‑in TypeScript support and `vi.mock`.
- **Supertest**: HTTP assertion library used for integration/e2e tests.
- **Types**: `vitest`, `node` and `@types/supertest` are included in `devDependencies`.

The server package `package.json` contains the following relevant scripts:

```json
"scripts": {
  "test": "vitest run --config vitest.config.ts",
  "test:watch": "vitest --config vitest.config.ts"
}
```

A `vitest.config.ts` file configures a Node environment, global helpers, and test inclusion patterns.

TypeScript is configured in `packages/server/tsconfig.json` with `rootDir: "."` and includes both `src` and `tests` directories. Test files reference `vitest` types at the top.

## Directory Layout

```
packages/server/
├── src/                # application code
└── tests/
    ├── unit/           # pure-unit tests
    │   ├── config.test.ts
    │   ├── middleware/authMiddleware.test.ts
    │   └── controllers/userController.test.ts
    └── e2e/            # integration tests via supertest
        ├── health.test.ts
        └── userRoutes.test.ts
```

## Unit Tests

- **`config.test.ts`**: validates environment variable parsing and defaults.
- **`middleware/authMiddleware.test.ts`**: exercises the authentication middleware with mocked `verifyIdToken` responses; checks header handling and token verification.
- **`controllers/userController.test.ts`**: ensures the controller calls the service and returns JSON.

All unit tests use `vi.mock()` to stub dependencies (services, repositories) and `vi.mocked()` to type-check mock usage. Mocks are reset between examples.

## Integration / E2E Tests

Integration tests load the full Express application by importing `createApp()` from `src/app.ts`. The Firebase initialization is mocked to avoid side effects, and the `userRepository` is mocked to control token verification.

- **`health.test.ts`**: calls `/api/health` and asserts a 200 `{status:'ok'}` response.
- **`userRoutes.test.ts`**: exercises `/api/me` with no token, invalid token, and valid token scenarios.

These tests use `supertest` to make HTTP requests against the in‑memory server.

## Running the Suite

From `packages/server`:

```bash
npm install    # install dependencies once
npm run test    # run all tests once
npm run test:watch  # run in watch mode during development
```

Tests are fully isolated; mocking and `vi.resetModules()` ensure different environment settings don’t leak between tests.

## Frontend Testing Strategy

The client package also uses **Vitest** along with React Testing Library for React components and hooks. The configuration mirrors the server setup but targets a `jsdom` environment and includes a small React plugin.

Key points:

- `vitest.config.ts` lives in `packages/client` and enables `@vitejs/plugin-react`.
- Tests are named `*.test.tsx`/`*.spec.tsx` and are found under `src/`.
- A `src/setupTests.ts` file loads `@testing-library/jest-dom` and stubs out the real Firebase module with a simple `vi.mock()`.
- Add or modify `include` entries in `packages/client/tsconfig.json` so the compiler sees tests.
- Scripts added to `package.json`:
  ```json
  "test": "vitest run --config vitest.config.ts",
  "test:watch": "vitest --config vitest.config.ts"
  ```

### Example files

```text
packages/client/src/App.test.tsx          # smoke test verifies login screen
packages/client/src/features/common/ErrorBoundary.test.tsx
packages/client/src/setupTests.ts         # global mocks & jest-dom
``` 

### Running the suite

From the client directory:

```bash
npm install           # ensure new dependencies are installed
npm run test          # run all frontend tests once
npm run test:watch    # watch mode during development
```

Tests can render components wrapped in `MemoryRouter` and mock hooks such as `useAuth` via `vi.spyOn` or `vi.mock`.
Mocking Firebase or other browser APIs prevents side effects. Add new component/unit tests alongside the component implementation.

## Extending Coverage

- Add new unit tests alongside corresponding modules under `tests/unit`.
- For new API routes, add e2e tests under `tests/e2e` that import the application.
- Use `vi.mock()` for any external services (Firebase, databases, etc.) to avoid network or file system dependencies.

The current setup covers configuration, middleware logic, controllers, and basic route behaviour. It's suitable for portfolio projects and can be expanded for production apps by adding more middleware and service tests.
