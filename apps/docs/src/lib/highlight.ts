import bash from '@shikijs/langs/shellscript';
import ts from '@shikijs/langs/typescript';
import vue from '@shikijs/langs/vue';
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore, ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const theme: ThemeRegistration = {
  name: 'vuefn',
  type: 'dark',
  colors: { 'editor.background': '#0e1012', 'editor.foreground': '#d8dadc' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8b9096' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#8fd6b4' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: '#f6a35c' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#ece6d8' },
    },
    { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#42b883' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#c3c8ce' } },
    {
      scope: ['entity.name.type', 'support.type', 'support.type.primitive'],
      settings: { foreground: '#9cc9e0' },
    },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#f6a35c' } },
  ],
};

let highlighter: Promise<HighlighterCore> | undefined;

export function load() {
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
