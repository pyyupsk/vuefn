/** Each starter in `template/`, with the package scripts to run after the install and before `dev`. */
export const TEMPLATES = {
  minimal: { label: 'Minimal', hint: 'one page', setup: [] },
  tailwind: { label: 'Tailwind', hint: 'with Tailwind CSS', setup: [] },
  d1: { label: 'D1', hint: 'with Drizzle and Cloudflare D1', setup: ['db:migrate'] },
} as const satisfies Record<string, { label: string; hint: string; setup: readonly string[] }>;

export type TemplateName = keyof typeof TEMPLATES;

export const TEMPLATE_NAMES = Object.keys(TEMPLATES) as TemplateName[];

export function isTemplate(value: string): value is TemplateName {
  return Object.hasOwn(TEMPLATES, value);
}
