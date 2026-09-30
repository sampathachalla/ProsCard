# ProsCard API

The local Node API uses Supabase Auth for identity, PostgreSQL for application data, and OCI Object Storage for media.

## Local development

1. Copy `.env.example` to `.env` and supply local/cloud credentials. Place the OCI key in `secrets/`.
2. Start PostgreSQL and the API in Docker: `npm run docker:up`, or `docker compose up -d --build` from the repository root. The `Dockerfile`, `.dockerignore`, and `docker-compose.yml` live at the repository root; the root `.env` is a git-ignored symlink to `api/.env` so Compose can read `PORT` and `DB_*`.
3. Check `http://localhost:${PORT}/health` (default `3000`).

The `api` container runs `tsx watch` against the mounted source, so edits reload automatically. Inside the compose network it connects to `postgres:5432`; the `DB_HOST`/`DB_PORT` values in `.env` are only used when running scripts from the host. Useful commands:

- `npm run docker:logs`: follow API logs.
- `npm run docker:migrate`: apply migrations inside the container.
- `npm run docker:down`: stop both containers (data stays in the `proscard_postgres_data` volume).
- Rebuild after changing dependencies: `npm run docker:up`.

Operational endpoints:

- `GET /health`: process liveness.
- `GET /ready`: PostgreSQL readiness.
- `GET /api-docs.json`: OpenAPI 3.1 route document.

Apply tracked database migrations with `npm run db:migrate`. Applied migration checksums are stored in `schema_migrations`; modifying an already-applied migration causes the command to fail.

Logs are emitted as JSON to stdout with request IDs, which is suitable for Docker or platform log collectors. To forward the same entries to a centralized HTTP collector, configure `LOG_SINK_URL` and optionally `LOG_SINK_TOKEN`. Request bodies, authorization headers, tokens, and credentials are never logged.

Abandoned uploads and failed OCI cleanup are processed automatically every `MEDIA_CLEANUP_INTERVAL_SECONDS` (default: 900). Set it to `0` only when a separate scheduler invokes `POST /api/v1/media/cleanup/retry`.

All application endpoints are under `/api/v1`. Protected endpoints require `Authorization: Bearer <supabase-access-token>`.

Media uploads use a two-step flow: request `POST /api/v1/media/upload-url`, then upload the bytes directly to the returned OCI URL using `PUT` and the returned headers.

## Opt-in live Supabase authentication test

Keep the API running and execute:

```bash
npm run test:live:auth
```

This command creates a generated Supabase Auth user, confirms it when necessary, verifies login and bearer-token authentication, and deletes it afterward. It never runs as part of `npm test` and does not print the credentials or tokens. Set `LIVE_TEST_KEEP_USER=true` only when you intentionally want to inspect the generated user afterward.
