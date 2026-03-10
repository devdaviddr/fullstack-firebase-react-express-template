# Fullstack Firebase React Express Template

![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D4.5-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A full‑stack **TypeScript monorepo** starter built with React on the frontend and Express on the backend. Firebase Authentication (Google Sign‑In) handles users; the server validates Firebase ID tokens on every protected route.  

Additional documentation lives in the `docs/` directory to explain architecture, auth flow, and testing practices for both client and server.



---

## Documentation

Documentation files are located in the `docs/` directory and cover various aspects of the project:

- [architecture.md](docs/architecture.md) – overall system architecture and design decisions
- [auth.md](docs/auth.md) – how Firebase authentication and token validation work across client and server
- [backend-testing.md](docs/backend-testing.md) – guidance for writing and running server‑side tests
- [client-testing.md](docs/client-testing.md) – guidance for writing and running client‑side tests
- [docker-dev.md](docs/docker-dev.md) – running the full stack locally with Docker Compose and hot reload (see `.env.example`)
- [docker-prod.md](docs/docker-prod.md) – building and running production images with multi-stage Dockerfiles (includes healthcheck details)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces |
| Client | React 18, Vite, TypeScript, Tailwind CSS, axios, React Query |
| Auth | Firebase Authentication (Google Sign-In) |
| Server | Node.js, Express, TypeScript, tsx |
| Token validation | Firebase Admin SDK |

---

## Project Structure

```
app-template/
├── package.json              # Root — scripts & workspaces
├── tsconfig.base.json        # Shared TypeScript config
└── packages/
    ├── client/               # React SPA (port 5173)
    │   ├── src/
    │   │   ├── firebase.ts          # Firebase client init
    │   │   ├── api/                 # axios + react-query hooks
    │   │   ├── features/            # feature-based UI code
    │   │   │   ├── auth/AuthContext.tsx
    │   │   │   ├── common/ProtectedRoute.tsx
    │   │   │   ├── login/Login.tsx
    │   │   │   └── dashboard/Dashboard.tsx
    │   └── vite.config.ts    # Dev proxy → :3001
    └── server/               # Express API (port 3001)
        └── src/
            ├── index.ts             # App entry, routes
            ├── firebase.ts          # Firebase Admin init
            └── middleware/authMiddleware.ts
```

---

## Getting Started 🚀

Follow these steps to boot the project locally. All commands are executed from the repository root unless otherwise noted.

### Prerequisites

- Node.js **18+** (LTS)
- npm **9+** (bundled with Node) or an equivalent package manager
- A Firebase project with **Google Sign‑In** enabled ([Firebase Console](https://console.firebase.google.com))

### 1. Install dependencies

```bash
npm install
```

### Prerequisites

- Node.js ≥ 18
- A Firebase project with **Google Sign-In** enabled ([Firebase Console](https://console.firebase.google.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the client

Create `packages/client/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These values are found under **Project Settings → Your apps** in the Firebase Console.

### 3. Configure the server

Create `packages/server/.env` using the service account credentials found under **Project Settings → Service accounts → Generate new private key**:

```env
PORT=3001

FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
"
```

### 4. Run in development

```bash
npm run dev
```

This starts both packages concurrently:

| Process | URL |
|---|---|
| Client (Vite) | http://localhost:5173 |
| Server (Express) | http://localhost:3001 |

Vite proxies all `/api/*` requests to the Express server, so the client never needs to hard-code the API URL.

### 🐳 Docker-based development

If you prefer containerized development, we provide a `docker-compose.yml` at the repo root. It builds two services (client and server) and mounts
source code for hot reload.

1. Ensure Docker is installed and running.
2. Copy `.env.example` (or use your existing root `.env`) and adjust ports/vars as needed.
3. From the repo root execute:

```bash
docker compose up --build
```

You can also run the containers in the background
with `-d` and view logs with `docker compose logs -f`.

The bind mounts keep your local edits in sync; there's no need
for rebuilding when editing source files. To stop, use

```bash
docker compose down
```

Ports are mapped according to the variables in `.env` (defaults
5173 and 3001). The client container reads `VITE_API_URL` from
`.env` so it can target the server.

> These containers are strictly for development; production
> image definitions are not included.

---

## Scripts 🧰

All workspace commands are defined at the root `package.json` and are forwarded to the appropriate package(s).

| Script | Description | Notes |
|---|---|---|
| `npm run dev` | Launch client and server concurrently in development mode | Starts Vite (5173) and Express (3001) with hot reload
| `npm run build` | Compile both packages for production | Outputs to each package’s `dist` folder
| `npm run lint` | Run ESLint across all packages | Configured with shared rules
| `npm run test:client` | Execute client unit tests (Vitest) | Runs inside `packages/client`
| `npm run test:server` | Execute server tests (Vitest) | Runs inside `packages/server`
| `npm run clean` | Remove `node_modules` and build artifacts | Helpful when switching branches

> **Tip:** use `npm run <script> --workspace=client` to run a script in a single package.

---

## Linting 🔍

The repository includes a shared ESLint configuration at the repo root. The primary lint command is wired at the root `package.json` and forwards to package-level lint scripts.

Run lint across all packages:

```bash
npm run lint
```

Run lint for a single package:

```bash
npm run lint --workspace=packages/client
npm run lint --workspace=packages/server
```

Auto-fix fixable issues across the repository:

```bash
npx eslint . --ext .ts,.tsx --fix
```

Notes:
- The server `lint` script runs `eslint` followed by `tsc --noEmit` so type errors are checked as part of linting.
- See [docs/eslint.md](docs/eslint.md) for full configuration details, rules and overrides.


## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |
| GET | `/api/me` | Bearer token | Returns the authenticated user's profile |

See [docs/auth.md](docs/auth.md) for how token‑based auth works and [docs/architecture.md](docs/architecture.md) for a full system overview.
