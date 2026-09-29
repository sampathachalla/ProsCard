# API test suites

- `local/`: fast unit tests with no database, network, Supabase, or OCI access.
- `integration/`: API route tests using the local PostgreSQL Docker container and mocked Supabase/OCI clients.
- `live/`: explicit cloud tests that can create real Supabase or OCI resources and are never included in the default test command.

Live commands:

- `npm run test:live:auth`: real Supabase signup/login/token verification with cleanup.
- `npm run test:live:profile`: real Supabase authentication plus local PostgreSQL profile persistence with cleanup.
- `npm run test:live:onboarding`: real onboarding draft/resume/completion persistence with cleanup.
- `npm run test:live:cards`: real authenticated card CRUD persistence with cleanup.
- `npm run test:live:security`: two-real-user ownership isolation for profiles, onboarding, cards, and media.
- `npm run test:live:media:profile`: real OCI profile-photo upload, byte-for-byte download verification, and cleanup.
- `npm run test:live:media:cover`: real OCI cover-photo upload, byte-for-byte download verification, and cleanup.
- `npm run test:live:media:logo`: real OCI company-logo upload, byte-for-byte download verification, and cleanup.
- `npm run test:live:media:replacement`: real profile-photo replacement, old-object cleanup, explicit removal, and profile-reference cleanup.
- `npm run test:live:media:cleanup`: abandoned pending-upload detection and idempotent OCI/database cleanup.
