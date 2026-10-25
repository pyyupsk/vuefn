import type { Options } from 'unplugin-vue-markdown/types';

import { slugOf } from '../utils/docs.ts';
import { MANAGERS, forManager, hasNpmCommand } from '../utils/package-manager.ts';
import { load } from './highlight.ts';

type Markdown = Parameters<NonNullable<Options['markdownSetup']>>[0];

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Gives h2 and h3 an id and exports them from the page as `toc`. */
function headings(md: Markdown) {
  md.core.ruler.push('vuefn-headings', (state) => {
    const toc: Heading[] = [];
    const seen = new Map<string, number>();
    state.tokens.forEach((token, index) => {
      if (token.type !== 'heading_open' || (token.tag !== 'h2' && token.tag !== 'h3')) return;
      const text = (state.tokens[index + 1]?.children ?? [])
        .filter((child) => child.type === 'text' || child.type === 'code_inline')
        .map((child) => child.content)
        .join('');
      const base = slugOf(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count ? `${base}-${count}` : base;
      token.attrSet('id', id);
      toc.push({ id, text, depth: token.tag === 'h2' ? 2 : 3 });
    });
    (state.env.frontmatter ??= {}).toc = toc;
  });
}

const copyButton = '<button type="button" class="code-copy" data-copy>Copy</button>';

/** Wraps each fenced block in a card with its file name (or "Terminal") and a copy button. */
function codeBlocks(md: Markdown, highlight: (code: string, lang: string) => string) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const [lang = '', ...rest] = (token?.info ?? '').trim().split(/\s+/);
    if (token && lang === 'bash' && rest.length === 0 && hasNpmCommand(token.content)) {
      return managerTabs(token.content, highlight);
    }
    const title = md.utils.escapeHtml(rest.join(' ') || (lang === 'bash' ? 'Terminal' : lang));
    const wrap = (html: string) =>
      `<figure class="code-block" data-pagefind-ignore><figcaption class="code-head"><span>${title}</span>${copyButton}</figcaption>${html}</figure>`;
    const html = fence(tokens, index, options, env, self);
    return typeof html === 'string' ? wrap(html) : (async () => wrap(await html))();
  };
}

/** A shell block with one tab per package manager. The page switches them with `data-pm`. */
function managerTabs(code: string, highlight: (code: string, lang: string) => string) {
  const tabs = MANAGERS.map(
    (manager, index) =>
      `<button type="button" class="pm-tab" data-pm="${manager}" aria-pressed="${index === 0}">${manager}</button>`,
  ).join('');
  const panels = MANAGERS.map(
    (manager, index) =>
      `<div data-pm-panel="${manager}"${index === 0 ? '' : ' hidden'}>${highlight(forManager(code, manager), 'bash')}</div>`,
  ).join('');
  return `<figure class="code-block" data-pm-block data-pagefind-ignore><figcaption class="code-head"><span class="pm-tabs">${tabs}</span>${copyButton}</figcaption>${panels}</figure>`;
}

export async function setupMarkdown(md: Markdown) {
  const highlighter = await load();
  const langs = highlighter.getLoadedLanguages();
  const highlight = (code: string, lang: string) =>
    highlighter.codeToHtml(code.trimEnd(), {
      lang: langs.includes(lang) ? lang : 'text',
      theme: 'vuefn-light',
    });
  md.options.highlight = highlight;
  md.use(headings);
  codeBlocks(md, highlight);
}
