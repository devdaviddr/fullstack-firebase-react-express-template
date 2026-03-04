# Docker — Development

This document covers how to run the full stack locally using Docker Compose with hot reload for both the client and server.

---

## Overview

The development setup mounts your local source code into each container as a bind volume, so any file change is reflected immediately without rebuilding the image.

```
┌─────────────────────────────────────────────────────┐
│                   Host Machine                      │
│                                                     │
│   packages/client  ──bind──▶  client container      │
│   packages/server  ──bind──▶  server container      │
│   .env             ──bind──▶  both containers       │
│   tsconfig.base.json ─bind──▶  client container     │
└─────────────────────────────────────────────────────┘

client (Vite)  :5173  ──proxy /api──▶  server (Express)  :3001
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A populated root `.env` file (copy `./.env.example` then edit, see [Environment Variables](#environment-variables) below)

---

## Quick Start

From the repository root:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Client (Vite dev server) | http://localhost:5173 |
| Server (Express) | http://localhost:3001 |

Run in the background:

```bash
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

Stop all containers:

```bash
docker compose down
```

---

## How Hot Reload Works

Both services use bind mounts so your local files are mirrored directly into the container filesystem:

- **Client** — Vite watches `packages/client/src/**` and triggers HMR in the browser on every save
- **Server** — `tsx watch` restarts the Express process whenever a TypeScript file in `packages/server/src/**` changes

Because `node_modules` is mounted as a **named volume** (not a bind mount), container dependencies are isolated from the host. If you add or remove a package, rebuild the relevant service:

```bash
docker compose up --build client   # or server
```

---

## Environment Variables

A single `.env` at the repository root is used by both services. Use `.env.example` as a starting point; the real file is git-ignored and bind-mounted read-only into each container.

### Required

| Variable | Used by | Description |
|---|---|---|
| `CLIENT_PORT` | client | Vite dev server port (default `5173`) |
| `SERVER_PORT` | server | Express server port (default `3001`) |
| `NODE_ENV` | server | Should be `development` |
| `CORS_ORIGIN` | server | Allowed origin, e.g. `http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | server | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | server | Service account email |
| `FIREBASE_PRIVATE_KEY` | server | Service account private key (use literal `\n` for newlines) |
| `VITE_FIREBASE_API_KEY` | client | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | client | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | client | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | client | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | client | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | client | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | client | Firebase measurement ID |

---

## Networking

Compose creates an internal network shared by both containers. The Vite proxy forwards all `/api/*` requests to the `server` container using the Docker service name:

```
VITE_API_URL=http://server:3001
```

This is set automatically in `docker-compose.yml` and does not need to be in `.env`.

Vite is configured with `host: true` (`0.0.0.0`) so Docker's port mapping can expose port `5173` to the host browser.

---

## File Structure

```
app-template/
├── .env                          # Git-ignored — populate before running
├── docker-compose.yml            # Dev compose file
├── tsconfig.base.json            # Bind-mounted into client container
└── packages/
    ├── client/
    │   ├── Dockerfile            # Dev image — installs deps, runs Vite
    │   └── .dockerignore
    └── server/
        ├── Dockerfile            # Dev image — installs deps, runs tsx watch
        └── .dockerignore
```

---

## Troubleshooting

**Port already in use**
Change `CLIENT_PORT` or `SERVER_PORT` in `.env` and restart.

**Healthcheck failures**
Docker will periodically curl `/api/health` on the server service. If you see restart loops, confirm the endpoint is reachable and returns 200. You can disable the check by removing the `healthcheck` section in `docker-compose.yml`.

**Module not found after adding a package**
Rebuild the affected service: `docker compose up --build client` or `server`.

**Firebase credentials error on server startup**
Ensure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are all set in `.env`.

**Changes not reflecting in browser**
Check that the Vite dev server output shows HMR updates. If not, confirm `packages/client` is correctly bind-mounted by inspecting `docker compose config`.
