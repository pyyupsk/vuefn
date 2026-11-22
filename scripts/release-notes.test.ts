import { describe, expect, it } from 'vitest';

import { firstReleaseNotes } from './release-notes';

const changelog = `### &nbsp;&nbsp;&nbsp;🚨 Breaking Changes

- Rename the CLI &nbsp;-&nbsp; by @a [<samp>(84e99)</samp>](https://github.com/pyyupsk/vuefn/commit/84e999c)

### &nbsp;&nbsp;&nbsp;🚀 Features

- Create an app &nbsp;-&nbsp; by @a [<samp>(e6197)</samp>](https://github.com/pyyupsk/vuefn/commit/e6197eb)
- Pick a template &nbsp;-&nbsp; by @a [<samp>(192a7)</samp>](https://github.com/pyyupsk/vuefn/commit/192a7e3)

### &nbsp;&nbsp;&nbsp;🐞 Bug Fixes

- Name a target that is a file &nbsp;-&nbsp; by @a [<samp>(ffda4)</samp>](https://github.com/pyyupsk/vuefn/commit/ffda4db)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/pyyupsk/vuefn/compare/bccd1ab...create-vuefn@0.1.0)
`;

describe('firstReleaseNotes', () => {
  it('keeps the features and links the source at the tag', () => {
    const notes = firstReleaseNotes(changelog, 'create-vuefn@0.1.0', 'create');
    expect(notes).toContain('- Create an app');
    expect(notes).toContain('- Pick a template');
    expect(notes).not.toContain('Breaking Changes');
    expect(notes).not.toContain('Bug Fixes');
    expect(notes).not.toContain('/compare/');
    expect(notes).toContain(
      '[View source on GitHub](https://github.com/pyyupsk/vuefn/tree/create-vuefn@0.1.0/packages/create)',
    );
  });

  it('links only the source when the first release has no features', () => {
    const notes = firstReleaseNotes('*No significant changes*\n', '@vuefn/core@0.1.0', 'vuefn');
    expect(notes).toBe(
      '##### &nbsp;&nbsp;&nbsp;&nbsp;[View source on GitHub](https://github.com/pyyupsk/vuefn/tree/@vuefn/core@0.1.0/packages/vuefn)\n',
    );
  });
});
