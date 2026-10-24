import type { HeroFile } from '@/content/landing';

/** Where a 1-based line of a hero file runs, or '' when it is not marked. */
export function whereOf(file: HeroFile, line: number): string {
  return file.ranges.find(([from, to]) => line >= from && line <= to)?.[2] ?? '';
}
