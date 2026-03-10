---
applyTo: "packages/server/**"
---

# Server Conventions

## Adding a New Feature Route

1. Create `packages/server/src/routes/<feature>.ts` — mount the router; protect every non-public endpoint with `authMiddleware`.
2. Create `packages/server/src/controllers/<feature>Controller.ts` — handle `req`/`res` only; delegate logic to the service.
3. Create `packages/server/src/services/<feature>Service.ts` — pure business logic; no Express imports.
4. If persistence is needed, add `packages/server/src/repositories/<feature>Repository.ts` — only file allowed to import firebase-admin.
5. Register the new router in `packages/server/src/routes/index.ts` under `/api`.

## Middleware

- Middleware order (defined in `app.ts`) must stay: `security` → `logging` → `rateLimiting` → `cors` → `express.json()` → routes → `errorHandler`.
- Never place `errorHandler` before any route or it won't catch errors.
- Per-route rate limits go on the specific router, not the app.

## Error Handling

- All errors forwarded via `next(err)` are caught by `errorHandler` in `middleware/errorHandler.ts`.
- Return `res.status(xxx).json({ error: 'descriptive message' })` — do not invent custom shapes per route.
- Log structured contexts in the service layer; never log the raw `Authorization` header or token strings.

## Testing

- Test files live in `packages/server/tests/` (e2e under `e2e/`, unit under `unit/`).
- **Always** mock `../../src/firebase` and `../../src/repositories/userRepository` at the top of every test file before importing `createApp`. See `tests/e2e/userRoutes.test.ts` for the canonical pattern:
  ```ts
  vi.mock('../../src/firebase', () => ({ default: {} }));
  vi.mock('../../src/repositories/userRepository', () => ({ verifyIdToken: vi.fn() }));
  ```
- Use `supertest` for e2e route tests; use plain `vitest` for unit tests of services and controllers.
- Call `vi.resetAllMocks()` in `beforeEach` to prevent mock bleed between tests.

## Environment / Config

- All env vars are validated at startup in `src/config.ts` using `zod`. Add new vars to the `EnvSchema` there; export them on the `config` object.
- Never access `process.env` outside `config.ts`.
