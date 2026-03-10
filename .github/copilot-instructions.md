# Project Guidelines

TypeScript monorepo (`packages/client` — React 18 + Vite + Tailwind, `packages/server` — Express). Firebase Auth (Google Sign-In); server validates ID tokens via firebase-admin.

## Architecture

- **Server** (strict layering): `routes/` → `controllers/` → `services/` → `repositories/`
- **Middleware order**: `helmet` → `morgan` → `rateLimiter` → `cors` → `express.json()` → `routes` → `errorHandler`
- **Client**: `features/<feature>/` for UI; `api/services/` for axios calls; `api/hooks.ts` for React Query wrappers; `features/auth/AuthContext.tsx` for auth state.

## Key Conventions

- TypeScript strict mode; no `any` — use `unknown` + type-guard.
- `async/await` only; wrap handlers in `try/catch`, forward with `next(err)`.
- Named exports everywhere; default export only for page-level components.
- `zod` for all runtime validation; config via `packages/server/src/config.ts` — never read `process.env` directly in feature code.
- Error responses: `res.status(xxx).json({ error: 'message' })` — consistent shape, no per-route variations.
- All routes mount under `/api` in `routes/index.ts`.
- `CORS_ORIGIN` env var drives allowed origins — never hard-code.
- Get auth token via `useAuth().getIdToken()` inside React Query `queryFn`, not at component level.
- In server tests, mock `../../src/firebase` and `../../src/repositories/userRepository` before importing `createApp`.
- All protected routes require `authMiddleware`; `req.user` is a `DecodedIdToken`.
- `helmet()` is global — do not remove or override without justification.
- Never log `Authorization` headers or Firebase ID tokens.
- Do not expose service account JSON in client bundles or version control.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.

## Commands

```bash
npm install                                  # from repo root
npm run dev                                  # client :5173 + server :3001
npm run build && npm run lint                # build & lint all
npm run test --workspace=packages/client
npm run test --workspace=packages/server
```
