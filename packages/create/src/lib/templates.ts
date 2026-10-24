export const TEMPLATES = ['minimal', 'tailwind', 'd1'] as const;

export type TemplateName = (typeof TEMPLATES)[number];

export function isTemplate(value: string): value is TemplateName {
  return (TEMPLATES as readonly string[]).includes(value);
}
