## Usage

```bash
npm create @vuefn@latest [directory] -- [--template minimal|tailwind|d1]
```

With pnpm, Bun or Yarn, run `pnpm create @vuefn`, `bun create @vuefn` or `yarn create @vuefn` with the same options. npm needs `--` before the options, so that it passes them on to the CLI.

| Option       | Short | Description                                                        |
| ------------ | ----- | ------------------------------------------------------------------ |
| `directory`  |       | The folder for the new app. Without it, the CLI asks in a terminal |
| `--template` | `-t`  | `minimal` (default), `tailwind` or `d1`                            |
| `--help`     | `-h`  | Shows the usage                                                    |

## Templates

| Template   | Gives you                                         |
| ---------- | ------------------------------------------------- |
| `minimal`  | One page. This is the default                     |
| `tailwind` | One page styled with Tailwind CSS                 |
| `d1`       | A list of notes in Cloudflare D1, through Drizzle |

## In a terminal

In a terminal, the CLI asks for the folder and the template. Then it offers to install the dependencies and to start a git repository. Press Ctrl+C or Ctrl+D to cancel before the CLI writes files.

The folder name can have lowercase letters, numbers and hyphens, up to 63 characters. A nested path or `.` works too.

If the folder is not empty, the CLI lists what it will write and asks before it replaces files with the same names. Other files stay.

## In scripts and CI

If standard input or standard output is not a terminal, the CLI does not ask anything, install or run `git init`. You must pass the folder. If the folder is not empty, the CLI stops with an error, so a script cannot overwrite files by accident.

## Package manager

The CLI reads `npm_config_user_agent` to find the package manager that started it, and writes the next steps for it. It knows npm, pnpm, Yarn, Bun and Deno, and uses npm for anything else.
