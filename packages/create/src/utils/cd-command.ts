/** The `cd` line of the next steps, quoted for the usual shell of the platform. */
export function cdCommand(directory: string, platform: NodeJS.Platform = process.platform) {
  // cmd.exe has no single quotes, and a Windows path cannot hold a double quote
  if (platform === 'win32') return `cd "${directory}"`;
  return `cd '${directory.replaceAll("'", "'\\''")}'`;
}
