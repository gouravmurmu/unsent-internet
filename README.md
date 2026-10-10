# The Unsent Internet

A small, nostalgic corner of the web where people anonymously leave the messages they never sent.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Checks

```bash
npm run lint
npm run build
```

## Status

The site is a prototype: notes come from `src/lib/mock-notes.ts`, and anything you publish, react to or reply to is stored only in your own browser (see `src/lib/api.ts`). The database, moderation and launch arrive in later stages.
