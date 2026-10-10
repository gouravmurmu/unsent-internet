# The Unsent Internet

A small, nostalgic corner of the web where people anonymously leave the messages they never sent.

## Run it locally

```bash
cp .env.example .env.local   # then fill in the two Supabase values
npm install
npm run dev
```

Then open http://localhost:3000.

## Checks

```bash
npm run lint
npm run build
```

## How data flows

- The browser only talks to this site's own `/api/*` routes (`src/app/api`). It never sees a database key.
- Those routes validate and clean input, identify the visitor with a random anonymous cookie (stored only as a keyed hash), and call Postgres functions with the server-only `SUPABASE_SECRET_KEY` (`src/server`).
- The schema lives in `supabase/migrations`. Every table has row-level security on with no policies, and only the `service_role` can run the functions, so the public API key can't read or write anything.
- Rate limits, duplicate checks, one kindness per note per visitor, and auto-hiding after three reports are enforced in the database functions.
- Drafts, saved notes and the writer's recovery code stay in the browser's localStorage.

## Environment variables

| Name | Where to find it |
| --- | --- |
| `SUPABASE_URL` | Supabase → Project Settings → Data API |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys |
