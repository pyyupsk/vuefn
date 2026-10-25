import bash from '@shikijs/langs/shellscript';
import ts from '@shikijs/langs/typescript';
import vue from '@shikijs/langs/vue';
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore, ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const theme: ThemeRegistration = {
  name: 'vuefn-dark',
  type: 'dark',
  colors: { 'editor.background': '#0b0b0d', 'editor.foreground': '#d4d4d8' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8b8b93' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#86e1b2' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: '#fdba74' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#93c5fd' },
    },
    { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#67e8f9' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#fde68a' } },
    {
      scope: ['entity.name.type', 'support.type', 'support.type.primitive'],
      settings: { foreground: '#7dd3fc' },
    },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#fcd34d' } },
  ],
};

const light: ThemeRegistration = {
  name: 'vuefn-light',
  type: 'light',
  colors: { 'editor.background': '#ffffff', 'editor.foreground': '#18181b' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#71717a' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#066e48' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: '#c2410c' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#1d4ed8' },
    },
    { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#0e7490' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#a16207' } },
    {
      scope: ['entity.name.type', 'support.type', 'support.type.primitive'],
      settings: { foreground: '#0369a1' },
    },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#b45309' } },
  ],
};

let highlighter: Promise<HighlighterCore> | undefined;

export function load() {
  highlighter ??= createHighlighterCore({
    themes: [theme, light],
    langs: [vue, ts, bash],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export type Lang = 'vue' | 'ts' | 'bash';

/** Highlights code as HTML lines. `lineData` returns a data attribute value for a 1-based line. */
export async function highlight(
  code: string,
  lang: Lang,
  lineData?: (line: number) => string,
  themeName: 'vuefn-dark' | 'vuefn-light' = 'vuefn-dark',
) {
  return (await load()).codeToHtml(code.trimEnd(), {
    lang,
    theme: themeName,
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
