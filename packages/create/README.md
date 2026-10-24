# @vuefn/create

Create a Vue app with vuefn on Cloudflare Workers.

## Features

- Three templates: `minimal` (one page), `tailwind` (Tailwind CSS) and `d1` (Cloudflare D1 with Drizzle)
- Vite, TypeScript and Wrangler ready to use
- Interactive directory prompt, or a directory argument for scripts
- Offers to install dependencies and initialize a git repository, and asks before overwriting a nonempty directory

## Usage

This package and `@vuefn/core` are not published yet. After both packages are published:

```bash
npm create @vuefn@latest my-app
cd my-app
npm install
npm run dev
```

Pick a template with `--template minimal|tailwind|d1`. Minimal is the default, and the CLI asks for it in a terminal.

Omit `my-app` to choose a directory in the terminal. Press Ctrl+C or Ctrl+D to cancel before the CLI writes files.

In scripts and CI, pass a directory. If standard input or standard output is not a terminal, the CLI does not prompt, install or run `git init`.

The CLI uses [package-manager-detector](https://github.com/antfu-collective/package-manager-detector) to read `npm_config_user_agent` and format the next steps. Supported callers include npm, Yarn, pnpm, Bun and Deno. If the value is missing or unsupported, it uses npm.

Use lowercase letters, numbers and hyphens for the directory name, up to 63 characters. Nested paths and `.` work too.

An empty or missing directory is fine. For a nonempty one the CLI lists the choice and asks before replacing files with the same names; other files stay. Non-interactive callers get an error instead, so a script cannot overwrite by accident.

## Commands

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Starts the Vite server on port 3000            |
| `npm run build`     | Builds the app for Cloudflare Workers          |
| `npm run preview`   | Serves the build locally with workerd          |
| `npm run typecheck` | Generates the route tree and checks TypeScript |
| `npm run deploy`    | Builds and deploys the app with Wrangler       |

The `d1` template also has `npm run db:migrate` for the local D1 database and `npm run db:generate` for a Drizzle migration.

## Local development

From the repository root:

```bash
bun install
bun run build
node packages/create/dist/index.mjs my-app
```

Before the first release, replace `@vuefn/core` in the generated app's `package.json` with a local tarball. `bun run test:pack` tests this path.

## License

[MIT](https://github.com/pyyupsk/vuefn/blob/main/LICENSE) License © 2026 [Pongsakorn Thipayanate](https://github.com/pyyupsk)
