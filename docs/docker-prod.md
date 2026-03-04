# Docker — Production

This document covers building and running production Docker images for the client and server using multi-stage builds.

---

## Overview

Each package has a `Dockerfile.prod` that uses multi-stage builds to produce lean, secure images:

- **Client** — Node builds the Vite bundle, then nginx serves the static output
- **Server** — Node compiles TypeScript to `dist/`, then a clean Node Alpine image runs the compiled JS with production dependencies only

```
┌─────────────────────────────────────────────────────────┐
│  client image (nginx:alpine)                            │
│  /usr/share/nginx/html  ◀── Vite build output           │
│  Port 80                                                │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP (internal compose network)
┌─────────────────────────▼───────────────────────────────┐
│  server image (node:18-alpine)                          │
│  dist/src/index.js  ◀── tsc compiled output             │
│  Port 3001                                              │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A populated root `.env` file (see [Environment Variables](#environment-variables) below)
- `VITE_API_URL` set to the publicly accessible server URL before building

---

## Quick Start

From the repository root:

```bash
docker compose -f docker-compose.prod.yml up --build
```

| Service | URL |
|---|---|
| Client (nginx) | http://localhost:80 |
| Server (Express) | http://localhost:3001 |

Run in the background:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Stop all containers:

```bash
docker compose -f docker-compose.prod.yml down
```

---

## Multi-Stage Build Breakdown

### Client (`packages/client/Dockerfile.prod`)

| Stage | Base image | What it does |
|---|---|---|
| `builder` | `node:18-alpine` | Installs deps, injects `VITE_*` build args as env vars, runs `npm run build` |
| `runner` | `nginx:alpine` | Copies `dist/` into nginx html root, uses custom `nginx.conf` |

`VITE_*` variables are **baked into the JS bundle at build time** by Vite. They must be passed as build args in compose — they are not read at runtime.

### Server (`packages/server/Dockerfile.prod`)

| Stage | Base image | What it does |
|---|---|---|
| `builder` | `node:18-alpine` | Installs all deps including dev, runs `npm run build` (tsc → `dist/`) |
| `runner` | `node:18-alpine` | Installs production deps only (`--omit=dev`), copies `dist/`, runs `node dist/src/index.js` |

---

## Build Context

Both production Dockerfiles use the **repository root** as the build context (set in `docker-compose.prod.yml`). This is required so the build can access `tsconfig.base.json`, which is referenced by both packages via `../../tsconfig.base.json`.

```yaml
build:
  context: .                                   # repo root
  dockerfile: packages/client/Dockerfile.prod
```

A root `.dockerignore` prevents `node_modules`, `dist/`, `.env`, and other unnecessary files from being sent to the Docker daemon.

---

## Environment Variables

### Build-time (client only)

Vite embeds these into the static bundle. They must be present when `docker compose ... up --build` is run.

| Variable | Description |
|---|---|
| `VITE_API_URL` | Public URL of the server, e.g. `https://api.example.com` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

### Runtime (server only)

Injected via `env_file: .env` in compose. Never baked into the image.

| Variable | Description |
|---|---|
| `NODE_ENV` | Should be `production` |
| `PORT` | Express port (default `3001`) |
| `CORS_ORIGIN` | Allowed origin, e.g. your client's public URL |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |

---

## nginx Configuration

The client image ships with a custom `nginx.conf` (`packages/client/nginx.conf`) that:

- Serves static assets from `/usr/share/nginx/html`
- Applies a **1-year cache** header to all JS/CSS/image assets (Vite fingerprints filenames so cache-busting is automatic)
- Routes all unmatched paths to `index.html` so React Router handles client-side navigation

---

## File Structure

```
app-template/
├── .env                               # Git-ignored — populate before building
├── .dockerignore                      # Root-level ignore for prod build contexts
├── docker-compose.prod.yml            # Production compose file
└── packages/
    ├── client/
    │   ├── Dockerfile.prod            # Multi-stage: Node build → nginx serve
    │   └── nginx.conf                 # SPA routing + asset caching
    └── server/
        └── Dockerfile.prod            # Multi-stage: Node build → Node runtime
```

---

## Troubleshooting

**Client shows blank page or broken assets**
Ensure `VITE_API_URL` was correctly set in `.env` before running `--build`. Vite bakes this at compile time — changing `.env` after the build has no effect without a rebuild.

**Server exits immediately with Firebase error**
Check that `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are all set in `.env` before starting the container.

**CORS errors in browser**
Set `CORS_ORIGIN` in `.env` to the exact origin of your client, including protocol and port if applicable.

**Rebuilding a single service**
```bash
docker compose -f docker-compose.prod.yml build client
docker compose -f docker-compose.prod.yml up -d
```
