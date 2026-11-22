import { expect, it } from 'vitest';

import { cdCommand } from '#utils/cd-command';

it('quotes the directory for a POSIX shell', () => {
  expect(cdCommand('my-app', 'linux')).toBe("cd 'my-app'");
  expect(cdCommand("it's $HOME/my-app", 'darwin')).toBe("cd 'it'\\''s $HOME/my-app'");
});

it('uses double quotes on Windows, which cmd.exe and PowerShell both read', () => {
  expect(cdCommand('my-app', 'win32')).toBe('cd "my-app"');
  expect(cdCommand('examples\\my app', 'win32')).toBe('cd "examples\\my app"');
});
