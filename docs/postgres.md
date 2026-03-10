# PostgreSQL Setup

The template includes optional PostgreSQL support for persisting user data
(in addition to Firebase auth). The server reads its connection string from
`DATABASE_URL`.

## Docker Compose

Both development and production compose files define a `postgres` service:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

When `DATABASE_URL` is omitted, the server still boots but skips database
initialization and repository operations.  The same credentials are used for
the `server` container via
`postgres://postgres:postgres@postgres:5432/app`.

### Environment variable

Set in `packages/server/.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app
```

Use a different URL in production; see `docker-compose.prod.yml` for examples
with `${POSTGRES_*}` variables.

## Code hooks

* `config.ts` uses zod to validate the URL.
* `db.ts` creates a `pg.Pool` from the URL, runs `initDb()` on startup to
  create a `users` table, and exports a `query` helper.

## Testing

Server unit tests mock repositories and do not require a running database. The
URL is optional.
