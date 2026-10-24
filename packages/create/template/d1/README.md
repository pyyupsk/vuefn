# My vuefn app

A Vue app with vuefn, Cloudflare D1 and Drizzle on Cloudflare Workers.

## Development

```bash
npm install
npm run db:migrate
npm run dev
```

`npm run db:migrate` applies `migrations/` to the local D1 database. The page reads and writes the `notes` table.

## Commands

```bash
npm run typecheck
npm run build
npm run preview
npm run db:generate
```

`npm run db:generate` writes a new SQL migration to `drizzle/` from `src/db/schema.ts`. Copy it into `migrations/` when you want Wrangler to apply it.

## Deploy

Create the database once, then paste its id into `wrangler.jsonc`:

```bash
npx wrangler d1 create <your-app>-db
npx wrangler d1 migrations apply DB --remote
npm run deploy
```

## Docs

- [vuefn](https://github.com/pyyupsk/vuefn)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
