# Client Testing Strategy

This document explains the frontend testing setup for the `@app/client` package and details each test suite already in place.

## Dependencies

- **Vitest**: same test runner as the server but configured for DOM.
- **@vitest/coverage-istanbul**: coverage reporting.
- **React Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`): component rendering and user interactions.
- **jsdom**: provides a browser-like DOM for tests.

## Configuration

`packages/client/vitest.config.ts` specifies:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react() as any], // cast avoids vitest/vite type mismatch
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
    coverage: { provider: 'istanbul', reporter: ['text', 'html'] },
  },
});
```

Notice `globals: true` enables `describe`, `it`, `expect`, and `vi` without imports.

### Global Setup (`src/setupTests.ts`)

```ts
import '@testing-library/jest-dom';

vi.mock('./firebase', () => ({
  auth: {},
  googleProvider: {},
}));
```

The Firebase module is stubbed globally to prevent real initialization.

## Available Tests

### `App.test.tsx`

- **Objective**: smoke‑test the login screen and ensure click handler works.
- **Key techniques**: `vi.spyOn(AuthContext, 'useAuth')` to fake authentication state, `MemoryRouter` with v7 future flags, `userEvent` for interaction.
- **Assertions**:
  - login prompt renders when `user` is null
  - clicking the sign‑in button calls `signInWithGoogle`

### `features/common/ErrorBoundary.test.tsx`

- **Objective**: verify `ErrorBoundary` shows fallback UI and suppress console/jsdom noise.
- **Technique**: create a throwing `Bomb` component, mock `console.error`, and prevent default on `window.error` events to silence jsdom.

### `features/common/ProtectedRoute.test.tsx`

- **Objective**: exercise all three rendering branches of `ProtectedRoute`.
- **Technique**: stub `useAuth()` return value with loading, unauthenticated, and authenticated states; wrap in `MemoryRouter`.

### `features/dashboard/Dashboard.test.tsx`

- **Objective**: validate interactive dashboard behaviour now that users can edit
  their name/picture and view a list of all users.
- **Additions**:
  - form inputs pre‑populate from `useMe()` and send updates via
    `useUpdateProfile()`.
  - a secondary query hook `useUsers()` fetches `/api/users`; tests mock it and
    assert that the list renders when data is returned.
- **Technique**: in addition to existing mocks for auth and API hooks,
  `useUsers` is also stubbed; `userEvent` types into inputs and clicks the save
  button, and the mutation is inspected for correct arguments.

### `api/services/userService.test.ts`

- **Objective**: unit‑test HTTP helper functions without network.
- **Technique**: mock the shared `axios` instance and assert correct URL, headers, and payloads.

### `api/hooks.test.tsx`

- **Objective**: test `useMe` hook's interaction with React Query and auth.
- **Technique**: `renderHook` with a `QueryClientProvider` wrapper, mock `getIdToken`, and drive `userService.getMe` to success, loading, and error states.

### `features/dashboard/Dashboard.test.tsx`

- **Objective**: component behaviour including user info, button states, API call, and sign‑out.
- **Technique**: mock `useAuth`, `useMe`, and `useMutationHook`; use `userEvent` to trigger button clicks.

## Running the Suite

```bash
cd packages/client
npm install              # after adding deps
npm run test             # run once
npm run test:watch       # watch mode
npm run test -- --coverage
```

## Testing Practices

- **Isolation**: use `vi.mock()` and `vi.spyOn()` so tests run deterministically without network or Firebase.
- **Typing mocks**: add explicit generics to `vi.fn<() => Promise<void>>()` for correctness.
- **Noise suppression**: error boundary tests mock `console.error` and prevent jsdom from writing uncaught exceptions.
- **Router & context wrappers**: `MemoryRouter` with future flags and custom hook spies keep tests lightweight.
- **Query client setup**: `new QueryClient({ defaultOptions: { queries: { retry: false } } })` prevents automatic retries during test failures.

## Extending Coverage

Add new component or hook tests next to their implementation; use the patterns above (mocks, wrappers, interaction). For any new async service call, prefer mocking the underlying module instead of real HTTP requests.
