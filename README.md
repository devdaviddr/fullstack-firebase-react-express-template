# App Template

A full-stack TypeScript monorepo starter with React + Firebase Auth on the client and an Express API server that validates Firebase ID tokens on every protected route.

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

## Getting Started

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

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start client + server in watch mode |
| `npm run build` | Build both packages for production |
| `npm run lint` | Lint all packages |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |
| GET | `/api/me` | Bearer token | Returns the authenticated user's profile |

See [docs/auth.md](docs/auth.md) for how token-based auth works and [docs/architecture.md](docs/architecture.md) for a full system overview.
