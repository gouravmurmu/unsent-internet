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
| `MODERATOR_PASSWORD` | Any password of 12+ characters you choose. Unlocks `/moderate`. |

Add all three in Vercel → Project → Settings → Environment Variables, then redeploy.

## Safety and moderation

- Every note and reply is screened on the server (`src/server/screening.ts`). Emails, phone numbers, links and @handles are refused with a friendly message. Text that reads like a threat, explicit content or self-harm is saved but held for review, and the writer is shown support resources when it sounds like they may be at risk.
- Held items, and published items with open reports, appear at `/moderate`. Sign in with `MODERATOR_PASSWORD`; you can approve, hide or remove each one. The page isn't linked anywhere and is excluded from search engines.
- Writers can take down their own notes from the Mailbox with their recovery code.
- Forms include a hidden honeypot field to catch simple bots, on top of the database rate limits.
