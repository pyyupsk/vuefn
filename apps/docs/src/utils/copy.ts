// when the browser refuses, nothing changes and the text stays on screen to copy by hand
export async function copy(text: string, show: (copied: boolean) => void) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }
  show(true);
  setTimeout(() => show(false), 1400);
}
