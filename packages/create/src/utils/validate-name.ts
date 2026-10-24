export function validateName(name: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) {
    return 'Use 1–63 lowercase letters, numbers or hyphens, starting with a letter or number.';
  }
}
