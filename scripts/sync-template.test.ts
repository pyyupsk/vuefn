import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { syncTemplate } from './sync-template';

const dir = mkdtempSync(join(tmpdir(), 'vuefn-template-'));
const template = join(dir, 'package.json');

afterEach(() => rmSync(template, { force: true }));

function write(manifest: unknown) {
  writeFileSync(template, `${JSON.stringify(manifest, null, 2)}\n`);
}

function range() {
  return JSON.parse(readFileSync(template, 'utf8')).dependencies['@vuefn/core'];
}

describe('syncTemplate', () => {
  it('points the starter at the released core version', () => {
    write({ name: 'app', dependencies: { '@vuefn/core': '^0.1.0', vue: '^3.5.44' } });
    syncTemplate('0.2.0', template);
    expect(range()).toBe('^0.2.0');
    expect(JSON.parse(readFileSync(template, 'utf8')).dependencies.vue).toBe('^3.5.44');
  });

  it('leaves the file alone when the range is current', () => {
    write({ name: 'app', dependencies: { '@vuefn/core': '^0.2.0' } });
    syncTemplate('0.2.0', template);
    expect(readFileSync(template, 'utf8')).toBe(
      `{\n  "name": "app",\n  "dependencies": {\n    "@vuefn/core": "^0.2.0"\n  }\n}\n`,
    );
  });
});
