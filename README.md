# Alvin Okoro | Software Engineer Technical Assessment

This repository is a polyglot monorepo for a customer support ticketing system.

- `apps/api`: Ruby on Rails API (PostgreSQL + GraphQL)
- `apps/web`: TanStack Start frontend

## Prerequisites

Install these tools locally:

- PostgreSQL `18` (recommended)
- Ruby `3.3.4` (project is pinned to this version in `apps/api/.ruby-version`)
- Bundler `2.5+`
- Node.js `20+` (Node `22+` is also fine)
- pnpm `9+`

Check versions:

```bash
psql --version
ruby -v
bundle -v
node -v
pnpm -v
```

## Repository Structure

```text
.
├── apps
│   ├── api
│   └── web
├── .env.example
└── README.md
```

## Environment Configuration

Create your local environment file at repository root:

```bash
cp .env.example .env
```

Connection strings:

- `DATABASE_URL`
- `TEST_DATABASE_URL`

Default values in `.env.example`:

```bash
DATABASE_URL=postgresql://postgres:admin@127.0.0.1:5432/supportos_dev
TEST_DATABASE_URL=postgresql://postgres:admin@127.0.0.1:5432/supportos_test
```

If your local PostgreSQL user has no password, use:

```bash
DATABASE_URL=postgresql://127.0.0.1:5432/supportos_dev
TEST_DATABASE_URL=postgresql://127.0.0.1:5432/supportos_test
```

## Backend Setup (Rails API)

From repository root:

```bash
set -a
source .env
set +a
cd apps/api
bundle install
bin/rails db:prepare
bin/rails server
```

Backend URL:

- `http://localhost:3001`

## Frontend Setup (TanStack Start)

From repository root:

```bash
cd apps/web
```

Install frontend dependencies:

```bash
pnpm install
```

Run frontend development server:

```bash
pnpm dev
```

Frontend URL:

- `http://localhost:3000`

## Run Both Apps in Development

Open two terminal tabs:

Terminal 1 (API):

```bash
set -a
source .env
set +a
cd apps/api
bin/rails server
```

Terminal 2 (Web):

```bash
cd apps/web
pnpm dev
```

Ensure PostgreSQL is running locally before starting the API.

## Test Commands

Backend tests:

```bash
cd apps/api
bin/rails test
```

Frontend tests (when configured in `apps/web`):

```bash
cd apps/web
pnpm test
```

## Notes

- If `bundle install` fails due Ruby version mismatch, switch Ruby to `3.3.4` and retry.
- If port `5432` is occupied, update `DATABASE_URL` and `TEST_DATABASE_URL` to the correct port.

## Assessment Artifacts

Database schema and migrations:

- `apps/api/db/schema.rb`
- `apps/api/db/migrate/*`

GraphQL schema definition:

- `apps/api/app/graphql/schema.graphql`

Regenerate GraphQL schema definition:

```bash
cd apps/api
bin/rails runner 'File.write(Rails.root.join("app/graphql/schema.graphql"), ApiSchema.to_definition)'
```

Backend unit and integration tests:

- `apps/api/test/models/*`
- `apps/api/test/services/*`
- `apps/api/test/integration/*`
- `apps/api/test/jobs/*`
- `apps/api/test/mailers/*`
