import bash from '@shikijs/langs/shellscript';
import ts from '@shikijs/langs/typescript';
import vue from '@shikijs/langs/vue';
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore, ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const theme: ThemeRegistration = {
  name: 'vuefn',
  type: 'dark',
  colors: { 'editor.background': '#11100e', 'editor.foreground': '#d9d8d0' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8a897f' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#b5cf8a' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: '#c7b9e8' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#e3d48a' },
    },
    { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#8fb3c9' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#c9c1a3' } },
    {
      scope: ['entity.name.type', 'support.type', 'support.type.primitive'],
      settings: { foreground: '#9cc2b8' },
    },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#e0a979' } },
  ],
};

let highlighter: Promise<HighlighterCore> | undefined;

function load() {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [vue, ts, bash],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export type Lang = 'vue' | 'ts' | 'bash';

/** Highlights code as HTML lines. `lineData` returns a data attribute value for a 1-based line. */
export async function highlight(code: string, lang: Lang, lineData?: (line: number) => string) {
  return (await load()).codeToHtml(code.trimEnd(), {
    lang,
    theme: 'vuefn',
    transformers: lineData
      ? [
          {
            line(node, line) {
              const value = lineData(line);
              if (value) node.properties['data-where'] = value;
            },
          },
        ]
      : [],
  });
}
