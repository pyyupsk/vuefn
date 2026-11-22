// Writes the GitHub release notes of one package with changelogithub, from the last tag of that package.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = 'https://github.com/pyyupsk/vuefn';

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** A first release has no earlier version to change from, so it keeps the features and links its source. */
export function firstReleaseNotes(markdown: string, tag: string, dir: string) {
  const features = markdown
    .split(/^(?=#{3,5} )/m)
    .filter((section) => section.startsWith('### ') && section.includes('Features'))
    .map((section) => section.trim());
  const source = `##### &nbsp;&nbsp;&nbsp;&nbsp;[View source on GitHub](${REPO}/tree/${tag}/packages/${dir})`;
  return `${[...features, source].join('\n\n')}\n`;
}

if (import.meta.main) {
  const [dir, tag, out = 'notes.md'] = process.argv.slice(2);
  if (!dir || !tag) {
    throw new Error('Usage: bun scripts/release-notes.ts <package dir> <tag> [out]');
  }
  const name = tag.slice(0, tag.lastIndexOf('@'));
  const previous = git('tag', '--list', `${name}@*`, '--sort=-v:refname')
    .split('\n')
    .find((other) => other && other !== tag);
  const from = previous ?? git('rev-list', '--max-parents=0', 'HEAD').split('\n').at(-1) ?? '';
  // the path twice: changelogithub 15.0.5 splits a single path into letters
  const path = `packages/${dir}`;
  execFileSync(
    'bun',
    [
      'x',
      'changelogithub@15.0.5',
      '--from',
      from,
      '--to',
      tag,
      '--output',
      out,
      '--commit-filter-by-paths',
      path,
      '--commit-filter-by-paths',
      path,
    ],
    { stdio: 'inherit' },
  );
  if (!previous) writeFileSync(out, firstReleaseNotes(readFileSync(out, 'utf8'), tag, dir));
}
