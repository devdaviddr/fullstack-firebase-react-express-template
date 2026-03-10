# Project Guidelines

## Project Overview

TypeScript monorepo (npm workspaces) with a **React 18 + Vite** single-page app (`packages/client`) and an **Express** REST API (`packages/server`). Firebase Authentication (Google Sign-In) handles identity; the server validates Firebase ID tokens on every protected route via firebase-admin.

## Architecture

```
packages/
  client/   React SPA — Firebase client SDK, React Query, axios, Tailwind
  server/   Express API — firebase-admin token verification, layered architecture
```

**Server layers** (strictly top-down, each layer imports only the one below):
- `routes/` → `controllers/` → `services/` → `repositories/`
- `repositories/userRepository.ts` wraps all firebase-admin calls — mock this in tests, never firebase-admin directly.
- Middleware order in `app.ts`: `security (helmet)` → `logging (morgan)` → `rateLimiting` → `cors` → `express.json()` → `routes` → `errorHandler` (always last).

**Client layers:**
- `features/<feature>/` — UI components scoped to a feature (auth, login, dashboard, common).
- `api/services/` — raw axios calls; `api/hooks.ts` — React Query wrappers that resolve the Bearer token before calling a service.
- `features/auth/AuthContext.tsx` — single source of auth state (`user`, `loading`, `getIdToken`).

## Build and Test

```bash
# Install (run from repo root)
npm install

# Dev (starts client :5173 and server :3001 concurrently)
npm run dev

# Build both packages
npm run build

# Lint all packages
npm run lint

# Test client
npm run test --workspace=packages/client

# Test server
npm run test --workspace=packages/server
```

## Code Style

- **TypeScript strict mode** throughout; no `any` unless unavoidable — use `unknown` + type-guard instead.
- `async/await` everywhere; never mix `.then()` chains. Always wrap async route handlers / service calls in `try/catch` and forward errors with `next(err)` on the server side.
- Prefer named exports for components and functions; default export only for page-level React components.
- Use `zod` for all runtime input/environment validation (see `packages/server/src/config.ts` for the pattern).
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.

## Project Conventions

- **Auth in API calls**: obtain the token via `useAuth().getIdToken()` inside a React Query `queryFn`, not at component level. See `packages/client/src/api/hooks.ts → useMe`.
- **Firebase Admin mocking**: in server tests always mock `../../src/firebase` and `../../src/repositories/userRepository` before importing `createApp`. See `packages/server/tests/e2e/userRoutes.test.ts`.
- **Config** is validated once at startup via `packages/server/src/config.ts`; access runtime config only through the exported `config` object, never `process.env` directly in feature code.
- **CORS origin** is driven by `CORS_ORIGIN` env var (default `http://localhost:5173`); never hard-code origins.
- **Rate limiting** is global on the Express app; if adding stricter per-route limits, apply them at the router level before the global one.
- **Error responses**: always `res.status(xxx).json({ error: 'message' })` — no custom error shape per route.
- **Route mounting**: all routes live under `/api` in `routes/index.ts`; add a new feature router there.

## Integration Points

- `packages/client/vite.config.ts` proxies `/api/*` → `http://localhost:3001` in dev; the same path hits the real Express server in production (nginx reverse-proxy or equivalent).
- Firebase credentials: client reads `VITE_FIREBASE_*` env vars; server reads `FIREBASE_SERVICE_ACCOUNT_JSON` (preferred) or individual `FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY` vars.

## Security

- Never log the raw `Authorization` header or Firebase ID tokens.
- Server-side — all protected routes must use `authMiddleware` before any controller; `req.user` is a `DecodedIdToken` set by that middleware.
- Do not expose the firebase-admin service account JSON in client bundles or version control.
- `helmet()` is already applied globally; do not remove or override its defaults without justification.
