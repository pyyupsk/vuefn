import type { Options } from 'unplugin-vue-markdown/types';

import { slugOf } from '../utils/docs.ts';
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

/** Wraps each fenced block in a card with its file name (or "Terminal") and a copy button. */
function codeBlocks(md: Markdown) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const [lang = '', ...rest] = (tokens[index]?.info ?? '').trim().split(/\s+/);
    const title = md.utils.escapeHtml(rest.join(' ') || (lang === 'bash' ? 'Terminal' : lang));
    const wrap = (html: string) =>
      `<figure class="code-block"><figcaption class="code-head"><span>${title}</span><button type="button" class="code-copy" data-copy>Copy</button></figcaption>${html}</figure>`;
    const html = fence(tokens, index, options, env, self);
    return typeof html === 'string' ? wrap(html) : (async () => wrap(await html))();
  };
}

export async function setupMarkdown(md: Markdown) {
  const highlighter = await load();
  const langs = highlighter.getLoadedLanguages();
  md.options.highlight = (code, lang) =>
    highlighter.codeToHtml(code.trimEnd(), {
      lang: langs.includes(lang) ? lang : 'text',
      theme: 'vuefn-light',
    });
  md.use(headings);
  md.use(codeBlocks);
}
