# @vuefn/create

Create a Vue app with vuefn on Cloudflare Workers.

## Features

- A minimal Workers app with one `.vue` page
- Vite, TypeScript and Wrangler ready to use
- Interactive directory prompt, or a directory argument for scripts
- No automatic install and no writes into nonempty directories

## Usage

This package and `@vuefn/core` are not published yet. After both packages are published:

```bash
npm create @vuefn@latest my-app
cd my-app
npm install
npm run dev
```

Omit `my-app` to choose a directory in the terminal. Press Ctrl+C or Ctrl+D to cancel before the CLI writes files.

In scripts and CI, pass a directory. If standard input or standard output is not a terminal, the CLI does not prompt.

Use lowercase letters, numbers and hyphens for the directory name, up to 63 characters. Nested paths and `.` work too. The target directory must be empty.

## Commands

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Starts the Vite server on port 3000            |
| `npm run build`     | Builds the app for Cloudflare Workers          |
| `npm run preview`   | Serves the build locally with workerd          |
| `npm run typecheck` | Generates the route tree and checks TypeScript |
| `npm run deploy`    | Builds and deploys the app with Wrangler       |

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
