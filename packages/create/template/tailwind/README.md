# My vuefn app

A Vue app with vuefn and Tailwind CSS on Cloudflare Workers.

## Development

```bash
npm install
npm run dev
```

Edit `src/pages/index.vue`. Global styles live in `src/app.css` and are imported by `src/pages/__root.vue`.

## Commands

```bash
npm run typecheck
npm run build
npm run preview
```

## Deploy

If Wrangler is not signed in, sign in first:

```bash
npx wrangler login
npm run deploy
```

## Docs

- [vuefn](https://github.com/pyyupsk/vuefn)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
