---
applyTo: "packages/client/**"
---

# Client Conventions

## Feature Structure

Each feature lives in `packages/client/src/features/<feature>/`. Add new UI concerns as a new folder here; do not scatter components in `src/` root.

Current features: `auth/`, `common/`, `dashboard/`, `login/`.

## Auth

- Single source of truth: `features/auth/AuthContext.tsx` — exposes `user`, `loading`, `signInWithGoogle`, `signOut`, `getIdToken`.
- Use `useAuth()` to access auth state; throw/redirect if used outside `<AuthProvider>`.
- Gate every private page with the `<ProtectedRoute>` wrapper (see `features/common/ProtectedRoute.tsx`).
- Obtain Firebase ID tokens inside a React Query `queryFn`, never at component render time.

## API Layer

- Raw axios calls belong in `api/services/<feature>Service.ts`.
- React Query wrappers belong in `api/hooks.ts`; fetch the token there before calling the service.
- The axios instance (`api/axios.ts`) has `baseURL: '/api'`; never hard-code the API base URL elsewhere.
- Response types live in `api/types.ts`; keep them aligned with server response shapes.

## State Management

- Server state: React Query (`@tanstack/react-query`) only.
- Local UI state: `useState` / `useReducer`.
- No global client-side state library needed; avoid adding one unless the need is compelling.

## Styling

- Tailwind CSS utility classes directly in JSX; no CSS modules or styled components.
- Responsive and accessible by default — include `aria-*` attributes for interactive elements.

## Testing

- Test files co-located under `src/` matching the source file name (`*.test.tsx`).
- Mock `useAuth` by spying on `AuthContext`: `vi.spyOn(AuthContext, 'useAuth').mockReturnValue(...)`.
- Use `@testing-library/react` + `@testing-library/user-event`; query by accessible role/text, not by class or test-id unless unavoidable.
- Wrap renders that need routing in `<MemoryRouter>`.
