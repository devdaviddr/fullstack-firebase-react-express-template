# Architecture

This document explains how the client, server, and Firebase services fit together and how data flows through the system.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│   React SPA  ──sign-in──▶  Firebase Auth           │
│       │                        │                   │
│       │◀── ID token ───────────┘                   │
│       │                                             │
│       │  GET /api/me                                │
│       │  Authorization: Bearer <id-token>           │
│       │                                             │
└───────┼─────────────────────────────────────────────┘
        │  (Vite dev proxy / production reverse proxy)
┌───────▼─────────────────────────────────────────────┐
│               Express Server (:3001)                │
│                                                     │
│   authMiddleware ──verifyIdToken──▶ Firebase Admin  │
│       │                                             │
│       ▼ (decoded token attached to req.user)        │
│   Route handler → JSON response                     │
└─────────────────────────────────────────────────────┘
```

---

## Monorepo Layout

The repo uses **npm workspaces** with two packages under `packages/`:

```
packages/
├── client/   @app/client  — React SPA served by Vite
└── server/   @app/server  — Express REST API
```

Both packages share a root `tsconfig.base.json` for consistent compiler settings. The root `package.json` wires them together with a single `npm run dev` command via `concurrently`.

---

## Client (`packages/client`)

### Stack

- **Vite** — dev server (port 5173) and production bundler
- **React 18** — UI
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Firebase JS SDK** — authentication only (no Firestore/Storage used)

### Key files

| File | Responsibility |
|---|---|
| `src/firebase.ts` | Initialises the Firebase app from `VITE_*` env vars; exports `auth` and `googleProvider` |
| `src/features/auth/AuthContext.tsx` | React context that wraps Firebase auth state; exposes `user`, `loading`, `signInWithGoogle`, `signOut`, `getIdToken` |
| `src/components/ProtectedRoute.tsx` | Route guard — redirects to `/login` if no user; shows a spinner while auth state is loading |
| `src/pages/Login.tsx` | Public page — triggers Google Sign-In and redirects to `/` on success |
| `src/pages/Dashboard.tsx` | Protected page — shows user profile and a demo button that calls `GET /api/me` |

### Routing

```
/          → <ProtectedRoute> → <Dashboard>
/login     → <Login>
*          → redirect to /
```

### Dev proxy

`vite.config.ts` proxies every `/api/*` request to `http://localhost:3001` during development, so the client code never references the server port directly:

```ts
proxy: {
  '/api': { target: 'http://localhost:3001', changeOrigin: true }
}
```

---

## Server (`packages/server`)

### Stack

- **Express** — HTTP server (port 3001)
- **tsx** — runs TypeScript directly in development (no compile step)
- **firebase-admin** — verifies Firebase ID tokens server-side
- **dotenv** — loads `packages/server/.env`

### Key files

| File | Responsibility |
|---|---|
| `src/index.ts` | Creates the Express app, registers middleware and routes, starts the listener |
| `src/firebase.ts` | Initialises the Firebase Admin SDK using service account credentials from env vars |
| `src/middleware/authMiddleware.ts` | Extracts the Bearer token from `Authorization` header and calls `admin.auth().verifyIdToken()` |

### Routes

| Method | Path | Guard | Handler |
|---|---|---|---|
| GET | `/api/health` | none | Returns `{ status: "ok", timestamp }` |
| GET | `/api/me` | `authMiddleware` | Returns `{ uid, email, name, picture }` from the decoded token |

### CORS

The server accepts cross-origin requests **only** from `http://localhost:5173` (the Vite dev server). Update this origin when deploying to production.

---

## Firebase Services Used

| Service | SDK | Purpose |
|---|---|---|
| Firebase Authentication | `firebase` (client) | Issues ID tokens after Google Sign-In |
| Firebase Authentication | `firebase-admin` (server) | Verifies ID tokens on protected API calls |

No database, storage, or other Firebase services are used — the template is intentionally minimal.

---

## Data Flow: Protected API Request

1. User signs in → Firebase issues a short-lived **ID token** (JWT, 1 hour TTL).
2. Dashboard calls `user.getIdToken()` — Firebase auto-refreshes if expiring soon.
3. Client sends `GET /api/me` with `Authorization: Bearer <token>`.
4. `authMiddleware` strips the token and calls `admin.auth().verifyIdToken(token)`.
5. Firebase Admin verifies the JWT signature using Google's public keys.
6. On success, the decoded payload is attached to `req.user`; the route handler reads `uid`, `email`, `name`, `picture` and returns them as JSON.
7. On failure (expired, tampered, missing), the middleware responds `401`.

---

## Environment Variables

### Client (`packages/client/.env`)

All variables must be prefixed `VITE_` to be exposed to browser code by Vite.

| Variable | Source |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

### Server (`packages/server/.env`)

| Variable | Source |
|---|---|
| `PORT` | Optional; defaults to `3001` |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → Service accounts |
| `FIREBASE_CLIENT_EMAIL` | same (service account email) |
| `FIREBASE_PRIVATE_KEY` | same (private key from downloaded JSON) |

Alternatively, set `FIREBASE_SERVICE_ACCOUNT_JSON` to a minified single-line JSON string of the full service account file — the server prefers this variable when present.
